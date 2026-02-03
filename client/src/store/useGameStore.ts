import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { GameType } from '../../../server/src/types';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

interface Player {
    id: string;
    name: string;
    avatar?: string;
    score: number;
    isHost?: boolean;
    gameVote?: string;
}

export interface ChatMessage {
    id: string;
    playerId: string | null;
    name: string;
    avatar?: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
    isAi?: boolean;
}

interface GameState {
    roomCode: string;
    players: Record<string, Player>;
    status: 'LOBBY' | 'GAME_SELECT' | 'PLAYING' | 'RESULTS';
    currentGame?: GameType;
    gameData?: any;
    timer?: number;
    chat?: ChatMessage[];
    aiPersona?: { name: string; avatar: string };
}

interface GameStore {
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
    nextRound: () => void;
    backToLobby: () => void;
    sendChat: (text: string) => void;
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

    setRole: (role) => set({ role }),

    createRoom: (name) => {
        get().socket?.emit('createRoom', { name });
    },

    joinRoom: (name, code, avatar) => {
        get().socket?.emit('joinRoom', { name, code, avatar });
    },

    startGame: () => {
        get().socket?.emit('startGame');
    },

    selectGame: (gameId) => {
        get().socket?.emit('selectGame', gameId);
    },

    nextRound: () => {
        get().socket?.emit('nextRound');
    },

    backToLobby: () => {
        get().socket?.emit('backToLobby');
    },
    sendChat: (text: string) => {
        get().socket?.emit('sendChat', { text });
    }
}));
