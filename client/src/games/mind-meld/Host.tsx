// Mind Meld - Players answer the same prompt, points for similar answers
// Uses Gemini API for semantic similarity checking
interface MindMeldHostProps {
    phase: 'PROMPT' | 'ANSWERING' | 'MATCHING' | 'RESULTS';
    prompt: string;
    answers: Record<string, string>;
    matches: { player1Id: string; player2Id: string; similarity: number }[];
    players: Record<string, { id: string; name: string; score: number }>;
    timer: number;
}

const MindMeldHost = ({ phase, prompt, answers, matches, players, timer }: MindMeldHostProps) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            {phase === 'PROMPT' && (
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        Mind Meld
                    </h2>
                    <p className="text-2xl text-white/50">Think alike to score!</p>
                    <div className="text-8xl mt-8">🧠💫</div>
                </div>
            )}

            {phase === 'ANSWERING' && (
                <div className="text-center w-full max-w-3xl">
                    <div className="text-6xl font-black mb-4">{timer}</div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">
                        {prompt}
                    </h2>
                    <p className="text-xl text-white/50 mb-8">Answer on your phone!</p>

                    <div className="flex flex-wrap justify-center gap-3">
                        {Object.entries(answers).map(([id]) => (
                            <div key={id} className="glass-card px-4 py-2 rounded-lg text-green-400">
                                ✓ {players[id]?.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {phase === 'MATCHING' && (
                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-8 text-game-secondary">🔮 Finding Matches...</h2>
                    <div className="animate-spin text-6xl">🧠</div>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="w-full max-w-4xl">
                    <h2 className="text-4xl md:text-6xl font-bold text-center mb-8 gradient-text-primary">
                        Mind Meld Results!
                    </h2>

                    {/* Show all answers */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {Object.entries(answers).map(([id, answer]) => (
                            <div key={id} className="glass-card p-4 rounded-xl text-center">
                                <div className="text-xl font-bold mb-2">{players[id]?.name}</div>
                                <div className="text-2xl text-game-secondary">"{answer}"</div>
                            </div>
                        ))}
                    </div>

                    {/* Show matches */}
                    {matches.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-center text-green-400">🎉 Matches Found!</h3>
                            {matches.map((match, i) => (
                                <div key={i} className="glass-card p-6 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-bold">{players[match.player1Id]?.name}</span>
                                        <span className="text-3xl">🤝</span>
                                        <span className="text-xl font-bold">{players[match.player2Id]?.name}</span>
                                    </div>
                                    <div className="text-3xl font-black text-green-400">
                                        +{Math.round(match.similarity * 100)} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {matches.length === 0 && (
                        <div className="text-center text-2xl text-white/50">
                            No matches this round! Think more alike! 🤔
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MindMeldHost;
