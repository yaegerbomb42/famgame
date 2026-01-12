import { useState } from 'react';

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
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
            {phase === 'CLAIM' && isMyTurn && (
                <div className="w-full max-w-2xl space-y-8">
                    <h2 className="text-4xl font-black text-center gradient-text-secondary uppercase">Make Your Claim!</h2>

                    <textarea
                        value={myClaim}
                        onChange={(e) => setMyClaim(e.target.value)}
                        placeholder="MAKE A BOLD STATEMENT ABOUT YOURSELF..."
                        className="w-full p-8 bg-white/5 border-4 border-white/5 rounded-[2rem] text-3xl font-black placeholder:text-white/10 min-h-[200px] focus:outline-none focus:border-game-secondary transition-all"
                    />

                    <div className="flex gap-6">
                        <button
                            onClick={() => setAmLying(false)}
                            className={`flex-1 py-8 rounded-[2rem] font-black text-2xl border-4 transition-all ${!amLying ? 'bg-green-500 border-white/50 scale-105 shadow-[0_0_40px_rgba(34,197,94,0.4)]' : 'bg-white/5 border-white/5 opacity-40'}`}
                        >
                            ✅ TRUTH
                        </button>
                        <button
                            onClick={() => setAmLying(true)}
                            className={`flex-1 py-8 rounded-[2rem] font-black text-2xl border-4 transition-all ${amLying ? 'bg-red-500 border-white/50 scale-105 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : 'bg-white/5 border-white/5 opacity-40'}`}
                        >
                            🤥 BLUFF
                        </button>
                    </div>

                    <button
                        onClick={() => onSubmitClaim(myClaim, amLying)}
                        disabled={!myClaim.trim()}
                        className="w-full py-8 bg-game-primary rounded-[2rem] font-black text-4xl shadow-[0_20px_50px_rgba(255,0,255,0.4)] disabled:opacity-20 transition-all uppercase"
                    >
                        SUBMIT CLAIM 🚀
                    </button>
                </div>
            )}

            {phase === 'CLAIM' && !isMyTurn && (
                <div className="text-center space-y-6">
                    <div className="text-9xl animate-spin-slow">⏳</div>
                    <p className="text-2xl text-white/40 font-black uppercase tracking-widest">Someone is lying...</p>
                </div>
            )}

            {phase === 'VOTING' && !isMyTurn && (
                <div className="w-full max-w-2xl text-center space-y-8">
                    <p className="text-2xl font-black text-white/40 uppercase tracking-widest">{claimerName} CLAIMS:</p>
                    <div className="glass-card p-10 rounded-[2.5rem] border-4 border-game-secondary shadow-[0_0_50px_rgba(0,255,255,0.2)]">
                        <p className="text-4xl font-black leading-tight">"{claim}"</p>
                    </div>

                    {!hasVoted ? (
                        <div className="flex gap-8">
                            <button
                                onClick={() => handleVote(false)}
                                className="flex-1 py-12 bg-green-500/10 hover:bg-green-500 border-4 border-white/5 hover:border-white/50 rounded-[2.5rem] font-black text-3xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.4)]"
                            >
                                ✅<br />TRUTH
                            </button>
                            <button
                                onClick={() => handleVote(true)}
                                className="flex-1 py-12 bg-red-500/10 hover:bg-red-500 border-4 border-white/5 hover:border-white/50 rounded-[2.5rem] font-black text-3xl transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                            >
                                🤥<br />BLUFF
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-9xl animate-bounce">📥</div>
                            <div className="text-4xl font-black gradient-text-primary uppercase">VOTE SUBMITTED!</div>
                        </div>
                    )}
                </div>
            )}

            {phase === 'VOTING' && isMyTurn && (
                <div className="text-center space-y-6">
                    <div className="text-9xl animate-pulse">😏</div>
                    <h3 className="text-4xl font-black uppercase">KEEP A DEADPAN FACE.</h3>
                    <p className="text-2xl text-white/40 font-black">They are trying to read you...</p>
                </div>
            )}

            {phase === 'REVEAL' && (
                <div className="text-center space-y-6">
                    <div className="text-9xl">👀</div>
                    <h3 className="text-4xl font-black gradient-text-secondary uppercase">MOMENT OF TRUTH!</h3>
                    <p className="text-2xl font-black uppercase tracking-widest animate-pulse">Check the TV!</p>
                </div>
            )}
        </div>
    );
};

export default BluffPlayer;
