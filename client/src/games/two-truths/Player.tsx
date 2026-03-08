import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const TwoTruthsPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();
    
    const [stmts, setStmts] = useState(['', '', '']);
    const [lieIdx, setLieIdx] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [votedIdx, setVotedIdx] = useState<number | null>(null);

    const phase = gameState?.gameData?.phase || 'INPUT';
    const isSubject = socket?.id === gameState?.gameData?.currentSubjectId;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (stmts.some(s => !s.trim()) || lieIdx === null) {
            playError();
            return;
        }
        socket?.emit('submitStatements', { statements: stmts, lieIndex: lieIdx });
        setSubmitted(true);
        playSuccess();
    };

    const handleVote = (i: number) => {
        if (votedIdx !== null) return;
        setVotedIdx(i);
        socket?.emit('voteLie', i);
        playClick();
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            <AnimatePresence mode="wait">
                {phase === 'INPUT' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
                    >
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">🤐</div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic">LIES SUBMITTED!</h3>
                                <p className="text-white/40 text-xl font-black uppercase tracking-[0.3em] animate-pulse">Waiting for others...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                                <h3 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter text-game-secondary">2 Truths, 1 Lie</h3>
                                {stmts.map((st, i) => (
                                    <div 
                                        key={i} 
                                        className={`p-6 rounded-[2rem] border-4 transition-all duration-300 ${
                                            lieIdx === i 
                                                ? 'border-red-500 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.2)]' 
                                                : 'border-white/5 bg-white/5'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-black uppercase text-white/20 tracking-widest">Fact {i + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => { playClick(); setLieIdx(i); }}
                                                className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                                                    lieIdx === i 
                                                        ? 'bg-red-500 text-white shadow-lg scale-110' 
                                                        : 'bg-white/5 text-white/20 hover:bg-white/10'
                                                }`}
                                            >
                                                {lieIdx === i ? 'THE LIE 🤥' : 'Mark as Lie'}
                                            </button>
                                        </div>
                                        <textarea
                                            value={st}
                                            onChange={(e) => {
                                                const newStmts = [...stmts];
                                                newStmts[i] = e.target.value;
                                                setStmts(newStmts);
                                            }}
                                            placeholder="Write something..."
                                            className="w-full bg-transparent text-xl font-bold focus:outline-none resize-none placeholder:text-white/10 uppercase"
                                            rows={2}
                                            maxLength={80}
                                        />
                                    </div>
                                ))}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={stmts.some(s => !s.trim()) || lieIdx === null}
                                    className="w-full py-8 bg-game-primary rounded-[2.5rem] font-black text-2xl shadow-2xl disabled:opacity-20 transition-all uppercase tracking-widest border-t-4 border-white/20"
                                >
                                    READY! ➔
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                )}

                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center justify-center p-4 space-y-8"
                    >
                        {isSubject ? (
                            <div className="text-center space-y-8">
                                <div className="text-[10rem] animate-pulse">😰</div>
                                <h3 className="text-5xl font-black text-game-primary uppercase tracking-tighter">DON'T FLINCH!</h3>
                                <p className="text-white/40 text-xl font-bold uppercase tracking-widest">They are hunting the lie...</p>
                            </div>
                        ) : votedIdx !== null ? (
                            <div className="text-center space-y-8">
                                <div className="text-[10rem]">🕵️‍♂️</div>
                                <h3 className="text-5xl font-black text-game-secondary uppercase tracking-tighter italic">VOTE CAST!</h3>
                                <div className="w-24 h-24 rounded-3xl bg-game-secondary/20 border-4 border-game-secondary flex items-center justify-center text-5xl font-black mx-auto">
                                    {['A', 'B', 'C'][votedIdx]}
                                </div>
                            </div>
                        ) : (
                            <div className="w-full space-y-6">
                                <h3 className="text-4xl font-black text-center mb-10 uppercase tracking-tighter">SPOT THE LIE!</h3>
                                {['A', 'B', 'C'].map((label, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleVote(i)}
                                        className="w-full py-12 bg-white/5 rounded-[2.5rem] border-4 border-white/10 text-8xl font-black hover:border-game-secondary hover:bg-game-secondary/10 transition-all active:scale-95"
                                    >
                                        {label}
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="text-[12rem] animate-bounce">🤭</div>
                        <h3 className="text-5xl font-black text-game-primary uppercase tracking-tighter">MOMENT OF TRUTH!</h3>
                        <p className="text-white/30 text-xl font-bold uppercase tracking-widest">Look at the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TwoTruthsPlayer;