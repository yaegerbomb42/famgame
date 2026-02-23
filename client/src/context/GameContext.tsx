import React, { createContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SOCKET_URL = isLocalDev ? 'http://localhost:3000' : (import.meta.env.VITE_SERVER_URL || 'https://famgame.onrender.com');

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gameData?: any;
}

interface GameContextType {
    socket: Socket | null;
    gameState: GameState | null;
    joinRoom: (name: string, code: string, avatar?: string) => void;
    startGame: () => void;
    isConnected: boolean;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

// Initialize socket outside component to prevent multiple connections during StrictMode/HMR
const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true
});

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);
            console.log('Connected to socket');
        };

        const onDisconnect = () => {
            setIsConnected(false);
            console.log('Disconnected from socket');
        };

        const onGameState = (state: GameState) => {
            console.log('Game state update:', state);
            setGameState(state);
        };

        const onTimer = (time: number) => {
            setGameState(prev => {
                if (!prev || !prev.gameData) return prev;
                return { ...prev, gameData: { ...prev.gameData, timer: time } };
            });
        };

        // If already connected when effect runs
        if (socket.connected) {
            onConnect();
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('gameState', onGameState);
        socket.on('timer', onTimer);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('gameState', onGameState);
            socket.off('timer', onTimer);
        };
    }, []);

    const joinRoom = (name: string, code: string, avatar: string = '🙂') => {
        socket?.emit('joinRoom', { name, code, avatar });
    };

    const startGame = () => {
        socket?.emit('startGame');
    };

    return (
        <GameContext.Provider value={{ socket, gameState, joinRoom, startGame, isConnected }}>
            {children}
        </GameContext.Provider>
    );
};

// Export context for useGame hook in separate file
export { GameContext };
