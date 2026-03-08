import { motion, AnimatePresence } from 'framer-motion';
import { useNarratorStore } from '../store/useNarratorStore';
import { useEffect } from 'react';

export const Narrator = () => {
    const { isPlaying, currentSubtitle, initVoice } = useNarratorStore();

    useEffect(() => {
        initVoice();
    }, [initVoice]);

    return (
        <>
            {/* The Persistent Floating Avatar */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="fixed bottom-6 left-6 z-[100] flex items-center gap-4 pointer-events-none"
            >
                {/* V.I.C. Head */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 border-4 border-white/20 shadow-[0_0_30px_rgba(217,70,239,0.4)] flex items-center justify-center overflow-hidden pointer-events-auto">
                    {/* Glowing Eyes */}
                    <div className="absolute top-1/3 flex gap-4">
                        <motion.div
                            animate={{
                                scaleY: isPlaying ? [1, 0.1, 1] : 1,
                                opacity: isPlaying ? [1, 0.5, 1] : 0.8
                            }}
                            transition={{ repeat: Infinity, duration: 3, delay: 0 }}
                            className="w-3 h-3 bg-cyan-300 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        />
                        <motion.div
                            animate={{
                                scaleY: isPlaying ? [1, 0.1, 1] : 1,
                                opacity: isPlaying ? [1, 0.5, 1] : 0.8
                            }}
                            transition={{ repeat: Infinity, duration: 3, delay: 0.1 }}
                            className="w-3 h-3 bg-cyan-300 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                        />
                    </div>

                    {/* Talking Mouth */}
                    <motion.div
                        animate={isPlaying ? {
                            height: [4, 16, 8, 20, 4],
                            width: [24, 28, 24, 30, 24],
                            borderRadius: ['50%', '20%', '50%', '10%', '50%']
                        } : {
                            height: 4,
                            width: 24,
                            borderRadius: '50%'
                        }}
                        transition={{ repeat: Infinity, duration: 0.2 }}
                        className="absolute bottom-1/4 bg-white shadow-[0_0_15_px_rgba(255,255,255,0.8)]"
                    />

                    {/* Scanline Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-scanline pointer-events-none opacity-30" />
                </div>

                {/* Subtitle Card */}
                <AnimatePresence>
                    {isPlaying && currentSubtitle && (
                        <motion.div
                            initial={{ opacity: 0, x: -20, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.8 }}
                            className="max-w-md bg-zinc-950/90 border-2 border-fuchsia-500/40 backdrop-blur-xl p-5 rounded-3xl rounded-bl-none shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative"
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.3em]">V.I.C. Transmission</span>
                                <p className="text-xl font-bold text-white italic leading-tight drop-shadow-md">
                                    "{currentSubtitle}"
                                </p>
                            </div>

                            {/* Decorative Waveform */}
                            <div className="absolute -bottom-1 -right-1 flex gap-0.5 h-4 opacity-30">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: ['20%', '100%', '20%'] }}
                                        transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.05 }}
                                        className="w-1 bg-fuchsia-400 rounded-full self-end"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};
