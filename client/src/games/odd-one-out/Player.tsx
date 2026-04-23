import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

export default function OddOneOutPlayer() {
    const { gameState, socket } = useGameStore();
    const { playClick } = useSound();
    const { gameData } = gameState || {};
    const { question, phase, submissions } = gameData || {};

    const mySubmission = submissions?.[socket?.id || ''];
    const hasSubmitted = !!mySubmission;

    const handleSelect = (index: number) => {
        if (hasSubmitted || phase !== 'PLAYING') return;
        playClick();
        socket?.emit('gameInput', { answerIndex: index });
    };

    if (!question) return null;

    if (phase === 'INTRO') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 rounded-[2rem] bg-cyan-500/10 border-2 border-cyan-400/50 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(0,255,255,0.2)]"
                >
                    🔍
                </motion.div>
                <div className="space-y-2">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase">Get Ready!</h2>
                    <p className="text-white/40 font-black uppercase tracking-widest text-sm">Category: {question.category}</p>
                </div>
            </div>
        );
    }

    if (phase === 'PLAYING') {
        return (
            <div className="flex-1 flex flex-col space-y-6 p-4">
                <div className="text-center space-y-1">
                    <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.2em]">Odd One Out</h3>
                    <p className="text-xl font-black text-cyan-400 uppercase tracking-wider">{question.category}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 flex-1">
                    {question.items.map((item: string, index: number) => (
                        <motion.button
                            key={index}
                            whileTap={!hasSubmitted ? { scale: 0.98 } : {}}
                            onClick={() => handleSelect(index)}
                            disabled={hasSubmitted}
                            className={`relative h-full min-h-[80px] rounded-2xl border-2 transition-all flex items-center px-6 gap-6 ${
                                hasSubmitted 
                                    ? mySubmission.answerIndex === index
                                        ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
                                        : 'bg-white/5 border-white/5 opacity-40'
                                    : 'bg-white/5 border-white/10 active:border-cyan-400 active:bg-cyan-500/10'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border-2 ${
                                hasSubmitted && mySubmission.answerIndex === index
                                    ? 'bg-white/20 border-white/30 text-white'
                                    : 'bg-black/20 border-white/10 text-white/40'
                            }`}>
                                {String.fromCharCode(65 + index)}
                            </div>
                            <span className={`text-xl font-black text-left flex-1 ${
                                hasSubmitted && mySubmission.answerIndex === index ? 'text-white' : 'text-white/80'
                            }`}>
                                {item}
                            </span>
                            {hasSubmitted && mySubmission.answerIndex === index && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-2xl"
                                >
                                    ✅
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>

                {hasSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-4"
                    >
                        <p className="text-sm font-black text-cyan-400 uppercase tracking-widest animate-pulse">Locked In!</p>
                    </motion.div>
                )}
            </div>
        );
    }

    if (phase === 'REVEAL') {
        const isCorrect = mySubmission?.answerIndex === question.correctIndex;
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-6">
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className={`w-40 h-40 rounded-[2.5rem] flex items-center justify-center text-8xl shadow-2xl border-4 ${
                        isCorrect ? 'bg-emerald-500/20 border-emerald-400' : 'bg-red-500/20 border-red-400'
                    }`}
                >
                    {isCorrect ? '🎯' : '💨'}
                </motion.div>
                <div className="space-y-4">
                    <h2 className={`text-6xl font-black italic tracking-tighter uppercase ${
                        isCorrect ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                        {isCorrect ? 'BULLSEYE!' : 'MISSED IT!'}
                    </h2>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-sm max-w-xs mx-auto">
                        {isCorrect 
                            ? "Your brain is on another level. points awarded!" 
                            : `The odd one out was ${question.items[question.correctIndex]}.`}
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
