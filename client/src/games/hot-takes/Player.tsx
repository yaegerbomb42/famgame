import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const HotTakesPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playError } = useSound();
    
    const [take, setTake] = useState('');

    const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
    const phase = gameData.phase as string | undefined;
    const { prompt = "WHAT'S YOUR TAKE?", submissions = {}, votes = {}, subPhase } = gameData;
    const hasSubmitted = !!submissions[socket?.id || ''];
    const hasVoted = !!votes[socket?.id || ''];

    const handleSubmit = () => {
        if (!take.trim()) {
            playError();
            return;
        }
        socket?.emit('gameInput', { submission: take });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleVote = (targetId: string) => {
        if (targetId === socket?.id) {
            playError();
            return;
        }
        socket?.emit('gameInput', { vote: targetId });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-gradient-to-b from-[#0d0f1a] to-[#1a1f3a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '🔥' : '💥'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic text-center">
                        {isIntro ? "THINGS GETTING" : "TAKEDOWN"}
                    </h2>
                    <p className="text-2xl text-[#ff4500] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "HOT IN HERE" : "SMOKING RESULTS"}
                    </p>
                </div>
                <div className="w-full h-px bg-white/10" />
            </div>
        );
    }

    if (phase === 'REVEAL') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[12rem]">🔥</motion.div>
                <div className="space-y-4">
                    <h3 className="text-6xl font-black uppercase tracking-tighter text-[#ff4500] italic">REVEAL TIME!</h3>
                    <p className="text-2xl text-white/30 font-black uppercase tracking-[0.4em] animate-pulse">Watch the big screen!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#0d0f1a]">
            <AnimatePresence mode="wait">
                {(phase === 'PLAYING' && subPhase === 'INPUT') && (
                    <motion.div
                        key="submitting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col space-y-10"
                    >
                        {hasSubmitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-[12rem]">🌶️</motion.div>
                                <h3 className="text-6xl font-black uppercase tracking-tighter text-[#ff4500] italic">TAKE RECEIVED!</h3>
                                <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose">Waiting for other spicy takes...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-10">
                                <div className="text-center space-y-4 w-full">
                                    <span className="text-xl font-black uppercase tracking-[0.4em] text-white/30">THE TOPIC:</span>
                                    <div className="p-8 glass-panel border-4 border-[#ff4500] rounded-[3rem] shadow-[0_0_30px_rgba(255,69,0,0.3)] bg-white/5 backdrop-blur-3xl">
                                        <h3 className="text-5xl font-black text-white uppercase tracking-tighter italic leading-none">{prompt}</h3>
                                    </div>
                                </div>

                                <textarea
                                    value={take}
                                    onChange={(e) => setTake(e.target.value)}
                                    placeholder="TYPE YOUR TAKE..."
                                    className="w-full h-64 bg-[#1a1f3a] border-8 border-white/5 rounded-[4rem] p-10 text-4xl font-black text-white placeholder:text-white/10 focus:outline-none focus:border-[#ff4500]/50 transition-all shadow-inner"
                                    maxLength={100}
                                />

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmit}
                                    disabled={!take.trim()}
                                    className="w-full bg-gradient-to-r from-[#ff4500] to-[#ffff00] text-[#0d0f1a] py-8 rounded-[3rem] font-black text-4xl uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(255,69,0,0.4)] border-4 border-white/20 disabled:opacity-30 disabled:grayscale transition-all"
                                >
                                    SUBMIT TAKE
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'PLAYING' && subPhase === 'VOTE' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col space-y-10"
                    >
                        {hasVoted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-[12rem]">🔥</motion.div>
                                <h3 className="text-6xl font-black uppercase tracking-tighter text-[#ffff00] italic">VOTE CAST!</h3>
                                <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose">Waiting for final rankings...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center w-full space-y-10">
                                <div className="text-center space-y-4">
                                    <span className="text-xl font-black uppercase tracking-[0.4em] text-white/30">PICK THE HOTTEST:</span>
                                    <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">WHO'S RIGHT?</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-6 w-full max-h-[60vh] overflow-y-auto scrollbar-hide px-4 pb-20">
                                    {Object.entries(submissions).map(([pid, text]: [string, any]) => (
                                        <motion.button
                                            key={pid}
                                            whileTap={{ scale: pid === socket?.id ? 1 : 0.97 }}
                                            onClick={() => handleVote(pid)}
                                            disabled={pid === socket?.id}
                                            className={`p-10 glass-panel border-4 rounded-[3.5rem] transition-all flex flex-col items-center justify-center space-y-6 relative group ${pid === socket?.id ? 'border-white/5 opacity-50 grayscale' : 'border-white/10 hover:border-[#ff4500]/50 bg-white/5 active:bg-[#ff4500]/10 shadow-2xl'}`}
                                        >
                                            <span className="text-3xl font-black text-white italic leading-tight group-active:scale-95 transition-transform">"{text}"</span>
                                            {pid === socket?.id && (
                                                <span className="absolute inset-0 flex items-center justify-center bg-[#0d0f1a]/80 font-black text-white/30 uppercase tracking-[0.5em] rounded-[3rem]">MY TAKE</span>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HotTakesPlayer;