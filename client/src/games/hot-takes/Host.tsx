import { motion, AnimatePresence } from 'framer-motion';

interface HotTakesHostProps {
    phase: 'INPUT' | 'VOTING' | 'RESULTS';
    prompt: string;
    inputs: Record<string, string>;
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
    votes: Record<string, string>;
}

const HotTakesHost: React.FC<HotTakesHostProps> = ({ phase, prompt, inputs, players, votes }) => {
    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative">
            <AnimatePresence mode="wait">
                {phase === 'INPUT' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="inline-block px-8 py-3 bg-red-500/20 text-red-500 rounded-full text-2xl font-black mb-12 uppercase tracking-[0.4em] border border-red-500/30">
                            Hot Takes
                        </div>
                        <h2 className="text-8xl font-black mb-16 tracking-tighter leading-none max-w-5xl">
                            "{prompt}"
                        </h2>

                        <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
                            {Object.values(players).filter(p => !p.isHost).map((p) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        y: inputs[p.id] ? [0, -10, 0] : 0,
                                        opacity: inputs[p.id] ? 1 : 0.2
                                    }}
                                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-4 transition-all ${
                                        inputs[p.id] ? 'bg-red-500/20 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    {p.avatar}
                                </motion.div>
                            ))}
                        </div>
                        <p className="mt-12 text-2xl font-black text-white/20 uppercase tracking-[0.3em]">Drop your truth on your device</p>
                    </motion.div>
                )}

                {(phase === 'VOTING' || phase === 'RESULTS') && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex flex-col items-center pt-20"
                    >
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-black tracking-tighter text-white/40 italic">"{prompt}"</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 w-full overflow-y-auto px-4 pb-20 custom-scrollbar">
                            {Object.entries(inputs).map(([pid, text]) => {
                                const entryVotes = Object.entries(votes).filter(([, target]) => target === pid);
                                const isWinner = phase === 'RESULTS' && entryVotes.length > 0 && entryVotes.length === Math.max(...Object.keys(inputs).map(p => Object.values(votes).filter(v => v === p).length));

                                return (
                                    <motion.div
                                        key={pid}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ 
                                            scale: isWinner ? 1.05 : 1, 
                                            opacity: 1,
                                            y: isWinner ? -20 : 0
                                        }}
                                        className={`p-12 rounded-[3.5rem] border-4 flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden transition-all duration-700 ${
                                            isWinner 
                                                ? 'bg-game-primary text-white border-white shadow-[0_0_100px_rgba(255,0,255,0.4)]' 
                                                : 'bg-white/5 border-white/10 text-white'
                                        }`}
                                    >
                                        <div className="absolute top-6 left-10 text-6xl opacity-10 font-black italic">HOT</div>
                                        <span className="text-4xl md:text-5xl font-black leading-tight z-10 drop-shadow-lg italic">
                                            "{text}"
                                        </span>

                                        <div className="flex flex-wrap justify-center gap-3 mt-10 min-h-[4rem]">
                                            {entryVotes.map(([voterId], idx) => (
                                                <motion.div
                                                    key={voterId}
                                                    initial={{ scale: 0, y: 20 }}
                                                    animate={{ scale: 1, y: 0 }}
                                                    transition={{ delay: 0.3 + idx * 0.05 }}
                                                    className="w-14 h-14 rounded-full bg-game-secondary border-4 border-game-bg flex items-center justify-center text-3xl shadow-lg"
                                                >
                                                    {players[voterId]?.avatar || '👾'}
                                                </motion.div>
                                            ))}
                                        </div>

                                        {phase === 'RESULTS' && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`absolute bottom-6 px-6 py-2 rounded-full text-xl font-black uppercase tracking-widest ${isWinner ? 'bg-black/20 text-white' : 'bg-white/10 text-white/40'}`}
                                            >
                                                BY {players[pid]?.name}
                                            </motion.div>
                                        )}
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

export default HotTakesHost;