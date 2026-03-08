import { motion, AnimatePresence } from 'framer-motion';

interface ThisOrThatHostProps {
    phase: 'CHOOSING' | 'REVEAL';
    optionA: string;
    optionB: string;
    votes: Record<string, 'A' | 'B'>;
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
}

const ThisOrThatHost = ({ phase, optionA, optionB, votes, players }: ThisOrThatHostProps) => {
    const participants = Object.values(players).filter(p => !p.isHost);
    const votesA = Object.values(votes).filter(v => v === 'A').length;
    const votesB = Object.values(votes).filter(v => v === 'B').length;
    const total = votesA + votesB;
    const percentA = total ? Math.round((votesA / total) * 100) : 50;
    const percentB = total ? Math.round((votesB / total) * 100) : 50;

    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <motion.h2 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-7xl font-black mb-20 tracking-tighter uppercase italic text-center"
            >
                This <span className="text-game-primary">or</span> That?
            </motion.h2>

            <div className="flex flex-col lg:flex-row gap-12 w-full items-center relative">
                {/* Option A */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`flex-1 w-full bg-white/5 p-12 rounded-[4rem] border-4 transition-all duration-700 relative overflow-hidden flex flex-col items-center gap-8 ${
                        phase === 'REVEAL' && percentA >= percentB ? 'border-game-primary shadow-[0_0_80px_rgba(255,0,255,0.4)] scale-105 z-10' : 'border-white/10 opacity-60'
                    }`}
                >
                    <div className="text-[10rem] drop-shadow-2xl">{optionA.split(' ')[0]}</div>
                    <h3 className="text-5xl font-black uppercase tracking-tight text-center">{optionA}</h3>
                    
                    {phase === 'REVEAL' && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-8xl font-black text-game-primary font-mono"
                        >
                            {percentA}%
                        </motion.div>
                    )}

                    <div className="flex flex-wrap justify-center gap-3">
                        {Object.entries(votes).filter(([, v]) => v === 'A').map(([id]) => (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={id} 
                                className="text-3xl"
                            >
                                {players[id]?.avatar}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>

                <div className="text-6xl font-black text-white/10 italic z-20">VS</div>

                {/* Option B */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`flex-1 w-full bg-white/5 p-12 rounded-[4rem] border-4 transition-all duration-700 relative overflow-hidden flex flex-col items-center gap-8 ${
                        phase === 'REVEAL' && percentB > percentA ? 'border-game-secondary shadow-[0_0_80px_rgba(0,255,255,0.4)] scale-105 z-10' : 'border-white/10 opacity-60'
                    }`}
                >
                    <div className="text-[10rem] drop-shadow-2xl">{optionB.split(' ')[0]}</div>
                    <h3 className="text-5xl font-black uppercase tracking-tight text-center">{optionB}</h3>
                    
                    {phase === 'REVEAL' && (
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-8xl font-black text-game-secondary font-mono"
                        >
                            {percentB}%
                        </motion.div>
                    )}

                    <div className="flex flex-wrap justify-center gap-3">
                        {Object.entries(votes).filter(([, v]) => v === 'B').map(([id]) => (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={id} 
                                className="text-3xl"
                            >
                                {players[id]?.avatar}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {phase === 'CHOOSING' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="mt-20 text-3xl font-black text-white/20 uppercase tracking-[0.5em]"
                    >
                        {Object.keys(votes).length} / {participants.length} DECISIONS MADE
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThisOrThatHost;