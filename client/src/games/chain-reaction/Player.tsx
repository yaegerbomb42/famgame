import { useState } from 'react';

interface ChainReactionPlayerProps {
    phase: 'WAITING' | 'ACTIVE' | 'RESULTS';
    isMyTurn: boolean;
    lastWord: string;
    timer: number;
    onSubmitWord: (word: string) => void;
}

const ChainReactionPlayer = ({ phase, isMyTurn, lastWord, timer, onSubmitWord }: ChainReactionPlayerProps) => {
    const [word, setWord] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (word.trim() && !submitted) {
            setSubmitted(true);
            onSubmitWord(word.trim());
            setWord('');
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            {phase === 'WAITING' && (
                <div className="text-center">
                    <div className="text-6xl mb-4">⛓️</div>
                    <h2 className="text-2xl font-bold">Chain Reaction</h2>
                    <p className="text-white/50 mt-2">Get ready!</p>
                </div>
            )}

            {phase === 'ACTIVE' && isMyTurn && (
                <div className="w-full max-w-sm text-center">
                    <div className={`text-6xl font-black mb-4 ${timer <= 3 ? 'text-red-500 animate-pulse' : ''}`}>
                        {timer}
                    </div>

                    <p className="text-xl text-white/50 mb-2">Connect to:</p>
                    <div className="text-4xl font-bold mb-6 text-game-secondary">{lastWord}</div>

                    <input
                        type="text"
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Type a connected word..."
                        className="w-full p-4 text-xl bg-white/10 rounded-xl mb-4 text-center"
                        autoFocus
                        autoComplete="off"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!word.trim()}
                        className="w-full py-4 bg-game-primary rounded-xl font-bold text-xl disabled:opacity-50"
                    >
                        SUBMIT! ⚡
                    </button>
                </div>
            )}

            {phase === 'ACTIVE' && !isMyTurn && (
                <div className="text-center">
                    <div className="text-6xl mb-4">👀</div>
                    <p className="text-xl text-white/50">Watch the chain grow...</p>
                    <p className="text-lg text-white/30 mt-2">Wait for your turn!</p>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center">
                    <div className="text-6xl mb-4">💥</div>
                    <p className="text-xl">Chain broken! Check the TV!</p>
                </div>
            )}
        </div>
    );
};

export default ChainReactionPlayer;
