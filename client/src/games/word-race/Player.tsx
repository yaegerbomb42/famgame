import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const WordRacePlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    useSound();
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const { phase, gameData } = (gameState as any) || {};
    const { 
        winnerId,
        timer: timeLeft 
    } = gameData || {};

    const myId = socket?.id || '';
    const hasWon = winnerId === myId;

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = input.trim().toLowerCase();
        if (trimmed.length < 1) return;
        
        socket?.emit('gameInput', { word: trimmed });
        setInput('');
        setTimeout(() => inputRef.current?.focus(), 10);
        if (navigator.vibrate) navigator.vibrate(30);
    };

    useEffect(() => {
        if (phase === 'PLAYING') {
            inputRef.current?.focus();
        } else {
            setInput('');
        }
    }, [phase]);

    if (phase === 'INTRO' || phase === 'RESULTS' || phase === 'COUNTDOWN') {
        const isIntro = phase === 'INTRO';
        const isCountdown = phase === 'COUNTDOWN';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem] animate-pulse">
                    {isIntro ? '🧩' : isCountdown ? '⏱️' : '🏁'}
                </div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic text-center">
                        {isIntro ? "RIDDLE RACE" : isCountdown ? "NEXT ROUND" : "RACE OVER"}
                    </h2>
                    <p className="text-2xl text-[#ffff00] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "SOLVE TO WIN" : isCountdown ? "READY YOUR THUMBS" : "CHECK THE STANDINGS"}
                    </p>
                </div>
            </div>
        );
    }

    if (phase === 'REVEAL') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[12rem]">
                    {hasWon ? '🏆' : '🏁'}
                </motion.div>
                <div className="space-y-4">
                    <h3 className={`text-6xl font-black uppercase tracking-tighter italic ${hasWon ? 'text-[#00ff00]' : 'text-[#ff00ff]'}`}>
                        {hasWon ? "YOU WON!" : "ROUND OVER"}
                    </h3>
                    <p className="text-2xl text-white/30 font-black uppercase tracking-[0.4em] animate-pulse">Check the answer!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#0d0f1a] overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col space-y-12 justify-center"
                    >
                        <div className="text-center space-y-4">
                            <span className="text-2xl font-black text-[#00ffff] uppercase tracking-[0.4em] animate-pulse">THE RIDDLE IS LIVE</span>
                            <h3 className="text-4xl font-black text-white uppercase italic tracking-tight opacity-40">
                                WATCH THE SCREEN
                            </h3>
                        </div>

                        <div className="flex flex-col space-y-8">
                            <form onSubmit={handleSubmit} className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="GUESS..."
                                    className="w-full bg-[#1a1f3a] border-8 border-white/10 rounded-[3rem] p-12 text-6xl font-black text-white placeholder:text-white/5 focus:outline-none focus:border-[#ffff00]/50 transition-all shadow-2xl uppercase italic text-center"
                                    autoFocus
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                />
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    type="submit"
                                    className="mt-8 w-full py-10 bg-[#ffff00] text-[#0d0f1a] rounded-[3rem] font-black text-4xl uppercase tracking-widest shadow-xl"
                                >
                                    SUBMIT
                                </motion.button>
                            </form>
                        </div>

                        {timeLeft !== undefined && (
                            <div className="text-center">
                                <div className={`text-6xl font-black font-mono tracking-widest ${timeLeft <= 5 ? 'text-[#ff00ff] animate-pulse' : 'text-white/10'}`}>
                                    {timeLeft}s
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WordRacePlayer;