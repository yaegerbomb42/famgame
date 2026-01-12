// Emoji Story - Players create stories using only emojis, others guess what it means
interface EmojiStoryHostProps {
    phase: 'INPUT' | 'GUESSING' | 'REVEAL';
    currentStory?: { playerId: string; emojis: string };
    inputs: Record<string, string>;
    guesses: Record<string, string>;
    players: Record<string, { id: string; name: string }>;
    correctAnswer?: string;
}

const EmojiStoryHost = ({ phase, currentStory, inputs, guesses, players, correctAnswer }: EmojiStoryHostProps) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            {phase === 'INPUT' && (
                <div className="text-center">
                    <h2 className="text-5xl font-display mb-4 gradient-text-primary">Create Your Story</h2>
                    <p className="text-xl text-white/50 mb-8">Players are writing emoji stories...</p>
                    <div className="text-8xl mb-8">📖✍️🎭</div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {Object.entries(inputs).map(([id]) => (
                            <div key={id} className="glass-card px-6 py-3 rounded-xl">
                                <span className="text-green-400">✓</span> {players[id]?.name || 'Player'} submitted
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {phase === 'GUESSING' && currentStory && (
                <div className="text-center">
                    <h2 className="text-4xl font-display mb-8 text-game-secondary">What Does This Story Mean?</h2>
                    <div className="text-[8rem] mb-8 tracking-widest">{currentStory.emojis}</div>
                    <p className="text-xl text-white/50">Players are guessing...</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        {Object.keys(guesses).map((id) => (
                            <div key={id} className="glass-card px-4 py-2 rounded-lg text-green-400">
                                ✓ {players[id]?.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {phase === 'REVEAL' && (
                <div className="text-center">
                    <h2 className="text-4xl font-display mb-4 text-game-accent">The Answer Was...</h2>
                    <div className="text-6xl font-bold mb-8 text-white">{correctAnswer}</div>
                </div>
            )}
        </div>
    );
};

export default EmojiStoryHost;
