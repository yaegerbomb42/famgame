import { motion, AnimatePresence } from 'framer-motion';

interface PollHostProps {
    phase: 'VOTING' | 'RESULTS';
    prompt: string;
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
    votes: Record<string, string>;
}

const PollHost: React.FC<PollHostProps> = ({ phase, prompt, players, votes }) => {
    const participants = Object.values(players).filter(p => !p.isHost);
    const votedCount = Object.keys(votes).length;
    const totalCount = participants.length;

    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="inline-block px-8 py-3 bg-game-secondary/20 text-game-secondary rounded-full text-2xl font-black mb-12 uppercase tracking-[0.4em] border border-game-secondary/30">
                            Opinion Poll
                        </div>
                        <h2 className="text-8xl font-black mb-16 tracking-tighter leading-none max-w-5xl italic">
                            "{prompt}"
                        </h2>

                        <div className="w-full max-w-2xl bg-white/5 h-6 rounded-full overflow-hidden border border-white/10 mb-6">
                            <motion.div 
                                className="h-full bg-game-secondary shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(votedCount / totalCount) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <p className="text-3xl font-black text-white/30 uppercase tracking-widest">
                            {votedCount} / {totalCount} VOTES RECEIVED
                        </p>
                    </motion.div>
                )}

                {phase === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full h-full flex flex-col items-center pt-10"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-5xl font-black tracking-tighter text-white/40 italic">"{prompt}"</h2>
                            <h3 className="text-7xl font-black uppercase tracking-tighter text-game-secondary mt-4">The Verdict</h3>
                        </div>

                        <div className="flex items-end justify-center gap-6 w-full h-[55vh] max-w-6xl pb-10 px-10">
                            {participants.map((player) => {
                                const voteCount = Object.values(votes).filter(v => v === player.id).length;
                                const percentage = totalCount > 0 ? (voteCount / totalCount) * 100 : 0;
                                const isWinner = voteCount > 0 && voteCount === Math.max(...participants.map(p => Object.values(votes).filter(v => v === p.id).length));

                                return (
                                    <motion.div
                                        key={player.id}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(percentage, 5)}%` }}
                                        transition={{ duration: 1, type: "spring" }}
                                        className="flex flex-col items-center justify-end flex-1 max-w-[12rem] relative group"
                                    >
                                        <div className={`w-full h-full rounded-t-[3rem] relative transition-all duration-700 ${
                                            isWinner 
                                                ? 'bg-gradient-to-t from-game-primary to-game-secondary shadow-[0_0_50px_rgba(255,0,255,0.3)] border-t-4 border-white/50' 
                                                : 'bg-white/5 border-t-4 border-white/10'
                                        }`}>
                                            <div className="absolute -top-16 inset-x-0 text-center text-6xl font-black drop-shadow-lg">
                                                {voteCount > 0 ? voteCount : ''}
                                            </div>

                                            {/* Voter Avatars */}
                                            <div className="absolute inset-x-0 bottom-6 flex flex-wrap justify-center gap-1 px-2">
                                                {Object.entries(votes).filter(([, target]) => target === player.id).map(([voterId], idx) => (
                                                    <motion.div
                                                        key={voterId}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 1 + idx * 0.1 }}
                                                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xl shadow-xl border-2 border-game-bg"
                                                    >
                                                        {players[voterId]?.avatar || '👾'}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="absolute top-full pt-6 w-full text-center">
                                            <div className="text-4xl mb-1">{player.avatar}</div>
                                            <div className="text-xl font-black uppercase tracking-tighter truncate w-full">{player.name}</div>
                                        </div>
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

export default PollHost;