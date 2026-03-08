import { motion, AnimatePresence } from 'framer-motion';

interface SpeedDrawHostProps {
    phase: 'DRAWING' | 'VOTING' | 'RESULTS';
    prompt: string;
    drawings: Record<string, string>;
    votes: Record<string, string>;
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
    timer: number;
}

const SpeedDrawHost = ({ phase, prompt, drawings, votes, players, timer }: SpeedDrawHostProps) => {
    const participants = Object.values(players).filter(p => !p.isHost);
    const voteCount: Record<string, number> = {};
    Object.values(votes).forEach(votedFor => {
        voteCount[votedFor] = (voteCount[votedFor] || 0) + 1;
    });

    const sortedWinners = Object.entries(voteCount).sort((a, b) => b[1] - a[1]);
    const winnerId = sortedWinners[0]?.[0];

    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'DRAWING' && (
                    <motion.div
                        key="drawing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="inline-block px-8 py-3 bg-game-accent/20 text-game-accent rounded-full text-2xl font-black mb-12 uppercase tracking-[0.4em] border border-game-accent/30">
                            The Canvas
                        </div>
                        <h2 className="text-8xl font-black mb-8 tracking-tighter leading-none italic uppercase">
                            DRAW: <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary drop-shadow-[0_0_50px_rgba(255,0,255,0.3)]">{prompt}</span>
                        </h2>
                        
                        <div className="text-[12rem] font-black font-mono text-white mb-16 leading-none">
                            {timer}
                        </div>

                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 max-w-5xl">
                            {participants.map((p) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        scale: drawings[p.id] ? 1.1 : 1,
                                        opacity: drawings[p.id] ? 1 : 0.3
                                    }}
                                    className={`relative w-24 h-24 rounded-3xl flex items-center justify-center text-5xl border-4 transition-all ${
                                        drawings[p.id] ? 'bg-game-accent/20 border-game-accent shadow-[0_0_30px_rgba(254,211,48,0.3)]' : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    {p.avatar}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex flex-col items-center pt-10"
                    >
                        <h2 className="text-5xl font-black mb-12 text-center uppercase tracking-widest text-white/40 italic">
                            Vote for the best <span className="text-white">"{prompt}"</span>
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl overflow-y-auto px-6 pb-20 custom-scrollbar">
                            {Object.entries(drawings).map(([id, dataUrl], i) => (
                                <motion.div
                                    key={id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/5 p-6 rounded-[3rem] border-4 border-white/10 flex flex-col items-center gap-6 shadow-2xl group"
                                >
                                    <div className="w-full aspect-square bg-white rounded-[2.5rem] overflow-hidden p-6 border-8 border-black/10">
                                        <img
                                            src={dataUrl}
                                            alt=""
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl">{players[id]?.avatar}</span>
                                        <span className="text-2xl font-black uppercase tracking-tight">{players[id]?.name}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {phase === 'RESULTS' && winnerId && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="text-4xl mb-6">🏆</div>
                        <h2 className="text-8xl font-black mb-12 text-game-accent uppercase tracking-tighter italic drop-shadow-glow">
                            Masterpiece Winner!
                        </h2>
                        
                        <div className="bg-white/5 p-12 rounded-[5rem] border-8 border-game-accent shadow-[0_0_150px_rgba(254,211,48,0.3)] flex flex-col items-center gap-10">
                            <div className="w-[30rem] h-[30rem] bg-white rounded-[4rem] overflow-hidden p-10 border-[16px] border-black/5">
                                <img
                                    src={drawings[winnerId]}
                                    alt="Winning drawing"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-9xl">{players[winnerId]?.avatar}</div>
                                <div className="text-left">
                                    <h3 className="text-7xl font-black uppercase tracking-tighter italic text-white">
                                        {players[winnerId]?.name}
                                    </h3>
                                    <p className="text-4xl font-black text-game-accent uppercase tracking-[0.2em] mt-2">
                                        {voteCount[winnerId] || 0} VOTES
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpeedDrawHost;