import React, { createContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'https://famgame.onrender.com';

interface Player {
    id: string;
    name: string;
    score: number;
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
    joinRoom: (name: string, code: string) => void;
    startGame: () => void;
    isConnected: boolean;
}

const GameContext = createContext<GameContextType>({} as GameContextType);

// Lazy initialization outside component to avoid re-creation, or inside state initializer
// Moving socket creation inside the component but controlled.
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize socket lazily
    const [socket] = useState<Socket>(() => io(SOCKET_URL));
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket');
        });

        socket.on('gameState', (state: GameState) => {
            console.log('Game state update:', state);
            setGameState(state);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socket.off('connect');
            socket.off('gameState');
            socket.off('disconnect');
            socket.close();
        };
    }, [socket]);

    const joinRoom = (name: string, code: string) => {
        socket?.emit('joinRoom', { name, code });
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
