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
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto">
            {phase === 'INPUT' && (
                <div className="w-full text-center space-y-8">
                    <h2 className="text-5xl font-black uppercase tracking-widest gradient-text-primary">Create Your Story!</h2>
                    <p className="text-2xl font-black text-white/40 uppercase tracking-[0.3em]">Theme: {prompt || 'Your Day'}</p>

                    <div className="glass-card p-10 rounded-[3rem] min-h-[120px] flex items-center justify-center border-4 border-white/10 shadow-[0_0_50px_rgba(255,0,255,0.2)]">
                        <span className="text-huge tracking-widest drop-shadow-2xl">{selectedEmojis.join('') || '...'}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-4 mb-8">
                        {EMOJI_OPTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => addEmoji(emoji)}
                                className="text-6xl p-4 hover:bg-white/10 rounded-2xl transition-all transform hover:scale-110 active:scale-90"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-6">
                        <button
                            onClick={removeLastEmoji}
                            className="flex-1 py-10 bg-white/5 border-4 border-white/10 rounded-[2.5rem] font-black text-3xl uppercase tracking-widest"
                        >
                            ⌫ Undo
                        </button>
                        <button
                            onClick={() => onSubmitStory(selectedEmojis.join(''))}
                            disabled={selectedEmojis.length === 0}
                            className="flex-1 py-10 bg-game-primary rounded-[2.5rem] font-black text-3xl shadow-[0_20px_50px_rgba(255,0,255,0.4)] disabled:opacity-20 uppercase tracking-widest"
                        >
                            Submit 🚀
                        </button>
                    </div>
                </div>
            )}

            {phase === 'GUESSING' && !isMyStory && (
                <div className="w-full text-center space-y-10">
                    <h2 className="text-5xl font-black uppercase tracking-widest gradient-text-secondary">Decode This!</h2>
                    <div className="text-[10rem] drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] my-12 animate-pulse">{currentEmojis}</div>

                    <input
                        type="text"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="TYPE YOUR GUESS..."
                        className="w-full p-10 bg-white/5 border-4 border-white/10 rounded-[3rem] text-4xl font-black uppercase text-center focus:outline-none focus:border-game-secondary transition-all placeholder:text-white/10 shadow-2xl"
                    />

                    <button
                        onClick={() => onSubmitGuess(guess)}
                        disabled={!guess.trim()}
                        className="w-full py-12 bg-game-secondary text-[#0a0518] rounded-[3.5rem] font-black text-4xl shadow-[0_20px_50px_rgba(0,255,255,0.4)] disabled:opacity-20 uppercase tracking-widest"
                    >
                        SEND GUESS ➔
                    </button>
                </div>
            )}

            {phase === 'GUESSING' && isMyStory && (
                <div className="text-center space-y-8">
                    <div className="text-huge animate-bounce">🤫</div>
                    <div className="text-5xl font-black gradient-text-primary uppercase">MUM'S THE WORD!</div>
                    <p className="text-2xl font-black text-white/40 uppercase tracking-widest">Wait for the fam to guess...</p>
                </div>
            )}

            {phase === 'REVEAL' && (
                <div className="text-center space-y-8">
                    <div className="text-huge">🎉</div>
                    <p className="text-4xl font-black uppercase tracking-widest text-white/40">Check the TV for the reveal!</p>
                </div>
            )}
        </div>
    );
};

export default EmojiStoryPlayer;
