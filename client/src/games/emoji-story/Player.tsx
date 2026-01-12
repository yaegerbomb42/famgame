interface EmojiStoryPlayerProps {
    phase: 'INPUT' | 'GUESSING' | 'REVEAL';
    prompt?: string;
    isMyStory?: boolean;
    currentEmojis?: string;
    onSubmitStory: (emojis: string) => void;
    onSubmitGuess: (guess: string) => void;
}

import { useState } from 'react';

const EMOJI_OPTIONS = ['😀', '😢', '😱', '🤔', '❤️', '💔', '🎉', '🔥', '💀', '👻', '🌟', '🌈', '🏠', '🚗', '✈️', '🎸', '📱', '💰', '🎁', '🍕', '🐕', '🐈', '🌳', '⛈️', '☀️', '🌙', '💪', '🏃', '💤', '🎮'];

const EmojiStoryPlayer = ({ phase, prompt, isMyStory, currentEmojis, onSubmitStory, onSubmitGuess }: EmojiStoryPlayerProps) => {
    const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
    const [guess, setGuess] = useState('');

    const addEmoji = (emoji: string) => {
        if (selectedEmojis.length < 5) {
            setSelectedEmojis([...selectedEmojis, emoji]);
        }
    };

    const removeLastEmoji = () => {
        setSelectedEmojis(selectedEmojis.slice(0, -1));
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            {phase === 'INPUT' && (
                <div className="w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-2">Create an Emoji Story!</h2>
                    <p className="text-white/50 mb-4">Theme: {prompt || 'Your Day'}</p>

                    <div className="glass-card p-4 rounded-xl mb-4 min-h-[80px] flex items-center justify-center">
                        <span className="text-5xl tracking-wider">{selectedEmojis.join('') || '...'}</span>
                    </div>

                    <div className="grid grid-cols-6 gap-2 mb-4">
                        {EMOJI_OPTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
                                className="text-3xl p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={removeLastEmoji}
                            className="flex-1 py-3 bg-white/10 rounded-xl font-bold"
                        >
                            ⌫ Undo
                        </button>
                        <button
                            onClick={() => onSubmitStory(selectedEmojis.join(''))}
                            disabled={selectedEmojis.length === 0}
                            className="flex-1 py-3 bg-game-primary rounded-xl font-bold disabled:opacity-50"
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}

            {phase === 'GUESSING' && !isMyStory && (
                <div className="w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-4">What does this mean?</h2>
                    <div className="text-5xl mb-6">{currentEmojis}</div>

                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Type your guess..."
                        className="w-full p-4 bg-white/10 rounded-xl text-lg mb-4"
                    />

                    <button
                        onClick={() => onSubmitGuess(guess)}
                        disabled={!guess.trim()}
                        className="w-full py-4 bg-game-secondary rounded-xl font-bold text-lg disabled:opacity-50"
                    >
                        Submit Guess
                    </button>
                </div>
            )}

            {phase === 'GUESSING' && isMyStory && (
                <div className="text-center">
                    <div className="text-6xl mb-4">🤫</div>
                    <p className="text-xl text-white/50">This is your story! Wait for others to guess...</p>
                </div>
            )}

            {phase === 'REVEAL' && (
                <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-xl">See the TV for results!</p>
                </div>
            )}
        </div>
    );
};

export default EmojiStoryPlayer;
