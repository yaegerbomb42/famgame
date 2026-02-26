import { motion, AnimatePresence } from 'framer-motion';
import { useNarratorStore } from '../store/useNarratorStore';
import { useEffect } from 'react';

export const Narrator = () => {
    const { isPlaying, currentSubtitle, initVoice } = useNarratorStore();

    useEffect(() => {
        initVoice();
    }, [initVoice]);

    return (
        <AnimatePresence>
            {isPlaying && currentSubtitle && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-12 left-0 right-0 z-50 flex flex-col items-center justify-center pointer-events-none"
                >
                    <div className="bg-zinc-950/90 border-2 border-fuchsia-500/50 backdrop-blur-xl p-6 rounded-3xl max-w-4xl w-full mx-4 shadow-[0_0_50px_rgba(217,70,239,0.3)] relative overflow-hidden">

                        {/* V.I.C. Visual Representation (Retro CRT waveform vibe) */}
                        <div className="absolute top-0 left-0 bottom-0 w-24 bg-fuchsia-900/30 border-r border-fuchsia-500/30 flex items-center justify-center">
                            <div className="flex gap-1 items-center h-12">
                                {[0.2, 0.7, 0.4, 0.9, 0.3, 0.8, 0.5, 0.6].map((rand, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: ['20%', '100%', '20%'] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.5 + rand * 0.5,
                                            ease: "linear",
                                            delay: i * 0.1
                                        }}
                                        className="w-2 bg-fuchsia-400 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Dialogue Text */}
                        <div className="pl-32 flex flex-col">
                            <span className="text-fuchsia-400 font-bold uppercase tracking-widest text-xs mb-1">
                                V.I.C. (Virtual Interactive Compere)
                            </span>
                            <p className="text-3xl font-black text-white italic tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                "{currentSubtitle}"
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
