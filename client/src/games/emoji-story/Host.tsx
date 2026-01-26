import { motion, AnimatePresence } from 'framer-motion';

interface EmojiStoryHostProps {
    phase: 'INPUT' | 'GUESSING' | 'REVEAL';
    currentStory?: { playerId: string; emojis: string };
    inputs: Record<string, string>;
    guesses: Record<string, string>;
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
    correctAnswer?: string;
}

const EmojiStoryHost = ({ phase, currentStory, inputs, guesses, players, correctAnswer }: EmojiStoryHostProps) => {
    const participants = Object.values(players).filter(p => !p.isHost);

    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'INPUT' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="inline-block px-8 py-3 bg-game-primary/20 text-game-primary rounded-full text-2xl font-black mb-12 uppercase tracking-[0.4em] border border-game-primary/30">
                            Story Time
                        </div>
                        <h2 className="text-8xl font-black mb-16 tracking-tighter leading-none italic uppercase">
                            Emoji <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary drop-shadow-[0_0_50px_rgba(255,0,255,0.3)]">Tales</span>
                        </h2>

                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 max-w-5xl">
                            {participants.map((p) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        scale: inputs[p.id] ? 1.1 : 1,
                                        opacity: inputs[p.id] ? 1 : 0.3
                                    }}
                                    className={`relative w-24 h-24 rounded-3xl flex items-center justify-center text-5xl border-4 transition-all ${
                                        inputs[p.id] ? 'bg-game-primary/20 border-game-primary shadow-[0_0_30px_rgba(255,0,255,0.3)]' : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    {p.avatar}
                                    {inputs[p.id] && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -right-3 -top-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white"
                                        >
                                            ✓
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {phase === 'GUESSING' && currentStory && (
                    <motion.div
                        key="guessing"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center"
                    >
                        <h2 className="text-4xl font-black text-game-secondary uppercase tracking-[0.3em] mb-12">Decode the Masterpiece</h2>
                        <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-[12rem] md:text-[18rem] tracking-[0.2em] drop-shadow-[0_0_80px_rgba(255,255,255,0.3)] mb-16"
                        >
                            {currentStory.emojis}
                        </motion.div>
                        
                        <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                            {participants.map((p) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ opacity: guesses[p.id] ? 1 : 0.2, scale: guesses[p.id] ? 1.1 : 1 }}
                                    className={`px-8 py-3 rounded-full border-2 font-black text-2xl uppercase tracking-widest ${
                                        guesses[p.id] ? 'bg-game-secondary/20 border-game-secondary text-game-secondary' : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    {p.name} {guesses[p.id] ? '✓' : ''}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="text-4xl mb-6">🎭</div>
                        <h2 className="text-6xl font-black text-white/30 uppercase tracking-[0.5em] mb-8">The Story Was...</h2>
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-8xl md:text-[10rem] font-black text-game-accent uppercase tracking-tighter italic leading-none drop-shadow-[0_0_60px_rgba(254,211,48,0.4)]"
                        >
                            "{correctAnswer}"
                        </motion.div>
                        
                        <div className="mt-20 p-10 bg-white/5 rounded-[3rem] border-4 border-white/10">
                            <p className="text-2xl text-white/40 font-black mb-6 uppercase tracking-widest">Storyteller</p>
                            <div className="flex items-center gap-8">
                                <span className="text-8xl">{players[currentStory?.playerId || '']?.avatar}</span>
                                <span className="text-7xl font-black text-game-primary uppercase tracking-tighter italic">
                                    {players[currentStory?.playerId || '']?.name}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmojiStoryHost;