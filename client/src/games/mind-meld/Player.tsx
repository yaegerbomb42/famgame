import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const MindMeldPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess } = useSound();
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const phase = gameState?.gameData?.phase || 'ANSWERING';
    const prompt = gameState?.gameData?.prompt || '';
    const timer = gameState?.gameData?.timer || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = answer.trim();
        if (trimmed.length > 0 && !submitted) {
            socket?.emit('submitMindMeldAnswer', trimmed);
            setSubmitted(true);
            playSuccess();
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'ANSWERING' && (
                    <motion.div
                        key="answering"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col p-4 space-y-6 justify-center"
                    >
                        {submitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">🧠</div>
                                <h3 className="text-5xl font-black uppercase tracking-tighter italic text-purple-500">THOUGHT LOCKED!</h3>
                                <p className="text-white/40 text-xl font-black uppercase tracking-[0.3em] animate-pulse">Scanning the family...</p>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center space-y-10">
                                <div className={`text-[10rem] font-black font-mono leading-none ${timer <= 5 ? 'text-red-500 animate-ping' : 'text-purple-500'}`}>
                                    {timer}
                                </div>

                                <div className="text-center">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-white/20">The Prompt</span>
                                    <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter drop-shadow-glow leading-tight mt-2">
                                        "{prompt}"
                                    </h3>
                                </div>

                                <form onSubmit={handleSubmit} className="w-full space-y-6">
                                    <input
                                        type="text"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="WHAT ARE YOU THINKING?"
                                        className="w-full py-8 bg-white/5 border-4 border-white/10 rounded-[2.5rem] text-center text-3xl font-black focus:outline-none focus:border-purple-500 transition-all uppercase placeholder:text-white/5"
                                        autoFocus
                                        autoComplete="off"
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        className="w-full py-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] font-black text-2xl shadow-2xl uppercase tracking-widest border-t-4 border-white/20"
                                    >
                                        SEND VIBES 🔮
                                    </motion.button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'MATCHING' && (
                    <motion.div
                        key="matching"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="text-[12rem] animate-spin">🔮</div>
                        <h3 className="text-4xl font-black text-purple-400 uppercase tracking-widest italic animate-pulse">ANALYZING BRAINWAVES...</h3>
                    </motion.div>
                )}

                {phase === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="text-[12rem] animate-pulse">🤝</div>
                        <h3 className="text-5xl font-black text-game-secondary uppercase tracking-tighter italic">MELD COMPLETE!</h3>
                        <p className="text-white/30 text-xl font-bold uppercase tracking-widest">Look at the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MindMeldPlayer;