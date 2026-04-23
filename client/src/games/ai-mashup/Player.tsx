import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const AIMashupPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playError } = useSound();
    const [input, setInput] = useState('');

    const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
    const phase = gameData.phase as string | undefined;
    const submissions = (gameData.submissions ?? {}) as Record<string, { prompt?: string }>;
    const timeLeft = typeof gameData.timer === 'number' ? gameData.timer : 0;

    const myId = socket?.id || '';
    const mySubmission = submissions[myId];

    const handleSubmit = () => {
        const trimmed = input.trim();
        if (trimmed.length < 5) {
            playError();
            return;
        }
        socket?.emit('gameInput', { prompt: trimmed });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '🤖' : '💾'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic text-center">
                        {isIntro ? "AI MASHUP" : "SESSION ARCHIVED"}
                    </h2>
                    <p className="text-2xl text-[#ff00ff] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "HACK THE MAINFRAME" : "DATA ANALYSIS COMPLETE"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-6 bg-[#0a0a0a] overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col space-y-6"
                    >
                        {mySubmission ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                                <motion.div 
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 5, -5, 0]
                                    }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="text-[12rem]"
                                >
                                    📥
                                </motion.div>
                                <div className="space-y-4">
                                    <h3 className="text-5xl font-black uppercase tracking-tighter text-[#00ffff] italic font-black">UPLINK ACTIVE</h3>
                                    <p className="text-2xl text-white/30 font-black uppercase tracking-widest leading-loose">Your prompt is being processed by the hive mind...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col space-y-8">
                                <div className="text-center space-y-2">
                                    <span className="text-xl font-black text-white/20 uppercase tracking-[0.4em]">PROMPT INPUT</span>
                                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter italic">CREATE SOMETHING <span className="text-[#ff00ff]">WEIRD</span></h2>
                                </div>

                                <div className="flex-1 flex flex-col justify-center gap-8">
                                    <div className="relative w-full">
                                        <div className="absolute -inset-2 bg-gradient-to-br from-[#ff00ff] to-[#00ffff] rounded-[3.5rem] blur-xl opacity-20 pointer-events-none" />
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="A CYBERNETIC PENGUIN RIDING A TOASTER..."
                                            className="relative z-10 w-full h-80 bg-[#1a1f3a] border-8 border-white/5 rounded-[3.5rem] p-12 text-3xl font-black text-white placeholder:text-white/5 focus:outline-none focus:border-[#ff00ff]/30 transition-all shadow-inner uppercase italic resize-none"
                                            autoFocus
                                        />
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubmit}
                                        disabled={input.trim().length < 5}
                                        className="w-full py-10 bg-gradient-to-r from-[#ff00ff] to-[#00ffff] rounded-[2.5rem] text-4xl font-black uppercase italic tracking-tighter text-white shadow-[0_20px_50px_rgba(255,0,255,0.3)] border-4 border-white/20 disabled:opacity-20"
                                    >
                                        TRANSMIT DATA
                                    </motion.button>
                                </div>

                                <div className="flex items-center justify-between text-white/20">
                                    <div className="text-xs font-black uppercase tracking-widest">ENCRYPTION: AES-256</div>
                                    <div className="text-3xl font-black font-mono tracking-widest text-[#00ffff] animate-pulse">{timeLeft}s</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-12"
                    >
                        <motion.div 
                            animate={{ 
                                y: [0, -20, 0],
                                rotateY: [0, 360]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="text-[12rem]"
                        >
                            🌠
                        </motion.div>
                        <div className="space-y-4">
                            <h3 className="text-6xl font-black text-[#00ffff] uppercase tracking-tighter italic font-black drop-shadow-[0_0_30px_#00ffff44]">RECONSTRUCTION</h3>
                            <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose italic">Witness the monstrosity you've co-created on the big screen.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIMashupPlayer;