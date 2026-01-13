import { useState } from 'react';
import { motion } from 'framer-motion';


interface WordRacePlayerProps {
    category: string;
    onSubmit: (word: string) => void;
}

const WordRacePlayer: React.FC<WordRacePlayerProps> = ({ category, onSubmit }) => {
    const [input, setInput] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim().length > 0) {
            onSubmit(input);
            setInput('');
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full bg-game-bg"
        >
            <div className="p-10 bg-white/5 border-b-4 border-white/10 shadow-2xl">
                <div className="text-center text-2xl uppercase tracking-[0.5em] font-black text-white/30 mb-2">Category</div>
                <div className="text-center text-7xl font-black text-game-secondary drop-shadow-[0_0_30px_rgba(0,255,255,0.4)] uppercase tracking-tighter leading-tight">{category}</div>
            </div>

            <form onSubmit={submit} className="flex-1 flex flex-col justify-center p-12 gap-10 max-w-4xl mx-auto w-full">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="TYPE FAST! ⌨️"
                    className="w-full p-12 bg-white/5 border-4 border-white/10 rounded-[3.5rem] text-center text-5xl font-black focus:outline-none focus:border-game-secondary transition-all shadow-2xl uppercase placeholder:text-white/5"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                />
                <button
                    type="submit"
                    className="w-full py-12 bg-game-secondary text-[#0a0518] font-black text-5xl rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,255,255,0.4)] active:scale-90 transition-all uppercase tracking-widest border-t-8 border-white/30"
                >
                    SEND IT! 🚀
                </button>
            </form>

            <div className="p-10 text-center">
                <div className="text-3xl font-black uppercase tracking-widest text-white/20 animate-pulse">
                    SPEED IS LIFE. GO GO GO!
                </div>
            </div>
        </motion.div>
    );
};

export default WordRacePlayer;
