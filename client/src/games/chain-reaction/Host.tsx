// Chain Reaction - Speed game where players build a chain as fast as possible
// Each player has 5 seconds to add a word that connects to the previous word
interface ChainReactionHostProps {
    phase: 'WAITING' | 'ACTIVE' | 'RESULTS';
    chain: { word: string; playerId: string }[];
    currentPlayerId: string | null;
    players: Record<string, { id: string; name: string }>;
    timer: number;
    failedPlayerId?: string;
}

const ChainReactionHost = ({ phase, chain, currentPlayerId, players, timer, failedPlayerId }: ChainReactionHostProps) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            {phase === 'WAITING' && (
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-4 gradient-text-primary">Chain Reaction</h2>
                    <p className="text-2xl text-white/50">Get ready to build the chain!</p>
                    <div className="text-8xl mt-8">⛓️</div>
                </div>
            )}

            {phase === 'ACTIVE' && (
                <div className="text-center w-full max-w-4xl">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <span className="text-2xl text-white/50">Time:</span>
                        <span className={`text-6xl font-black ${timer <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timer}
                        </span>
                    </div>

                    {/* The Chain */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {chain.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="glass-card px-6 py-4 rounded-2xl">
                                    <div className="text-2xl md:text-3xl font-bold">{item.word}</div>
                                    <div className="text-sm text-white/40">{players[item.playerId]?.name}</div>
                                </div>
                                {i < chain.length - 1 && <span className="text-3xl text-game-secondary">→</span>}
                            </div>
                        ))}
                        <div className="flex items-center gap-2">
                            <span className="text-3xl text-game-secondary">→</span>
                            <div className="glass-card px-6 py-4 rounded-2xl border-2 border-game-primary animate-pulse">
                                <div className="text-2xl md:text-3xl font-bold">?</div>
                                <div className="text-sm text-game-primary">{players[currentPlayerId || '']?.name}</div>
                            </div>
                        </div>
                    </div>

                    <p className="text-3xl text-white/50">
                        <span className="text-white font-bold">{players[currentPlayerId || '']?.name}</span>'s turn!
                    </p>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-4 text-red-500">💥 Chain Broken!</h2>
                    {failedPlayerId && (
                        <p className="text-3xl text-white/50 mb-8">
                            {players[failedPlayerId]?.name} ran out of time!
                        </p>
                    )}
                    <p className="text-2xl text-game-secondary">Chain length: {chain.length} words</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-4xl">
                        {chain.map((item, i) => (
                            <span key={i} className="glass-card px-4 py-2 rounded-lg text-xl">
                                {item.word}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChainReactionHost;
