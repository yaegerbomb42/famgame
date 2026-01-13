import { useState } from 'react';
import { motion } from 'framer-motion';

interface TwoTruthsPlayerProps {
    phase: 'INPUT' | 'VOTING' | 'REVEAL';
    onSubmitStatements: (data: { statements: string[], lieIndex: number }) => void;
    onVote: (index: number) => void;
    isSubject: boolean; // Is this player the one being voted on?
}

const TwoTruthsPlayer: React.FC<TwoTruthsPlayerProps> = ({ phase, onSubmitStatements, onVote, isSubject }) => {
    // Input State
    const [stmts, setStmts] = useState(['', '', '']);
    const [lieIdx, setLieIdx] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    // Voting State
    const [votedIdx, setVotedIdx] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (stmts.some(s => !s.trim()) || lieIdx === null) return;
        onSubmitStatements({ statements: stmts, lieIndex: lieIdx });
        setSubmitted(true);
    };

    // --- INPUT PHASE ---
    if (phase === 'INPUT') {
        if (submitted) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-center flex-col text-center p-12 space-y-10 w-full max-w-4xl mx-auto"
                >
                    <div className="text-huge animate-bounce shadow-glow">🤐</div>
                    <h3 className="text-6xl font-black gradient-text-secondary uppercase tracking-widest">Secrets Locked.</h3>
                    <p className="text-white/40 text-3xl font-black uppercase tracking-[0.3em] animate-pulse">Waiting for other liars...</p>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-y-auto p-10 pb-32 w-full max-w-4xl mx-auto custom-scrollbar"
            >
                <h3 className="text-center text-5xl font-black mb-12 gradient-text-secondary uppercase tracking-tighter">Write 2 Truths, 1 Lie</h3>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {stmts.map((st, i) => (
                        <div key={i} className={`p-8 rounded-[3rem] border-4 transition-all duration-300 ${lieIdx === i ? 'border-red-500 bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'border-white/5 bg-white/5'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl uppercase tracking-[0.4em] font-black text-white/30">Fact {i + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => setLieIdx(i)}
                                    className={`text-lg px-8 py-3 rounded-full font-black uppercase tracking-widest transition-all ${lieIdx === i ? 'bg-red-500 text-white shadow-huge-red scale-110' : 'bg-white/10 text-white/30 hover:bg-white/20'}`}
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
                                placeholder="TYPE SOMETHING SPICY... 🔥"
                                className="w-full bg-transparent text-3xl font-black focus:outline-none resize-none placeholder:text-white/5 uppercase"
                                rows={2}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={stmts.some(s => !s.trim()) || lieIdx === null}
                        className="w-full py-12 bg-game-primary rounded-[3.5rem] font-black text-4xl shadow-[0_20px_60px_rgba(255,0,255,0.4)] disabled:opacity-20 disabled:grayscale transition-all uppercase tracking-widest border-t-8 border-white/20 active:scale-95"
                    >
                        LOCK SECRETS 🔒
                    </button>
                </form>
            </motion.div>
        );
    }

    // --- VOTING PHASE ---
    if (phase === 'VOTING') {
        if (isSubject) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-center flex-col text-center p-12 space-y-10 w-full max-w-4xl mx-auto"
                >
                    <div className="text-huge animate-pulse shadow-glow">😰</div>
                    <h3 className="text-6xl font-black text-white uppercase tracking-tighter">THEY ARE JUDGING YOU.</h3>
                    <p className="text-3xl text-white/40 font-black uppercase tracking-[0.4em] animate-pulse">Stay cold as ice.</p>
                </motion.div>
            );
        }

        if (votedIdx !== null) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex items-center justify-center flex-col text-center p-12 space-y-10 w-full max-w-4xl mx-auto"
                >
                    <div className="text-huge">🕵️‍♂️</div>
                    <h3 className="text-6xl font-black gradient-text-primary uppercase tracking-widest shadow-glow">VOTE CAST.</h3>
                    <p className="text-3xl font-black text-white/40 uppercase tracking-[0.3em]">Did you smell the lie?</p>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col p-10 justify-center space-y-10 w-full max-w-4xl mx-auto"
            >
                <h3 className="text-center text-6xl font-black mb-12 uppercase tracking-tighter gradient-text-secondary">Spot the Lie!</h3>
                {['A', 'B', 'C'].map((label, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setVotedIdx(i); onVote(i); }}
                        className="py-16 bg-white/5 rounded-[3.5rem] border-4 border-white/5 text-9xl font-black hover:bg-white/10 hover:border-game-secondary shadow-2xl transition-all border-t-8 border-white/10"
                    >
                        {label}
                    </motion.button>
                ))}
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center flex-col text-center p-12 space-y-8 w-full max-w-4xl mx-auto"
        >
            <div className="text-huge animate-pulse">😲</div>
            <h3 className="text-6xl font-black gradient-text-secondary uppercase tracking-widest">Behold the Reveal!</h3>
            <p className="text-3xl font-black text-white/40 uppercase tracking-[0.4em] animate-bounce">Check the big screen!</p>
        </motion.div>
    );

    return null;
};

export default TwoTruthsPlayer;
