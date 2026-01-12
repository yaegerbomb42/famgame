import { motion, AnimatePresence } from 'framer-motion';

interface WordRaceHostProps {
    category: string;
    words: any[];
    scores: any;
    players: any;
}

const WordRaceHost: React.FC<WordRaceHostProps> = ({ category, words, players }) => {

    // Get last 15 words
    const recentWords = words.slice(-15).reverse();

    return (
        <div className="flex flex-col h-full p-8 relative">
            <div className="flex justify-between items-start mb-8 z-10">
                <div>
                    <div className="text-sm uppercase tracking-widest text-white/50">Category</div>
                    <div className="text-6xl font-display font-black text-game-secondary">{category}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm uppercase tracking-widest text-white/50">Total Words</div>
                    <div className="text-4xl font-mono">{words.length}</div>
                </div>
            </div>

            {/* Word Stream */}
            <div className="flex-1 relative flex items-center justify-center">
                <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-4 p-8 overflow-hidden mask-fade-y">
                    <AnimatePresence>
                        {recentWords.map((w) => (
                            <motion.div
                                key={w.timestamp + w.word}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                className="bg-white/10 px-6 py-3 rounded-full border border-white/5 text-xl font-bold backdrop-blur-sm"
                            >
                                <span>{w.word}</span>
                                <span className="text-xs ml-2 opacity-50 bg-black/20 px-2 py-1 rounded">{players[w.playerId]?.name}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default WordRaceHost;
