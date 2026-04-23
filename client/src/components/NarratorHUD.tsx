import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export const NarratorHUD: React.FC = () => {
    const { latestNarratorMessage } = useGameStore();
    const [visible, setVisible] = useState(false);
    const [msg, setMsg] = useState<{ text: string; mood?: string } | null>(null);

    useEffect(() => {
        if (latestNarratorMessage) {
            setMsg(latestNarratorMessage);
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [latestNarratorMessage]);

    return (
        <AnimatePresence>
            {visible && msg && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50, x: '-50%' }}
                    animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
                    className="fixed bottom-32 left-1/2 z-[100] w-full max-w-2xl px-6"
                >
                    <div className="relative glass-panel bg-[#1a1f3a]/90 border-4 border-[#00ffff]/30 p-8 shadow-[0_0_80px_rgba(0,255,255,0.2)]">
                        {/* Avatar / Icon */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-[#0d0f1a] border-4 border-[#00ffff] flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                            {msg.mood === 'SAVAGE' ? '💀' : '🧠'}
                        </div>

                        <div className="mt-8 text-center space-y-3">
                            <span className="text-xs font-black uppercase tracking-[0.5em] text-[#00ffff] opacity-50">
                                {msg.mood || 'NARRATOR'}
                            </span>
                            <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter leading-tight">
                                "{msg.text}"
                            </h2>
                        </div>

                        {/* Animated Border Glow */}
                        <motion.div 
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-[1.5rem] border border-[#00ff00]/20 pointer-events-none" 
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
