import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GAME_INSTRUCTIONS } from '../constants/gameInstructions';

export interface GameTransitionProps {
  title?: string;
  subtitle?: string;
  phase?: string;
  duration?: number;
  gameState?: any;
  onComplete?: () => void;
  isHost?: boolean;
}

export const GameTransition: React.FC<GameTransitionProps> = ({ 
  title, 
  subtitle, 
  phase,
  duration = 3,
  gameState,
  onComplete,
  isHost
}) => {
  const showOverlay =
    title != null ||
    phase === 'INTRO' ||
    phase === 'COUNTDOWN';
    
  const currentGame = gameState?.currentGame;
  const isIntro = phase === 'INTRO';
  const instructions = isIntro && currentGame ? GAME_INSTRUCTIONS[currentGame] : null;

  const displayTitle = title || (isIntro && (gameState as any)?.gameData?.gameName ? (gameState as any).gameData.gameName : (phase ? phase.replace(/_/g, ' ') : 'GET READY'));
  const displaySubtitle = subtitle || (phase === 'INTRO' ? (gameState as any)?.gameData?.gameDescription : null);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
    
    // Narrator explanation trigger for Host
    if (isIntro && isHost && instructions?.explanation) {
        // We use the store directly to avoid hook issues if not in a store context
        const { speak } = (window as any).narratorStore || {};
        if (speak) {
            speak(instructions.explanation, 'HYPED');
        }
    }
  }, [duration, phase, isIntro, isHost, instructions]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  if (!showOverlay) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d0f1a] overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-500/20 via-transparent to-pink-500/20 pointer-events-none" />

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center z-10 p-12 w-full max-w-7xl"
      >
        <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-9xl md:text-[12rem] font-black text-white italic tracking-tighter uppercase drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] mb-4 leading-none"
        >
          {displayTitle}
        </motion.h1>
        
        {isIntro && instructions?.explanation ? (
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-black text-cyan-400 max-w-5xl px-8 leading-tight mx-auto mb-16 italic uppercase tracking-tight"
             >
                "{instructions.explanation}"
             </motion.p>
        ) : displaySubtitle && (
          <p className="text-3xl font-fredoka text-white/40 max-w-4xl px-8 leading-tight mx-auto mb-16">
            {displaySubtitle}
          </p>
        )}

        {/* Instructions Grid */}
        <AnimatePresence>
          {instructions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto my-12">
              {instructions.steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.15) }}
                  className="glass-panel p-10 bg-white/5 border-4 border-white/10 flex flex-col items-center text-center space-y-8 rounded-[3.5rem] shadow-2xl"
                >
                  <div className="text-8xl mb-2 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                    {instructions.icons[i]}
                  </div>
                  <p className="text-2xl font-black text-white uppercase tracking-widest leading-tight">
                    {step}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Countdown Progress */}
      <div className="absolute bottom-20 flex items-center gap-6 z-10">
        {[...Array(Math.max(0, Math.floor(duration)))].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ 
              scale: timeLeft > i ? 1.2 : 0.8, 
              opacity: timeLeft > i ? 1 : 0.2,
              backgroundColor: timeLeft > i ? "#00ffff" : "rgba(255,255,255,0.1)",
              boxShadow: timeLeft > i ? "0 0 40px rgba(0,255,255,0.6)" : "none"
            }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-black font-black text-2xl transition-all duration-300"
          >
            {i + 1}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
