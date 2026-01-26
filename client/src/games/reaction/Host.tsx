import { motion, AnimatePresence } from 'framer-motion';

interface ReactionHostProps {
    phase: 'WAITING' | 'GO' | 'RESULTS';
    results: Record<string, number>;
    players: Record<string, { name: string; avatar?: string }>;
}

const ReactionHost: React.FC<ReactionHostProps> = ({ phase, results, players }) => {
    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'WAITING' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-12"
                    >
                        <div className="text-[12rem] animate-pulse">🚦</div>
                        <h2 className="text-8xl font-black text-red-500 uppercase tracking-tighter italic drop-shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                            Ready...
                        </h2>
                        <div className="w-64 h-64 rounded-full bg-red-500/20 border-8 border-red-500/50 animate-ping absolute -z-10" />
                    </motion.div>
                )}

                {phase === 'GO' && (
                    <motion.div
                        key="go"
                        initial={{ scale: 0, rotate: 20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center z-50 shadow-[inset_0_0_200px_rgba(0,0,0,0.3)]"
                    >
                        <motion.h1 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.2 }}
                            className="text-[25vw] font-black text-white italic tracking-tighter leading-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                        >
                            TAP!
                        </motion.h1>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="z-10 w-full max-w-5xl mt-20">
                <div className="grid grid-cols-2 gap-6">
                    {Object.entries(results).sort(([, a], [, b]) => a - b).map(([pid, ms], i) => (
                        <motion.div
                            key={pid}
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-8 rounded-[2.5rem] flex justify-between items-center border-4 backdrop-blur-md shadow-2xl ${
                                i === 0 
                                    ? 'bg-green-500/20 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]' 
                                    : 'bg-white/5 border-white/10'
                            }`}
                        >
                            <div className="flex items-center gap-6">
                                <span className="text-4xl font-black text-white/20">#{i + 1}</span>
                                <div className="text-6xl">{players[pid]?.avatar}</div>
                                <div className="text-3xl font-black uppercase tracking-tight">{players[pid]?.name}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-5xl font-black font-mono ${i === 0 ? 'text-green-400' : 'text-game-secondary'}`}>
                                    {ms}ms
                                </span>
                                {i === 0 && <span className="text-xs font-black text-green-400 uppercase tracking-widest">Lightning!</span>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReactionHost;