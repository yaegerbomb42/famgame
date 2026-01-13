import { useState } from 'react';
import { motion } from 'framer-motion';

interface MindMeldPlayerProps {
    phase: 'PROMPT' | 'ANSWERING' | 'MATCHING' | 'RESULTS';
    prompt: string;
    timer: number;
    onSubmitAnswer: (answer: string) => void;
}

const MindMeldPlayer = ({ phase, prompt, timer, onSubmitAnswer }: MindMeldPlayerProps) => {
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (answer.trim() && !submitted) {
            setSubmitted(true);
            onSubmitAnswer(answer.trim());
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto"
        >
            {phase === 'PROMPT' && (
                <div className="text-center space-y-8">
                    <div className="text-huge animate-pulse shadow-glow">🧠💫</div>
                    <h2 className="text-5xl font-black uppercase tracking-widest gradient-text-primary">Mind Meld</h2>
                    <p className="text-2xl font-black text-white/40 uppercase tracking-[0.3em] animate-bounce">Think alike to win!</p>
                </div>
            )}

            {phase === 'ANSWERING' && !submitted && (
                <div className="w-full text-center space-y-10">
                    <div className={`text-[10rem] leading-none font-black my-8 ${timer <= 5 ? 'text-red-500 animate-pulse' : 'text-game-secondary'}`}>
                        {timer}
                    </div>

                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight drop-shadow-2xl">{prompt}</h2>

                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="YOUR THOUGHTS..."
                        className="w-full p-10 bg-white/5 border-4 border-white/10 rounded-[3rem] text-5xl font-black uppercase text-center focus:outline-none focus:border-game-primary transition-all placeholder:text-white/5 shadow-2xl"
                        autoFocus
                        autoComplete="off"
                    />

                    <button
                        onClick={handleSubmit}
                        disabled={!answer.trim()}
                        className="w-full py-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[3.5rem] font-black text-4xl shadow-[0_20px_50px_rgba(236,72,153,0.4)] disabled:opacity-20 transition-all uppercase tracking-widest border-t-8 border-white/20 active:scale-95"
                    >
                        LOCK IN 🔮
                    </button>

                    <p className="text-2xl font-black text-white/30 uppercase tracking-widest mt-8">Think like the fam!</p>
                </div>
            )}

            {phase === 'ANSWERING' && submitted && (
                <div className="text-center space-y-8">
                    <div className="text-huge animate-bounce">⚡</div>
                    <p className="text-5xl font-black gradient-text-secondary uppercase">MELD LOCKED!</p>
                    <p className="text-2xl font-black text-white/40 uppercase tracking-[0.2em]">Waiting for other minds...</p>
                </div>
            )}

            {phase === 'MATCHING' && (
                <div className="text-center space-y-8">
                    <div className="text-huge animate-spin">🔮</div>
                    <p className="text-4xl font-black uppercase tracking-widest text-white/40 animate-pulse">Scanning brainwaves...</p>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center space-y-8">
                    <div className="text-huge animate-pulse">✨</div>
                    <p className="text-4xl font-black uppercase tracking-widest text-white/40">Check the TV matches!</p>
                </div>
            )}
        </motion.div>
    );
};

export default MindMeldPlayer;
