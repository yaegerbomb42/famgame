import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HypeManProps {
    text: string;
    intensity: number; // 0 - 100
    trigger: boolean; // Toggle to trigger animation
}

const HypeMan: React.FC<HypeManProps> = ({ text, intensity, trigger }) => {
    const [words, setWords] = useState<string[]>([]);

    useEffect(() => {
        if (trigger && text) {
            setWords(text.split(' '));
        }
    }, [trigger, text]);

    // Color based on intensity
    const getColor = () => {
        if (intensity > 80) return 'text-red-500 drop-shadow-[0_0_30px_rgba(255,0,0,1)]';
        if (intensity > 50) return 'text-orange-500 drop-shadow-[0_0_20px_rgba(255,100,0,0.8)]';
        return 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]';
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {trigger && (
                    <div className="flex flex-wrap justify-center gap-4 max-w-6xl">
                        {words.map((word, i) => (
                            <motion.div
                                key={i + Date.now()}
                                initial={{
                                    opacity: 0,
                                    scale: 5,
                                    rotate: Math.random() * 60 - 30,
                                    y: Math.random() * 500 - 250
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    rotate: 0,
                                    y: 0
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0,
                                    filter: 'blur(20px)'
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                    delay: i * 0.05
                                }}
                                className={`text-8xl md:text-[8rem] font-black uppercase italic tracking-tighter ${getColor()}`}
                                style={{
                                    textShadow: intensity > 80 ? '10px 10px 0px rgba(0,0,0,1)' : 'none'
                                }}
                            >
                                {word}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HypeMan;
