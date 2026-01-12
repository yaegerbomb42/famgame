import { motion } from 'framer-motion';

interface HotTakesHostProps {
    phase: 'INPUT' | 'VOTING' | 'RESULTS';
    prompt: string;
    inputs: any; // { playerId: text }
    players: any;
    votes: any;
}

const HotTakesHost: React.FC<HotTakesHostProps> = ({ phase, prompt, inputs, players, votes }) => {
    if (phase === 'INPUT') {
        const submittedCount = Object.keys(inputs).length;
        const totalCount = Object.keys(players).length;

        return (
            <div className="flex flex-col h-full justify-center items-center text-center p-8">
                <h2 className="text-2xl text-game-accent uppercase tracking-widest mb-8 font-bold">Hot Take Topic</h2>
                <div className="text-5xl md:text-7xl font-display leading-tight mb-16 max-w-4xl">
                    {prompt}
                </div>

                <div className="glass-card px-12 py-8 rounded-full flex items-center gap-6">
                    <div className="text-4xl font-mono font-bold">{submittedCount} / {totalCount}</div>
                    <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-game-primary transition-all duration-500" style={{ width: `${(submittedCount / totalCount) * 100}%` }} />
                    </div>
                </div>
            </div>
        )
    }

    // VOTING PHASE: Show answers grid
    if (phase === 'VOTING' || phase === 'RESULTS') {
        return (
            <div className="flex flex-col h-full justify-center items-center p-8">
                <h2 className="text-3xl font-bold mb-12 text-white/50">{prompt}</h2>

                <div className="grid grid-cols-2 gap-6 w-full max-w-6xl">
                    {Object.entries(inputs).map(([pid, text]: [string, any], i) => {
                        // Calculate votes
                        const myVotes = Object.values(votes).filter(v => v === pid).length;
                        const isWinner = phase === 'RESULTS' && myVotes > 0 && myVotes === Math.max(...Object.values(inputs).map((pid) => Object.values(votes).filter(v => v === pid).length));

                        return (
                            <motion.div
                                key={pid}
                                layout
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: isWinner ? 1.1 : 1, opacity: 1, borderColor: isWinner ? '#f59e0b' : 'rgba(255,255,255,0.1)' }}
                                className={`p-8 rounded-3xl border-2 bg-white/5 flex flex-col items-center justify-center text-center min-h-[200px] relative ${isWinner ? 'shadow-[0_0_50px_rgba(245,158,11,0.4)] bg-game-accent/10' : ''}`}
                            >
                                <span className="text-3xl font-bold mb-4">"{text}"</span>

                                {/* Vote Bubbles */}
                                <div className="flex gap-2 min-h-[20px] flex-wrap justify-center">
                                    {Object.entries(votes).filter(([_, target]) => target === pid).map(([voterId, _]) => (
                                        <motion.div
                                            key={voterId}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-8 h-8 rounded-full bg-game-primary border border-white/20 flex items-center justify-center text-[10px]"
                                            title={players[voterId]?.name}
                                        >
                                            {players[voterId]?.name?.charAt(0)}
                                        </motion.div>
                                    ))}
                                </div>

                                {phase === 'RESULTS' && (
                                    <div className="absolute top-4 right-4 text-xs font-mono opacity-50">
                                        {players[pid]?.name}
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return null;
};

export default HotTakesHost;
