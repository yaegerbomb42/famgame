import { motion } from 'framer-motion';
import { usePersona } from '../context/PersonaContext';
import { useEffect, useState } from 'react';

export const Persona = () => {
    const { isSpeaking } = usePersona();
    const [audioData, setAudioData] = useState<number[]>([10, 10, 10, 10]);

    // Simulate audio visualizer data when speaking
    // Simulate audio visualizer data when speaking
    useEffect(() => {
        if (!isSpeaking) return;

        const interval = setInterval(() => {
            setAudioData(prev => prev.map(() => Math.random() * 20 + 5));
        }, 100);

        return () => {
            clearInterval(interval);
            setAudioData([10, 10, 10, 10]);
        };
    }, [isSpeaking]);

    return (
        <div className="fixed top-8 right-8 z-50 pointer-events-none flex items-center gap-6">
            {/* Holographic Speech Bubble */}
            {isSpeaking && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="hidden md:block bg-black/40 backdrop-blur-md border border-cyan-500/30 px-6 py-3 rounded-tr-none rounded-2xl text-cyan-400 font-mono text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                    <span className="animate-pulse">System Voice Active...</span>
                </motion.div>
            )}

            {/* Core Node */}
            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Outer Orbital Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-cyan-500/20 rounded-full border-t-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                />

                {/* Counter-Rotating Inner Ring */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border border-cyan-400/10 rounded-full border-b-cyan-400/50"
                />

                {/* Central Core */}
                <motion.div
                    animate={isSpeaking ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                            "0 0 20px rgba(6,182,212,0.4)",
                            "0 0 40px rgba(6,182,212,0.8)",
                            "0 0 20px rgba(6,182,212,0.4)"
                        ]
                    } : {
                        scale: 1,
                        boxShadow: "0 0 20px rgba(6,182,212,0.2)"
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }} // Beat with speech
                    className="relative w-12 h-12 bg-black rounded-full border-2 border-cyan-500 flex items-center justify-center overflow-hidden z-10"
                >
                    {/* Simulated Eye / Scanner */}
                    <motion.div
                        animate={{ x: [-5, 5, -5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]"
                    />

                    {/* Scanlines */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay" />
                </motion.div>

                {/* Audio Visualizer Bars (Orbiting) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {audioData.map((h, i) => (
                        <motion.div
                            key={i}
                            animate={{ height: isSpeaking ? h : 4, opacity: isSpeaking ? 1 : 0.3 }}
                            className="absolute w-1 bg-cyan-400/80 rounded-full"
                            style={{
                                height: 10,
                                transform: `rotate(${i * 90}deg) translateY(-28px)`
                            }}
                        />
                    ))}
                </div>

                {/* Background Glitch Elements */}
                {isSpeaking && (
                    <motion.div
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
                        className="absolute -inset-4 border border-cyan-500/20 rounded-full"
                    />
                )}
            </div>
        </div>
    );
};

