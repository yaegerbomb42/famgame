import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const TriviaPlayer = () => {
    const { gameState, socket } = useGameStore();
    const { playClick, playSuccess } = useSound();
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [step, setStep] = useState<'ANSWER' | 'CONFIDENCE'>('ANSWER');

    const gameData = gameState?.gameData;
    const me = socket?.id ? gameState?.players[socket.id] : null;

    // Pattern: Adjust state during rendering to reset on round change
    // This avoids "synchronous setState in effect" warnings
    const [prevRound, setPrevRound] = useState<number | undefined>(undefined);
    const [prevResultState, setPrevResultState] = useState<boolean | undefined>(undefined);

    if (gameData?.round !== prevRound) {
        setPrevRound(gameData?.round);
        setSelectedIdx(null);
        setConfidence(null);
        setStep('ANSWER');
    }

    if (gameData?.showResult !== prevResultState) {
        setPrevResultState(gameData?.showResult);
        if (!gameData?.showResult) {
            setSelectedIdx(null);
            setConfidence(null);
            setStep('ANSWER');
        }
    }

    const colors = [
        'bg-pink-600 shadow-pink-600/40 border-pink-400',
        'bg-blue-600 shadow-blue-600/40 border-blue-400',
        'bg-green-600 shadow-green-600/40 border-green-400',
        'bg-orange-600 shadow-orange-600/40 border-orange-400'
    ];
    const labels = ['A', 'B', 'C', 'D'];

    const handleSelect = (i: number) => {
        if (selectedIdx !== null || gameData?.showResult) return;
        setSelectedIdx(i);
        setStep('CONFIDENCE');
        playClick();
        if (navigator.vibrate) navigator.vibrate(30);
    }

    const handleConfirm = (bet: number) => {
        if (confidence !== null || gameData?.showResult) return;
        setConfidence(bet);
        socket?.emit('submitTriviaAnswer', { answerIndex: selectedIdx, confidence: bet });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate([50, 30]);
    }

    if (gameData?.phase === 'GENERATING') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-6 space-y-8 text-center">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="text-8xl"
                >
                    🧬
                </motion.div>
                <div>
                    <h2 className="text-3xl font-black text-cyan-400 uppercase tracking-tighter mb-2 animate-pulse">
                        SWARM INBOUND
                    </h2>
                    <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest leading-relaxed">
                        The AI is crafting a custom challenge<br />based on the topic: <span className="text-white">{gameData?.topic}</span>
                    </p>
                </div>
            </div>
        );
    }

    if (gameData?.phase === 'SETTINGS') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-6 space-y-8 text-center">
                <div className="text-6xl animate-pulse">⚙️</div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Host Settings</h2>
                    <p className="text-zinc-500 font-bold uppercase text-sm">Waiting for the host to choose category and difficulty...</p>
                </div>
            </div>
        );
    }

    if (step === 'CONFIDENCE' && confidence === null && !gameData?.showResult) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 bg-zinc-950"
            >
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Level of Confidence?</h2>
                    <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest">How sure are you about {labels[selectedIdx!] || ''}?</p>
                </div>

                <div className="grid grid-cols-5 gap-3 w-full max-w-sm">
                    {Array.from({ length: 10 }).map((_, i) => {
                        const val = i + 1;
                        const isHigh = val > 7;
                        const isMid = val > 4;
                        return (
                            <motion.button
                                key={val}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleConfirm(val)}
                                className={`aspect-square rounded-xl flex items-center justify-center text-xl font-black border-2 transition-all ${isHigh ? 'bg-red-500/20 border-red-500 text-red-500' :
                                    isMid ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
                                        'bg-blue-500/20 border-blue-500 text-blue-500'
                                    } shadow-lg shadow-black/40`}
                            >
                                {val}
                            </motion.button>
                        );
                    })}
                </div>

                <div className="w-full max-w-[200px] h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 15, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500"
                    />
                </div>

                <button
                    onClick={() => setStep('ANSWER')}
                    className="text-zinc-600 font-bold uppercase text-xs hover:text-white transition-colors"
                >
                    ← Change Answer
                </button>
            </motion.div>
        );
    }

    if (confidence !== null && !gameData?.showResult) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 bg-zinc-900"
            >
                <div className="flex flex-col items-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-[10rem] filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        {confidence > 7 ? '🔥' : confidence > 4 ? '🤔' : '🎲'}
                    </motion.div>
                    <span className="text-2xl font-black text-white mt-8 uppercase tracking-[0.3em]">Bet Locked: {confidence}</span>
                </div>

                <div className={`w-32 h-32 rounded-[2rem] ${colors[selectedIdx!].split(' ')[0]} flex items-center justify-center text-6xl font-black border-4 border-white/20 shadow-2xl`}>
                    {labels[selectedIdx!]}
                </div>

                <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest text-center animate-pulse">
                    Waiting for others to risk it all...
                </p>
            </motion.div>
        )
    }

    if (gameData?.showResult) {
        const myResult = gameData.roundScores?.[socket?.id || ''];
        const isCorrect = myResult?.isCorrect;
        const points = myResult?.points || 0;
        const bet = myResult?.confidence || 0;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex-1 flex flex-col items-center justify-center p-8 space-y-8 ${isCorrect ? 'bg-green-900/20' : 'bg-red-900/40'}`}
            >
                <div className="text-[10rem] drop-shadow-2xl">
                    {isCorrect ? '💎' : '📉'}
                </div>

                <div className="text-center space-y-4">
                    <h2 className={`text-6xl font-black uppercase tracking-tighter ${isCorrect ? 'text-green-400' : 'text-red-500'}`}>
                        {isCorrect ? 'BANKED!' : 'LIQUIDATED'}
                    </h2>

                    <div className="flex flex-col items-center gap-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.2 }}
                            className={`text-6xl font-black ${isCorrect ? 'text-white' : 'text-red-400'}`}
                        >
                            {points > 0 ? '+' : ''}{points} PTS
                        </motion.div>

                        <div className="px-6 py-2 bg-white/5 rounded-2xl border border-white/10 mt-4">
                            <span className="text-sm font-bold text-white/40 uppercase tracking-widest">Confidence Risk: {bet}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-6">
            <header className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Current Score</span>
                    <span className="text-3xl font-black text-white">{me?.score || 0}</span>
                </div>
                <div className="px-4 py-2 bg-zinc-900 rounded-full border border-white/10">
                    <span className="text-xs font-mono text-blue-400">ROUND {(gameData?.round ?? 0) + 1}</span>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-2 gap-4">
                {colors.map((color, i) => (
                    <motion.button
                        key={i}
                        whileHover={{ scale: 0.98 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(i)}
                        className={`${color} rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden shadow-xl border-b-8 active:border-b-0 active:translate-y-2 transition-all group`}
                    >
                        <span className="text-8xl font-black text-white/95 drop-shadow-md z-10 group-active:scale-90 transition-transform">
                            {labels[i]}
                        </span>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default TriviaPlayer;