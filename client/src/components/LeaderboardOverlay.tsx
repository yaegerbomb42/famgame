import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerRoundWinConfetti } from '../utils/rewards';

interface LeaderboardEntry {
    name: string;
    score: number;
    delta?: number;
    color?: string;
    avatar?: string;
}

interface LeaderboardOverlayProps {
    entries: LeaderboardEntry[];
    title?: string;
}

export const LeaderboardOverlay: React.FC<LeaderboardOverlayProps> = ({ 
    entries, 
    title = "STANDINGS" 
}) => {
    // Sort by score descending
    const sorted = [...entries].sort((a, b) => b.score - a.score);

    useEffect(() => {
        triggerRoundWinConfetti();
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4 md:p-12">
            <motion.div 
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                className="w-full max-w-5xl glass-panel p-8 md:p-16 relative overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Background Glow */}
                <div className="absolute -top-48 -left-48 w-96 h-96 bg-cyan-500/20 rounded-full blur-[150px]" />
                <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-pink-500/20 rounded-full blur-[150px]" />

                <h2 className="text-5xl md:text-8xl font-black text-center text-white mb-12 tracking-tighter uppercase italic drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    {title}
                </h2>

                <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                    <AnimatePresence>
                        {sorted.map((entry, index) => (
                            <motion.div
                                key={entry.name}
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center gap-6 p-6 rounded-[2rem] border-4 transition-all ${
                                    index === 0 
                                        ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border-white/20 shadow-[0_0_40px_rgba(0,255,255,0.15)]' 
                                        : 'bg-white/5 border-white/5'
                                }`}
                            >
                                <div className={`text-4xl font-black w-16 text-center ${index < 3 ? 'text-cyan-400' : 'text-white/20'}`}>
                                    #{index + 1}
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center text-4xl shadow-inner border-2 border-white/10">
                                    {entry.avatar || '👤'}
                                </div>
                                <div className="flex-1">
                                    <div className="text-3xl font-black text-white uppercase italic tracking-tighter">{entry.name}</div>
                                    {index === 0 && <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Current Leader</div>}
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="text-5xl font-black text-white tabular-nums tracking-tighter">
                                        {entry.score.toLocaleString()}
                                    </div>
                                    {entry.delta !== undefined && entry.delta > 0 && (
                                        <div className="text-green-400 font-bold text-sm tracking-widest">+{entry.delta}</div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
