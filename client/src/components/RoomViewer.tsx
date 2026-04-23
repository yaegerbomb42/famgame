import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';

interface RoomViewerData {
    code: string;
    players: number;
    status: string;
    game: string | null;
    lastActivity: number;
    isPublic: boolean;
}

interface RoomViewerProps {
    onBack: () => void;
}

export const RoomViewer: React.FC<RoomViewerProps> = ({ onBack }) => {
    const [rooms, setRooms] = useState<RoomViewerData[]>([]);
    const socket = useGameStore(s => s.socket);
    const initSocket = useGameStore(s => s.initSocket);

    useEffect(() => {
        initSocket();
    }, [initSocket]);

    useEffect(() => {
        if (!socket) return;

        socket.on('room_viewer_data', (data: RoomViewerData[]) => {
            setRooms(data);
        });

        // Request immediately
        socket.emit('request_public_rooms');

        const interval = setInterval(() => {
            socket.emit('request_public_rooms');
        }, 5000);

        return () => {
            socket.off('room_viewer_data');
            clearInterval(interval);
        };
    }, [socket]);

    return (
        <div className="min-h-screen bg-[#0f0a1e] p-8 md:p-12 text-white font-['Outfit']">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter mb-2">LIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">LOBBIES</span></h1>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Real-time Directory</span>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-4xl font-mono font-bold">{ rooms.filter(r => r.isPublic).length }</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Public Rooms</div>
                        </div>
                        <a 
                            href="/admin" 
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs opacity-20 hover:opacity-100 transition-all hover:bg-pink-500/20 hover:border-pink-500/30"
                            title="Admin Console"
                        >
                            🔐
                        </a>
                    </div>
                </div>
            </header>

            <div className="grid gap-6">
                <div className="grid grid-cols-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 sticky top-0 bg-[#0f0a1e] py-2 z-10">
                    <div>Status</div>
                    <div>Channel</div>
                    <div>Load</div>
                    <div>Active Game</div>
                    <div className="text-right whitespace-nowrap">Last Sync</div>
                    <div className="text-right">Action</div>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence>
                        {rooms.map((room) => (
                            <motion.div 
                                key={room.code}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] grid grid-cols-6 items-center hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center">
                                    {room.isPublic ? (
                                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> PUBLIC
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                            🔒 PRIVATE
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-2xl md:text-3xl font-mono font-black text-white group-hover:text-game-primary transition-colors">
                                        {room.isPublic ? room.code : '••••'}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xl">{room.players}</span>
                                    <div className="hidden md:block flex-1 max-w-[100px] h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-game-secondary transition-all duration-500" 
                                            style={{ width: `${Math.min(100, (room.players / 20) * 100)}%` }} 
                                        />
                                    </div>
                                </div>
                                <div className="font-black text-[10px] uppercase tracking-widest text-white/60 flex items-center gap-3 truncate">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] ${room.status === 'PLAYING' ? 'bg-game-primary/20 text-game-primary' : 'bg-white/5'}`}>
                                        {room.status}
                                    </span>
                                    <span className="hidden sm:inline">{room.game || ''}</span>
                                </div>
                                <div className="text-right text-[10px] font-mono text-white/30 truncate">
                                    {new Date(room.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-right">
                                    {room.isPublic ? (
                                        <a 
                                            href={`/?code=${room.code}`}
                                            className="px-4 py-2 md:px-6 md:py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all inline-block"
                                        >
                                            JOIN
                                        </a>
                                    ) : (
                                        <button 
                                            disabled
                                            className="px-4 py-2 md:px-6 md:py-3 bg-black/20 text-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed"
                                        >
                                            LOCKED
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {rooms.length === 0 && (
                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                        <div className="text-6xl mb-4 opacity-20">📡</div>
                        <div className="text-xl font-bold text-white/20 uppercase tracking-widest animate-pulse">Scanning for active frequencies...</div>
                    </div>
                )}
            </div>
            
            <div className="mt-12 text-center">
                <button 
                    onClick={onBack}
                    className="text-white/30 hover:text-white uppercase font-black text-xs tracking-[0.3em] transition-colors"
                >
                    Return to Main Menu
                </button>
            </div>
        </div>
    );
};
