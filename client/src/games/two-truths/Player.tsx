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
                <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                    <div className="text-6xl mb-4">🤐</div>
                    <h3 className="text-2xl font-bold">Secrets Locked.</h3>
                    <p className="text-white/50">Waiting for other liars...</p>
                </div>
            )
        }

        return (
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <h3 className="text-center text-xl font-bold mb-6 gradient-text-secondary">Write 2 Truths, 1 Lie</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {stmts.map((st, i) => (
                        <div key={i} className={`p-4 rounded-xl border-2 transition-all ${lieIdx === i ? 'border-red-500 bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs uppercase tracking-widest font-bold opacity-50">Statement {i + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => setLieIdx(i)}
                                    className={`text-xs px-3 py-1 rounded-full border ${lieIdx === i ? 'bg-red-500 text-white border-red-500' : 'border-white/20 text-white/50'}`}
                                >
                                    {lieIdx === i ? 'THE LIE' : 'Mark as Lie'}
                                </button>
                            </div>
                            <textarea
                                value={st}
                                onChange={(e) => {
                                    const newStmts = [...stmts];
                                    newStmts[i] = e.target.value;
                                    setStmts(newStmts);
                                }}
                                placeholder="Type something..."
                                className="w-full bg-transparent text-lg font-bold focus:outline-none resize-none"
                                rows={2}
                            />
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={stmts.some(s => !s.trim()) || lieIdx === null}
                        className="w-full py-4 bg-game-primary rounded-xl font-bold text-xl disabled:opacity-50 disabled:grayscale"
                    >
                        LOCK IT IN
                    </button>
                </form>
            </div>
        )
    }

    // --- VOTING PHASE ---
    if (phase === 'VOTING') {
        if (isSubject) {
            return (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                    <div className="text-6xl mb-4 animate-pulse">😰</div>
                    <h3 className="text-2xl font-bold">They are judging you.</h3>
                    <p className="text-white/50">Keep a straight face.</p>
                </div>
            )
        }

        if (votedIdx !== null) {
            return (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                    <div className="text-6xl mb-4">🕵️</div>
                    <h3 className="text-2xl font-bold">Vote Cast.</h3>
                    <p className="text-white/50">Did you catch them?</p>
                </div>
            )
        }

        return (
            <div className="flex-1 flex flex-col p-4 justify-center space-y-4">
                <h3 className="text-center text-xl font-bold mb-4">Which one is the LIE?</h3>
                {['A', 'B', 'C'].map((label, i) => (
                    <motion.button
                        key={i}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setVotedIdx(i); onVote(i); }}
                        className="py-8 bg-white/10 rounded-2xl border border-white/5 text-4xl font-black hover:bg-white/20 hover:border-game-secondary transition-all"
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
