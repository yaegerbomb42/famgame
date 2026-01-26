import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const CompetePlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();
    
    const [tapCount, setTapCount] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [sequenceIndex, setSequenceIndex] = useState(0);

    const phase = gameState?.gameData?.phase || 'COUNTDOWN';
    const challenge = gameState?.gameData?.challenge;
    const isCompeting = socket?.id === gameState?.gameData?.challenger1Id || socket?.id === gameState?.gameData?.challenger2Id;
    const timer = gameState?.gameData?.timer || 0;
    const amWinner = socket?.id === gameState?.gameData?.winnerId;

    const TAP_TARGET = 30;
    const sequence = challenge?.target?.sequence || [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const handleTap = useCallback(() => {
        if (challenge?.type === 'TAP' && phase === 'ACTIVE') {
            const newCount = tapCount + 1;
            setTapCount(newCount);
            socket?.emit('competeProgress', (newCount / TAP_TARGET) * 100);
            playClick();
            if (newCount >= TAP_TARGET) playSuccess();
        }
    }, [tapCount, challenge, phase, socket, playClick, playSuccess]);

    useEffect(() => {
        if (challenge?.type === 'TYPE' && phase === 'ACTIVE') {
            const target = challenge.target || '';
            const progress = target.length > 0 ? (typedText.length / target.length) * 100 : 0;
            socket?.emit('competeProgress', Math.min(progress, 100));
            if (typedText.length > 0) playClick();
            if (progress >= 100) playSuccess();
        }
    }, [typedText, challenge, phase, socket, playClick, playSuccess]);

    const handleSequenceTap = (num: number) => {
        if (challenge?.type === 'SEQUENCE' && phase === 'ACTIVE') {
            if (sequence[sequenceIndex] === num) {
                const newIndex = sequenceIndex + 1;
                setSequenceIndex(newIndex);
                socket?.emit('competeProgress', (newIndex / sequence.length) * 100);
                playClick();
                if (newIndex >= sequence.length) playSuccess();
            } else {
                playError();
                if (navigator.vibrate) navigator.vibrate(100);
            }
        }
    };

    if (!isCompeting) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8">
                <div className="text-[10rem] animate-pulse">📺</div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic">SPECTATOR MODE</h3>
                <p className="text-white/40 text-xl font-bold uppercase tracking-widest">Watch the showdown on TV!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'COUNTDOWN' && (
                    <motion.div
                        key="countdown"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
                    >
                        <div className="text-[15rem] font-black text-white animate-bounce leading-none drop-shadow-huge">{timer}</div>
                        <h2 className="text-6xl font-black text-game-accent uppercase tracking-widest italic animate-pulse">GET READY!</h2>
                    </motion.div>
                )}

                {phase === 'ACTIVE' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col p-4 space-y-6 justify-center"
                    >
                        {challenge?.type === 'TAP' && (
                            <div className="w-full flex flex-col items-center gap-10">
                                <div className="text-center">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-white/20">Task</span>
                                    <h3 className="text-4xl font-black text-game-primary italic uppercase tracking-tighter">TAP {TAP_TARGET} TIMES!</h3>
                                </div>
                                <div className="text-[8rem] font-black font-mono leading-none">{tapCount}</div>
                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    onClick={handleTap}
                                    className="w-full aspect-square max-w-[20rem] bg-gradient-to-b from-red-500 to-red-700 rounded-full border-[1.5rem] border-white/20 shadow-[0_20px_80px_rgba(239,68,68,0.5)] flex items-center justify-center text-[10rem] active:shadow-none transition-all"
                                >
                                    👆
                                </motion.button>
                            </div>
                        )}

                        {challenge?.type === 'TYPE' && (
                            <div className="w-full flex flex-col gap-8">
                                <div className="text-center">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-white/20">Type Exactly</span>
                                    <div className="mt-4 p-8 bg-white/5 rounded-[2.5rem] border-4 border-game-secondary shadow-glow">
                                        <p className="text-3xl font-black font-mono uppercase text-white tracking-tighter">"{challenge.target}"</p>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={typedText}
                                    onChange={(e) => setTypedText(e.target.value)}
                                    placeholder="TYPE HERE!"
                                    className="w-full py-10 bg-white/5 border-4 border-white/10 rounded-[2.5rem] text-center text-4xl font-black focus:outline-none focus:border-game-primary transition-all uppercase placeholder:text-white/5"
                                    autoFocus
                                    autoComplete="off"
                                    autoCorrect="off"
                                />
                            </div>
                        )}

                        {challenge?.type === 'SEQUENCE' && (
                            <div className="w-full flex flex-col gap-10">
                                <div className="text-center">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-white/20">Mission</span>
                                    <h3 className="text-4xl font-black text-game-secondary italic uppercase tracking-tighter">TAP IN ORDER!</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                        <motion.button
                                            key={num}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleSequenceTap(num)}
                                            className={`aspect-square text-5xl font-black rounded-3xl transition-all border-4 ${
                                                sequence.indexOf(num) < sequenceIndex
                                                    ? 'bg-green-500 border-white text-white shadow-lg'
                                                    : 'bg-white/5 border-white/10 text-white/40'
                                            }`}
                                        >
                                            {num}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        {amWinner ? (
                            <>
                                <div className="text-[12rem] animate-bounce">🏆</div>
                                <h3 className="text-6xl font-black text-game-accent uppercase tracking-tighter italic drop-shadow-glow">GLORY!</h3>
                                <p className="text-white/40 text-2xl font-bold uppercase tracking-widest">+500 POINTS EARNED</p>
                            </>
                        ) : (
                            <>
                                <div className="text-[12rem] opacity-40 grayscale animate-shake">💀</div>
                                <h3 className="text-6xl font-black text-white/20 uppercase tracking-tighter italic">DEFEAT</h3>
                                <p className="text-white/10 text-2xl font-bold uppercase tracking-widest">The fam was faster</p>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompetePlayer;