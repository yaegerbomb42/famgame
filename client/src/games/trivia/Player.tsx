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
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                <div className="text-8xl animate-bounce">👍</div>
                <h2 className="text-4xl font-black gradient-text-primary text-center">ANSWER SUBMITTED!</h2>
                <p className="text-white/40 text-xl tracking-[0.2em] uppercase">Check the big screen</p>
            </div>
        )
    }

    return (
        <div className="flex-1 grid grid-cols-2 gap-6 p-6">
            {colors.map((color, i) => (
                <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSelect(i)}
                    className={`${color} rounded-[2.5rem] flex items-center justify-center text-8xl font-black text-white shadow-[0_15px_40px_rgba(0,0,0,0.3)] border-4 border-white/10 active:border-white/50 transition-all`}
                >
                    {labels[i]}
                </motion.button>
            ))}
        </div>
    );
};

export default TriviaPlayer;
