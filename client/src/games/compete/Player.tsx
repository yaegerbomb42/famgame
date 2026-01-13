import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface CompetePlayerProps {
    phase: 'SELECTING' | 'COUNTDOWN' | 'ACTIVE' | 'RESULTS';
    isCompeting: boolean;
    challenge: { type: 'TAP' | 'TYPE' | 'SEQUENCE'; target: any };
    timer: number;
    onProgress: (progress: number) => void;
    amWinner?: boolean;
}

const CompetePlayer = ({ phase, isCompeting, challenge, timer, onProgress, amWinner }: CompetePlayerProps) => {
    const [tapCount, setTapCount] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [sequenceIndex, setSequenceIndex] = useState(0);

    const TAP_TARGET = 30;
    const sequence = challenge?.target?.sequence || [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const handleTap = useCallback(() => {
        if (challenge?.type === 'TAP' && phase === 'ACTIVE') {
            const newCount = tapCount + 1;
            setTapCount(newCount);
            onProgress((newCount / TAP_TARGET) * 100);
        }
    }, [tapCount, challenge, phase, onProgress]);

    useEffect(() => {
        if (challenge?.type === 'TYPE' && phase === 'ACTIVE') {
            const target = challenge.target || '';
            const progress = target.length > 0 ? (typedText.length / target.length) * 100 : 0;
            onProgress(Math.min(progress, 100));
        }
    }, [typedText, challenge, phase, onProgress]);

    const handleSequenceTap = (num: number) => {
        if (challenge?.type === 'SEQUENCE' && phase === 'ACTIVE') {
            if (sequence[sequenceIndex] === num) {
                const newIndex = sequenceIndex + 1;
                setSequenceIndex(newIndex);
                onProgress((newIndex / sequence.length) * 100);
            }
        }
    };

    if (!isCompeting) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-6xl mb-4">👀</div>
                <p className="text-xl text-white/50">Watch the competition on TV!</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto"
        >
            {phase === 'COUNTDOWN' && (
                <div className="text-center space-y-8">
                    <div className="text-[15rem] font-black text-white animate-bounce leading-none">{timer}</div>
                    <p className="text-5xl font-black text-game-accent uppercase tracking-[0.5em] animate-pulse">GET READY!</p>
                </div>
            )}

            {phase === 'ACTIVE' && challenge?.type === 'TAP' && (
                <div className="w-full text-center space-y-10">
                    <div className="text-4xl font-black text-white/40 uppercase tracking-widest">Tap {TAP_TARGET} times!</div>
                    <div className="text-[12rem] font-black leading-none text-game-primary drop-shadow-[0_0_50px_rgba(255,0,255,0.4)]">{tapCount}/{TAP_TARGET}</div>
                    <button
                        onClick={handleTap}
                        className="w-full py-20 bg-gradient-to-b from-red-500 to-orange-600 rounded-[4rem] text-[8rem] font-black active:scale-90 transition-all shadow-[0_30px_60px_rgba(239,68,68,0.5)] border-t-8 border-white/30"
                    >
                        TAP! 👆
                    </button>
                </div>
            )}

            {phase === 'ACTIVE' && challenge?.type === 'TYPE' && (
                <div className="w-full text-center space-y-10">
                    <p className="text-3xl font-black text-white/40 uppercase tracking-widest leading-none">Type this precisely:</p>
                    <div className="glass-card p-12 rounded-[3.5rem] border-4 border-white/20 shadow-2xl">
                        <p className="text-5xl font-black font-mono text-game-secondary tracking-tighter uppercase">{challenge.target}</p>
                    </div>
                    <input
                        type="text"
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                        className="w-full p-12 text-5xl bg-white/5 border-4 border-white/10 rounded-[3.5rem] text-center font-black font-mono focus:outline-none focus:border-game-primary transition-all shadow-2xl uppercase placeholder:text-white/5"
                        placeholder="TYPE HERE..."
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                    />
                </div>
            )}

            {phase === 'ACTIVE' && challenge?.type === 'SEQUENCE' && (
                <div className="w-full text-center space-y-10">
                    <p className="text-3xl font-black text-white/40 uppercase tracking-[0.3em]">Tap in sequence!</p>
                    <div className="grid grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleSequenceTap(num)}
                                className={`aspect-square text-6xl font-black rounded-[2.5rem] transition-all transform active:scale-90 border-4 ${sequence.indexOf(num) < sequenceIndex
                                    ? 'bg-green-500 border-white/40 shadow-[0_0_40px_rgba(34,197,94,0.5)]'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center space-y-12">
                    {amWinner ? (
                        <div className="space-y-6">
                            <div className="text-[12rem] animate-bounce drop-shadow-huge">🏆</div>
                            <p className="text-7xl font-black text-yellow-400 uppercase tracking-tight shadow-glow-yellow">YOU WON!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-[12rem] animate-shake opacity-40">😢</div>
                            <p className="text-5xl font-black text-white/30 uppercase tracking-widest">Better luck next time!</p>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default CompetePlayer;
