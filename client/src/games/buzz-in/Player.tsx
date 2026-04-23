import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const BuzzInPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playError } = useSound();
    
    const { phase, gameData } = (gameState as any) || {};
    const { active, winnerId } = gameData || {};
    
    const isWinner = winnerId === socket?.id;
    const hasWinner = !!winnerId;

    const handleBuzz = () => {
        if (hasWinner) return;
        
        socket?.emit('gameInput', { action: 'buzz' });
        
        if (active) {
            playSuccess();
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else {
            playError();
            if (navigator.vibrate) navigator.vibrate([200]);
        }
    };

    if (phase === 'INTRO') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-gradient-to-b from-[#0d0f1a] to-[#1a1f3a]">
                <div className="text-[12rem] animate-pulse">⚡</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">GET READY</h2>
                    <p className="text-2xl text-[#ffff00] font-black uppercase tracking-widest animate-pulse">
                        FINGERS ON THE BUTTON
                    </p>
                </div>
            </div>
        );
    }

    if (phase === 'REVEAL') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0d0f1a]">
                <AnimatePresence mode="wait">
                    {isWinner ? (
                        <motion.div
                            key="winner"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-12"
                        >
                            <div className="text-[12rem] drop-shadow-[0_0_50px_rgba(0,255,0,0.8)]">🏆</div>
                            <div>
                                <h2 className="text-7xl font-black text-[#00ff00] uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(0,255,0,0.5)]">
                                    YOU BUZZED FIRST!
                                </h2>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="loser"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-12"
                        >
                            <div className="text-[12rem] opacity-50 grayscale">🐢</div>
                            <div>
                                <h2 className="text-6xl font-black text-white/50 uppercase italic tracking-tighter">
                                    TOO SLOW
                                </h2>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // PLAYING PHASE
    return (
        <div className="flex-1 flex flex-col p-6 bg-[#0d0f1a]">
            <div className="flex-1 flex items-center justify-center">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleBuzz}
                    disabled={hasWinner}
                    className={`
                        relative w-full max-w-sm aspect-square rounded-full flex items-center justify-center text-6xl font-black italic tracking-tighter uppercase border-8 transition-colors duration-300
                        ${hasWinner 
                            ? 'bg-gray-800 border-gray-600 text-gray-500 opacity-50'
                            : active 
                                ? 'bg-[#00ff00] border-[#00cc00] text-black shadow-[0_0_100px_rgba(0,255,0,0.6)]' 
                                : 'bg-[#ff0000] border-[#cc0000] text-white shadow-[0_0_50px_rgba(255,0,0,0.4)]'
                        }
                    `}
                >
                    <div className="absolute inset-0 rounded-full border-[16px] border-white/20 pointer-events-none" />
                    <span className="relative z-10 drop-shadow-md">
                        {hasWinner ? 'OVER' : active ? 'BUZZ!' : 'WAIT'}
                    </span>
                </motion.button>
            </div>
        </div>
    );
};

export default BuzzInPlayer;
