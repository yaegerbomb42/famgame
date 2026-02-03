import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const TriviaPlayer = () => {
    const { gameState, gameInput, socket } = useGameStore();
    const { playClick } = useSound();
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const gameData = gameState?.gameData;
    const me = socket?.id ? gameState?.players[socket.id] : null;
    const roundScore = gameData?.roundScores?.[socket?.id || ''];

    // Pattern: Adjust state during rendering to reset on round change
    // This avoids "synchronous setState in effect" warnings
    const [prevRound, setPrevRound] = useState<number | undefined>(undefined);
    const [prevResultState, setPrevResultState] = useState<boolean | undefined>(undefined);

    if (gameData?.round !== prevRound) {
        setPrevRound(gameData?.round);
        setSelectedIdx(null);
    }

    if (gameData?.showResult !== prevResultState) {
        setPrevResultState(gameData?.showResult);
        if (!gameData?.showResult) {
            setSelectedIdx(null);
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
        gameInput({ answerIndex: i });
        playClick();
        if (navigator.vibrate) navigator.vibrate(50);
    }

    if (selectedIdx !== null && !gameData?.showResult) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 bg-zinc-900"
            >
                <div className="flex flex-col items-center animate-pulse">
                    <span className="text-8xl">🔒</span>
                    <span className="text-2xl font-bold text-white mt-4 uppercase tracking-widest">Locked In</span>
                </div>

                <div className={`w-40 h-40 rounded-[2.5rem] ${colors[selectedIdx].split(' ')[0]} flex items-center justify-center text-7xl font-black border-4 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
                    {labels[selectedIdx]}
                </div>

                <p className="text-zinc-500 font-mono text-sm max-w-[200px] text-center">
                    Wait for the timer to expire...
                </p>
            </motion.div>
        )
    }

    if (gameData?.showResult) {
        const isCorrect = roundScore?.isCorrect;
        const totalPoints = roundScore?.points || 0;
        const streak = roundScore?.streak || 0;
        const multiplier = roundScore?.multiplier || 1;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex-1 flex flex-col items-center justify-center p-8 space-y-8 ${isCorrect ? 'bg-green-900/20' : 'bg-red-900/20'}`}
            >
                <div className="text-[8rem] drop-shadow-2xl">
                    {isCorrect ? (streak > 2 ? '🔥' : '✅') : '❌'}
                </div>

                <div className="text-center space-y-2">
                    <h2 className={`text-6xl font-black uppercase tracking-tighter ${isCorrect ? 'text-green-400' : 'text-red-500'}`}>
                        {isCorrect ? 'CORRECT!' : 'MISSED IT'}
                    </h2>

                    {isCorrect && (
                        <div className="flex flex-col items-center gap-2 mt-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-5xl font-black text-white"
                            >
                                +{totalPoints} PTS
                            </motion.div>

                            {multiplier > 1 && (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="px-4 py-1 bg-yellow-500 text-black font-bold rounded-full text-sm uppercase tracking-wide"
                                >
                                    {multiplier}x Streak Bonus!
                                </motion.div>
                            )}

                            {roundScore?.speedBonus > 50 && (
                                <span className="text-xs font-mono text-blue-300">⚡️ Speed Demon (+{roundScore.speedBonus})</span>
                            )}
                        </div>
                    )}
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
                    <span className="text-xs font-mono text-blue-400">ROUND {gameData?.round + 1 || 1}</span>
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