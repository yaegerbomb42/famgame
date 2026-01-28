import { Server, Socket } from 'socket.io';
import { GameState, Player, GameType, IGameLogic } from '../types';
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

    constructor(io: Server) {
        this.io = io;
        this.state = {
            roomCode: this.generateRoomCode(),
            hostId: null,
            players: {},
            status: 'LOBBY',
            gameVotes: {},
            leaderboard: [],
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
        this.addPlayer(socket, name, '📺', true);
        this.state.status = 'LOBBY';
        this.broadcastState();
    }

    public handleJoinRoom(socket: Socket, name: string, code: string, avatar: string) {
        if (code.toUpperCase() !== this.state.roomCode) {
            socket.emit('error', { message: 'Invalid room code' });
            return;
        }
        this.addPlayer(socket, name, avatar || '🙂', false);
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
        delete this.state.players[socketId];
        if (socketId === this.state.hostId) {
            // Hard reset if host leaves
            this.state.hostId = null;
            this.state.roomCode = this.generateRoomCode();
            this.state.players = {};
            this.state.status = 'LOBBY';
            // Ideally we'd migrate host, but for now reset is safe
        }
        this.broadcastState();
    }

    public startGameSelect() {
        this.state.status = 'GAME_SELECT';
        this.state.gameVotes = {};
        Object.values(this.state.players).forEach(p => p.gameVote = undefined);
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

        this.broadcastState();
    }

    public handleInput(socketId: string, data: any) {
        if (this.state.status === 'PLAYING' && this.activeGame) {
            this.activeGame.onInput(this.state, socketId, data);
            this.broadcastState();
        }
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
    }
}
