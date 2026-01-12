// This or That - Quick-fire preference choices
interface ThisOrThatHostProps {
    phase: 'CHOOSING' | 'RESULTS';
    optionA: string;
    optionB: string;
    votes: Record<string, 'A' | 'B'>;
    players: Record<string, { id: string; name: string }>;
}

const ThisOrThatHost = ({ phase, optionA, optionB, votes, players }: ThisOrThatHostProps) => {
    const votesA = Object.values(votes).filter(v => v === 'A').length;
    const votesB = Object.values(votes).filter(v => v === 'B').length;
    const total = votesA + votesB;
    const percentA = total ? Math.round((votesA / total) * 100) : 50;
    const percentB = total ? Math.round((votesB / total) * 100) : 50;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <h2 className="text-4xl font-display mb-12 gradient-text-primary">This or That?</h2>

            <div className="flex gap-8 w-full max-w-4xl">
                {/* Option A */}
                <div className="flex-1 relative">
                    <div
                        className="glass-card p-8 rounded-3xl text-center transition-all duration-500"
                        style={{
                            borderColor: phase === 'RESULTS' && percentA > percentB ? '#ff00ff' : 'transparent',
                            borderWidth: '3px',
                            boxShadow: phase === 'RESULTS' && percentA > percentB ? '0 0 40px rgba(255,0,255,0.4)' : 'none'
                        }}
                    >
                        <div className="text-6xl mb-4">{optionA.split(' ')[0]}</div>
                        <h3 className="text-3xl font-bold mb-4">{optionA}</h3>
                        {phase === 'RESULTS' && (
                            <>
                                <div className="text-6xl font-black text-game-primary">{percentA}%</div>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {Object.entries(votes)
                                        .filter(([_, v]) => v === 'A')
                                        .map(([id]) => (
                                            <span key={id} className="text-sm bg-white/10 px-2 py-1 rounded">
                                                {players[id]?.name}
                                            </span>
                                        ))
                                    }
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center">
                    <span className="text-5xl font-black text-white/20">VS</span>
                </div>

                {/* Option B */}
                <div className="flex-1 relative">
                    <div
                        className="glass-card p-8 rounded-3xl text-center transition-all duration-500"
                        style={{
                            borderColor: phase === 'RESULTS' && percentB > percentA ? '#00ffff' : 'transparent',
                            borderWidth: '3px',
                            boxShadow: phase === 'RESULTS' && percentB > percentA ? '0 0 40px rgba(0,255,255,0.4)' : 'none'
                        }}
                    >
                        <div className="text-6xl mb-4">{optionB.split(' ')[0]}</div>
                        <h3 className="text-3xl font-bold mb-4">{optionB}</h3>
                        {phase === 'RESULTS' && (
                            <>
                                <div className="text-6xl font-black text-game-secondary">{percentB}%</div>
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {Object.entries(votes)
                                        .filter(([_, v]) => v === 'B')
                                        .map(([id]) => (
                                            <span key={id} className="text-sm bg-white/10 px-2 py-1 rounded">
                                                {players[id]?.name}
                                            </span>
                                        ))
                                    }
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {phase === 'CHOOSING' && (
                <div className="mt-12 text-2xl text-white/50">
                    {Object.keys(votes).length} / {Object.keys(players).length} voted
                </div>
            )}
        </div>
    );
};

export default ThisOrThatHost;
