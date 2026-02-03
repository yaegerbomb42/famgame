import { motion } from 'framer-motion';
import { useState } from 'react';

const LoadingScreen = () => {
    // Use lazy initializer for particles to avoid impurity lint during render
    const [particles] = useState(() => {
        return [...Array(20)].map((_, i) => ({
            id: i,
            x: Math.random() * 100, // percentage
            y: Math.random() * 100, // percentage
            targetY: -100 - (Math.random() * 200),
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2
        }));
    });

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] bg-game-bg flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Background Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[800px] max-h-[800px] bg-game-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-game-secondary/20 blur-[100px] rounded-full animate-pulse-delayed" />

            <div className="relative flex flex-col items-center">
                {/* Pulsing Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
                    transition={{ duration: 1.2, times: [0, 0.7, 1], ease: "easeOut" }}
                    className="mb-12"
                >
                    <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        FAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">GAME</span>
                    </h1>
                </motion.div>

                {/* Loading Progress */}
                <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '0%' }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-game-primary to-game-secondary shadow-[0_0_15px_rgba(255,0,255,0.5)]"
                    />
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-white/40 font-black uppercase tracking-[0.3em] text-sm animate-pulse"
                >
                    Launching App...
                </motion.p>
            </div>

            {/* Floating particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        opacity: 0
                    }}
                    animate={{
                        y: [0, p.targetY],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay
                    }}
                    className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
                />
            ))}
        </motion.div>
    );
};

export default LoadingScreen;
