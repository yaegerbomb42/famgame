import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const EMOJI_OPTIONS = ['😀', '😢', '😱', '🤔', '❤️', '💔', '🎉', '🔥', '💀', '👻', '🌟', '🌈', '🏠', '🚗', '✈️', '🎸', '📱', '💰', '🎁', '🍕', '🐕', '🐈', '🌳', '⛈️', '☀️', '🌙', '💪', '🏃', '💤', '🎮'];

const EmojiStoryPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();
    
    const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
    const [guess, setGuess] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const phase = gameState?.gameData?.phase || 'INPUT';
    const prompt = gameState?.gameData?.prompt || '';
    const currentEmojis = gameState?.gameData?.currentStory?.emojis || '';
    const isMyStory = socket?.id === gameState?.gameData?.currentStory?.playerId;

    const addEmoji = (emoji: string) => {
        if (selectedEmojis.length < 5) {
            setSelectedEmojis([...selectedEmojis, emoji]);
            playClick();
        } else {
            playError();
        }
    };

    const removeLastEmoji = () => {
        setSelectedEmojis(selectedEmojis.slice(0, -1));
        playClick();
    };

    const handleSubmitStory = () => {
        if (selectedEmojis.length === 0) return;
        socket?.emit('emojiInput', selectedEmojis.join(''));
        setSubmitted(true);
        playSuccess();
    };

    const handleSubmitGuess = () => {
        if (!guess.trim()) return;
        socket?.emit('submitGuess', guess);
        setSubmitted(true);
        playSuccess();
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'INPUT' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar"
                    >
                        {submitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">✍️</div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic text-game-primary">STORY TOLD!</h3>
                                <p className="text-white/40 text-xl font-black uppercase tracking-[0.3em] animate-pulse">Wait for the reveal...</p>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-10">
                                <div className="text-center space-y-2">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-game-primary">Your Topic</span>
                                    <h3 className="text-3xl font-black tracking-tight italic uppercase">"{prompt}"</h3>
                                </div>

                                <div className="bg-white/5 p-10 rounded-[3rem] border-4 border-white/10 flex items-center justify-center min-h-[120px] shadow-2xl">
                                    <span className="text-7xl tracking-[0.2em] drop-shadow-2xl">{selectedEmojis.join('') || '...'}</span>
                                </div>

                                <div className="grid grid-cols-5 gap-3 bg-white/5 p-4 rounded-[2.5rem] border-2 border-white/10">
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => addEmoji(emoji)}
                                            className="text-4xl p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={removeLastEmoji}
                                        className="flex-1 py-6 bg-white/5 border-2 border-white/10 rounded-[2rem] font-black text-lg uppercase tracking-widest"
                                    >
                                        ⌫ Back
                                    </button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubmitStory}
                                        disabled={selectedEmojis.length === 0}
                                        className="flex-[2] py-6 bg-game-primary rounded-[2rem] font-black text-xl shadow-xl disabled:opacity-20 uppercase tracking-widest border-t-4 border-white/20"
                                    >
                                        POST STORY ➔
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'GUESSING' && (
                    <motion.div
                        key="guessing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col p-4 space-y-8"
                    >
                        {isMyStory ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-pulse">🤐</div>
                                <h3 className="text-5xl font-black text-game-secondary uppercase tracking-tighter italic">DON'T SPEAK!</h3>
                                <p className="text-white/40 text-xl font-bold uppercase tracking-widest">They are decoding your tale...</p>
                            </div>
                        ) : submitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">🤔</div>
                                <h3 className="text-5xl font-black text-game-secondary uppercase tracking-tighter">GUESS SENT!</h3>
                                <p className="text-white/40 text-xl font-bold uppercase tracking-widest">Was it correct?</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col justify-center gap-10">
                                <div className="text-center">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-white/20">The Story</span>
                                    <div className="text-[7rem] tracking-widest drop-shadow-glow my-4">{currentEmojis}</div>
                                </div>

                                <div className="space-y-6">
                                    <input
                                        type="text"
                                        value={guess}
                                        onChange={(e) => setGuess(e.target.value)}
                                        placeholder="WHAT'S THE MEANING?"
                                        className="w-full py-8 bg-white/5 border-4 border-white/10 rounded-[2.5rem] text-center text-2xl font-black focus:outline-none focus:border-game-secondary transition-all uppercase placeholder:text-white/5"
                                        autoFocus
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubmitGuess}
                                        disabled={!guess.trim()}
                                        className="w-full py-8 bg-game-secondary text-game-bg rounded-[2rem] font-black text-2xl shadow-2xl uppercase tracking-widest border-t-4 border-white/20"
                                    >
                                        SEND GUESS ➔
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="text-[12rem] animate-pulse">📖</div>
                        <h3 className="text-5xl font-black text-game-accent uppercase tracking-tighter italic">STORY REVEALED!</h3>
                        <p className="text-white/30 text-xl font-bold uppercase tracking-widest">Look at the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmojiStoryPlayer;