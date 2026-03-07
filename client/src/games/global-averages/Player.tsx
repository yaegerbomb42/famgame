import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Socket } from 'socket.io-client';

interface GlobalAveragesPlayerProps {
    phase: 'WAITING' | 'REVEAL';
    question: string;
    socket: Socket;
    hasGuessed: boolean;
    timerEnd?: number;
    submissionCount?: number;
    totalPlayers?: number;
}

export default function GlobalAveragesPlayer({ phase, question, socket, hasGuessed, timerEnd, submissionCount, totalPlayers }: GlobalAveragesPlayerProps) {
    const [guess, setGuess] = useState(50);
    const [locked, setLocked] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(30);

    useEffect(() => {
        setLocked(hasGuessed);
    }, [hasGuessed]);

    // Countdown timer
    useEffect(() => {
        if (phase !== 'WAITING' || !timerEnd) return;
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
            setSecondsLeft(remaining);
        }, 250);
        return () => clearInterval(interval);
    }, [phase, timerEnd]);

    const submitGuess = () => {
        if (!locked) {
            socket.emit('submitAverageGuess', guess);
            setLocked(true);
        }
    };

    if (phase === 'REVEAL') {
        return (
            <div className="flex flex-col h-full bg-zinc-950 p-6 items-center justify-center text-center">
                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-black mb-10 text-white uppercase tracking-tighter"
                >
                    Look at the TV!
                </motion.h2>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="text-9xl mb-12 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                    📺
                </motion.div>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">
                    Calculating the median...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950 p-6 items-center justify-center relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Timer */}
            <motion.div
                animate={secondsLeft <= 5 ? { scale: [1, 1.1, 1], filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.5))' } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className={`text-6xl font-black mb-8 font-mono tracking-tighter ${secondsLeft <= 5 ? 'text-red-500' : secondsLeft <= 10 ? 'text-yellow-400' : 'text-cyan-400'
                    }`}
            >
                {secondsLeft}s
            </motion.div>

            <h2 className="text-3xl font-black text-center mb-12 text-white uppercase tracking-tight leading-none max-w-sm">
                {question || 'Awaiting Question...'}
            </h2>

            {/* Premium Slider Container */}
            <div className="relative w-full max-w-md h-24 bg-zinc-900/50 rounded-3xl border-2 border-white/5 shadow-2xl overflow-hidden mb-12 group">
                {/* Active Progress Fill */}
                <motion.div
                    style={{ width: `${guess}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 opacity-80"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />

                {/* The Input Range (Invisible but large hit area) */}
                <input
                    type="range"
                    min="0" max="100"
                    value={guess}
                    onChange={(e) => {
                        if (!locked) {
                            setGuess(parseInt(e.target.value));
                            if (navigator.vibrate) navigator.vibrate(10);
                        }
                    }}
                    disabled={locked}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
                />

                {/* Handle / Value Display */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-6xl font-black text-white drop-shadow-xl tabular-nums">
                        {guess}%
                    </span>
                </div>

                {/* Sub-label */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                    Slide to Estimate
                </div>
            </div>

            <motion.button
                onClick={submitGuess}
                disabled={locked}
                whileHover={!locked ? { scale: 1.02, boxShadow: '0 0 30px rgba(6,182,212,0.4)' } : {}}
                whileTap={!locked ? { scale: 0.95 } : {}}
                className={`w-full max-w-md py-6 rounded-3xl text-2xl font-black uppercase tracking-widest transition-all duration-300 ${locked
                    ? 'bg-zinc-800 text-zinc-500 border-2 border-white/5 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-900/20 active:translate-y-1'
                    }`}
            >
                {locked ? (
                    <span className="flex items-center justify-center gap-3">
                        Locked In <span className="text-xl">🔒</span>
                    </span>
                ) : 'Confirm Estimate'}
            </motion.button>

            {/* Submission progress */}
            {(submissionCount !== undefined && totalPlayers !== undefined) && (
                <div className="mt-8 flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <div className="flex gap-1">
                        {Array.from({ length: totalPlayers }).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < submissionCount ? 'bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'bg-zinc-800'}`} />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {submissionCount} / {totalPlayers} Ready
                    </span>
                </div>
            )}
        </div>
    );
}
