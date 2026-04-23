import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

const BrainBurstPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess } = useSound();
    
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
    const phase = gameData.phase as string | undefined;
    const { 
        question: currentQuestion, 
        tier, 
        questionIndex = 0, 
        fiftyFiftyDisabled = [], 
        lifelinesUsed = {},
        submissions = {}
    } = gameData;

    const hasVoted = submissions[socket?.id || ''] !== undefined;
    const myLifelines = lifelinesUsed[socket?.id || ''] || [];
    const usedFiftyFifty = myLifelines.includes('50-50');

    const handleAnswer = (index: number) => {
        if (hasVoted || phase !== 'PLAYING') return;
        if (fiftyFiftyDisabled.includes(index)) return;
        
        setSelectedIdx(index);
        socket?.emit('gameInput', { answerIndex: index });
        playClick();
        playSuccess();
    };

    const handleUseLifeline = () => {
        if (usedFiftyFifty || phase !== 'PLAYING') return;
        socket?.emit('gameInput', { lifeline: '50-50' });
        playClick();
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10">
                <div className="text-[12rem] animate-pulse">{isIntro ? '🧠' : '🏆'}</div>
                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    {isIntro ? "GET BRAINY!" : "GAME OVER"}
                </h2>
                <p className="text-2xl text-white/50 font-black uppercase tracking-widest leading-tight">
                    {isIntro ? "Prepare for high-stakes trivia!" : "Check the leaderboard!"}
                </p>
            </div>
        );
    }

    if (hasVoted && phase === 'PLAYING') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 text-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-40 h-40 flex items-center justify-center border-8 border-[#00ffff] rounded-[3rem] shadow-[0_0_60px_rgba(0,255,255,0.4)] bg-[#1a1f3a]"
                >
                    <span className="text-8xl font-black text-white italic tracking-tighter">
                        {ANSWER_LABELS[selectedIdx ?? submissions[socket?.id || '']]}
                    </span>
                </motion.div>
                <div className="space-y-4">
                    <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase">LOCKED IN!</h3>
                    <p className="text-2xl text-white/30 font-black uppercase tracking-[0.4em] animate-pulse">Waiting for the others...</p>
                </div>
            </div>
        );
    }

    if (phase === 'REVEAL') {
        const myAns = submissions[socket?.id || ''];
        const isCorrect = myAns === currentQuestion?.correct;
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 space-y-10 text-center"
            >
                <div className="text-[15rem] filter drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                    {!currentQuestion ? '🔍' : (isCorrect ? '💎' : (myAns !== undefined ? '🧨' : '⌛'))}
                </div>
                <div className="space-y-6">
                    <h3 className={`text-7xl font-black italic tracking-tighter uppercase ${isCorrect ? 'text-[#00ff00]' : 'text-white/20'}`}>
                        {!currentQuestion ? 'LOADING...' : (isCorrect ? 'CORRECT!' : (myAns !== undefined ? 'WRONG!' : "TIMEOUT!"))}
                    </h3>
                    {isCorrect && (
                        <div className="px-10 py-4 bg-[#00ff00]/10 border-4 border-[#00ff00]/40 rounded-full inline-block shadow-[0_0_30px_rgba(0,255,0,0.2)]">
                            <span className="text-3xl font-black text-white tracking-widest leading-none">+{tier?.points} PTS</span>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8">
            <div className="flex justify-between items-center shrink-0 pt-4">
                <div className="flex flex-col">
                    <span className="text-xs font-black text-white/30 uppercase tracking-[0.4em]">LEVEL {tier?.level}</span>
                    <span className="text-4xl font-black text-white italic tracking-tighter">ROUND {questionIndex + 1}</span>
                </div>
                
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleUseLifeline}
                    disabled={usedFiftyFifty}
                    className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.3em] border-4 transition-all ${
                        usedFiftyFifty 
                        ? 'border-white/5 text-white/10 opacity-30' 
                        : 'border-[#00ffff]/30 bg-[#00ffff]/10 text-[#00ffff] shadow-[0_0_20px_rgba(0,255,255,0.2)] active:bg-[#00ffff] active:text-[#0d0f1a]'
                    }`}
                >
                    {usedFiftyFifty ? '50/50 USED' : 'USE 50/50'}
                </motion.button>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 pt-4">
                {currentQuestion?.a.map((answer: string, i: number) => {
                    const isDisabled = fiftyFiftyDisabled.includes(i);
                    return (
                        <motion.button
                            key={i}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ 
                                scale: isDisabled ? 0.9 : 1, 
                                opacity: isDisabled ? 0.1 : 1 
                            }}
                            whileTap={!isDisabled ? { scale: 0.95 } : {}}
                            onClick={() => handleAnswer(i)}
                            disabled={isDisabled}
                            className={`flex flex-col items-center justify-center p-8 rounded-[3rem] border-4 transition-all ${
                                isDisabled 
                                ? 'border-transparent' 
                                : 'bg-[#1a1f3a] border-[#00ffff]/40 hover:border-[#00ffff] hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] active:border-[#ffff00]'
                            }`}
                        >
                            <span className="text-7xl font-black text-white italic tracking-tighter mb-4">{ANSWER_LABELS[i]}</span>
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest text-center leading-tight line-clamp-2">
                                {answer}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default BrainBurstPlayer;