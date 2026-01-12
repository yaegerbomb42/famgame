import { useState, useEffect, useCallback } from 'react';

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
        <div className="flex-1 flex flex-col items-center justify-center p-6">
            {phase === 'COUNTDOWN' && (
                <div className="text-center">
                    <div className="text-[8rem] font-black text-white animate-pulse">{timer}</div>
                    <p className="text-2xl text-game-accent">GET READY!</p>
                </div>
            )}

            {phase === 'ACTIVE' && challenge?.type === 'TAP' && (
                <div className="w-full max-w-sm text-center">
                    <div className="text-2xl text-white/50 mb-2">Tap {TAP_TARGET} times!</div>
                    <div className="text-6xl font-black mb-8">{tapCount}/{TAP_TARGET}</div>
                    <button
                        onClick={handleTap}
                        className="w-full h-64 bg-gradient-to-b from-red-500 to-orange-600 rounded-3xl text-6xl font-black active:scale-95 transition-transform"
                    >
                        TAP! 👆
                    </button>
                </div>
            )}

            {phase === 'ACTIVE' && challenge?.type === 'TYPE' && (
                <div className="w-full max-w-sm text-center">
                    <p className="text-lg text-white/50 mb-2">Type this:</p>
                    <div className="glass-card p-4 rounded-xl mb-4">
                        <p className="text-xl font-mono">{challenge.target}</p>
                    </div>
                    <input
                        type="text"
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                        className="w-full p-4 text-xl bg-white/10 rounded-xl text-center font-mono"
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                    />
                </div>
            )}

            {phase === 'ACTIVE' && challenge?.type === 'SEQUENCE' && (
                <div className="w-full max-w-sm text-center">
                    <p className="text-lg text-white/50 mb-4">Tap in order: 1, 2, 3...</p>
                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleSequenceTap(num)}
                                className={`aspect-square text-3xl font-black rounded-xl transition-all ${sequence.indexOf(num) < sequenceIndex
                                        ? 'bg-green-500'
                                        : 'bg-white/10 active:bg-white/30'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center">
                    {amWinner ? (
                        <>
                            <div className="text-8xl mb-4">🏆</div>
                            <p className="text-3xl font-bold text-yellow-400">YOU WON!</p>
                        </>
                    ) : (
                        <>
                            <div className="text-8xl mb-4">😢</div>
                            <p className="text-3xl text-white/50">Better luck next time!</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompetePlayer;
