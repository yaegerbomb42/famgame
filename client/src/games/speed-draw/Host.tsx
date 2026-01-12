// Speed Draw - Quick drawing challenge, vote for best interpretation
interface SpeedDrawHostProps {
    phase: 'DRAWING' | 'VOTING' | 'RESULTS';
    prompt: string;
    drawings: Record<string, string>; // playerId -> dataURL
    votes: Record<string, string>; // voterId -> drawingPlayerId
    players: Record<string, { id: string; name: string }>;
    timer: number;
}

const SpeedDrawHost = ({ phase, prompt, drawings, votes, players, timer }: SpeedDrawHostProps) => {
    // Count votes per drawing
    const voteCount: Record<string, number> = {};
    Object.values(votes).forEach(votedFor => {
        voteCount[votedFor] = (voteCount[votedFor] || 0) + 1;
    });

    const winner = Object.entries(voteCount).sort((a, b) => b[1] - a[1])[0];

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            {phase === 'DRAWING' && (
                <div className="text-center">
                    <h2 className="text-4xl font-display mb-4 gradient-text-secondary">Speed Draw!</h2>
                    <div className="text-8xl font-black text-white mb-4">{timer}</div>
                    <div className="glass-card px-12 py-6 rounded-2xl mb-8">
                        <p className="text-3xl font-bold">Draw: {prompt}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {Object.entries(drawings).map(([id]) => (
                            <div key={id} className="glass-card px-4 py-2 rounded-lg text-green-400">
                                ✓ {players[id]?.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {phase === 'VOTING' && (
                <div className="w-full max-w-6xl">
                    <h2 className="text-4xl font-display mb-8 text-center gradient-text-primary">
                        Vote for the Best "{prompt}"!
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {Object.entries(drawings).map(([id, dataUrl]) => (
                            <div key={id} className="glass-card p-4 rounded-2xl">
                                <img
                                    src={dataUrl}
                                    alt={`Drawing by ${players[id]?.name}`}
                                    className="w-full aspect-square object-contain bg-white rounded-xl mb-3"
                                />
                                <div className="text-center font-bold">{players[id]?.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {phase === 'RESULTS' && winner && (
                <div className="text-center">
                    <h2 className="text-5xl font-display mb-8 text-yellow-400">🏆 Winner! 🏆</h2>
                    <div className="glass-card p-6 rounded-3xl inline-block">
                        <img
                            src={drawings[winner[0]]}
                            alt="Winning drawing"
                            className="w-64 h-64 object-contain bg-white rounded-xl mb-4"
                        />
                        <div className="text-3xl font-bold">{players[winner[0]]?.name}</div>
                        <div className="text-xl text-white/50">{winner[1]} votes</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpeedDrawHost;
