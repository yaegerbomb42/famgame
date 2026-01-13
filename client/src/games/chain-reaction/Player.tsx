import { useState } from 'react';
import { motion } from 'framer-motion';

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto"
        >
            {phase === 'WAITING' && (
                <div className="text-center space-y-8">
                    <div className="text-huge animate-pulse shadow-glow">⛓️</div>
                    <h2 className="text-5xl font-black uppercase tracking-widest gradient-text-primary">Chain Reaction</h2>
                    <p className="text-2xl font-black text-white/40 uppercase tracking-[0.3em] animate-bounce">Get ready!</p>
                </div>
            )}

            {phase === 'ACTIVE' && isMyTurn && (
                <div className="w-full text-center space-y-10">
                    <div className={`text-[12rem] leading-none font-black my-8 ${timer <= 3 ? 'text-red-500 animate-pulse' : 'text-game-primary'}`}>
                        {timer}
                    </div>

                    <div className="space-y-4">
                        <p className="text-2xl uppercase tracking-[0.5em] font-black text-white/30">Connect to:</p>
                        <div className="text-6xl font-black uppercase tracking-tighter text-game-secondary drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]">{lastWord}</div>
                    </div>

                    <input
                        type="text"
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="TYPE CONNECTED WORD..."
                        className="w-full p-10 bg-white/5 border-4 border-white/10 rounded-[3rem] text-5xl font-black uppercase text-center focus:outline-none focus:border-game-primary transition-all placeholder:text-white/5 shadow-2xl"
                        autoFocus
                        autoComplete="off"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!word.trim()}
                        className="w-full py-12 bg-game-primary rounded-[3.5rem] font-black text-4xl shadow-[0_20px_50px_rgba(255,0,255,0.4)] transition-all uppercase tracking-widest border-t-8 border-white/20 active:scale-95 disabled:opacity-20"
                    >
                        SUBMIT! ⚡
                    </button>
                </div>
            )}

            {phase === 'ACTIVE' && !isMyTurn && (
                <div className="text-center space-y-8 opacity-40">
                    <div className="text-huge animate-spin-slow">👀</div>
                    <p className="text-4xl font-black text-white uppercase tracking-widest">Watching the chain...</p>
                    <p className="text-2xl font-black text-white/40 uppercase tracking-[0.2em]">Your turn is coming!</p>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center space-y-8">
                    <div className="text-huge animate-shake">💥</div>
                    <p className="text-5xl font-black uppercase tracking-widest text-red-500">CHAIN BROKEN!</p>
                    <p className="text-3xl font-black text-white/40 uppercase">Check the TV!</p>
                </div>
            )}
        </motion.div>
    );
};

export default ChainReactionPlayer;
