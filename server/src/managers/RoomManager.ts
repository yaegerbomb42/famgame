import { Server, Socket } from 'socket.io';
import { GameState, Player, GameType, IGameLogic, ChatMessage } from '../types';
import { TriviaGame } from '../games/Trivia';
import { TwoTruthsGame } from '../games/TwoTruths';
import { HotTakesGame } from '../games/HotTakes';
import { PollGame } from '../games/Poll';
import { BuzzInGame } from '../games/BuzzIn';
import { WordRaceGame } from '../games/WordRace';
import { ReactionGame } from '../games/Reaction';
import { EmojiStoryGame } from '../games/EmojiStory';
import { BluffGame } from '../games/Bluff';
import { ThisOrThatGame } from '../games/ThisOrThat';
import { SpeedDrawGame } from '../games/SpeedDraw';
import { ChainReactionGame } from '../games/ChainReaction';
import { MindMeldGame } from '../games/MindMeld';
import { CompeteGame } from '../games/Compete';

export class RoomManager {
    public state: GameState;
    private io: Server;
    private activeGame: IGameLogic | null = null;
    private lastLeaderName: string | null = null;

    constructor(io: Server) {
        this.io = io;
        this.state = {
            roomCode: this.generateRoomCode(),
            hostId: null,
            players: {},
            status: 'LOBBY',
            gameVotes: {},
            leaderboard: [],
            chat: [],
            aiPersona: { name: 'BYTE', avatar: '🤖' },
        };
    }

    private generateRoomCode(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    public handleCreateRoom(socket: Socket, name: string) {
        this.state.roomCode = this.generateRoomCode();
        this.state.hostId = socket.id;
        this.state.players = {};
        this.state.chat = [];
        this.state.aiPersona = { name: 'BYTE', avatar: '🤖' };
        this.lastLeaderName = null;
        this.addPlayer(socket, name, '📺', true);
        this.state.status = 'LOBBY';
        this.addAiMessage('Welcome to FamGame! I am BYTE, your hype AI host. Bring the energy.');
        this.broadcastState();
    }

    public handleJoinRoom(socket: Socket, name: string, code: string, avatar: string) {
        if (code.toUpperCase() !== this.state.roomCode) {
            socket.emit('error', { message: 'Invalid room code' });
            return;
        }
        this.addPlayer(socket, name, avatar || '🙂', false);
        this.addSystemMessage(`${name || 'A player'} joined the room.`);
        this.broadcastState();
    }

    private addPlayer(socket: Socket, name: string, avatar: string, isHost: boolean) {
        this.state.players[socket.id] = {
            id: socket.id,
            name: name || `Player ${Object.keys(this.state.players).length + 1}`,
            avatar,
            score: 0,
            isHost,
        };
    }

    public handleDisconnect(socketId: string) {
        const player = this.state.players[socketId];
        delete this.state.players[socketId];
        if (player) {
            this.addSystemMessage(`${player.name} left the room.`);
        }
        if (socketId === this.state.hostId) {
            // Hard reset if host leaves
            this.state.hostId = null;
            this.state.roomCode = this.generateRoomCode();
            this.state.players = {};
            this.state.status = 'LOBBY';
            this.state.chat = [];
            // Ideally we'd migrate host, but for now reset is safe
        }
        this.broadcastState();
    }

    public startGameSelect() {
        this.state.status = 'GAME_SELECT';
        this.state.gameVotes = {};
        Object.values(this.state.players).forEach(p => p.gameVote = undefined);
        this.addAiMessage('Pick your game! I am already placing imaginary bets on you.');
        this.broadcastState();
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
        this.broadcastState();
    }

    public selectGame(gameId: GameType) {
        this.state.status = 'PLAYING';
        this.state.currentGame = gameId;

        switch (gameId) {
            case 'TRIVIA': this.activeGame = new TriviaGame(); break;
            case '2TRUTHS': this.activeGame = new TwoTruthsGame(); break;
            case 'HOT_TAKES': this.activeGame = new HotTakesGame(); break;
            case 'POLL': this.activeGame = new PollGame(); break;
            case 'BUZZ_IN': this.activeGame = new BuzzInGame(); break;
            case 'WORD_RACE': this.activeGame = new WordRaceGame(); break;
            case 'REACTION': this.activeGame = new ReactionGame(); break;
            case 'EMOJI_STORY': this.activeGame = new EmojiStoryGame(); break;
            case 'BLUFF': this.activeGame = new BluffGame(); break;
            case 'THIS_OR_THAT': this.activeGame = new ThisOrThatGame(); break;
            case 'SPEED_DRAW': this.activeGame = new SpeedDrawGame(); break;
            case 'CHAIN_REACTION': this.activeGame = new ChainReactionGame(); break;
            case 'MIND_MELD': this.activeGame = new MindMeldGame(); break;
            case 'COMPETE': this.activeGame = new CompeteGame(); break;
            default:
                this.activeGame = null;
                this.state.gameData = { phase: 'WIP' };
        }

        if (this.activeGame) {
            this.activeGame.onStart(this.state, () => this.broadcastState());
        }

        this.addAiMessage(`Locking in ${this.getGameName(gameId)}. Let the chaos begin!`);
        this.broadcastState();
    }

    public handleInput(socketId: string, data: any) {
        if (this.state.status === 'PLAYING' && this.activeGame) {
            this.activeGame.onInput(this.state, socketId, data);
            this.broadcastState();
        }
    }

    public handleChat(socketId: string, text: string) {
        const player = this.state.players[socketId];
        if (!player) return;
        const trimmed = this.sanitizeChatText(text);
        if (!trimmed) return;
        this.addChatMessage({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            playerId: socketId,
            name: player.name,
            avatar: player.avatar,
            text: trimmed,
            timestamp: Date.now(),
        });
        this.broadcastState();
    }

    public broadcastState() {
        this.updateLeaderboard();
        this.io.emit('gameState', this.state);
    }

    private updateLeaderboard() {
        this.state.leaderboard = Object.values(this.state.players)
            .map(p => ({ name: p.name, score: p.score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
        const currentLeader = this.state.leaderboard[0]?.name ?? null;
        if (currentLeader && currentLeader !== this.lastLeaderName) {
            this.lastLeaderName = currentLeader;
            this.addAiMessage(`New leader alert: ${currentLeader} is on top! Keep it up.`);
        }
    }

    private sanitizeChatText(text: string) {
        return text.replace(/\s+/g, ' ').trim().slice(0, 240);
    }

    private addChatMessage(message: ChatMessage) {
        this.state.chat.push(message);
        this.state.chat = this.state.chat.slice(-80);
    }

    private addSystemMessage(text: string) {
        this.addChatMessage({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            playerId: null,
            name: 'SYSTEM',
            text,
            timestamp: Date.now(),
            isSystem: true,
        });
    }

    private addAiMessage(text: string) {
        this.addChatMessage({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            playerId: null,
            name: this.state.aiPersona.name,
            avatar: this.state.aiPersona.avatar,
            text,
            timestamp: Date.now(),
            isAi: true,
        });
    }

    private getGameName(gameId: GameType) {
        const names: Record<GameType, string> = {
            TRIVIA: 'Trivia',
            '2TRUTHS': 'Two Truths',
            HOT_TAKES: 'Hot Takes',
            POLL: 'Poll Party',
            BUZZ_IN: 'Buzz In',
            WORD_RACE: 'Word Race',
            REACTION: 'Reaction',
            EMOJI_STORY: 'Emoji Story',
            BLUFF: 'Bluff',
            THIS_OR_THAT: 'This or That',
            SPEED_DRAW: 'Speed Draw',
            CHAIN_REACTION: 'Chain Reaction',
            MIND_MELD: 'Mind Meld',
            COMPETE: 'Compete',
        };
        return names[gameId] ?? gameId;
    }
}
