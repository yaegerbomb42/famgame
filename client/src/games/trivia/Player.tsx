import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const TriviaPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess } = useSound();
    
    const gameData = (gameState as any)?.gameData ?? {};
    const myPlayer = (gameState as any)?.players?.[socket?.id || ''];
    const isHost = myPlayer?.isHost ?? false;
    const phase = gameData.phase as string | undefined;
    const {
        availableCategories = [],
        submissions = {},
        roundResults = {},
        votes = {},
        question,
        round = 0,
        totalRounds = 10,
        timer: serverTimeLeft = 0
    } = gameData;

    const [localTimeLeft, setLocalTimeLeft] = useState(serverTimeLeft);

    useEffect(() => {
        setLocalTimeLeft(serverTimeLeft);
        if (serverTimeLeft <= 0 || (phase !== 'PLAYING' && phase !== 'VOTING')) return;
        
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000;
            setLocalTimeLeft(Math.max(0, serverTimeLeft - elapsed));
        }, 100);
        return () => clearInterval(interval);
    }, [serverTimeLeft, phase]);

    const myId = socket?.id || '';
    const mySubmission = submissions[myId];
    const myVote = votes[myId];
    const myResult = roundResults[myId];

    const selectedIdx = mySubmission?.index ?? null;
    const votedCat = myVote ?? null;

    const [customTheme, setCustomTheme] = useState('');

    const handleSelect = (idx: number) => {
        if (selectedIdx !== null || mySubmission !== undefined) return;
        socket?.emit('gameInput', { answerIndex: idx });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleVote = (cat: string) => {
        if (votedCat !== null || myVote !== undefined) return;
        if (cat === 'Custom' && isHost) {
            // Local state for host to show input
            return;
        }
        socket?.emit('gameInput', { category: cat });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customTheme.trim()) return;
        socket?.emit('gameInput', { customTheme: customTheme.trim(), category: 'Custom' });
        playSuccess();
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '🧠' : '🏆'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter text-center">
                        {isIntro ? "PURE TRIVIA" : "BRAIN DRAIN"}
                    </h2>
                    <p className="text-2xl text-[#00ffff] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "LOCK IN" : "CHECK THE SCORES"}
                    </p>
                    {isIntro && (
                        <p className="text-lg text-white/60 font-bold uppercase mt-4 px-4">
                            Answer fast to keep your streak alive!
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-6 bg-[#0d0f1a] overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'LOADING' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                            className="w-24 h-24 border-8 border-[#00ffff] border-t-transparent rounded-full"
                        />
                        <p className="text-3xl font-black text-white/80 uppercase tracking-widest">
                            Loading questions…
                        </p>
                        <p className="text-5xl font-black font-mono text-[#00ffff]">{Math.ceil(localTimeLeft)}s</p>
                    </motion.div>
                )}

                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex flex-col space-y-8"
                    >
                        <div className="text-center space-y-2 mb-2">
                            <span className="text-xl font-black text-white/40 uppercase tracking-[0.5em] drop-shadow-md">SELECT YOUR</span>
                            <h2 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#ff00ff] uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                                EXPERTISE
                            </h2>
                        </div>

                        <div className="flex-1 flex flex-col justify-start gap-4 overflow-y-auto pr-2 custom-scrollbar py-4 px-1">
                            {/* Special case for Host Custom Theme Input */}
                            {isHost && votedCat === null && !myVote && (
                                <div className="mb-4 space-y-4 flex-shrink-0 bg-white/5 p-6 rounded-[2rem] border-2 border-white/10">
                                    <h3 className="text-xl font-black text-white/60 uppercase tracking-widest text-center">OR ENTER CUSTOM</h3>
                                    <form onSubmit={handleCustomSubmit} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customTheme}
                                            onChange={(e) => setCustomTheme(e.target.value)}
                                            placeholder="Custom Theme..."
                                            className="flex-1 bg-black/40 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-[#00ffff] transition-colors"
                                        />
                                        <button type="submit" className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] text-black px-6 py-3 rounded-xl font-black uppercase italic shadow-[0_0_15px_rgba(0,255,255,0.5)]">GO</button>
                                    </form>
                                </div>
                            )}

                            {availableCategories.map((cat: string) => (
                                <motion.button
                                    key={cat}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVote(cat)}
                                    disabled={votedCat !== null || myVote !== undefined}
                                    className={`relative w-full py-6 px-8 rounded-[2rem] border-4 transition-all duration-300 flex items-center justify-between text-2xl md:text-3xl font-black uppercase italic tracking-widest flex-shrink-0 overflow-hidden ${
                                        (votedCat === cat || myVote === cat)
                                            ? 'border-[#00ffff] bg-gradient-to-r from-[#00ffff]/20 to-[#ff00ff]/20 shadow-[0_0_30px_rgba(0,255,255,0.3)] text-white scale-[1.02]'
                                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/30'
                                    }`}
                                >
                                    <span className="relative z-10 text-left line-clamp-2 drop-shadow-md">{cat}</span>
                                    {(votedCat === cat || myVote === cat) && (
                                        <motion.div 
                                            initial={{ scale: 0, rotate: -90 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="relative z-10 w-12 h-12 bg-gradient-to-tr from-[#00ffff] to-[#ff00ff] rounded-full flex items-center justify-center shadow-[0_0_20px_#00ffff]"
                                        >
                                            <span className="text-2xl text-black">✓</span>
                                        </motion.div>
                                    )}
                                    {(votedCat === cat || myVote === cat) && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] animate-[shimmer_2s_infinite]" />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {phase === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col space-y-4"
                    >
                        <div className="flex justify-between items-center text-white/40 px-4">
                            <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-widest">ROUND {round + 1} / {totalRounds}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${
                                    question?.difficulty === 'Hard' ? 'text-red-500' :
                                    question?.difficulty === 'Medium' ? 'text-yellow-500' :
                                    'text-emerald-500'
                                }`}>
                                    {question?.difficulty || 'Normal'} Mode
                                </span>
                            </div>
                            <span className="text-4xl font-black font-mono text-[#00ffff]">{Math.ceil(localTimeLeft)}s</span>
                        </div>

                        {question?.q && (
                            <div className="max-h-[25vh] overflow-y-auto custom-scrollbar px-2 bg-white/5 rounded-2xl py-4 flex-shrink-0">
                                <p className="text-center text-xl md:text-3xl font-black text-white leading-snug">
                                    {question.q}
                                </p>
                            </div>
                        )}

                        {(selectedIdx !== null || mySubmission !== undefined) ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                                <motion.div 
                                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="text-[12rem]"
                                >
                                    🔒
                                </motion.div>
                                <div className="space-y-4">
                                    <h3 className="text-5xl font-black uppercase tracking-tighter text-[#00ff00] italic">ANSWER LOCKED</h3>
                                    <p className="text-2xl text-white/40 font-black uppercase tracking-widest">Waiting for others...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 grid grid-cols-2 gap-2 pb-2 pt-2 min-h-0">
                                {(() => {
                                    const options = Array.isArray(question?.a) && question?.a.length > 0 ? question.a : (Array.isArray(question?.options) ? question.options : ['','','','']);
                                    return ['A', 'B', 'C', 'D'].map((label, i) => {
                                        const rawAns = options[i];
                                        const ansText = typeof rawAns === 'string' ? rawAns : (rawAns?.text || rawAns?.answer || '');
                                        return (
                                            <motion.button
                                                key={i}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleSelect(i)}
                                                className="bg-[#1a1f3a] rounded-2xl border-2 sm:border-4 border-white/5 flex flex-col items-center justify-center p-2 sm:p-4 hover:border-[#00ffff]/50 transition-all shadow-xl active:bg-[#00ffff]/10 min-h-[80px] sm:min-h-[120px] h-full"
                                            >
                                                <span className="text-2xl sm:text-4xl font-black text-[#00ffff] mb-1">{label}</span>
                                                <span className="text-xs sm:text-sm font-bold text-white uppercase text-center line-clamp-4 leading-tight break-words">
                                                    {ansText}
                                                </span>
                                            </motion.button>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-12"
                    >
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            className="text-[15rem]"
                        >
                            {myResult?.correct ? '🔥' : '💀'}
                        </motion.div>
                        <div className="space-y-4">
                            <h3 className={`text-7xl font-black uppercase tracking-tighter italic ${myResult?.correct ? 'text-[#00ff00]' : 'text-white/20'}`}>
                                {myResult?.correct ? 'GENIUS!' : 'NO MERCY'}
                            </h3>
                            <p className="text-3xl font-black text-white/40 tracking-[0.3em]">+{myResult?.points || 0} POINTS</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TriviaPlayer;