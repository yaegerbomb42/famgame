import { useState } from 'react';
import { motion } from 'framer-motion';

interface ThisOrThatPlayerProps {
    phase: 'CHOOSING' | 'RESULTS';
    optionA: string;
    optionB: string;
    onVote: (choice: 'A' | 'B') => void;
}

const ThisOrThatPlayer = ({ phase, optionA, optionB, onVote }: ThisOrThatPlayerProps) => {
    const [voted, setVoted] = useState(false);

    const handleVote = (choice: 'A' | 'B') => {
        if (!voted) {
            setVoted(true);
            onVote(choice);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto">
            {phase === 'CHOOSING' && !voted && (
                <div className="w-full space-y-12">
                    <h2 className="text-5xl font-black text-center uppercase tracking-[0.2em] gradient-text-primary">Pick One!</h2>

                    <div className="flex flex-col gap-8">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVote('A')}
                            className="w-full py-16 px-10 glass-card rounded-[3.5rem] text-center border-4 border-white/5 hover:border-game-primary hover:bg-game-primary/10 transition-all hover:shadow-[0_0_60px_rgba(255,0,255,0.3)]"
                        >
                            <span className="text-8xl block mb-6 drop-shadow-2xl">{optionA.split(' ')[0]}</span>
                            <span className="text-4xl font-black uppercase tracking-widest leading-tight">{optionA}</span>
                        </motion.button>

                        <div className="text-center text-white/30 font-black text-3xl tracking-[1em]">OR</div>

                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleVote('B')}
                            className="w-full py-16 px-10 glass-card rounded-[3.5rem] text-center border-4 border-white/5 hover:border-game-secondary hover:bg-game-secondary/10 transition-all hover:shadow-[0_0_60px_rgba(0,255,255,0.3)]"
                        >
                            <span className="text-8xl block mb-6 drop-shadow-2xl">{optionB.split(' ')[0]}</span>
                            <span className="text-4xl font-black uppercase tracking-widest leading-tight">{optionB}</span>
                        </motion.button>
                    </div>
                </div>
            )}

            {(phase === 'CHOOSING' && voted) && (
                <div className="text-center space-y-8">
                    <div className="text-huge animate-bounce">🎯</div>
                    <div className="text-5xl font-black gradient-text-secondary uppercase">VOTE LOCKED IN!</div>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center space-y-8">
                    <div className="text-huge">👀</div>
                    <p className="text-4xl font-black uppercase tracking-widest text-white/40">Check the TV for the verdict!</p>
                </div>
            )}
        </div>
    );
};

export default ThisOrThatPlayer;
