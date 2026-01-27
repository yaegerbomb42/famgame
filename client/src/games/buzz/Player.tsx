import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';
import { useState, useEffect } from 'react';

const BuzzPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playBuzz, playError } = useSound();
    const [isBanned, setIsBanned] = useState(false);

    useEffect(() => {
        const handleFalseStart = () => {
            setIsBanned(true);
            playError();
            if (navigator.vibrate) navigator.vibrate(200);
            setTimeout(() => setIsBanned(false), 2000);
        };
        socket?.on('falseStart', handleFalseStart);
        return () => { socket?.off('falseStart', handleFalseStart); };
    }, [socket, playError]);

    const handleBuzz = () => {
        if (isBanned) return;
        socket?.emit('buzz');
        playBuzz();
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    };

    const phase = gameState?.gameData?.phase || 'WAITING';
    const isWinner = gameState?.gameData?.winnerId === socket?.id;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            <AnimatePresence mode="wait">
                {isBanned && (
                    <motion.div
                        key="banned"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="text-[12rem] animate-shake">🚫</div>
                        <h2 className="text-5xl font-black text-red-500 uppercase tracking-tighter">TOO EARLY!</h2>
                        <p className="text-white/40 text-xl font-black uppercase tracking-widest">2s Penalty</p>
                    </motion.div>
                )}

                {!isBanned && phase === 'WAITING' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center space-y-12"
                    >
                        <div className="text-[10rem] animate-pulse">🧤</div>
                        <p className="text-2xl font-black uppercase tracking-[0.3em] text-white/20">Get Ready...</p>
                        <button 
                            onClick={handleBuzz}
                            className="w-48 h-48 rounded-full border-8 border-white/5 bg-white/5 active:bg-red-500/20 active:border-red-500/40 transition-all"
                        />
                    </motion.div>
                )}

                {!isBanned && phase === 'ACTIVE' && (
                    <motion.button
                        key="active"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBuzz}
                        className="w-[22rem] h-[22rem] rounded-full bg-red-600 border-[1rem] border-red-900 shadow-[0_0_80px_rgba(220,38,38,0.6)] flex items-center justify-center relative overflow-hidden active:bg-red-500 transition-all border-t-[1.5rem] border-white/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/20" />
                        <span className="text-7xl font-black text-white drop-shadow-2xl tracking-tighter uppercase relative z-10">
                            BUZZ!
                        </span>
                    </motion.button>
                )}

                {phase === 'BUZZED' && (
                    <motion.div
                        key="buzzed"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-center space-y-8"
                    >
                        <div className="text-[12rem]">{isWinner ? '🏆' : '💨'}</div>
                        <h2 className={`text-6xl font-black uppercase tracking-tighter ${isWinner ? 'text-game-secondary' : 'text-white/40'}`}>
                            {isWinner ? 'YOU GOT IT!' : 'TOO SLOW!'}
                        </h2>
                        {isWinner && <p className="text-white/40 text-2xl font-bold uppercase">+500 PTS</p>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BuzzPlayer;