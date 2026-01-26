import { motion, AnimatePresence } from 'framer-motion';

interface MindMeldHostProps {
    phase: 'PROMPT' | 'ANSWERING' | 'MATCHING' | 'RESULTS';
    prompt: string;
    answers: Record<string, string>;
    matches: { player1Id: string; player2Id: string; similarity: number }[];
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
    timer: number;
}

const MindMeldHost = ({ phase, prompt, answers, matches, players, timer }: MindMeldHostProps) => {
    const participants = Object.values(players).filter(p => !p.isHost);

    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'ANSWERING' && (
                    <motion.div
                        key="answering"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="inline-block px-8 py-3 bg-purple-500/20 text-purple-400 rounded-full text-2xl font-black mb-12 uppercase tracking-[0.4em] border border-purple-500/30">
                            Telepathy Test
                        </div>
                        <h2 className="text-[6rem] md:text-[8rem] font-black mb-8 tracking-tighter leading-none italic uppercase">
                            "{prompt}"
                        </h2>
                        
                        <div className="text-[10rem] font-black font-mono text-white mb-16 leading-none">
                            {timer}
                        </div>

                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 max-w-5xl">
                            {participants.map((p) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        scale: answers[p.id] ? 1.1 : 1,
                                        opacity: answers[p.id] ? 1 : 0.3
                                    }}
                                    className={`relative w-24 h-24 rounded-3xl flex items-center justify-center text-5xl border-4 transition-all ${
                                        answers[p.id] ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    {p.avatar}
                                    {answers[p.id] && (
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

                {phase === 'MATCHING' && (
                    <motion.div
                        key="matching"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-12"
                    >
                        <motion.div 
                            animate={{ 
                                rotate: 360,
                                scale: [1, 1.2, 1],
                                filter: ['blur(0px)', 'blur(4px)', 'blur(0px)']
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-[15rem]"
                        >
                            🔮
                        </motion.div>
                        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-widest animate-pulse">
                            Syncing Brainwaves...
                        </h2>
                    </motion.div>
                )}

                {phase === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full h-full flex flex-col items-center pt-10"
                    >
                        <h2 className="text-7xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-tighter italic">
                            Mind Meld Results
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl overflow-y-auto px-6 pb-20 custom-scrollbar">
                            {/* Matches */}
                            <div className="space-y-6">
                                <h3 className="text-3xl font-black uppercase tracking-widest text-game-secondary flex items-center gap-4">
                                    <span>Matches Found</span>
                                    <div className="h-1 flex-1 bg-game-secondary/20" />
                                </h3>
                                {matches.length > 0 ? matches.map((match, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white/5 p-8 rounded-[3rem] border-4 border-game-secondary/30 flex items-center justify-between shadow-2xl"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="flex -space-x-4">
                                                <div className="text-5xl z-10 border-4 border-game-bg rounded-full bg-white/10 p-2">{players[match.player1Id]?.avatar}</div>
                                                <div className="text-5xl border-4 border-game-bg rounded-full bg-white/10 p-2">{players[match.player2Id]?.avatar}</div>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xl font-black uppercase text-white/60">MELD!</div>
                                                <div className="text-2xl font-black uppercase tracking-tight">
                                                    {players[match.player1Id]?.name} + {players[match.player2Id]?.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-5xl font-black text-game-secondary font-mono">
                                            +{Math.round(match.similarity * 100)}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="bg-white/5 p-12 rounded-[3rem] border-4 border-dashed border-white/10 text-center opacity-30">
                                        <p className="text-2xl font-black uppercase tracking-widest">No brain sync detected</p>
                                    </div>
                                )}
                            </div>

                            {/* All Answers */}
                            <div className="space-y-6">
                                <h3 className="text-3xl font-black uppercase tracking-widest text-white/30 flex items-center gap-4">
                                    <span>All Thoughts</span>
                                    <div className="h-1 flex-1 bg-white/10" />
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {Object.entries(answers).map(([id, answer]) => (
                                        <motion.div 
                                            key={id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-6"
                                        >
                                            <div className="text-4xl shrink-0">{players[id]?.avatar}</div>
                                            <div className="text-left">
                                                <div className="text-xs font-black uppercase text-white/20 tracking-widest">{players[id]?.name}</div>
                                                <div className="text-2xl font-black uppercase italic text-game-primary leading-tight">"{answer}"</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MindMeldHost;