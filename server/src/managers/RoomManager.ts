import { Server, Socket } from 'socket.io';
import { GameState, GameType, IGameLogic } from '../types';
import { GAME_REGISTRY } from '../games/gameRegistry';
import { AnalyticsManager } from './AnalyticsManager';
import { getOpener, getCloser, getAIQuip } from '../games/content/RoastTemplates';
import { AIGenerator } from '../utils/AIGenerator';
import { GAME_CATALOG, GameCatalogEntry } from '../data/gameCatalog';

export class RoomManager {
    public state: GameState;
    private io: Server;
    private activeGame: IGameLogic | null = null;
    private updateInterval: any = null;
    private autoNextGameTimer: NodeJS.Timeout | null = null;
    private isTicking: boolean = false;
    public lastActivity: number;

    constructor(io: Server, roomCode: string, isPublic: boolean = false) {
        this.io = io;
        this.lastActivity = Date.now();
        this.state = {
            roomCode: roomCode,
            hostId: null,
            players: {},
            status: 'LOBBY',
            gameVotes: {},
            leaderboard: [],
            isPublic: isPublic,
            continuousMode: false
        };
    }

    public setHost(socket: Socket, name: string) {
        this.state.hostId = socket.id;
        this.addPlayer(socket, name || 'Host', '📺', true);
        this.lastActivity = Date.now();
        this.broadcastState();
    }

    public handleJoinRoom(socket: Socket, name: string, avatar: string, color?: string) {
        this.addPlayer(socket, name, avatar || '🙂', false, color);
        this.lastActivity = Date.now();
        this.broadcastState();
    }

    private addPlayer(socket: Socket, name: string, avatar: string, isHost: boolean, color?: string) {
        this.state.players[socket.id] = {
            id: socket.id,
            name: name || `Player ${Object.keys(this.state.players).length + 1}`,
            avatar,
            color,
            score: 0,
            isHost,
        };
        socket.join(this.state.roomCode);
        if (!isHost) AnalyticsManager.incrementPlayers();
    }

    public async handleDisconnect(socketId: string) {
        if (this.activeGame && this.activeGame.onPlayerLeave) {
            await this.activeGame.onPlayerLeave(this.state, socketId, () => this.broadcastState());
        }

        const player = this.state.players[socketId];
        if (!player) return;

        delete this.state.players[socketId];
        
        if (socketId === this.state.hostId) {
            // Host left - room will be cleaned up by SocketManager if no one else is there
            this.state.hostId = null;
        }

        this.lastActivity = Date.now();
        this.broadcastState();
    }

    public startGameSelect() {
        if (this.state.continuousMode) {
            const games = [
                'TRIVIA', '2TRUTHS', 'HOT_TAKES', 'POLL', 'BUZZ_IN', 
                'WORD_RACE', 'REACTION', 'EMOJI_STORY', 'BLUFF', 'THIS_OR_THAT', 
                'SPEED_DRAW', 'CHAIN_REACTION', 'MIND_MELD', 'COMPETE', 
                'ROAST_MASTER', 'BRAIN_BURST', 'AI_MASHUP', 'GLOBAL_AVERAGES', 'SKILL_SHOWDOWN',
                'ODD_ONE_OUT', 'DRAW_CHAIN'
            ] as GameType[];
            const nextGame = games[Math.floor(Math.random() * games.length)];
            
            // Validate nextGame player count for continuous mode
            const entry = GAME_CATALOG.find((g: GameCatalogEntry) => g.id === nextGame);
            const nonHostCount = Object.values(this.state.players).filter((p) => !p.isHost).length;
            if (entry && nonHostCount < entry.minPlayers) {
                // If it doesn't fit, just skip or wait for more players
                this.state.gameData = { ...this.state.gameData, pickWarning: `Skipped ${entry.name} (needs ${entry.minPlayers} players)` };
                this.broadcastState();
                return;
            }

            if (this.autoNextGameTimer) {
                clearTimeout(this.autoNextGameTimer);
                this.autoNextGameTimer = null;
            }
            this.selectGame(nextGame);
            return;
        }

        this.state.status = 'GAME_SELECT';
        this.state.gameVotes = {};
        Object.values(this.state.players).forEach(p => p.gameVote = undefined);
        this.lastActivity = Date.now();
        this.broadcastState();
    }

    public handleOpenGameSelect(socketId: string) {
        if (socketId !== this.state.hostId) return;
        this.startGameSelect();
    }

    public handleVote(socketId: string, gameId: string) {
        if (!this.state.players[socketId]) return;
        this.state.players[socketId].gameVote = gameId;

        // Tally
        const votes: Record<string, number> = {};
        Object.values(this.state.players).forEach(p => {
            if (p.gameVote) votes[p.gameVote] = (votes[p.gameVote] || 0) + 1;
        });
        this.state.gameVotes = votes;
        this.lastActivity = Date.now();
        this.broadcastState();
    }

    public async selectGame(gameId: GameType) {
        const nonHostCount = Object.values(this.state.players).filter((p) => !p.isHost).length;
        const gameEntry = GAME_CATALOG.find((g: GameCatalogEntry) => g.id === gameId);
        
        if (gameEntry && nonHostCount < gameEntry.minPlayers) {
            this.state.status = 'GAME_SELECT';
            this.state.currentGame = undefined;
            this.state.gameData = { 
                pickWarning: `Need at least ${gameEntry.minPlayers} players to start ${gameEntry.name}.` 
            };
            this.lastActivity = Date.now();
            this.broadcastState();
            return;
        }

        if (nonHostCount === 0) {
            this.state.status = 'GAME_SELECT';
            this.state.currentGame = undefined;
            this.state.gameData = { pickWarning: 'Need at least one player before starting a game.' };
            this.lastActivity = Date.now();
            this.broadcastState();
            return;
        }

        this.state.status = 'PLAYING';
        this.state.currentGame = gameId;
        this.state.gameData = {}; // Clear stale data immediately

        // Timer Safety: Clear any existing timers before starting a new game
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.autoNextGameTimer) {
            clearInterval(this.autoNextGameTimer);
            this.autoNextGameTimer = null;
        }

        // Generate custom quips if this is the first game of the room
        if (!this.state.customQuips) {
            const playerNames = Object.values(this.state.players).filter(p => !p.isHost).map(p => p.name);
            AIGenerator.generateNarratorQuips(playerNames).then(quips => {
                this.state.customQuips = quips;
                this.broadcastState();
            }).catch(e => console.error('Narrator quip error:', e));
        }

        try {
            this.initActiveGame(gameId);

            if (this.activeGame) {
                await this.activeGame.onStart(this.state, () => this.broadcastState(), (c, t) => this.narratorRoast(c, t));
                this.updateInterval = setInterval(() => this.tick(), 200); 
            }
        } catch (error) {
            console.error(`CRITICAL: Failed to start game ${gameId}:`, error);
            this.state.status = 'GAME_SELECT'; // Fallback
            this.broadcastState();
        }

        this.lastActivity = Date.now();
        this.broadcastState();
    }

    private initActiveGame(gameId: GameType) {
        const GameClass = GAME_REGISTRY[gameId];
        if (GameClass) {
            this.activeGame = new GameClass();
        } else {
            this.activeGame = null;
            this.state.gameData = { phase: 'WIP' };
        }
    }

    public async handleInput(socketId: string, data: any) {
        if (this.state.status === 'PLAYING' && this.activeGame) {
            try {
                await this.activeGame.onInput(this.state, socketId, data, () => this.broadcastState(), (c, t) => this.narratorRoast(c, t));
                this.lastActivity = Date.now();

                if (this.state.gameData?.phase === 'RESULTS') {
                    this.activeGame.onEnd(this.state, () => this.broadcastState(), (c, t) => this.narratorRoast(c, t));
                    this.endCurrentGame();
                } else {
                    this.broadcastState();
                }
            } catch (error) {
                console.error(`Non-fatal input error in ${this.state.currentGame}:`, error);
            }
        }
    }

    private async tick() {
        if (this.isTicking) return;
        this.isTicking = true;

        try {
            if (this.state.status !== 'PLAYING' || !this.activeGame) {
                if (this.updateInterval) {
                    clearInterval(this.updateInterval);
                    this.updateInterval = null;
                }
                return;
            }

            if (this.activeGame.update) {
                await this.activeGame.update(0.2, this.state, () => this.broadcastState(), (c, t) => this.narratorRoast(c, t));
            }

            if (this.state.gameData?.phase === 'RESULTS') {
                this.endCurrentGame();
            }
        } finally {
            this.isTicking = false;
        }
    }

    private endCurrentGame() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.activeGame) {
            this.activeGame.onEnd(this.state, () => this.broadcastState(), (c, t) => this.narratorRoast(c, t));
        }
        this.activeGame = null;
        this.state.status = 'RESULTS';


        // Continuous Mode: Auto-advance after 10s
        if (this.state.continuousMode) {
            let countdown = 10;
            this.state.gameData = { ...this.state.gameData, nextGameCountdown: countdown };
            
            if (this.autoNextGameTimer) {
                clearInterval(this.autoNextGameTimer);
                this.autoNextGameTimer = null;
            }
            
            this.autoNextGameTimer = setInterval(() => {
                countdown--;
                if (this.state.gameData) {
                    this.state.gameData.nextGameCountdown = countdown;
                }
                
                if (countdown <= 0) {
                    if (this.autoNextGameTimer) {
                        clearInterval(this.autoNextGameTimer);
                        this.autoNextGameTimer = null;
                    }
                    this.startGameSelect();
                } else {
                    this.broadcastState();
                }
            }, 1000);
        }

        this.broadcastState();
    }

    /** Stops timers and drops the active game without running onEnd (host bailout). */
    private stopActiveGameSilently(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.activeGame = null;
    }

    /** Host: force the current round to end and show RESULTS (same as normal completion). */
    public hostForceEndRound(hostSocketId: string): void {
        if (hostSocketId !== this.state.hostId) return;
        if (this.state.status !== 'PLAYING' || !this.activeGame) return;
        this.endCurrentGame();
    }

    /** Host: leave play/results and open the game picker (category mode flow). */
    public hostBackToGameMenu(hostSocketId: string): void {
        if (hostSocketId !== this.state.hostId) return;
        this.stopActiveGameSilently();
        if (this.autoNextGameTimer) {
            clearInterval(this.autoNextGameTimer);
            this.autoNextGameTimer = null;
        }
        this.state.status = 'GAME_SELECT';
        this.state.currentGame = undefined;
        this.state.gameData = undefined;
        this.lastActivity = Date.now();
        this.broadcastState();
    }

    /** Host: full reset to party lobby (QR / players). */
    public hostReturnToPartyLobby(hostSocketId: string): void {
        if (hostSocketId !== this.state.hostId) return;
        this.stopActiveGameSilently();
        if (this.autoNextGameTimer) {
            clearInterval(this.autoNextGameTimer);
            this.autoNextGameTimer = null;
        }
        this.state.status = 'LOBBY';
        this.state.currentGame = undefined;
        this.state.gameData = undefined;
        this.state.gameVotes = {};
        Object.values(this.state.players).forEach((p) => {
            p.gameVote = undefined;
        });
        this.lastActivity = Date.now();
        this.broadcastState();
    }

    public async narratorRoast(context?: string, targetId?: string) {
        const players = Object.values(this.state.players).filter(p => !p.isHost);
        if (players.length === 0) return;

        let target = targetId ? this.state.players[targetId] : players[Math.floor(Math.random() * players.length)];
        if (!target) target = players[0];

        // Collect some context about current scores to feed the AI
        const recentEvents = players.map(p => `${p.name} has ${p.score} points`);
        
        try {
            const roast = await AIGenerator.generateDynamicRoast(target.name, context || 'gameplay', recentEvents);
            
            this.io.to(this.state.roomCode).emit('narratorMessage', {
                text: roast.text,
                quip: roast.text, // For now, same as text
                mood: roast.mood
            });
        } catch (e) {
            console.error('Failed to generate dynamic roast:', e);
        }
    }

    public broadcastState() {
        this.updateLeaderboard();
        this.io.to(this.state.roomCode).emit('gameState', this.state);
    }

    private updateLeaderboard() {
        this.state.leaderboard = Object.values(this.state.players)
            .filter(p => !p.isHost)
            .map(p => ({ name: p.name, score: p.score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    public cleanup() {
        if (this.updateInterval) clearInterval(this.updateInterval);
    }
}
