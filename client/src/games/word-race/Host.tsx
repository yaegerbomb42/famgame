import { motion, AnimatePresence } from 'framer-motion';

interface WordRaceHostProps {
    category: string;
    words: Array<{ word: string; timestamp: number; playerId: string }>;
    scores?: Record<string, number>;
    players: Record<string, { name: string; avatar?: string }>;
}

const WordRaceHost: React.FC<WordRaceHostProps> = ({ category, words, players }) => {
    // Get last 20 words
    const recentWords = words.slice(-20).reverse();

    return (
        <div className="flex flex-col h-full w-full max-w-7xl p-12 relative overflow-hidden">
            <div className="flex justify-between items-start mb-16 z-20">
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    <div className="text-2xl uppercase tracking-[0.4em] text-white/40 font-black mb-4">Category</div>
                    <div className="text-[7rem] font-black text-game-secondary leading-none tracking-tighter drop-shadow-[0_0_50px_rgba(0,255,255,0.3)] italic">
                        {category}
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-right flex flex-col items-end"
                >
                    <div className="text-2xl uppercase tracking-[0.4em] text-white/40 font-black mb-4">Total Heat</div>
                    <div className="text-8xl font-black font-mono text-game-primary drop-shadow-[0_0_30px_rgba(255,0,255,0.3)]">
                        {words.length}
                    </div>
                </motion.div>
            </div>

            {/* Word Stream */}
            <div className="flex-1 relative flex items-center justify-center z-10">
                <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-6 p-10 overflow-hidden">
                    <AnimatePresence>
                        {recentWords.map((w) => (
                            <motion.div
                                key={w.timestamp + w.word}
                                initial={{ scale: 0, y: 50, rotate: -10 }}
                                animate={{ scale: 1, y: 0, rotate: Math.random() * 10 - 5 }}
                                exit={{ scale: 2, opacity: 0 }}
                                className="bg-white/5 px-10 py-5 rounded-[2.5rem] border-4 border-white/10 text-4xl font-black backdrop-blur-md flex items-center gap-6 shadow-2xl transition-all"
                            >
                                <span className="uppercase italic tracking-tight">{w.word}</span>
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                                    <span className="text-2xl">{players[w.playerId]?.avatar}</span>
                                    <span className="text-sm font-black uppercase text-white/50">{players[w.playerId]?.name}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Background Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-radial-gradient-cyan opacity-10 pointer-events-none blur-[150px]" 
                 style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)' }} />
        </div>
    );
};

export default WordRaceHost;