import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

interface Player {
    id: string;
    name: string;
    avatar?: string;
    score: number;
    isHost?: boolean;
    gameVote?: string;
}

interface GameState {
    roomCode: string;
    players: Record<string, Player>;
    status: 'LOBBY' | 'GAME_SELECT' | 'PLAYING' | 'RESULTS';
    currentGame?: string;
    gameData?: any;
    timer?: number;
    chat?: any[];
    aiPersona?: any;
    gameVotes?: Record<string, number>;
}

export interface GameStore {
    socket: Socket | null;
    gameState: GameState | null;
    isConnected: boolean;
    role: 'NONE' | 'HOST' | 'PLAYER';

    // Actions
    initSocket: () => void;
    setRole: (role: 'NONE' | 'HOST' | 'PLAYER') => void;
    createRoom: (name: string) => void;
    joinRoom: (name: string, code: string, avatar?: string) => void;
    startGame: () => void;
    selectGame: (gameId: string) => void;
    voteGame: (gameId: string) => void;
    gameInput: (data: any) => void;
    sendChat: (message: string) => void;
    nextRound: () => void;
    backToLobby: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    socket: null,
    gameState: null,
    isConnected: false,
    role: 'NONE',

    initSocket: () => {
        if (get().socket) return;

        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            set({ isConnected: true });
            console.log('Connected to server');
        });

        socket.on('gameState', (state: GameState) => {
            set({ gameState: state });
        });

        socket.on('disconnect', () => {
            set({ isConnected: false });
        });

        socket.on('roomClosed', () => {
            set({ gameState: null, role: 'NONE' });
            alert('Room was closed by host');
        });

        socket.on('error', (err: { message: string }) => {
            alert(err.message);
        });

        set({ socket });
    },

    setRole: (role: 'NONE' | 'HOST' | 'PLAYER') => set({ role }),

    createRoom: (name: string) => {
        get().socket?.emit('createRoom', { name });
    },

    joinRoom: (name: string, code: string, avatar?: string) => {
        get().socket?.emit('joinRoom', { name, code, avatar });
    },

    startGame: () => {
        get().socket?.emit('startGame');
    },

    selectGame: (gameId: string) => {
        get().socket?.emit('selectGame', gameId);
    },

    voteGame: (gameId: string) => {
        get().socket?.emit('voteGame', gameId);
    },

    gameInput: (data: any) => {
        get().socket?.emit('gameInput', data);
    },

    sendChat: (message: string) => {
        get().socket?.emit('chatMessage', message);
    },

    nextRound: () => {
        get().socket?.emit('nextRound');
    },

    backToLobby: () => {
        get().socket?.emit('backToLobby');
    }
}));
