import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { GameMode, AllGameData, ChatMessage, AiPersona } from '../types/game';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export interface Player {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
    score: number;
    isHost?: boolean;
    gameVote?: string;
}

export interface GameState {
    roomCode: string;
    players: Record<string, Player>;
    status: GameMode;
    currentGame: string | null;
    gameData: AllGameData;
    chat: ChatMessage[];
    aiPersona: AiPersona;
    customGames: unknown[];
}

export interface GameStore {
    socket: Socket | null;
    gameState: GameState | null;
    isConnected: boolean;
    serverStatus: 'IDLE' | 'WAKING' | 'READY' | 'ERROR';
    role: 'NONE' | 'HOST' | 'PLAYER';

    // Actions
    initSocket: () => Promise<void>;
    setRole: (role: 'NONE' | 'HOST' | 'PLAYER') => void;
    createRoom: (name: string) => void;
    joinRoom: (name: string, code: string, avatar?: string, color?: string) => void;
    startGame: () => void;
    selectGame: (gameId: string | { type: string; category: string }) => void;
    voteGame: (gameId: string) => void;
    gameInput: (data: Record<string, unknown>) => void;
    sendChat: (message: string) => void;
    nextRound: () => void;
    backToLobby: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    socket: null,
    gameState: null,
    isConnected: false,
    serverStatus: 'IDLE',
    role: 'NONE',

    initSocket: async () => {
        if (get().socket) return;
        set({ serverStatus: 'WAKING' });

        // Pre-flight "wake up" call
        try {
            await fetch(SOCKET_URL, { mode: 'no-cors' });
        } catch {
            console.log('Server wakeup ping sent (or failed, which is expected during boot)');
        }

        const socket = io(SOCKET_URL, {
            reconnectionAttempts: 20,
            reconnectionDelay: 2000,
        });

        socket.on('connect', () => {
            set({ isConnected: true, serverStatus: 'READY' });
            console.log('Connected to server');
        });

        socket.on('gameState', (state: GameState) => {
            set({ gameState: state, serverStatus: 'READY' });
        });

        socket.on('disconnect', () => {
            set({ isConnected: false });
        });

        socket.on('connect_error', () => {
            set({ serverStatus: 'WAKING' });
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

    joinRoom: (name: string, code: string, avatar?: string, color?: string) => {
        get().socket?.emit('joinRoom', { name, code, avatar, color });
    },

    startGame: () => {
        get().socket?.emit('startGameSequence');
    },

    selectGame: (gameId: string | { type: string; category: string }) => {
        get().socket?.emit('selectGame', gameId);
    },

    voteGame: (gameId: string) => {
        get().socket?.emit('voteGame', gameId);
    },

    gameInput: (data: Record<string, unknown>) => {
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
