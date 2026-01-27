import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const TriviaPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick } = useSound();
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    
    const colors = [
        'bg-[#ff0055] shadow-[#ff0055]/40', 
        'bg-[#0055ff] shadow-[#0055ff]/40', 
        'bg-[#00ff55] shadow-[#00ff55]/40', 
        'bg-[#ffaa00] shadow-[#ffaa00]/40'
    ];
    const labels = ['A', 'B', 'C', 'D'];

    const handleSelect = (i: number) => {
        if (selectedIdx !== null || gameState?.gameData?.showResult) return;
        setSelectedIdx(i);
        socket?.emit('submitAnswer', i);
        playClick();
    }

    if (selectedIdx !== null && !gameState?.gameData?.showResult) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 space-y-12"
            >
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-[10rem] drop-shadow-2xl"
                >
                    💎
                </motion.div>
                <div className="space-y-4 text-center">
                    <h2 className="text-5xl font-black text-game-primary uppercase tracking-tighter italic">LOCKED IN!</h2>
                    <p className="text-white/30 text-xl font-black uppercase tracking-[0.3em] animate-pulse">Wait for the reveal</p>
                </div>
                
                <div className={`w-32 h-32 rounded-full ${colors[selectedIdx]} flex items-center justify-center text-5xl font-black border-4 border-white/20`}>
                    {labels[selectedIdx]}
                </div>
            </motion.div>
        )
    }

    if (gameState?.gameData?.showResult) {
        const isCorrect = selectedIdx === gameState.gameData.question.correct;
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 space-y-12"
            >
                <div className="text-[12rem]">{isCorrect ? '👑' : '💀'}</div>
                <div className="text-center space-y-4">
                    <h2 className={`text-6xl font-black uppercase tracking-tighter ${isCorrect ? 'text-game-secondary' : 'text-red-500'}`}>
                        {isCorrect ? 'YESSS!' : 'OH NO!'}
                    </h2>
                    <p className="text-white/40 text-2xl font-bold italic">
                        {isCorrect ? '+100 POINTS' : 'Better luck next time'}
                    </p>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="flex-1 grid grid-cols-2 gap-4 h-full">
            {colors.map((color, i) => (
                <motion.button
                    key={i}
                    whileHover={{ scale: 0.98 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSelect(i)}
                    className={`${color} rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border-b-[12px] border-black/20 active:border-b-0 active:translate-y-2 transition-all`}
                >
                    <span className="text-9xl font-black text-white/90 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                        {labels[i]}
                    </span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 active:opacity-100 transition-opacity" />
                </motion.button>
            ))}
        </div>
    );
};

export default TriviaPlayer;