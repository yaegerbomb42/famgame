import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import type { GameMode, AllGameData, ChatMessage, AiPersona } from '../types/game';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || (
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? window.location.origin
        : 'http://localhost:3000'
);

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
    phase?: string;
    gameData: AllGameData;
    chat: ChatMessage[];
    aiPersona: AiPersona;
    hostId?: string | null;
    customQuips?: Array<{text: string, mood: 'hype' | 'savage' | 'neutral'}>;
}

export interface GameStore {
    socket: Socket | null;
    gameState: GameState | null;
    isConnected: boolean;
    role: 'NONE' | 'HOST' | 'PLAYER';
    continuousMode: boolean;
    publicRoomPreference: boolean;

    latestNarratorMessage: { text: string; quip?: string; mood?: string } | null;

    // Actions
    initSocket: () => void;
    setRole: (role: 'NONE' | 'HOST' | 'PLAYER') => void;
    setPublicRoomPreference: (val: boolean) => void;
    createRoom: (name: string, isPublic?: boolean) => void;
    joinRoom: (name: string, code: string, avatar?: string, color?: string) => void;
    startGame: () => void;
    setContinuousMode: (isContinuous: boolean) => void;
    selectGame: (gameId: string | { type: string; category: string }) => void;
    voteGame: (gameId: string) => void;
    gameInput: (data: Record<string, unknown>) => void;
    sendChat: (message: string) => void;
    nextRound: () => void;
    backToLobby: () => void;
    /** Host: end stuck round → RESULTS */
    hostForceEndRound: () => void;
    /** Host: open game picker immediately */
    openGameSelect: () => void;
    /** Host: QR / party lobby */
    returnToPartyLobby: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    socket: null,
    gameState: null,
    isConnected: false,
    role: 'NONE',
    continuousMode: false,
    publicRoomPreference: true,
    latestNarratorMessage: null,

    initSocket: () => {
        if (get().socket) return;

        const socket = io(SOCKET_URL, {
            transports: ['polling', 'websocket'],
            upgrade: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            timeout: 10000,
        });

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

        socket.on('narratorMessage', (msg: any) => {
            set({ latestNarratorMessage: msg });
        });

        socket.on('error', (err: { message: string }) => {
            alert(err.message);
        });

        set({ socket });
    },

    setRole: (role: 'NONE' | 'HOST' | 'PLAYER') => set({ role }),

    setPublicRoomPreference: (val: boolean) => set({ publicRoomPreference: val }),

    createRoom: (name: string, isPublic?: boolean) => {
        get().socket?.emit('createRoom', { name, isPublic });
    },

    joinRoom: (name: string, code: string, avatar?: string, color?: string) => {
        get().socket?.emit('joinRoom', { name, code, avatar, color });
    },

    startGame: () => {
        get().socket?.emit('startGame');
    },

    setContinuousMode: (isContinuous: boolean) => {
        set({ continuousMode: isContinuous });
        get().socket?.emit('setContinuousMode', isContinuous);
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
    },

    hostForceEndRound: () => {
        get().socket?.emit('hostForceEndRound');
    },
    
    openGameSelect: () => {
        get().socket?.emit('openGameSelect');
    },

    returnToPartyLobby: () => {
        get().socket?.emit('returnToPartyLobby');
    }
}));
