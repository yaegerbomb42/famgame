import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const ChainReactionPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playError } = useSound();
    const [word, setWord] = useState('');

    const phase = gameState?.gameData?.phase || 'WAITING';
    const isMyTurn = socket?.id === gameState?.gameData?.currentPlayerId;
    const lastWord = gameState?.gameData?.chain?.[gameState?.gameData?.chain.length - 1]?.word || '...';
    const timer = gameState?.gameData?.timer || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = word.trim();
        if (trimmed.length > 0 && isMyTurn) {
            socket?.emit('submitChainWord', trimmed);
            setWord('');
            playSuccess();
            if (navigator.vibrate) navigator.vibrate(50);
        } else {
            playError();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'WAITING' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                    >
                        <div className="text-[10rem] animate-pulse">⛓️</div>
                        <h3 className="text-4xl font-black uppercase tracking-widest text-game-primary">CHAIN REACTION</h3>
                        <p className="text-white/40 text-xl font-black uppercase tracking-[0.3em] animate-bounce">Prepare to connect!</p>
                    </motion.div>
                )}

                {phase === 'ACTIVE' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col p-4 space-y-6 justify-center"
                    >
                        {isMyTurn ? (
                            <div className="w-full flex flex-col items-center space-y-8">
                                <div className={`text-[10rem] font-black font-mono leading-none ${timer <= 2 ? 'text-red-500 animate-ping' : 'text-game-primary'}`}>
                                    {timer}
                                </div>

                                <div className="text-center">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-white/20">Connect to</span>
                                    <h3 className="text-5xl font-black text-game-secondary italic uppercase tracking-tighter drop-shadow-glow">
                                        {lastWord}
                                    </h3>
                                </div>

                                <form onSubmit={handleSubmit} className="w-full space-y-6">
                                    <input
                                        type="text"
                                        value={word}
                                        onChange={(e) => setWord(e.target.value)}
                                        placeholder="NEXT WORD..."
                                        className="w-full py-8 bg-white/5 border-4 border-white/10 rounded-[2.5rem] text-center text-4xl font-black focus:outline-none focus:border-game-primary transition-all uppercase placeholder:text-white/5"
                                        autoFocus
                                        autoComplete="off"
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        className="w-full py-8 bg-game-primary rounded-[2rem] font-black text-3xl shadow-2xl uppercase tracking-widest border-t-4 border-white/20"
                                    >
                                        CONNECT! ⚡
                                    </motion.button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 opacity-40">
                                <div className="text-[10rem] animate-spin-slow">👀</div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic">WATCH THE CHAIN</h3>
                                <p className="text-white/40 text-xl font-bold uppercase tracking-widest">Your turn is coming...</p>
                            </div>
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
                        <div className="text-[12rem] animate-shake">💥</div>
                        <h3 className="text-5xl font-black text-red-500 uppercase tracking-tighter italic">CHAIN BROKEN!</h3>
                        <p className="text-white/30 text-xl font-bold uppercase tracking-widest">Check the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChainReactionPlayer;