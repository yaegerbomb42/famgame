import React from 'react';
import { motion } from 'framer-motion';

interface WaitingPulseProps {
    players: { id: string; name: string; avatar?: string }[];
    submissions: Record<string, any>;
    label?: string;
    accentColor?: string;
}

const WaitingPulse: React.FC<WaitingPulseProps> = ({
    players,
    submissions,
    label = 'Waiting for players...',
    accentColor = 'var(--color-cyan)',
}) => {
    const total = players.length;
    const submitted = Object.keys(submissions).filter(id =>
        players.some(p => p.id === id)
    ).length;
    const progress = total > 0 ? submitted / total : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
        >
            {/* Label */}
            <p className="text-sm font-black uppercase tracking-[0.3em] text-white/30">
                {label}
            </p>

            {/* Progress bar */}
            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: accentColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
            </div>

            {/* Player avatars */}
            <div className="flex flex-wrap justify-center gap-3 max-w-md">
                {players.map((p, i) => {
                    const hasSubmitted = !!submissions[p.id];
                    return (
                        <motion.div
                            key={p.id}
                            initial={{ scale: 0 }}
                            animate={{
                                scale: 1,
                                opacity: hasSubmitted ? 1 : 0.3,
                                y: hasSubmitted ? [0, -8, 0] : 0,
                            }}
                            transition={{
                                delay: i * 0.05,
                                y: hasSubmitted ? { duration: 0.4 } : {},
                            }}
                            className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
                                hasSubmitted
                                    ? 'border-white/40 bg-white/10 shadow-lg'
                                    : 'border-white/5 bg-white/5'
                            }`}
                            style={
                                hasSubmitted
                                    ? { borderColor: accentColor, boxShadow: `0 0 20px ${accentColor}33` }
                                    : {}
                            }
                        >
                            <span>{p.avatar || '👤'}</span>
                            {hasSubmitted && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                                    style={{ backgroundColor: accentColor, color: '#0d0f1a' }}
                                >
                                    ✓
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Count */}
            <p className="text-xs font-bold text-white/20 tabular-nums">
                {submitted}/{total} submitted
            </p>
        </motion.div>
    );
};

export default WaitingPulse;
