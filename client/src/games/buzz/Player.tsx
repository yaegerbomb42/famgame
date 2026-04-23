import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const BuzzPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playBuzz, playError } = useSound();
    const [isBanned, setIsBanned] = useState(false);

    useEffect(() => {
        const handleFalseStart = () => {
            setIsBanned(true);
            playError();
            if (navigator.vibrate) navigator.vibrate(200);
            setTimeout(() => setIsBanned(false), 2000);
        };
        socket?.on('falseStart', handleFalseStart);
        return () => { socket?.off('falseStart', handleFalseStart); };
    }, [socket, playError]);

    const handleBuzz = () => {
        if (isBanned) return;
        socket?.emit('gameInput', {});
        playBuzz();
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    };

    const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
    const phase = gameData.phase as string | undefined;
    const { winnerId } = gameData;
    const isWinner = winnerId === socket?.id;

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10">
                <div className="text-[12rem] animate-pulse">{isIntro ? '⚡' : '🏆'}</div>
                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    {isIntro ? "BE FAST!" : "GAME OVER"}
                </h2>
                <p className="text-2xl text-white/50 font-black uppercase tracking-widest leading-tight">
                    {isIntro ? "Watch the screen, buzz on the signal!" : "Check the leaderboard!"}
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
            <AnimatePresence mode="wait">
                {isBanned && (
                    <motion.div
                        key="banned"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="flex flex-col items-center gap-10"
                    >
                        <div className="text-[15rem] animate-pulse">⏰</div>
                        <div className="p-10 glass-panel border-8 border-[#ffff00] rounded-[3rem] text-center shadow-[0_0_80px_rgba(255,255,0,0.4)]">
                            <h2 className="text-6xl font-black text-[#ffff00] uppercase tracking-tighter mb-4 italic">TOO SOON!</h2>
                            <p className="text-white/60 text-2xl font-black uppercase tracking-widest">COOLDOWN ACTIVE</p>
                        </div>
                    </motion.div>
                )}

                {!isBanned && phase === 'PLAYING' && !winnerId && !gameData.active && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center space-y-20 w-full"
                    >
                        <div className="text-center space-y-6">
                            <p className="text-4xl font-black uppercase tracking-[0.4em] text-[#00ffff] drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] animate-pulse">EYES ON SCREEN</p>
                            <p className="text-xl text-white/30 font-black uppercase tracking-widest">Wait for the signal...</p>
                        </div>
                        
                        {/* Fake button to encourage engagement but handle false starts */}
                        <motion.button 
                            whileTap={{ scale: 0.85 }}
                            onClick={handleBuzz}
                            className="w-80 h-80 rounded-[4rem] border-8 border-white/5 bg-[#1a1f3a]/80 shadow-2xl relative"
                        >
                            <div className="absolute inset-8 border-4 border-white/5 rounded-[2.5rem]" />
                        </motion.button>
                    </motion.div>
                )}

                {!isBanned && phase === 'PLAYING' && gameData.active && (
                    <motion.div
                        key="active"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center w-full"
                    >
                        <motion.button
                            animate={{ 
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    "0 0 40px rgba(0,255,255,0.4)",
                                    "0 0 100px rgba(0,255,255,0.8)",
                                    "0 0 40px rgba(0,255,255,0.4)"
                                ]
                            }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleBuzz}
                            className="w-full h-full max-h-[70vh] rounded-[4rem] bg-gradient-to-br from-[#00ffff] to-[#00ff00] border-8 border-white/20 flex flex-col items-center justify-center p-12 group"
                        >
                            <span className="text-9xl font-black text-[#0d0f1a] uppercase italic tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] leading-none mb-4">
                                BUZZ!
                            </span>
                            <span className="text-2xl font-black text-[#0d0f1a]/60 uppercase tracking-widest">TAP NOW</span>
                        </motion.button>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="buzzed"
                        initial={{ scale: 0.5, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center space-y-12 text-center w-full"
                    >
                        <div className="text-[15rem] leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                            {isWinner ? '🏆' : '💨'}
                        </div>
                        <div className={`p-12 glass-panel border-8 w-full rounded-[4rem] ${isWinner ? 'border-[#00ff00] shadow-[0_0_60px_rgba(0,255,0,0.4)]' : 'border-[#ff00ff] shadow-[0_0_60px_rgba(255,0,255,0.2)]'}`}>
                            <h2 className={`text-6xl font-black uppercase tracking-tighter italic ${isWinner ? 'text-[#00ff00]' : 'text-[#ff00ff]'}`}>
                                {isWinner ? 'FIRST PLACE!' : 'TOO SLOW!'}
                            </h2>
                            <p className="text-2xl text-white/40 font-black uppercase tracking-widest mt-4">
                                {isWinner ? 'POINTS AWARDED' : 'BETTER LUCK NEXT TIME'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BuzzPlayer;