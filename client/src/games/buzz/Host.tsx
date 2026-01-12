import { motion } from 'framer-motion';

interface BuzzHostProps {
    phase: 'WAITING' | 'ACTIVE' | 'BUZZED';
    winnerId: string | null;
    players: any;
}

const BuzzHost: React.FC<BuzzHostProps> = ({ phase, winnerId, players }) => {

    return (
        <div className="flex flex-col h-full justify-center items-center p-8 relative overflow-hidden">
            {phase === 'WAITING' && (
                <div className="text-4xl text-white/50 animate-pulse font-mono tracking-widest">
                    PREPARE TO BUZZ...
                </div>
            )}

            {phase === 'ACTIVE' && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="text-9xl font-black text-game-primary drop-shadow-[0_0_50px_rgba(217,70,239,0.8)]"
                >
                    GO!
                </motion.div>
            )}

            {phase === 'BUZZED' && winnerId && (
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex flex-col items-center justify-center bg-white text-black p-12 rounded-3xl z-10"
                >
                    <div className="text-2xl uppercase tracking-widest mb-4 font-bold">Winner</div>
                    <div className="text-6xl font-black text-game-primary">{players[winnerId]?.name}</div>
                    <div className="text-xl mt-4 text-black/50">+50 PTS</div>
                </motion.div>
            )}

            {/* Background Flash */}
            {phase === 'ACTIVE' && (
                <div className="absolute inset-0 bg-game-primary/10 animate-pulse z-0" />
            )}
        </div>
    );
};

export default BuzzHost;
