import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const GlobalAveragesPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess } = useSound();
    
    const [guess, setGuess] = useState(50);

    const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
    const phase = gameData.phase as string | undefined;
    const { currentQuestion = '', guesses = {}, submissions = {}, timer: timeLeft } = gameData;
    const actualSubmissions = submissions || guesses; // Handle legacy naming if any
    const hasGuessed = actualSubmissions[socket?.id || ''] !== undefined;

    const handleLockIn = () => {
        if (hasGuessed) return;
        socket?.emit('gameInput', { guess });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-gradient-to-b from-[#0d0f1a] to-[#1a1f3a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '📊' : '🎯'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic">
                        {isIntro ? "GUESS THE WORLD" : "ACCURACY CHECK"}
                    </h2>
                    <p className="text-2xl text-[#00ff00] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "SLIDE TO PERFECTION" : "FINAL STATS"}
                    </p>
                </div>
                <div className="w-full h-px bg-white/10" />
            </div>
        );
    }

    if (phase === 'REVEAL') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12">
                <div className="text-[15rem] leading-none drop-shadow-[0_0_50px_rgba(0,255,255,0.4)] animate-pulse">📺</div>
                <div className="space-y-4">
                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">REVEAL TIME</h2>
                    <p className="text-2xl text-[#00ffff] font-black uppercase tracking-[0.4em]">WATCH THE SCREEN!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#0d0f1a]">
            {/* QUESTION HEADER */}
            <div className="w-full p-8 glass-panel border-4 border-[#00ffff] rounded-[3rem] shadow-[0_0_30px_rgba(0,255,255,0.2)] bg-white/5 backdrop-blur-3xl text-center">
                <h3 className="text-4xl font-black text-white uppercase italic tracking-tight leading-none mb-2">
                    {currentQuestion || 'Wait for it...'}
                </h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-16">
                {/* SLIDER CONTAINER */}
                <div className="w-full space-y-12 relative">
                    <div className="flex justify-between items-end px-4 mb-2">
                        <span className="text-xl font-black text-white/20 uppercase tracking-widest italic">0%</span>
                        <div className="text-9xl font-black text-[#ffff00] drop-shadow-[0_0_40px_rgba(255,255,0,0.5)] leading-none tabular-nums select-none">
                            {guess}%
                        </div>
                        <span className="text-xl font-black text-white/20 uppercase tracking-widest italic">100%</span>
                    </div>

                    <div className="relative w-full h-32 bg-[#1a1f3a] rounded-[4rem] border-8 border-white/5 shadow-2xl overflow-hidden group">
                        {/* THE SLIDER TRACK COLOR */}
                        <motion.div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#ffff00] transition-all duration-100"
                            style={{ width: `${guess}%` }}
                        />
                        
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={guess}
                            onChange={(e) => {
                                if (!hasGuessed) {
                                    setGuess(parseInt(e.target.value));
                                    if (navigator.vibrate) navigator.vibrate(5);
                                }
                            }}
                            disabled={hasGuessed}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 disabled:cursor-not-allowed"
                        />
                    </div>
                    
                    <p className="text-center text-xl font-black text-white/20 uppercase tracking-[0.3em]">SLIDE TO ADJUST</p>
                </div>

                {/* LOCK IN BUTTON */}
                <motion.button
                    whileTap={{ scale: hasGuessed ? 1 : 0.95 }}
                    onClick={handleLockIn}
                    disabled={hasGuessed}
                    className={`w-full py-10 rounded-[3rem] font-black text-4xl uppercase tracking-[0.2em] shadow-2xl border-4 transition-all duration-500 ${hasGuessed 
                        ? 'bg-[#1a1f3a] text-white/20 border-white/5 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#00ffff] to-[#00ff00] text-[#0d0f1a] border-white/20 shadow-[0_0_50px_rgba(0,255,0,0.4)]'}`}
                >
                    {hasGuessed ? 'GUESS LOCKED! 🔒' : 'LOCK IN GUESS'}
                </motion.button>

                {timeLeft !== undefined && (
                    <div className={`text-7xl font-black font-mono tracking-tighter ${timeLeft <= 5 ? 'text-[#ff00ff] animate-pulse' : 'text-white/40'}`}>
                        {Math.ceil(timeLeft)}s
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalAveragesPlayer;