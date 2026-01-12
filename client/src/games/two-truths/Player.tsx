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
                <div className="flex-1 flex items-center justify-center flex-col text-center p-8 space-y-6">
                    <div className="text-9xl animate-bounce">🤐</div>
                    <h3 className="text-4xl font-black gradient-text-secondary uppercase">Secrets Locked.</h3>
                    <p className="text-white/40 text-xl">Waiting for other liars...</p>
                </div>
            )
        }

        return (
            <div className="flex-1 overflow-y-auto p-6 pb-32">
                <h3 className="text-center text-3xl font-black mb-8 gradient-text-secondary uppercase tracking-tighter">Write 2 Truths, 1 Lie</h3>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {stmts.map((st, i) => (
                        <div key={i} className={`p-6 rounded-[2rem] border-4 transition-all duration-300 ${lieIdx === i ? 'border-red-500 bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-white/5 bg-white/5'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm uppercase tracking-[0.3em] font-black text-white/30">Fact {i + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => setLieIdx(i)}
                                    className={`text-sm px-6 py-2 rounded-full font-black uppercase tracking-widest transition-all ${lieIdx === i ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-white/10 text-white/30 hover:bg-white/20'}`}
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
                                placeholder="TYPE SOMETHING SPICY..."
                                className="w-full bg-transparent text-2xl font-black focus:outline-none resize-none placeholder:text-white/5"
                                rows={2}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={stmts.some(s => !s.trim()) || lieIdx === null}
                        className="w-full py-8 bg-game-primary rounded-[2rem] font-black text-3xl shadow-[0_20px_50px_rgba(255,0,255,0.4)] disabled:opacity-20 disabled:grayscale transition-all uppercase"
                    >
                        LOCK SECRETS 🔒
                    </button>
                </form>
            </div>
        )
    }

    // --- VOTING PHASE ---
    if (phase === 'VOTING') {
        if (isSubject) {
            return (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-8 space-y-6">
                    <div className="text-9xl animate-pulse">😰</div>
                    <h3 className="text-4xl font-black text-white uppercase">THEY ARE JUDGING YOU.</h3>
                    <p className="text-white/40 text-xl uppercase tracking-widest">Don't blink.</p>
                </div>
            )
        }

        if (votedIdx !== null) {
            return (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-8 space-y-6">
                    <div className="text-9xl">🕵️</div>
                    <h3 className="text-4xl font-black gradient-text-primary uppercase">VOTE CAST.</h3>
                    <p className="text-white/40 text-xl">Did you smell the lie?</p>
                </div>
            )
        }

        return (
            <div className="flex-1 flex flex-col p-6 justify-center space-y-6">
                <h3 className="text-center text-4xl font-black mb-8 uppercase tracking-tighter">Spot the Lie!</h3>
                {['A', 'B', 'C'].map((label, i) => (
                    <motion.button
                        key={i}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setVotedIdx(i); onVote(i); }}
                        className="py-12 bg-white/5 rounded-[2.5rem] border-4 border-white/5 text-7xl font-black hover:bg-white/10 hover:border-game-secondary hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-all"
                    >
                        {label}
                    </motion.button>
                ))}
            </div>
        )
    }

    if (phase === 'REVEAL') {
        return (
            <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                <h3 className="text-2xl font-bold">Look at the TV!</h3>
            </div>
        )
    }

    return null;
};

export default TwoTruthsPlayer;
