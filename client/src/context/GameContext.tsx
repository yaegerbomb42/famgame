import React, { createContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export interface Player {
    id: string;
    name: string;
    avatar?: string;
    score: number;
    isHost?: boolean;
    gameVote?: string;
}

export interface GameState {
    roomCode: string;
    hostId: string | null;
    players: Record<string, Player>;
    status: 'LOBBY' | 'GAME_SELECT' | 'PLAYING' | 'RESULTS';
    currentGame?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gameData?: any;
    gameVotes: Record<string, number>;
    leaderboard: { name: string; score: number }[];
    timer?: number;
}

interface GameContextType {
    socket: Socket | null;
    gameState: GameState | null;
    createRoom: (name: string) => void;
    joinRoom: (name: string, code: string, avatar?: string) => void;
    startGame: () => void;
    selectGame: (gameId: string) => void;
    voteGame: (gameId: string) => void;
    isConnected: boolean;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Use lazy useState initializer - runs only once even with StrictMode
    const [socket] = useState<Socket>(() => io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    }));
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket at ' + SOCKET_URL);
        });

        socket.on('gameState', (state: GameState) => {
            // console.log('Game state update:', state); 
            setGameState(state);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socket.off('connect');
            socket.off('gameState');
            socket.off('disconnect');
            // Don't close socket - it persists for app lifetime
            // socket.close() breaks React StrictMode double-mount
        };
    }, [socket]);

    const createRoom = (name: string) => {
        socket?.emit('createRoom', { name });
    }

    const joinRoom = (name: string, code: string, avatar: string = '🙂') => {
        socket?.emit('joinRoom', { name, code, avatar });
    };

    const startGame = () => {
        socket?.emit('startGame');
    };

    const selectGame = (gameId: string) => {
        socket?.emit('selectGame', gameId);
    };

    const voteGame = (gameId: string) => {
        socket?.emit('voteGame', gameId);
    }

    return (
        <GameContext.Provider value={{ socket, gameState, createRoom, joinRoom, startGame, selectGame, voteGame, isConnected }}>
            {children}
        </GameContext.Provider>
    );
};

export { GameContext };
