import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const ReactionPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playError } = useSound();

    const phase = gameState?.gameData?.phase || 'WAITING';
    const result = gameState?.gameData?.results?.[socket?.id || ''];

    const handleTap = () => {
        if (phase === 'WAITING') {
            playError();
            if (navigator.vibrate) navigator.vibrate(200);
            return;
        }
        if (phase === 'GO' && !result) {
            socket?.emit('reactionClick');
            playSuccess();
            if (navigator.vibrate) navigator.vibrate([50, 50]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleTap}
            className={`fixed inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors duration-75 ${
                phase === 'GO' ? 'bg-green-600' : 'bg-red-950'
            }`}
        >
            <AnimatePresence mode="wait">
                {result ? (
                    <motion.div
                        key="result"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-8"
                    >
                        <div className="text-[12rem] animate-bounce">⚡</div>
                        <h2 className="text-7xl font-black text-white uppercase tracking-tighter italic">
                            {result}ms
                        </h2>
                        <p className="text-white/40 text-2xl font-black uppercase tracking-widest">Check the Leaderboard</p>
                    </motion.div>
                ) : phase === 'WAITING' ? (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-12"
                    >
                        <div className="text-[12rem] animate-pulse">🛑</div>
                        <h3 className="text-5xl font-black uppercase tracking-widest text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                            WAIT FOR GREEN
                        </h3>
                    </motion.div>
                ) : (
                    <motion.div
                        key="go"
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-8"
                    >
                        <div className="text-[15rem] animate-ping absolute inset-0 flex items-center justify-center opacity-20">🟢</div>
                        <div className="relative z-10 text-[12rem] font-black uppercase tracking-tighter text-white drop-shadow-[0_10px_50px_rgba(0,0,0,0.5)] leading-none italic">
                            TAP!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ReactionPlayer;