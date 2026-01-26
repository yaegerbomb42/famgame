import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const WordRacePlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess } = useSound();
    const [input, setInput] = useState('');

    const category = gameState?.gameData?.category || '';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (trimmed.length > 2) {
            socket?.emit('submitWord', trimmed);
            setInput('');
            playSuccess();
            if (navigator.vibrate) navigator.vibrate(50);
        } else {
            playClick();
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
        >
            <header className="p-8 bg-white/5 border-b-4 border-white/10 text-center space-y-2">
                <span className="text-xs uppercase tracking-[0.4em] font-black text-white/20">Category</span>
                <h3 className="text-5xl font-black text-game-secondary italic uppercase tracking-tighter drop-shadow-glow">
                    {category}
                </h3>
            </header>

            <main className="flex-1 flex flex-col justify-center p-6 gap-8">
                <form onSubmit={submit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="TYPE FAST!"
                            className="w-full py-10 bg-white/5 border-4 border-white/10 rounded-[2.5rem] text-center text-4xl font-black focus:outline-none focus:border-game-secondary transition-all shadow-2xl uppercase placeholder:text-white/5"
                            autoFocus
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-6 -right-2 text-5xl"
                        >
                            ⌨️
                        </motion.div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full py-8 bg-game-secondary text-game-bg font-black text-3xl rounded-[2rem] shadow-[0_20px_40px_rgba(0,255,255,0.3)] border-t-4 border-white/30 uppercase tracking-widest"
                    >
                        SUBMIT! ➔
                    </motion.button>
                </form>

                <div className="text-center mt-4">
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-white/10 animate-pulse">
                        SPEED = POINTS. NO MERCY.
                    </p>
                </div>
            </main>
        </motion.div>
    );
};

export default WordRacePlayer;