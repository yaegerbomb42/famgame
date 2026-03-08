import { motion, AnimatePresence } from 'framer-motion';

interface CompeteHostProps {
    phase: 'SELECTING' | 'COUNTDOWN' | 'ACTIVE' | 'RESULTS';
    challenger1Id: string;
    challenger2Id: string;
    challenge: { type: 'TAP' | 'TYPE' | 'SEQUENCE'; target: any };
    progress: Record<string, number>;
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
    winnerId?: string;
    timer: number;
}

const CompeteHost = ({ phase, challenger1Id, challenger2Id, challenge, progress, players, winnerId, timer }: CompeteHostProps) => {
    const p1 = players[challenger1Id];
    const p2 = players[challenger2Id];
    const p1Progress = progress[challenger1Id] || 0;
    const p2Progress = progress[challenger2Id] || 0;

    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'COUNTDOWN' && (
                    <motion.div
                        key="countdown"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="flex items-center justify-center gap-20 mb-20">
                            <div className="flex flex-col items-center gap-6">
                                <div className="text-[10rem] drop-shadow-2xl">{p1?.avatar}</div>
                                <h3 className="text-5xl font-black uppercase tracking-tight italic">{p1?.name}</h3>
                            </div>
                            <div className="text-[12rem] font-black text-red-500 italic drop-shadow-huge">VS</div>
                            <div className="flex flex-col items-center gap-6">
                                <div className="text-[10rem] drop-shadow-2xl">{p2?.avatar}</div>
                                <h3 className="text-5xl font-black uppercase tracking-tight italic">{p2?.name}</h3>
                            </div>
                        </div>
                        <div className="text-[15rem] font-black font-mono text-white animate-bounce leading-none">
                            {timer}
                        </div>
                    </motion.div>
                )}

                {phase === 'ACTIVE' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col items-center"
                    >
                        <div className="text-center mb-20">
                            <div className="inline-block px-8 py-3 bg-red-500/20 text-red-500 rounded-full text-2xl font-black mb-8 uppercase tracking-[0.4em] border border-red-500/30">
                                {challenge.type} SHOWDOWN
                            </div>
                            <h2 className="text-8xl font-black uppercase tracking-tighter italic leading-none drop-shadow-glow">
                                {challenge.type === 'TAP' && '👆 FASTEST TAPPER!'}
                                {challenge.type === 'TYPE' && '⌨️ TYPING SPEED!'}
                                {challenge.type === 'SEQUENCE' && '🔢 MASTER SEQUENCER!'}
                            </h2>
                        </div>

                        {/* Progress bars */}
                        <div className="w-full max-w-6xl space-y-16">
                            {/* P1 */}
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-4xl font-black uppercase italic text-red-500">{p1?.name}</span>
                                    <span className="text-5xl font-black font-mono">{Math.round(p1Progress)}%</span>
                                </div>
                                <div className="h-20 bg-white/5 rounded-full border-4 border-white/10 overflow-hidden relative shadow-2xl">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_40px_rgba(239,68,68,0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${p1Progress}%` }}
                                        transition={{ duration: 0.1 }}
                                    />
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                                </div>
                            </div>

                            {/* P2 */}
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-4xl font-black uppercase italic text-game-secondary">{p2?.name}</span>
                                    <span className="text-5xl font-black font-mono">{Math.round(p2Progress)}%</span>
                                </div>
                                <div className="h-20 bg-white/5 rounded-full border-4 border-white/10 overflow-hidden relative shadow-2xl">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-game-secondary to-blue-400 shadow-[0_0_40px_rgba(0,255,255,0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${p2Progress}%` }}
                                        transition={{ duration: 0.1 }}
                                    />
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                                </div>
                            </div>
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
                        <div className="text-9xl mb-8 animate-bounce">🏆</div>
                        <h2 className="text-[10rem] font-black text-game-accent uppercase tracking-tighter italic leading-none mb-12 drop-shadow-glow">
                            CHAMPION!
                        </h2>
                        
                        <div className="p-12 bg-white/5 rounded-[5rem] border-8 border-game-accent shadow-[0_0_150px_rgba(254,211,48,0.3)] flex flex-col items-center gap-10">
                            <div className="flex items-center gap-12">
                                <span className="text-[12rem] drop-shadow-2xl">{players[winnerId]?.avatar}</span>
                                <div className="text-left">
                                    <h3 className="text-8xl font-black uppercase tracking-tighter italic text-white">
                                        {players[winnerId]?.name}
                                    </h3>
                                    <p className="text-4xl font-black text-game-accent uppercase tracking-[0.3em] mt-4">
                                        VICTORY! +500 PTS
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

export default CompeteHost;