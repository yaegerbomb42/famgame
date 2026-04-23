import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const MindMeldPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playError } = useSound();
    
    const [answer, setAnswer] = useState('');

    const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
    const phase = gameData.phase as string | undefined;
    const currentQuestion = gameData.prompt ?? 'SYNC YOUR THOUGHTS!';
    const submissions = gameData.submissions ?? {};
    const timeLeft = typeof gameData.timer === 'number' ? gameData.timer : 0;
    const hasSubmitted = !!submissions[socket?.id || ''];

    const handleSubmit = () => {
        if (!answer.trim()) {
            playError();
            return;
        }
        socket?.emit('gameInput', { answer });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-gradient-to-b from-[#0d0f1a] to-[#1a1f3a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '🧠' : '✨'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic text-center">
                        {isIntro ? "MIND READER" : "MELD FINALE"}
                    </h2>
                    <p className="text-2xl text-[#00ffff] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "START SYNCING" : "WAVELENGTHS REVEALED"}
                    </p>
                </div>
                <div className="w-full h-px bg-white/10" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#0d0f1a]">
            {/* QUESTION BOX */}
            <div className="w-full p-8 glass-panel border-4 border-[#00ffff] rounded-[3rem] shadow-[0_0_30px_rgba(0,255,255,0.2)] bg-white/5 backdrop-blur-3xl text-center">
                <span className="text-xl font-black uppercase text-white/30 tracking-[0.4em] mb-2 block">TELEPATHIC PROMPT</span>
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tight leading-none">
                    "{currentQuestion}"
                </h3>
            </div>

            <AnimatePresence mode="wait">
                {hasSubmitted ? (
                    <motion.div
                        key="submitted"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-[10rem] drop-shadow-[0_0_40px_rgba(0,255,0,0.4)]"
                        >
                            🔋
                        </motion.div>
                        <h3 className="text-6xl font-black uppercase tracking-tighter text-[#00ff00] italic">BRAINWAVES SENT!</h3>
                        <p className="text-2xl text-white/40 font-black uppercase tracking-widest">Awaiting other frequencies...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center justify-center space-y-12 w-full"
                    >
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                            className="w-full relative space-y-12"
                        >
                            <div className="w-full relative">
                                <textarea
                                    value={answer}
                                    maxLength={120}
                                    onChange={(e) => setAnswer(e.target.value.substring(0, 120))}
                                    placeholder="TYPE YOUR THOUGHT..."
                                    className="w-full py-10 px-8 bg-[#1a1f3a] border-8 border-white/5 rounded-[4rem] text-center text-4xl font-black text-white placeholder:text-white/10 focus:outline-none focus:border-[#00ffff]/50 transition-all shadow-inner uppercase italic resize-none"
                                    rows={2}
                                />
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={!answer.trim()}
                                className="w-full bg-gradient-to-r from-[#00ffff] to-[#00ff00] text-[#0d0f1a] py-10 rounded-[3rem] font-black text-4xl uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(0,255,255,0.4)] border-4 border-white/20 disabled:opacity-30 disabled:grayscale transition-all"
                            >
                                SEND THOUGHT
                            </motion.button>
                        </form>

                        <div className="flex items-center gap-6">
                            <span className="text-xl font-black text-white/20 uppercase tracking-[0.3em]">HURRY UP!</span>
                            <div className={`text-6xl font-black font-mono ${timeLeft <= 5 ? 'text-[#ff00ff] animate-pulse' : 'text-white/40'}`}>
                                {timeLeft}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MindMeldPlayer;