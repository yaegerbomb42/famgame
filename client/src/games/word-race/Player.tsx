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
        <div className="flex flex-col h-full bg-game-bg">
            <div className="p-4 bg-game-secondary/20 border-b border-game-secondary/20">
                <div className="text-center text-xs uppercase tracking-widest mb-1">Category</div>
                <div className="text-center text-2xl font-black text-game-secondary">{category}</div>
            </div>

            <form onSubmit={submit} className="flex-1 flex flex-col justify-center p-6 gap-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type here..."
                    className="w-full h-20 bg-white/10 rounded-2xl text-center text-3xl font-bold focus:outline-none focus:border-2 focus:border-game-secondary"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                />
                <button
                    type="submit"
                    className="w-full py-6 bg-game-secondary text-black font-black text-2xl rounded-2xl active:scale-95 transition-transform"
                >
                    SEND
                </button>
            </form>

            <div className="p-4 text-center text-white/30 text-sm">
                Speed is key. Short words allowed.
            </div>
        </div>
    );
};

export default WordRacePlayer;
