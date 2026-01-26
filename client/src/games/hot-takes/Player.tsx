import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const HotTakesPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();
    
    const [take, setTake] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [voted, setVoted] = useState(false);

    const phase = gameState?.gameData?.phase || 'INPUT';
    const prompt = gameState?.gameData?.prompt || '';
    const inputs = gameState?.gameData?.inputs || {};
    const myId = socket?.id || '';

    const handleSubmit = () => {
        if (!take.trim()) {
            playError();
            return;
        }
        socket?.emit('submitTake', take);
        setSubmitted(true);
        playSuccess();
    };

    const handleVote = (pid: string) => {
        if (voted) return;
        socket?.emit('voteTake', pid);
        setVoted(true);
        playClick();
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
                        className="flex-1 flex flex-col p-4 space-y-6"
                    >
                        {submitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">🔥</div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic">TAKE SERVED!</h3>
                                <p className="text-white/40 text-xl font-black uppercase tracking-[0.3em] animate-pulse">Wait for the fire...</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center space-y-2">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-game-primary">Hot Topic</span>
                                    <h3 className="text-3xl font-black leading-tight tracking-tight italic">"{prompt}"</h3>
                                </div>

                                <textarea
                                    value={take}
                                    onChange={(e) => setTake(e.target.value)}
                                    placeholder="DROP THE TRUTH..."
                                    className="w-full flex-1 bg-white/5 border-4 border-white/10 rounded-[2.5rem] p-8 text-3xl font-black focus:outline-none focus:border-game-primary resize-none placeholder:text-white/5 uppercase"
                                    maxLength={100}
                                    autoFocus
                                />

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmit}
                                    disabled={!take.trim()}
                                    className="w-full py-8 bg-game-primary rounded-[2rem] font-black text-3xl shadow-2xl disabled:opacity-20 transition-all uppercase tracking-widest border-t-4 border-white/20"
                                >
                                    SHIP IT! 🚀
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                )}

                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col p-4 overflow-hidden"
                    >
                        {voted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-pulse">🗳️</div>
                                <h3 className="text-5xl font-black text-game-secondary uppercase tracking-tighter">VOTE CAST!</h3>
                                <p className="text-white/40 text-xl font-bold uppercase tracking-widest">Which take was the hottest?</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-center text-2xl font-black mb-6 text-white/40 uppercase tracking-[0.2em]">Pick the spicyest take</h3>
                                <div className="space-y-4 overflow-y-auto pb-10 custom-scrollbar pr-2">
                                    {Object.entries(inputs).map(([pid, text]: [string, any]) => {
                                        if (pid === myId) return null;
                                        return (
                                            <motion.button
                                                key={pid}
                                                whileHover={{ scale: 0.98 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleVote(pid)}
                                                className="w-full p-8 bg-white/5 rounded-[2rem] border-4 border-white/10 text-left font-black text-2xl hover:border-game-primary hover:bg-game-primary/10 transition-all active:scale-95"
                                            >
                                                <span className="block leading-tight uppercase italic">"{text}"</span>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {phase === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="text-[10rem] animate-bounce">🎖️</div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter text-game-accent">RESULTS ARE IN!</h3>
                        <p className="text-white/30 text-xl font-bold uppercase tracking-widest">Look at the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HotTakesPlayer;