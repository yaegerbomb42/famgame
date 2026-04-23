import { useNarratorStore } from '../store/useNarratorStore';
import { useGameStore } from '../store/useGameStore';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHypeConfetti, triggerSavageParticles } from '../utils/rewards';
import { GAME_START_QUIPS } from '../store/useNarratorStore';

export const Narrator = () => {
    const { isPlaying, currentSubtitle, currentMood, initVoice, setCustomQuips, speak, customQuips } = useNarratorStore();
    const { gameState } = useGameStore();

    useEffect(() => {
        initVoice();
    }, [initVoice]);

    // Sync AI quips from server
    useEffect(() => {
        if (gameState?.customQuips && gameState.customQuips.length > 0) {
            setCustomQuips(gameState.customQuips);
        }
    }, [gameState?.customQuips, setCustomQuips]);

    const { latestNarratorMessage } = useGameStore();

    // Trigger AI roasts from server
    useEffect(() => {
        if (latestNarratorMessage) {
            speak(latestNarratorMessage.text, (latestNarratorMessage.mood?.toLowerCase() as any) || 'neutral');
        }
    }, [latestNarratorMessage, speak]);

    // Trigger quips on major transitions
    useEffect(() => {
        if (gameState?.status === 'PLAYING' && gameState?.gameData?.phase === 'INTRO') {
            const lines = customQuips.length > 0 ? customQuips : GAME_START_QUIPS.map(q => ({ text: q, mood: 'hype' as const }));
            const pick = lines[Math.floor(Math.random() * lines.length)];
            speak(pick.text, pick.mood);
        }
    }, [gameState?.status, gameState?.currentGame, gameState?.gameData?.phase, customQuips, speak]);

    // Character Bits FX
    useEffect(() => {
        if (isPlaying) {
            if (currentMood === 'hype') triggerHypeConfetti(0.1, 0.9);
            if (currentMood === 'savage') triggerSavageParticles(0.1, 0.9);
        }
    }, [isPlaying, currentMood, currentSubtitle]); // re-trigger on new line

    const MOOD_EMOJIS: Record<string, string> = {
        neutral: '🎙️',
        hype: '🔥',
        savage: '😈',
        sad: '💀'
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MOOD_ANIMATIONS: Record<string, any> = {
        neutral: { y: [0, -3, 0, -2, 0], rotate: [0, -2, 2, -1, 0], scale: [1, 1.08, 1, 1.05, 1], transition: { repeat: Infinity, duration: 0.6 } },
        hype: { y: [0, -15, 0], rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.3, 1], transition: { repeat: Infinity, duration: 0.4 } },
        savage: { x: [-3, 3, -3], rotate: [-5, 5, -5], scale: [1.1, 1.1, 1.1], filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)'], transition: { repeat: Infinity, duration: 0.15 } },
        sad: { y: [0, 5, 0], opacity: [0.5, 0.8, 0.5], filter: 'grayscale(100%)', transition: { repeat: Infinity, duration: 1.5 } },
    };

    const MOOD_COLORS: Record<string, string> = {
        neutral: 'from-[#1a1040] to-[#0d1025] border-fuchsia-500/60 shadow-[0_0_30px_rgba(192,38,211,0.4)]',
        hype: 'from-[#ff00ff] to-[#00ffff] border-white shadow-[0_0_50px_rgba(0,255,255,0.8)]',
        savage: 'from-[#600000] to-[#200020] border-red-500 shadow-[0_0_50px_rgba(255,0,0,0.8)]',
        sad: 'from-[#101010] to-[#050505] border-gray-600 shadow-none'
    };

    const activeAnimation = isPlaying ? MOOD_ANIMATIONS[currentMood] || MOOD_ANIMATIONS.neutral : { y: 0, scale: 1, rotate: 0, x: 0 };
    const activeColor = MOOD_COLORS[currentMood] || MOOD_COLORS.neutral;

    return (
        <div className="fixed bottom-6 left-6 z-[100] flex items-end gap-4 pointer-events-none" style={{ maxWidth: '60vw' }}>
            {/* Host Avatar - Always visible, alive when speaking */}
            <div className={`relative w-20 h-20 shrink-0 rounded-2xl bg-gradient-to-br border-2 flex items-center justify-center overflow-hidden pointer-events-auto group transition-colors duration-500 ${activeColor}`}>
                <motion.div 
                    animate={isPlaying ? { ...activeAnimation } : { y: 0, scale: 1, rotate: 0 }}
                    transition={isPlaying ? activeAnimation.transition : { duration: 0.3 }}
                    className="text-5xl z-10 select-none drop-shadow-lg"
                >
                    {isPlaying ? MOOD_EMOJIS[currentMood] || '🎙️' : '🎙️'}
                </motion.div>
                
                {/* Glow ring when speaking */}
                {isPlaying && currentMood === 'hype' && (
                    <>
                        <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="absolute inset-0 border-4 border-white rounded-2xl"
                        />
                        <motion.div
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="absolute inset-0 bg-[#00ffff]/30 rounded-2xl blur-md"
                        />
                    </>
                )}
                 {isPlaying && currentMood === 'savage' && (
                    <>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 0.2 }}
                            className="absolute inset-0 bg-red-500/40 rounded-2xl blur-lg pointer-events-none mix-blend-overlay"
                        />
                    </>
                )}

                {/* LIVE indicator */}
                <div className={`absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-white/10'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-white animate-pulse' : 'bg-white/30'}`} />
                    <span className="text-[7px] font-black uppercase text-white/80 tracking-wider">
                        {isPlaying ? 'LIVE' : 'IDLE'}
                    </span>
                </div>
            </div>

            {/* Speech Bubble */}
            <AnimatePresence>
                {isPlaying && currentSubtitle && (
                    <motion.div
                        initial={{ opacity: 0, x: -15, scale: 0.85, y: 10 }}
                        animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10, scale: 0.9, y: 5 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative bg-gradient-to-br from-[#1a1040]/95 to-[#0d1025]/95 backdrop-blur-2xl border border-fuchsia-500/40 px-5 py-4 rounded-2xl rounded-bl-sm shadow-[0_15px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(192,38,211,0.2)] max-w-md"
                    >
                        {/* Tag line */}
                        <div className="flex items-center gap-2 mb-1.5">
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-2 h-2 bg-fuchsia-400 rounded-full shadow-[0_0_8px_rgba(192,38,211,0.8)]"
                            />
                            <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.25em]">FAM HOST</span>
                        </div>

                        {/* Subtitle text */}
                        <p className="text-base font-bold text-white/90 leading-relaxed">
                            {currentSubtitle}
                        </p>

                        {/* Audio visualizer strip */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[2px] h-2 overflow-hidden opacity-50 rounded-b-2xl px-2">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-[3px] bg-gradient-to-t from-fuchsia-500 to-cyan-400 rounded-t-full narrator-bar"
                                    style={{ animationDelay: `${i * 0.06}s` }}
                                />
                            ))}
                        </div>

                        {/* Pointer triangle */}
                        <div className="absolute -left-2 bottom-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-fuchsia-500/40 border-b-[6px] border-b-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
