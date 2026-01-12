// Bluff - One player makes a true or false claim, others guess if they're lying
interface BluffHostProps {
    phase: 'CLAIM' | 'VOTING' | 'REVEAL';
    currentClaimerId?: string;
    claim?: string;
    isLying?: boolean;
    votes: Record<string, boolean>; // true = thinks they're lying
    players: Record<string, { id: string; name: string }>;
}

const BluffHost = ({ phase, currentClaimerId, claim, isLying, votes, players }: BluffHostProps) => {
    const claimer = currentClaimerId ? players[currentClaimerId] : null;
    const truthVotes = Object.values(votes).filter(v => !v).length;
    const lieVotes = Object.values(votes).filter(v => v).length;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            {phase === 'CLAIM' && (
                <div className="text-center">
                    <h2 className="text-5xl font-display mb-4 gradient-text-secondary">Make Your Claim</h2>
                    <p className="text-xl text-white/50 mb-8">{claimer?.name || 'A player'} is thinking of a claim...</p>
                    <div className="text-8xl mb-4">🎭</div>
                    <p className="text-lg text-white/30">Truth or Bluff? You decide!</p>
                </div>
            )}

            {phase === 'VOTING' && (
                <div className="text-center max-w-3xl">
                    <div className="mb-8">
                        <span className="text-2xl text-game-secondary">{claimer?.name} claims:</span>
                    </div>
                    <div className="glass-card p-8 rounded-3xl mb-8">
                        <p className="text-4xl font-bold leading-relaxed">"{claim}"</p>
                    </div>
                    <h3 className="text-3xl font-display mb-6">Truth or Bluff?</h3>
                    <div className="flex justify-center gap-8">
                        <div className="text-center">
                            <div className="text-6xl mb-2">✅</div>
                            <div className="text-2xl font-bold">{truthVotes}</div>
                            <div className="text-white/50">Truth</div>
                        </div>
                        <div className="text-center">
                            <div className="text-6xl mb-2">🤥</div>
                            <div className="text-2xl font-bold">{lieVotes}</div>
                            <div className="text-white/50">Bluff</div>
                        </div>
                    </div>
                </div>
            )}

            {phase === 'REVEAL' && (
                <div className="text-center">
                    <div className="text-[10rem] mb-4">{isLying ? '🤥' : '✅'}</div>
                    <h2 className="text-6xl font-display mb-4" style={{
                        color: isLying ? '#ff6b6b' : '#26de81'
                    }}>
                        {isLying ? 'BLUFF!' : 'TRUTH!'}
                    </h2>
                    <p className="text-2xl text-white/50">{claimer?.name} was {isLying ? 'lying!' : 'telling the truth!'}</p>
                </div>
            )}
        </div>
    );
};

export default BluffHost;
