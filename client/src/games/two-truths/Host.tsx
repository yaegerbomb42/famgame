import { motion } from 'framer-motion';

interface TwoTruthsHostProps {
    phase: 'INPUT' | 'VOTING' | 'REVEAL';
    inputs: any; // Map of player inputs
    currentSubjectId: string | null;
    players: any; // Player map
    votes: any; // Vote map
    showLie: boolean;
}

const TwoTruthsHost: React.FC<TwoTruthsHostProps> = ({ phase, inputs, currentSubjectId, players, votes, showLie }) => {
    const subjectName = currentSubjectId ? players[currentSubjectId]?.name : 'Someone';
    const statements = currentSubjectId ? inputs[currentSubjectId]?.statements : [];
    const lieIndex = currentSubjectId ? inputs[currentSubjectId]?.lieIndex : -1;

    if (phase === 'INPUT') {
        const submittedCount = Object.keys(inputs).length;
        const totalCount = Object.keys(players).length;

        return (
            <div className="flex flex-col h-full justify-center items-center text-center">
                <h2 className="text-6xl font-display mb-8 gradient-text-secondary">THE INTERROGATION</h2>
                <p className="text-2xl text-white/60 mb-16">Enter 2 Truths and 1 Lie on your device.</p>

                <div className="glass-card px-12 py-8 rounded-full">
                    <span className="text-4xl font-mono font-bold">{submittedCount} / {totalCount}</span>
                    <span className="ml-4 text-sm uppercase tracking-widest text-white/40">READY</span>
                </div>

                <div className="mt-12 flex gap-4">
                    {/* Visually show who has submitted */}
                    {Object.values(players).map((p: any) => (
                        <div key={p.id} className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-colors ${inputs[p.id] ? 'bg-green-500 border-green-400' : 'border-white/20'}`}>
                            {inputs[p.id] ? '✓' : '...'}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // VOTING / REVEAL PHASE
    return (
        <div className="flex flex-col h-full justify-center items-center p-8">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-12 text-center"
            >
                <div className="text-2xl text-game-accent font-bold mb-4 tracking-widest uppercase">DETECT THE LIE</div>
                <h2 className="text-6xl font-display leading-tight">
                    {subjectName}'s Statements
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 w-full max-w-4xl">
                {statements.map((stmt: string, i: number) => {
                    // Calculate how many votes this statement got
                    const voteCount = Object.values(votes).filter(v => v === i).length;
                    const isLie = i === lieIndex;

                    return (
                        <motion.div
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className={`p-8 rounded-2xl border-2 flex items-center justify-between text-3xl font-bold relative overflow-hidden transition-all duration-500 ${showLie
                                    ? (isLie ? 'bg-red-500/20 border-red-500 text-red-100' : 'bg-green-500/10 border-green-500/50 text-white/50')
                                    : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-6 z-10">
                                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-sm font-mono">
                                    {['A', 'B', 'C'][i]}
                                </div>
                                <span>{stmt}</span>
                            </div>

                            {/* Voting Pills */}
                            <div className="flex -space-x-3">
                                {Object.entries(votes).filter(([_, v]) => v === i).map(([vid, _]) => (
                                    <div key={vid} className="w-10 h-10 rounded-full bg-game-secondary border-2 border-game-bg flex items-center justify-center text-xs font-bold" title={players[vid]?.name}>
                                        {players[vid]?.name?.charAt(0)}
                                    </div>
                                ))}
                            </div>

                            {showLie && isLie && (
                                <motion.div
                                    initial={{ scale: 2, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute right-4 top-2 text-red-500 font-black text-6xl -rotate-12 border-4 border-red-500 rounded-lg px-4 py-2 opacity-50"
                                >
                                    LIE
                                </motion.div>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    );
};

export default TwoTruthsHost;
