import { motion, AnimatePresence } from 'framer-motion';

interface BluffHostProps {
    phase: 'CLAIM' | 'VOTING' | 'REVEAL';
    currentClaimerId?: string;
    claim?: string;
    isLying?: boolean;
    votes: Record<string, boolean>;
    players: Record<string, { id: string; name: string; avatar?: string; isHost?: boolean }>;
}

const BluffHost = ({ phase, currentClaimerId, claim, isLying, votes, players }: BluffHostProps) => {
    const claimer = currentClaimerId ? players[currentClaimerId] : null;
    const truthVotes = Object.values(votes).filter(v => !v).length;
    const lieVotes = Object.values(votes).filter(v => v).length;

    return (
        <div className="flex flex-col h-full w-full max-w-7xl justify-center items-center px-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'CLAIM' && (
                    <motion.div
                        key="claim"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="inline-block px-8 py-3 bg-game-primary/20 text-game-primary rounded-full text-2xl font-black mb-12 uppercase tracking-[0.4em] border border-game-primary/30">
                            Deception
                        </div>
                        <h2 className="text-8xl font-black mb-16 tracking-tighter leading-none italic uppercase">
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary drop-shadow-[0_0_50px_rgba(255,0,255,0.3)]">Bluff</span>
                        </h2>

                        <div className="p-12 bg-white/5 rounded-[4rem] border-4 border-white/10 flex flex-col items-center gap-10">
                            <div className="text-9xl animate-pulse">{claimer?.avatar}</div>
                            <div className="space-y-4">
                                <h3 className="text-6xl font-black uppercase tracking-tighter italic">
                                    {claimer?.name} <span className="text-white/40">is plotting...</span>
                                </h3>
                                <p className="text-2xl text-white/20 font-black uppercase tracking-widest">Truth or Lie? They are choosing now.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="text-center mb-12">
                            <div className="flex items-center justify-center gap-6 mb-4">
                                <span className="text-6xl">{claimer?.avatar}</span>
                                <h2 className="text-5xl font-black uppercase tracking-tight italic">"{claimer?.name}'s Claim"</h2>
                            </div>
                        </div>

                        <div className="bg-white/5 p-16 rounded-[4rem] border-4 border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.05)] mb-20 max-w-5xl">
                            <p className="text-7xl font-black leading-tight italic uppercase tracking-tight">
                                "{claim}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-20 w-full max-w-4xl">
                            <div className="space-y-8">
                                <div className="text-4xl font-black uppercase tracking-widest text-game-secondary">TRUTH</div>
                                <div className="flex flex-wrap justify-center gap-4 min-h-[6rem]">
                                    {Object.entries(votes).filter(([, v]) => !v).map(([vid]) => (
                                        <motion.div key={vid} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">{players[vid]?.avatar}</motion.div>
                                    ))}
                                    {Array.from({ length: truthVotes }).map((_, i) => (
                                        <div key={i} className="w-16 h-16 rounded-full bg-game-secondary/20 border-4 border-game-secondary flex items-center justify-center text-3xl font-black animate-pulse shadow-glow">?</div>
                                    )).slice(0, 0) /* Hide the ? counters for more mystery */}
                                </div>
                                <div className="text-8xl font-black font-mono text-game-secondary">{truthVotes}</div>
                            </div>

                            <div className="space-y-8">
                                <div className="text-4xl font-black uppercase tracking-widest text-red-500">BLUFF</div>
                                <div className="flex flex-wrap justify-center gap-4 min-h-[6rem]">
                                    {Object.entries(votes).filter(([, v]) => v).map(([vid]) => (
                                        <motion.div key={vid} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">{players[vid]?.avatar}</motion.div>
                                    ))}
                                </div>
                                <div className="text-8xl font-black font-mono text-red-500">{lieVotes}</div>
                            </div>
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
                        <motion.div 
                            initial={{ scale: 5, rotate: 45 }}
                            animate={{ scale: 1, rotate: isLying ? -15 : 0 }}
                            className={`text-[12rem] md:text-[20rem] font-black uppercase italic leading-none mb-10 drop-shadow-[0_0_80px_rgba(255,255,255,0.2)] ${
                                isLying ? 'text-red-500' : 'text-game-secondary'
                            }`}
                        >
                            {isLying ? 'BLUFF!' : 'TRUTH!'}
                        </motion.div>
                        
                        <div className="text-[10rem] mb-12 animate-bounce">
                            {isLying ? '🤥' : '✅'}
                        </div>

                        <h3 className="text-6xl font-black uppercase tracking-tighter">
                            {claimer?.name} <span className="text-white/40">was</span> {isLying ? 'LYING!' : 'NOT LYING!'}
                        </h3>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BluffHost;