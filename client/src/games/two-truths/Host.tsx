import { motion, AnimatePresence } from 'framer-motion';

interface TwoTruthsHostProps {
    phase: 'INPUT' | 'VOTING' | 'REVEAL';
    inputs: Record<string, { statements: string[]; lieIndex: number }>;
    currentSubjectId: string | null;
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
    votes: Record<string, number>;
    showLie: boolean;
}

const TwoTruthsHost: React.FC<TwoTruthsHostProps> = ({ phase, inputs, currentSubjectId, players, votes, showLie }) => {
    const subject = currentSubjectId ? players[currentSubjectId] : null;
    const subjectStatements = currentSubjectId ? inputs[currentSubjectId]?.statements : [];
    const actualLieIndex = currentSubjectId ? inputs[currentSubjectId]?.lieIndex : -1;

    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'INPUT' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="inline-block px-8 py-3 bg-game-secondary/20 text-game-secondary rounded-full text-2xl font-black mb-12 uppercase tracking-[0.4em] border border-game-secondary/30">
                            The Interrogation
                        </div>
                        <h2 className="text-8xl font-black mb-16 tracking-tighter leading-none">
                            TWO TRUTHS <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">AND A LIE</span>
                        </h2>

                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 max-w-5xl">
                            {Object.values(players).filter(p => !p.isHost).map((p) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        scale: inputs[p.id] ? 1.1 : 1,
                                        opacity: inputs[p.id] ? 1 : 0.3
                                    }}
                                    className={`relative w-24 h-24 rounded-3xl flex items-center justify-center text-5xl border-4 transition-all ${
                                        inputs[p.id] ? 'bg-game-secondary/20 border-game-secondary shadow-[0_0_30px_rgba(0,255,255,0.3)]' : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    {p.avatar}
                                    {inputs[p.id] && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -right-3 -top-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white"
                                        >
                                            ✓
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {(phase === 'VOTING' || phase === 'REVEAL') && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col items-center"
                    >
                        <div className="text-center mb-16">
                            <div className="text-4xl mb-4">{subject?.avatar}</div>
                            <h2 className="text-7xl font-black tracking-tighter">
                                <span className="text-game-secondary italic">{subject?.name}'s</span> Statements
                            </h2>
                            <p className="text-2xl text-white/30 font-black uppercase tracking-widest mt-4">Spot the lie!</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 w-full max-w-5xl">
                            {subjectStatements.map((stmt, i) => {
                                const isLie = i === actualLieIndex;
                                const stmtVotes = Object.entries(votes).filter(([, v]) => v === i);

                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.15 }}
                                        className={`p-10 rounded-[3rem] border-4 flex items-center justify-between text-4xl font-black relative overflow-hidden transition-all duration-700 ${
                                            showLie
                                                ? (isLie 
                                                    ? 'bg-red-500 text-white border-white shadow-[0_0_60px_rgba(239,68,68,0.5)] scale-105 z-10' 
                                                    : 'bg-white/5 border-white/5 opacity-30')
                                                : 'bg-white/5 border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-10 z-10 pr-24">
                                            <div className="w-16 h-16 rounded-2xl border-2 border-white/20 flex items-center justify-center text-2xl font-mono shrink-0">
                                                {['A', 'B', 'C'][i]}
                                            </div>
                                            <span className="leading-tight">{stmt}</span>
                                        </div>

                                        {/* Votes */}
                                        <div className="flex -space-x-4">
                                            {stmtVotes.map(([vid], idx) => (
                                                <motion.div 
                                                    key={vid}
                                                    initial={{ scale: 0, rotate: -20 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ delay: 0.5 + idx * 0.05 }}
                                                    className="w-16 h-16 rounded-full bg-game-secondary border-4 border-game-bg flex items-center justify-center text-3xl shadow-xl hover:z-20 transition-all"
                                                >
                                                    {players[vid]?.avatar || '👾'}
                                                </motion.div>
                                            ))}
                                        </div>

                                        {showLie && isLie && (
                                            <motion.div
                                                initial={{ scale: 5, opacity: 0, rotate: 45 }}
                                                animate={{ scale: 1, opacity: 0.8, rotate: -15 }}
                                                className="absolute right-10 top-1/2 -translate-y-1/2 text-white font-black text-9xl pointer-events-none"
                                            >
                                                LIE!
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TwoTruthsHost;