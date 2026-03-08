import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const ThisOrThatPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess } = useSound();
    const [votedId, setVotedId] = useState<'A' | 'B' | null>(null);

    const phase = gameState?.gameData?.phase || 'CHOOSING';
    const optionA = gameState?.gameData?.optionA || '';
    const optionB = gameState?.gameData?.optionB || '';

    const handleVote = (choice: 'A' | 'B') => {
        if (votedId) return;
        socket?.emit('voteOption', choice);
        setVotedId(choice);
        playClick();
        playSuccess();
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'CHOOSING' && (
                    <motion.div
                        key="choosing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col p-4 space-y-6 justify-center"
                    >
                        {votedId ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">⚖️</div>
                                <h3 className="text-5xl font-black uppercase tracking-tighter italic text-game-primary">VOTE CAST!</h3>
                                <div className="p-10 bg-white/5 rounded-[3rem] border-4 border-white/10 flex flex-col items-center gap-4">
                                    <span className="text-8xl">{(votedId === 'A' ? optionA : optionB).split(' ')[0]}</span>
                                    <span className="text-2xl font-black uppercase">{(votedId === 'A' ? optionA : optionB)}</span>
                                </div>
                                <p className="text-white/40 text-xl font-black uppercase tracking-[0.3em] animate-pulse">Wait for the reveal...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 w-full">
                                <h2 className="text-5xl font-black text-center mb-8 uppercase tracking-tighter italic">This or That?</h2>
                                
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVote('A')}
                                    className="w-full py-10 bg-white/5 border-4 border-white/10 rounded-[3rem] flex flex-col items-center gap-4 hover:border-game-primary hover:bg-game-primary/10 transition-all active:scale-95"
                                >
                                    <span className="text-8xl">{optionA.split(' ')[0]}</span>
                                    <span className="text-3xl font-black uppercase italic">{optionA}</span>
                                </motion.button>

                                <div className="text-center font-black text-2xl text-white/10 tracking-[1em]">VS</div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVote('B')}
                                    className="w-full py-10 bg-white/5 border-4 border-white/10 rounded-[3rem] flex flex-col items-center gap-4 hover:border-game-secondary hover:bg-game-secondary/10 transition-all active:scale-95"
                                >
                                    <span className="text-8xl">{optionB.split(' ')[0]}</span>
                                    <span className="text-3xl font-black uppercase italic">{optionB}</span>
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="text-[12rem] animate-pulse">⚖️</div>
                        <h3 className="text-5xl font-black text-game-accent uppercase tracking-tighter italic">DECISION TIME!</h3>
                        <p className="text-white/30 text-xl font-bold uppercase tracking-widest">Look at the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThisOrThatPlayer;