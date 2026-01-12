// Compete - Real-time head-to-head challenge between two players
// Others watch on TV while two players compete on their phones
interface CompeteHostProps {
    phase: 'SELECTING' | 'COUNTDOWN' | 'ACTIVE' | 'RESULTS';
    challenger1Id: string;
    challenger2Id: string;
    challenge: { type: 'TAP' | 'TYPE' | 'SEQUENCE'; target: any };
    progress: Record<string, number>;
    players: Record<string, { id: string; name: string; score: number }>;
    winnerId?: string;
    timer: number;
}

const CompeteHost = ({ phase, challenger1Id, challenger2Id, challenge, progress, players, winnerId, timer }: CompeteHostProps) => {
    const p1 = players[challenger1Id];
    const p2 = players[challenger2Id];
    const p1Progress = progress[challenger1Id] || 0;
    const p2Progress = progress[challenger2Id] || 0;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            {phase === 'SELECTING' && (
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                        COMPETE
                    </h2>
                    <p className="text-2xl text-white/50">Head-to-head showdown!</p>
                    <div className="text-8xl mt-8">⚔️</div>
                </div>
            )}

            {phase === 'COUNTDOWN' && (
                <div className="text-center">
                    <div className="flex items-center justify-center gap-12 mb-12">
                        <div className="text-center">
                            <div className="text-6xl mb-2">👤</div>
                            <div className="text-3xl font-bold">{p1?.name}</div>
                        </div>
                        <div className="text-6xl font-black text-red-500">VS</div>
                        <div className="text-center">
                            <div className="text-6xl mb-2">👤</div>
                            <div className="text-3xl font-bold">{p2?.name}</div>
                        </div>
                    </div>
                    <div className="text-[12rem] font-black text-white animate-pulse">{timer}</div>
                </div>
            )}

            {phase === 'ACTIVE' && (
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-5xl font-bold mb-2">
                            {challenge.type === 'TAP' && '👆 TAP RACE!'}
                            {challenge.type === 'TYPE' && '⌨️ TYPE RACE!'}
                            {challenge.type === 'SEQUENCE' && '🔢 SEQUENCE RACE!'}
                        </h2>
                        {challenge.type === 'TYPE' && (
                            <p className="text-2xl text-game-secondary">Type: "{challenge.target}"</p>
                        )}
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl w-32 truncate">{p1?.name}</span>
                            <div className="flex-1 h-12 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-100"
                                    style={{ width: `${p1Progress}%` }}
                                />
                            </div>
                            <span className="text-2xl font-bold w-16">{Math.round(p1Progress)}%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl w-32 truncate">{p2?.name}</span>
                            <div className="flex-1 h-12 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-100"
                                    style={{ width: `${p2Progress}%` }}
                                />
                            </div>
                            <span className="text-2xl font-bold w-16">{Math.round(p2Progress)}%</span>
                        </div>
                    </div>
                </div>
            )}

            {phase === 'RESULTS' && winnerId && (
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 text-yellow-400">
                        🏆 WINNER! 🏆
                    </h2>
                    <div className="text-6xl mb-4">👑</div>
                    <div className="text-5xl font-black">{players[winnerId]?.name}</div>
                </div>
            )}
        </div>
    );
};

export default CompeteHost;
