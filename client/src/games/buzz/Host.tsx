import { motion, AnimatePresence } from 'framer-motion';

interface BuzzHostProps {
    phase: 'WAITING' | 'ACTIVE' | 'BUZZED';
    winnerId: string | null;
    players: any;
}

const BuzzHost: React.FC<BuzzHostProps> = ({ phase, winnerId, players }) => {
    return (
        <div className="flex flex-col h-full w-full justify-center items-center p-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'WAITING' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <div className="text-[10rem] animate-pulse">🤫</div>
                        <h2 className="text-5xl font-black text-white/20 uppercase tracking-[0.5em] text-center">
                            Don't touch your screen...
                        </h2>
                    </motion.div>
                )}

                {phase === 'ACTIVE' && (
                    <motion.div
                        key="active"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="relative z-10"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                            className="text-[18rem] md:text-[25rem] font-black text-white drop-shadow-[0_0_100px_rgba(255,0,255,0.8)] leading-none"
                        >
                            BUZZ!
                        </motion.div>
                        <motion.div 
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.3 }}
                            className="absolute inset-0 bg-game-primary/20 blur-[100px]" 
                        />
                    </motion.div>
                )}

                {phase === 'BUZZED' && winnerId && (
                    <motion.div
                        key="buzzed"
                        initial={{ scale: 0, y: 100 }}
                        animate={{ scale: 1, y: 0 }}
                        className="flex flex-col items-center justify-center bg-white text-black p-20 rounded-[5rem] z-10 shadow-[0_0_150px_rgba(255,255,255,0.5)] border-[12px] border-white/20"
                    >
                        <div className="text-4xl uppercase tracking-[0.3em] mb-6 font-black text-black/30">Fastest Fingers</div>
                        <div className="flex items-center gap-8">
                            <span className="text-9xl">{players[winnerId]?.avatar}</span>
                            <div className="text-9xl font-black text-game-primary tracking-tighter uppercase">
                                {players[winnerId]?.name}
                            </div>
                        </div>
                        <div className="text-4xl mt-8 font-black bg-game-primary/10 px-8 py-3 rounded-full text-game-primary">+500 PTS</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Effects */}
            <AnimatePresence>
                {phase === 'ACTIVE' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-game-primary/20 z-0" 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BuzzHost;