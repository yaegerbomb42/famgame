import { useState } from 'react';
import { motion } from 'framer-motion';

interface BluffPlayerProps {
    phase: 'CLAIM' | 'VOTING' | 'REVEAL';
    isMyTurn: boolean;
    claim?: string;
    claimerName?: string;
    onSubmitClaim: (claim: string, isLying: boolean) => void;
    onVote: (thinkingLying: boolean) => void;
}

const BluffPlayer = ({ phase, isMyTurn, claim, claimerName, onSubmitClaim, onVote }: BluffPlayerProps) => {
    const [myClaim, setMyClaim] = useState('');
    const [amLying, setAmLying] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    const handleVote = (lying: boolean) => {
        if (!hasVoted) {
            setHasVoted(true);
            onVote(lying);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto"
        >
            {phase === 'CLAIM' && isMyTurn && (
                <div className="w-full space-y-10">
                    <h2 className="text-5xl font-black text-center gradient-text-secondary uppercase tracking-widest">Make Your Claim!</h2>

                    <textarea
                        value={myClaim}
                        onChange={(e) => setMyClaim(e.target.value)}
                        placeholder="MAKE A BOLD STATEMENT ABOUT YOURSELF..."
                        className="w-full p-10 bg-white/5 border-4 border-white/5 rounded-[3rem] text-4xl font-black placeholder:text-white/5 min-h-[250px] focus:outline-none focus:border-game-secondary transition-all shadow-2xl uppercase"
                        autoFocus
                    />

                    <div className="flex gap-8">
                        <button
                            onClick={() => setAmLying(false)}
                            className={`flex-1 py-12 rounded-[3rem] font-black text-3xl border-4 transition-all ${!amLying ? 'bg-green-500 border-white/50 scale-105 shadow-[0_0_60px_rgba(34,197,94,0.5)]' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'}`}
                        >
                            ✅ TRUTH
                        </button>
                        <button
                            onClick={() => setAmLying(true)}
                            className={`flex-1 py-12 rounded-[3rem] font-black text-3xl border-4 transition-all ${amLying ? 'bg-red-500 border-white/50 scale-105 shadow-[0_0_60px_rgba(239,68,68,0.5)]' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'}`}
                        >
                            🤥 BLUFF
                        </button>
                    </div>

                    <button
                        onClick={() => onSubmitClaim(myClaim, amLying)}
                        disabled={!myClaim.trim()}
                        className="w-full py-12 bg-game-primary rounded-[3.5rem] font-black text-4xl shadow-[0_20px_60px_rgba(255,0,255,0.4)] disabled:opacity-20 transition-all uppercase tracking-widest border-t-8 border-white/20 active:scale-95"
                    >
                        SUBMIT CLAIM 🚀
                    </button>
                </div>
            )}

            {phase === 'CLAIM' && !isMyTurn && (
                <div className="text-center space-y-10 opacity-60">
                    <div className="text-huge animate-spin-slow">⏳</div>
                    <p className="text-4xl text-white font-black uppercase tracking-[0.2em]">Witnessing a lie...</p>
                </div>
            )}

            {phase === 'VOTING' && !isMyTurn && (
                <div className="w-full text-center space-y-12">
                    <div className="space-y-4">
                        <p className="text-3xl font-black text-white/40 uppercase tracking-widest">{claimerName} CLAIMS:</p>
                        <div className="glass-card p-12 rounded-[4rem] border-4 border-game-secondary shadow-[0_0_60px_rgba(0,255,255,0.3)] bg-white/5">
                            <p className="text-5xl font-black leading-tight uppercase tracking-tight">"{claim}"</p>
                        </div>
                    </div>

                    {!hasVoted ? (
                        <div className="flex gap-10">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleVote(false)}
                                className="flex-1 py-16 bg-green-500/10 hover:bg-green-500 border-4 border-white/10 hover:border-white/50 rounded-[3.5rem] font-black text-4xl transition-all shadow-huge-green flex flex-col items-center gap-4"
                            >
                                <span className="text-8xl">✅</span>
                                <span>TRUTH</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleVote(true)}
                                className="flex-1 py-16 bg-red-500/10 hover:bg-red-500 border-4 border-white/10 hover:border-white/50 rounded-[3.5rem] font-black text-4xl transition-all shadow-huge-red flex flex-col items-center gap-4"
                            >
                                <span className="text-8xl">🤥</span>
                                <span>BLUFF</span>
                            </motion.button>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <div className="text-huge animate-bounce">📥</div>
                            <div className="text-6xl font-black gradient-text-primary uppercase tracking-widest">VOTE SUBMITTED!</div>
                        </div>
                    )}
                </div>
            )}

            {phase === 'VOTING' && isMyTurn && (
                <div className="text-center space-y-10">
                    <div className="text-huge animate-pulse shadow-glow">😏</div>
                    <h3 className="text-5xl font-black uppercase tracking-tighter">STAY DEADPAN.</h3>
                    <p className="text-3xl text-white/40 font-black uppercase tracking-[0.3em]">They're hunting for tells...</p>
                </div>
            )}

            {phase === 'REVEAL' && (
                <div className="text-center space-y-10">
                    <div className="text-huge">👀</div>
                    <h3 className="text-6xl font-black gradient-text-secondary uppercase">MOMENT OF TRUTH!</h3>
                    <p className="text-4xl font-black uppercase tracking-widest animate-pulse text-white/40">Watch the big screen!</p>
                </div>
            )}
        </motion.div>
    );
};

export default BluffPlayer;
