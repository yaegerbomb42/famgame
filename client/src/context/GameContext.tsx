import React, { createContext, useEffect, useState, useContext } from 'react';
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

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only connect when clearly needed? For now auto-connect is fine for simplicity
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket');
        });

        newSocket.on('gameState', (state: GameState) => {
            console.log('Game state update:', state);
            setGameState(state);
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            newSocket.close();
        };
    }, []);

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

export const useGame = () => useContext(GameContext);
