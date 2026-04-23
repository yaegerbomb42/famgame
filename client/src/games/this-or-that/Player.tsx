import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const HigherLowerPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playClick } = useSound();
    const [voted, setVoted] = useState<'HIGHER' | 'LOWER' | null>(null);

    const { phase, gameData } = (gameState as any) || {};
    const { 
        cardA,
        cardB,
        statLabel,
        submissions = {}, 
        round,
        timer: timeLeft 
    } = gameData || {};

    const myId = socket?.id || '';
    const mySubmission = submissions[myId];

    useEffect(() => {
        setVoted(null);
    }, [round]);

    const handleVote = (choice: 'HIGHER' | 'LOWER') => {
        if (voted || mySubmission) return;
        setVoted(choice);
        socket?.emit('gameInput', { choice });
        playClick();
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'COUNTDOWN') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem] animate-pulse">📈</div>
                <div className="text-center space-y-4 max-w-sm">
                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">HIGHER OR LOWER</h2>
                    <p className="text-2xl text-[#ffff00] font-black uppercase tracking-widest animate-pulse">STATISTICS BATTLE</p>
                    <p className="text-lg text-white/40 font-medium">
                        Compare {cardA?.name} to {cardB?.name}. Is the second one higher or lower?
                    </p>
                </div>
            </div>
        );
    }

    if (phase === 'RESULTS') {
        return (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 bg-[#0d0f1a]">
                <div className="text-9xl animate-bounce">📊</div>
                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">FINAL STATS</h2>
                <p className="text-2xl text-white/40 font-black uppercase tracking-widest">See the leaderboard!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-6 bg-[#0d0f1a] overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col space-y-8"
                    >
                        {(voted || mySubmission) ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="text-[15rem] drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                                >
                                    {voted === 'HIGHER' ? '🚀' : '📉'}
                                </motion.div>
                                <div className="space-y-4">
                                    <h3 className={`text-6xl font-black uppercase tracking-tighter italic ${voted === 'HIGHER' ? 'text-[#00ff00]' : 'text-[#ff00ff]'}`}>
                                        {voted} LOCKED
                                    </h3>
                                    <p className="text-2xl text-white/40 font-black uppercase tracking-widest">Waiting for the verdict...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col justify-center gap-8">
                                <div className="text-center space-y-4">
                                    <span className="text-2xl font-black text-white/20 uppercase tracking-[0.4em]">COMPARING</span>
                                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tight">{statLabel}</h3>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleVote('HIGHER')}
                                    className="flex-1 bg-gradient-to-br from-[#00ff00]/20 to-[#1a1f3a] rounded-[3rem] border-8 border-[#00ff00]/40 p-10 flex flex-col items-center justify-center space-y-4 shadow-[0_0_50px_rgba(0,255,0,0.1)] active:border-[#00ff00]"
                                >
                                    <span className="text-8xl">🔼</span>
                                    <span className="text-5xl font-black text-[#00ff00] uppercase italic tracking-tighter">HIGHER</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleVote('LOWER')}
                                    className="flex-1 bg-gradient-to-br from-[#ff00ff]/20 to-[#1a1f3a] rounded-[3rem] border-8 border-[#ff00ff]/40 p-10 flex flex-col items-center justify-center space-y-4 shadow-[0_0_50px_rgba(255,0,255,0.1)] active:border-[#ff00ff]"
                                >
                                    <span className="text-8xl">🔽</span>
                                    <span className="text-5xl font-black text-[#ff00ff] uppercase italic tracking-tighter">LOWER</span>
                                </motion.button>

                                {timeLeft !== undefined && (
                                    <div className="text-center">
                                        <span className="text-4xl font-black font-mono text-white/20 tracking-[0.2em]">{timeLeft}s</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-12"
                    >
                        <motion.div 
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-[15rem]"
                        >
                            🔎
                        </motion.div>
                        <h3 className="text-6xl font-black text-[#ffff00] uppercase tracking-tighter italic drop-shadow-[0_0_30px_rgba(255,255,0,0.5)]">THE VERDICT</h3>
                        <p className="text-2xl text-white/40 font-black uppercase tracking-widest">Did you guess correctly?</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HigherLowerPlayer;