import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../../store/useGameStore';

export default function OddOneOutHost({ gameState }: { gameState: GameState }) {
    const { gameData } = gameState;
    const { question, phase, timer, submissions } = gameData;
    const playerCount = Object.keys(gameState.players).filter(id => !gameState.players[id].isHost).length;
    const submissionCount = Object.keys(submissions || {}).length;

    if (!question) return null;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-12">
            <AnimatePresence mode="wait">
                {phase === 'INTRO' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center space-y-8"
                    >
                        <h2 className="text-4xl font-black text-cyan-400 uppercase tracking-[0.3em]">Next Category</h2>
                        <h1 className="text-9xl font-black text-white italic tracking-tighter">{question.category}</h1>
                        <p className="text-2xl text-white/40 font-bold uppercase tracking-widest">Identify the one that doesn't fit!</p>
                    </motion.div>
                )}

                {phase === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full max-w-6xl space-y-12"
                    >
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-cyan-400 uppercase tracking-widest">{question.category}</h2>
                                <p className="text-white/40 font-bold uppercase text-sm">Which one is the odd one out?</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-6xl font-black font-mono text-white">{Math.ceil(timer || 0)}</span>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Seconds Left</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {question.items.map((item: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/5 border-2 border-white/10 rounded-[2.5rem] p-12 flex items-center justify-center text-center relative overflow-hidden group"
                                >
                                    <div className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white/20">
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="text-5xl font-black text-white group-hover:scale-105 transition-transform">{item}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <div className="bg-black/40 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {Object.keys(submissions || {}).map((pid) => (
                                        <div key={pid} className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-black flex items-center justify-center text-[10px] font-black">
                                            {gameState.players[pid]?.avatar || '👤'}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest text-white/40">
                                    {submissionCount} / {playerCount} Players Locked In
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full max-w-6xl space-y-12"
                    >
                        <div className="text-center space-y-4">
                            <h2 className="text-3xl font-black text-white/20 uppercase tracking-[0.2em]">The Odd One Out Was...</h2>
                            <h1 className="text-8xl font-black text-cyan-400 italic tracking-tighter uppercase">{question.items[question.correctIndex]}</h1>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {question.items.map((item: string, index: number) => {
                                const isCorrect = index === question.correctIndex;
                                return (
                                    <motion.div
                                        key={index}
                                        className={`rounded-[2.5rem] p-12 flex items-center justify-center text-center relative border-4 transition-all duration-500 ${
                                            isCorrect 
                                                ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_50px_rgba(0,255,255,0.3)] scale-105 z-10' 
                                                : 'bg-white/5 border-white/5 opacity-40'
                                        }`}
                                    >
                                        <span className={`text-5xl font-black ${isCorrect ? 'text-white' : 'text-white/40'}`}>{item}</span>
                                        {isCorrect && (
                                            <motion.div 
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute -top-4 -right-4 w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center text-2xl shadow-lg"
                                            >
                                                ✨
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center"
                        >
                            <p className="text-3xl font-bold text-white/80">{question.explanation}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
