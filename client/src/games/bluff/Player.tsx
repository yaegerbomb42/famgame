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
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            {phase === 'CLAIM' && isMyTurn && (
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-center">Your Turn to Claim!</h2>

                    <textarea
                        value={myClaim}
                        onChange={(e) => setMyClaim(e.target.value)}
                        placeholder="Make a statement about yourself..."
                        className="w-full p-4 bg-white/10 rounded-xl text-lg mb-4 min-h-[120px]"
                    />

                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setAmLying(false)}
                            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${!amLying ? 'bg-green-500 scale-105' : 'bg-white/10'}`}
                        >
                            ✅ Truth
                        </button>
                        <button
                            onClick={() => setAmLying(true)}
                            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${amLying ? 'bg-red-500 scale-105' : 'bg-white/10'}`}
                        >
                            🤥 Bluff
                        </button>
                    </div>

                    <button
                        onClick={() => onSubmitClaim(myClaim, amLying)}
                        disabled={!myClaim.trim()}
                        className="w-full py-4 bg-game-primary rounded-xl font-bold text-xl disabled:opacity-50"
                    >
                        Submit Claim
                    </button>
                </div>
            )}

            {phase === 'CLAIM' && !isMyTurn && (
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-xl text-white/50">Someone is making a claim...</p>
                </div>
            )}

            {phase === 'VOTING' && !isMyTurn && (
                <div className="w-full max-w-md text-center">
                    <p className="text-lg text-white/50 mb-2">{claimerName} claims:</p>
                    <div className="glass-card p-6 rounded-xl mb-8">
                        <p className="text-2xl font-bold">"{claim}"</p>
                    </div>

                    {!hasVoted ? (
                        <div className="flex gap-6">
                            <button
                                onClick={() => handleVote(false)}
                                className="flex-1 py-6 bg-green-500/20 hover:bg-green-500 rounded-2xl font-bold text-xl transition-colors"
                            >
                                ✅<br />Truth
                            </button>
                            <button
                                onClick={() => handleVote(true)}
                                className="flex-1 py-6 bg-red-500/20 hover:bg-red-500 rounded-2xl font-bold text-xl transition-colors"
                            >
                                🤥<br />Bluff
                            </button>
                        </div>
                    ) : (
                        <div className="text-2xl text-game-secondary">Vote submitted! ✓</div>
                    )}
                </div>
            )}

            {phase === 'VOTING' && isMyTurn && (
                <div className="text-center">
                    <div className="text-6xl mb-4">😏</div>
                    <p className="text-xl text-white/50">Watch them squirm...</p>
                </div>
            )}

            {phase === 'REVEAL' && (
                <div className="text-center">
                    <div className="text-6xl mb-4">👀</div>
                    <p className="text-xl">Check the TV!</p>
                </div>
            )}
        </div>
    );
};

export default BluffPlayer;
