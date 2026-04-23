import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const PollPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess } = useSound();
    const [guess, setGuess] = useState(50);
    
    const { phase, gameData } = (gameState as any) || {};
    const { currentQuestion = "...", submissions = {}, timer: timeLeft } = gameData || {};
    const hasGuessed = !!submissions[socket?.id || ''];

    const handleGuessSubmit = () => {
        if (hasGuessed) return;
        socket?.emit('gameInput', { guess });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'RESULTS' || phase === 'COUNTDOWN') {
        const isIntro = phase === 'INTRO';
        const isCountdown = phase === 'COUNTDOWN';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-gradient-to-b from-[#0d0f1a] to-[#1a1f3a]">
                <div className="text-[12rem] animate-pulse">
                    {isIntro ? '🗳️' : isCountdown ? '⏱️' : '⚖️'}
                </div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic text-center">
                        {isIntro ? "GLOBAL STATS" : isCountdown ? "READY?" : "THE VERDICT"}
                    </h2>
                    <p className="text-2xl text-[#ffff00] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "GUESS THE PERCENTAGE" : isCountdown ? "NEXT ROUND INCOMING" : "JUDGMENT DAY"}
                    </p>
                </div>
                <div className="w-full h-px bg-white/10" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#0d0f1a]">
            {/* QUESTION BOX */}
            <div className="w-full p-8 glass-panel border-4 border-[#ffff00] rounded-[3rem] shadow-[0_0_30px_rgba(255,255,0,0.2)] bg-white/5 backdrop-blur-3xl text-center">
                <span className="text-xl font-black uppercase text-white/30 tracking-[0.4em] mb-2 block">GLOBAL AVERAGE</span>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tight leading-tight px-4">
                    "{currentQuestion}"
                </h3>
            </div>

            <AnimatePresence mode="wait">
                {hasGuessed ? (
                    <motion.div
                        key="voted"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <div className="p-12 bg-[#1a1f3a] rounded-[4rem] border-8 border-[#00ffff] shadow-[0_0_60px_rgba(0,255,255,0.4)] flex flex-col items-center gap-4">
                            <div className="text-9xl font-black text-white drop-shadow-2xl">{submissions[socket?.id || '']}%</div>
                            <div className="text-3xl font-black text-white/40 uppercase tracking-widest italic">
                                YOUR GUESS
                            </div>
                        </div>
                        <h3 className="text-5xl font-black uppercase tracking-tighter text-[#ffff00] italic">LOCKED IN!</h3>
                        <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose">Wait for the reveal...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="guessing"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col w-full space-y-12 items-center"
                    >
                        <div className="w-full space-y-8 mt-8">
                            <div className="text-center">
                                <span className="text-9xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{guess}%</span>
                            </div>
                            
                            <div className="relative w-full px-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={guess}
                                    onChange={(e) => setGuess(parseInt(e.target.value))}
                                    className="w-full h-12 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#ffff00] border-4 border-white/5"
                                />
                                <div className="flex justify-between mt-4 text-white/20 font-black text-xl px-2">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleGuessSubmit}
                            className="w-full py-10 bg-gradient-to-r from-[#00ffff] to-[#00ff00] rounded-[3rem] text-4xl font-black text-[#0d0f1a] uppercase tracking-widest shadow-[0_20px_50px_rgba(0,255,255,0.3)] border-t-8 border-white/30"
                        >
                            LOCK IT IN
                        </motion.button>

                        {timeLeft !== undefined && (
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
                                <div className={`text-7xl font-black font-mono tracking-tighter ${timeLeft <= 5 ? 'text-[#ff00ff] animate-pulse' : 'text-white/20'}`}>
                                    {timeLeft}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PollPlayer;