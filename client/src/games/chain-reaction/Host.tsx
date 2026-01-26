import { motion, AnimatePresence } from 'framer-motion';

interface ChainReactionHostProps {
    phase: 'WAITING' | 'ACTIVE' | 'RESULTS';
    chain: { word: string; playerId: string }[];
    currentPlayerId: string | null;
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
    timer: number;
    failedPlayerId?: string;
}

const ChainReactionHost = ({ phase, chain, currentPlayerId, players, timer, failedPlayerId }: ChainReactionHostProps) => {
    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'WAITING' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="inline-block px-8 py-3 bg-game-primary/20 text-game-primary rounded-full text-2xl font-black mb-12 uppercase tracking-[0.4em] border border-game-primary/30">
                            Speed Association
                        </div>
                        <h2 className="text-8xl font-black mb-16 tracking-tighter leading-none italic uppercase">
                            Chain <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary drop-shadow-[0_0_50px_rgba(255,0,255,0.3)]">Reaction</span>
                        </h2>
                        <div className="text-[15rem] animate-pulse">⛓️</div>
                    </motion.div>
                )}

                {phase === 'ACTIVE' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col items-center"
                    >
                        <div className="flex items-center gap-8 mb-16">
                            <div className={`text-[10rem] font-black font-mono leading-none ${timer <= 2 ? 'text-red-500 animate-ping' : 'text-white'}`}>
                                {timer}
                            </div>
                            <div className="text-left">
                                <p className="text-2xl font-black text-white/30 uppercase tracking-widest">SECONDS REMAINING</p>
                                <h3 className="text-5xl font-black uppercase tracking-tighter italic">
                                    <span className="text-game-primary">{players[currentPlayerId || '']?.name}'s</span> Turn!
                                </h3>
                            </div>
                        </div>

                        {/* The Chain */}
                        <div className="flex flex-wrap justify-center gap-6 max-w-6xl overflow-y-auto px-10 pb-20 custom-scrollbar max-h-[50vh]">
                            {chain.map((item, i) => (
                                <motion.div
                                    key={i + item.word}
                                    initial={{ scale: 0, x: -50 }}
                                    animate={{ scale: 1, x: 0 }}
                                    className="flex items-center gap-6"
                                >
                                    <div className="bg-white/5 p-8 rounded-[2.5rem] border-4 border-white/10 flex flex-col items-center min-w-[15rem] shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 font-black italic">#{i+1}</div>
                                        <div className="text-4xl font-black uppercase italic tracking-tight mb-2">{item.word}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{players[item.playerId]?.avatar}</span>
                                            <span className="text-xs font-black uppercase text-white/30">{players[item.playerId]?.name}</span>
                                        </div>
                                    </div>
                                    {i < chain.length - 1 && (
                                        <motion.div 
                                            animate={{ x: [0, 10, 0] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            className="text-5xl text-game-secondary font-black"
                                        >
                                            →
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-6"
                            >
                                <div className="text-5xl text-game-primary font-black animate-pulse">→</div>
                                <div className="bg-game-primary/10 p-8 rounded-[2.5rem] border-4 border-game-primary border-dashed flex flex-col items-center justify-center min-w-[15rem] h-[10rem] animate-pulse">
                                    <div className="text-6xl font-black text-game-primary">?</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {phase === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="text-9xl mb-8 animate-shake">💥</div>
                        <h2 className="text-[8rem] font-black text-red-500 uppercase tracking-tighter italic leading-none mb-8 drop-shadow-glow">
                            CHAIN BROKEN!
                        </h2>
                        
                        <div className="p-12 bg-white/5 rounded-[4rem] border-4 border-red-500/30 flex flex-col items-center gap-10">
                            <div className="flex items-center gap-8">
                                <span className="text-9xl">{players[failedPlayerId || '']?.avatar}</span>
                                <div className="text-left">
                                    <h3 className="text-6xl font-black uppercase tracking-tighter text-white">
                                        {players[failedPlayerId || '']?.name}
                                    </h3>
                                    <p className="text-3xl font-black text-red-500 uppercase tracking-widest mt-2">
                                        RAN OUT OF TIME
                                    </p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-white/10" />
                            <div className="text-4xl font-black uppercase tracking-widest text-game-secondary">
                                FINAL CHAIN: {chain.length} WORDS
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChainReactionHost;