import { motion } from 'framer-motion';

interface ReactionHostProps {
    phase: 'WAITING' | 'GO' | 'END';
    results: any;
    players: any;
}

const ReactionHost: React.FC<ReactionHostProps> = ({ phase, results, players }) => {

    return (
        <div className="flex flex-col h-full items-center justify-center p-8">
            {phase === 'WAITING' && (
                <div className="w-96 h-96 rounded-full bg-red-500 blur-[80px] opacity-50 animate-pulse" />
            )}

            {phase === 'GO' && (
                <div className="absolute inset-0 bg-green-500 flex items-center justify-center">
                    <h1 className="text-[20vw] font-black text-white">TAP!</h1>
                </div>
            )}

            <div className="z-10 w-full max-w-4xl grid grid-cols-2 gap-4">
                {Object.entries(results).sort(([, a]: any, [, b]: any) => a - b).map(([pid, ms]: [string, any], i) => (
                    <motion.div
                        key={pid}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className={`bg-black/50 p-6 rounded-xl flex justify-between items-center border ${i === 0 ? 'border-green-500' : 'border-white/10'}`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="font-mono text-white/50">#{i + 1}</span>
                            <span className="font-bold text-xl">{players[pid]?.name}</span>
                        </div>
                        <span className="font-mono text-2xl text-game-primary">{ms}ms</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ReactionHost;
