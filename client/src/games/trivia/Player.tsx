import { useState } from 'react';
import { motion } from 'framer-motion';

interface TriviaPlayerProps {
    onAnswer: (index: number) => void;
    hasAnswered: boolean;
}

const TriviaPlayer: React.FC<TriviaPlayerProps> = ({ onAnswer, hasAnswered }) => {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const colors = ['bg-[#ff0055]', 'bg-[#0055ff]', 'bg-[#00ff55]', 'bg-[#ffaa00]'];
    const labels = ['A', 'B', 'C', 'D'];

    const handleSelect = (i: number) => {
        if (hasAnswered || selectedIdx !== null) return;
        setSelectedIdx(i);
        onAnswer(i);
    }

    if (hasAnswered || selectedIdx !== null) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 w-full max-w-4xl mx-auto"
            >
                <div className="text-[12rem] animate-bounce drop-shadow-huge">👍</div>
                <h2 className="text-6xl font-black gradient-text-primary text-center uppercase tracking-widest shadow-glow">ANSWER SUBMITTED!</h2>
                <p className="text-white/40 text-3xl tracking-[0.4em] uppercase font-black animate-pulse">Witness the big screen</p>
            </motion.div>
        )
    }

    return (
        <div className="flex-1 grid grid-cols-2 gap-8 p-10 w-full max-w-5xl mx-auto">
            {colors.map((color, i) => (
                <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleSelect(i)}
                    className={`${color} rounded-[3.5rem] flex items-center justify-center text-[10rem] font-black text-white shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-t-8 border-white/30 active:border-white/50 transition-all uppercase`}
                >
                    {labels[i]}
                </motion.button>
            ))}
        </div>
    );
};

export default TriviaPlayer;
