import { motion } from 'framer-motion';

interface PollHostProps {
    phase: 'VOTING' | 'RESULTS';
    prompt: string;
    players: Record<string, { id: string; name: string }>;
    votes: Record<string, string>;
}

const PollHost: React.FC<PollHostProps> = ({ phase, prompt, players, votes }) => {
    const votedCount = Object.keys(votes).length;
    const totalCount = Object.keys(players).length;

    if (phase === 'VOTING') {
        return (
            <div className="flex flex-col h-full justify-center items-center text-center p-8">
                <h2 className="text-2xl text-game-accent uppercase tracking-widest mb-8 font-bold">Opinion Poll</h2>
                <div className="text-5xl md:text-7xl font-display leading-tight mb-16 max-w-4xl">
                    {prompt}
                </div>

                <div className="glass-card px-12 py-8 rounded-full flex items-center gap-6">
                    <div className="text-4xl font-mono font-bold">{votedCount} / {totalCount}</div>
                    <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-game-primary transition-all duration-500" style={{ width: `${(votedCount / totalCount) * 100}%` }} />
                    </div>
                </div>
            </div>
        )
    }

    // RESULTS PHASE
    return (
        <div className="flex flex-col h-full justify-center items-center p-8">
            <h2 className="text-3xl font-bold mb-12 text-white/50">{prompt}</h2>

            <div className="flex gap-8 items-end justify-center w-full h-[50vh]">
                {Object.values(players).map((player) => {
                    const voteCount = Object.values(votes).filter(v => v === player.id).length;
                    const percentage = totalCount > 0 ? (voteCount / totalCount) * 100 : 0;

                    return (
                        <motion.div
                            key={player.id}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(percentage, 10)}%` }}
                            className="flex flex-col items-center justify-end w-32 relative group"
                        >
                            <div className={`w-full h-full rounded-t-2xl relative ${voteCount > 0 ? 'bg-gradient-to-t from-game-primary to-game-secondary' : 'bg-white/5'}`}>
                                <div className="absolute -top-12 inset-x-0 text-center text-4xl font-bold">
                                    {voteCount > 0 ? voteCount : ''}
                                </div>

                                {/* Avatars of voters */}
                                <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
                                    {Object.entries(votes).filter(([, target]) => target === player.id).map(([voterId]) => (
                                        <div key={voterId} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold shadow-lg" title={players[voterId]?.name}>
                                            {players[voterId]?.name?.charAt(0)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <div className="font-bold truncate w-full">{player.name}</div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    );
};

export default PollHost;
