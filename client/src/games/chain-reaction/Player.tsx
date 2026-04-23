import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const ChainReactionPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playError } = useSound();
    const [word, setWord] = useState('');

    const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
    const phase = gameData.phase as string | undefined;
    const activePlayerId = gameData.currentPlayerId as string | undefined;
    const chain = (gameData.chain as { word: string }[] | undefined) ?? [];
    const lastWord = chain.length > 0 ? chain[chain.length - 1].word : '...';
    const timeLeft = typeof gameData.timer === 'number' ? gameData.timer : 0;
    const isMyTurn = socket?.id === activePlayerId;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = word.trim();
        if (trimmed.length > 0 && isMyTurn) {
            socket?.emit('gameInput', { word: trimmed });
            setWord('');
            playSuccess();
            if (navigator.vibrate) navigator.vibrate(50);
        } else {
            playError();
        }
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10">
                <div className="text-[12rem] animate-pulse">{isIntro ? '🔗' : '💥'}</div>
                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    {isIntro ? "CHAIN ON!" : "CHAIN BROKEN"}
                </h2>
                <p className="text-2xl text-white/50 font-black uppercase tracking-widest leading-tight">
                    {isIntro ? "Connect the words, don't miss a link!" : "Check the final length!"}
                </p>
            </div>
        );
    }

    if (phase === 'REVEAL') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10">
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[12rem]">🔗</motion.div>
                <div className="space-y-4">
                    <h3 className="text-6xl font-black uppercase tracking-tighter text-[#00ff00] italic">CHAIN COMPLETE!</h3>
                    <p className="text-3xl font-black text-white/40 uppercase tracking-widest">Final chain: <span className="text-[#ffff00]">{chain.length}</span> links</p>
                    <p className="text-2xl text-white/30 font-black uppercase tracking-[0.4em] animate-pulse">Check the big screen!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#0d0f1a]">
            <AnimatePresence mode="wait">
                {isMyTurn ? (
                    <motion.div
                        key="my-turn"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center justify-center w-full space-y-12"
                    >
                        <div className={`text-[12rem] font-black font-mono leading-none ${timeLeft <= 3 ? 'text-[#ff00ff] animate-pulse' : 'text-[#ffff00]'} drop-shadow-[0_0_40px_currentColor]`}>
                            {timeLeft}
                        </div>

                        <div className="w-full space-y-4 text-center">
                            <span className="text-xl font-black uppercase tracking-[0.4em] text-white/30">Connect to:</span>
                            <div className="p-8 glass-panel border-4 border-[#00ff00] rounded-[2.5rem] shadow-[0_0_30px_rgba(0,255,0,0.3)] transform -rotate-1">
                                <h3 className="text-6xl font-black text-white uppercase italic tracking-tighter">{lastWord}</h3>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="w-full space-y-8">
                            <input
                                type="text"
                                value={word}
                                onChange={(e) => setWord(e.target.value)}
                                placeholder="YOUR WORD..."
                                className="w-full py-10 px-8 bg-[#1a1f3a] border-4 border-[#00ffff]/30 rounded-[3rem] text-center text-4xl font-black text-white focus:outline-none focus:border-[#00ffff] focus:shadow-[0_0_40px_rgba(0,255,255,0.4)] transition-all placeholder:text-white/10 uppercase tracking-widest"
                                autoFocus
                                autoComplete="off"
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="w-full py-10 bg-gradient-to-r from-[#00ffff] to-[#ff00ff] rounded-[3rem] font-black text-4xl text-[#0d0f1a] uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(0,255,255,0.4)] border-4 border-white/20"
                            >
                                LINK IT 🔗
                            </motion.button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
                    >
                        <div className="text-[12rem] animate-pulse">📢</div>
                        <div className="space-y-4">
                            <h3 className="text-5xl font-black uppercase tracking-tighter text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                Watch The Chain
                            </h3>
                            <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-relaxed">
                                Get ready to link!<br/>Current: <span className="text-[#ffff00]">{lastWord}</span>
                            </p>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent shadow-[0_0_20px_#00ffff]"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChainReactionPlayer;