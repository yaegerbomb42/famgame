import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface CompeteHostProps {
    gameState: any;
}

const CompeteHost: React.FC<CompeteHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        challengerIds = [], 
        challengeType, 
        target, 
        scores = {}, 
        timer: timeLeft 
    } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const solo = challengerIds.length === 1;

    const p1 = challengerIds[0] ? players[challengerIds[0]] : null;
    const p2 = challengerIds[1] ? players[challengerIds[1]] : null;
    
    const p1Score = scores[challengerIds[0]] || 0;
    const p2Score = scores[challengerIds[1]] || 0;

    const tapGoal = challengeType === 'TAP' && typeof target === 'number' ? target : 30;
    const p1Progress =
        challengeType === 'TAP'
            ? (p1Score / tapGoal) * 100
            : (p1Score / (typeof target === 'string' ? target.length : 1)) * 100;
    const p2Progress =
        challengeType === 'TAP'
            ? (p2Score / tapGoal) * 100
            : (p2Score / (typeof target === 'string' ? target.length : 1)) * 100;

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden">
            <GameTransition phase={phase} gameState={gameState} isHost={true} />

            <AnimatePresence mode="wait">
                {(phase === 'INTRO' || phase === 'COUNTDOWN') && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className={`flex items-center justify-center mb-16 ${solo ? 'gap-0' : 'gap-24'}`}>
                            <motion.div 
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex flex-col items-center gap-8"
                            >
                                <div className="text-[12rem] drop-shadow-[0_0_40px_rgba(0,255,255,0.5)]">{p1?.avatar || '👤'}</div>
                                <div className="glass-panel px-10 py-5 border-4 border-[#00ffff] rounded-[3rem] shadow-[0_0_40px_rgba(0,255,255,0.3)] transform -rotate-3">
                                    <h3 className="text-6xl font-black uppercase tracking-tight text-white italic">{p1?.name}</h3>
                                </div>
                            </motion.div>
                            
                            {!solo && (
                            <>
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-[14rem] font-black text-[#ffff00] italic drop-shadow-[0_0_60px_rgba(255,255,0,0.8)] leading-none"
                            >
                                VS
                            </motion.div>

                            <motion.div 
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex flex-col items-center gap-8"
                            >
                                <div className="text-[12rem] drop-shadow-[0_0_40px_rgba(255,0,255,0.5)]">{p2?.avatar || '👤'}</div>
                                <div className="glass-panel px-10 py-5 border-4 border-[#ff00ff] rounded-[3rem] shadow-[0_0_40px_rgba(255,0,255,0.3)] transform rotate-3">
                                    <h3 className="text-6xl font-black uppercase tracking-tight text-white italic">{p2?.name}</h3>
                                </div>
                            </motion.div>
                            </>
                            )}
                        </div>
                        
                        {phase === 'COUNTDOWN' && (
                            <motion.div 
                                initial={{ scale: 2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                key={timeLeft}
                                className="mt-8"
                            >
                                <TimerRing timeLeft={timeLeft} maxTime={3} size={250} accentColor="var(--game-compete)" accentGlow="var(--game-compete-glow)" />
                            </motion.div>
                        )}
                        
                        {(phase === 'INTRO' || phase === 'COUNTDOWN') && (
                            <p className="text-5xl text-white/40 font-black uppercase tracking-[0.5em] animate-pulse">
                                {solo ? 'SOLO RUN' : 'HEAD TO HEAD'}
                            </p>
                        )}
                    </motion.div>
                )}

                {phase === 'PLAYING' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col items-center max-w-7xl"
                    >
                        <div className="text-center mb-24">
                            <div className="inline-block px-12 py-4 glass-panel border-4 border-[#ffff00] rounded-[2.5rem] text-4xl font-black mb-10 uppercase tracking-[0.3em] text-[#ffff00] shadow-[0_0_40px_rgba(255,255,0,0.4)]">
                                {challengeType} BATTLE
                            </div>
                            <h2 className="text-[9rem] font-black uppercase tracking-tighter text-white leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] italic">
                                {challengeType === 'TAP' && '🎯 HIT THE CENTER!'}
                                {challengeType === 'TYPE' && '⌨️ SPEED TYPING!'}
                            </h2>
                            {challengeType === 'TYPE' && target && (
                                <div className="mt-8 p-10 glass-panel border-4 border-white/10 rounded-[3rem] shadow-xl">
                                    <p className="text-6xl font-black text-[#00ffff] tracking-widest leading-none">"{target}"</p>
                                </div>
                            )}
                        </div>

                        <div className="w-full space-y-20 p-12 glass-panel rounded-[5rem] border-8 border-white/5 relative bg-white/5 backdrop-blur-3xl">
                            {/* P1 Bar */}
                            <div className="flex flex-col gap-8">
                                <div className="flex justify-between items-end px-4">
                                    <div className="flex items-center gap-6">
                                        <span className="text-6xl">{p1?.avatar || '👤'}</span>
                                        <span className="text-5xl font-black uppercase text-white tracking-widest italic">{p1?.name}</span>
                                    </div>
                                    <span className="text-7xl font-black font-mono text-[#00ffff] drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">{Math.min(100, Math.round(p1Progress))}%</span>
                                </div>
                                <div className="h-24 bg-[#0d0f1a] rounded-[2rem] border-4 border-[#00ffff]/30 overflow-hidden p-2 shadow-inner">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[#00ffff] to-[#00ffcc] rounded-[1rem] shadow-[0_0_40px_rgba(0,255,255,0.6)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, p1Progress)}%` }}
                                        transition={{ duration: 0.1 }}
                                    />
                                </div>
                            </div>

                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-white/10 italic select-none">
                                {solo ? 'GO' : 'BATTLE'}
                            </div>

                            {!solo && (
                            <div className="flex flex-col gap-8">
                                <div className="flex justify-between items-end px-4">
                                    <div className="flex items-center gap-6">
                                        <span className="text-6xl text-right">{p2?.avatar || '👤'}</span>
                                        <span className="text-5xl font-black uppercase text-white tracking-widest italic">{p2?.name}</span>
                                    </div>
                                    <span className="text-7xl font-black font-mono text-[#ff00ff] drop-shadow-[0_0_20px_rgba(255,0,255,0.5)]">{Math.min(100, Math.round(p2Progress))}%</span>
                                </div>
                                <div className="h-24 bg-[#0d0f1a] rounded-[2rem] border-4 border-[#ff00ff]/30 overflow-hidden p-2 shadow-inner">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-[#ff00ff] to-[#cc00ff] rounded-[1rem] shadow-[0_0_40px_rgba(255,0,255,0.6)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, p2Progress)}%` }}
                                        transition={{ duration: 0.1 }}
                                    />
                                </div>
                            </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompeteHost;