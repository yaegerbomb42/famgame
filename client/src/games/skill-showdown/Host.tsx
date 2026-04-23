import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface SkillShowdownHostProps {
    gameState: any;
}

const SkillShowdownHost: React.FC<SkillShowdownHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        challenge, 
        submissions = {}, 
        timer
    } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);
    const isIntro = phase === 'INTRO';
    const showGame = phase === 'PLAYING' || phase === 'REVEAL' || isIntro;

    if (!showGame) return null;

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            {/* AMBIENT PARTICLES */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--game-skill)11,transparent_70%)]" />
            </div>

            {/* INSTRUCTIONS OVERLAY DURING INTRO */}
            <AnimatePresence>
                {isIntro && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0f1a]/95 backdrop-blur-xl"
                    >
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(255,255,0,0.6)] mb-8"
                        >
                            ⚡️
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase leading-none">
                            SKILL <span className="text-yellow-400">SHOWDOWN</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">Survival of the sharpest</p>
                    </motion.div>
                )}

                {phase === 'PLAYING' && challenge && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center w-full relative z-10 max-w-7xl"
                    >
                        <div className="mb-12">
                            <span className="text-3xl font-black text-white/20 uppercase tracking-[0.4em] block mb-4">CURRENT CHALLENGE:</span>
                            <h2 className="text-[8rem] font-black text-[#00ffff] italic tracking-tighter leading-none drop-shadow-[0_0_60px_rgba(0,255,255,0.5)] uppercase">
                                {challenge.title}
                            </h2>
                            <p className="text-4xl text-white/60 font-black uppercase tracking-widest mt-6 italic">"{challenge.instruction}"</p>
                        </div>

                        <div className="flex-1 w-full flex items-center justify-center min-h-[400px]">
                            <div className="bg-[#1a1f3a] p-16 rounded-[4rem] border-8 border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00ffff11] to-transparent opacity-50" />
                                
                                {challenge.type === 'MEMORY_GRID' && challenge.grid && (
                                    <div className="grid grid-cols-4 gap-6 w-[400px]">
                                        {challenge.grid.map((lit: boolean, i: number) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={`aspect-square rounded-3xl border-4 transition-all duration-500 ${lit ? 'bg-[#00ffff] shadow-[0_0_40px_#00ffff] border-white' : 'bg-[#0d0f1a] border-white/10'}`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {challenge.type === 'COLOR_MATCH' && challenge.targetColor && (
                                    <div className="flex flex-col items-center gap-8">
                                        <div className="w-80 h-80 rounded-[4rem] border-8 border-white shadow-2xl"
                                            style={{ backgroundColor: `rgb(${challenge.targetColor.r},${challenge.targetColor.g},${challenge.targetColor.b})` }} 
                                        />
                                        <span className="text-3xl font-black text-white/40 uppercase tracking-[0.3em]">REPRODUCE THIS TINT</span>
                                    </div>
                                )}

                                {challenge.type === 'PRECISION_TAP' && (
                                    <div className="flex flex-col items-center gap-12 w-[500px]">
                                        <div className="w-full h-16 bg-[#0d0f1a] rounded-full border-4 border-white/10 relative overflow-hidden">
                                            <div className="absolute h-full bg-[#00ff00]/40 blur-md" style={{ left: '80%', width: '10%' }} />
                                            <div className="absolute h-full border-x-2 border-[#00ff00] shadow-[0_0_20px_#00ff00]" style={{ left: '82.5%', width: '10%' }} />
                                            <motion.div 
                                                className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_15px_white]"
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                            />
                                        </div>
                                        <div className="text-5xl font-black text-[#00ffff] animate-pulse uppercase tracking-widest">PRECISION WINDOW OPEN</div>
                                    </div>
                                )}

                                {challenge.type === 'CIRCLE_DRAW' && (
                                    <div className="relative">
                                        <motion.div
                                            className="w-80 h-80 rounded-full border-12 border-dashed border-[#00ffff]/20"
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center text-9xl">⭕️</div>
                                    </div>
                                )}

                                {challenge.type === 'ANGLE_GUESS' && (
                                    <div className="text-[15rem] drop-shadow-2xl">📐</div>
                                )}
                            </div>
                        </div>

                        <div className="mt-16 flex items-center gap-16 bg-[#1a1f3a]/80 px-12 py-8 rounded-[3rem] border-4 border-white/10 shadow-2xl">
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-white/20 uppercase tracking-[0.4em] mb-2">TIME REMAINING</span>
                                <TimerRing timeLeft={timer} maxTime={30} size={100} accentColor="var(--game-skill)" accentGlow="var(--game-skill-glow)" className="my-4" />
                            </div>
                            <div className="h-20 w-px bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-white/20 uppercase tracking-[0.4em] mb-4">LOCKED IN</span>
                                <div className="flex gap-3">
                                    {participants.map((p: any) => (
                                        <motion.div
                                            key={p.id}
                                            animate={{ 
                                                scale: submissions[p.id] !== undefined ? 1.2 : 1,
                                                opacity: submissions[p.id] !== undefined ? 1 : 0.2
                                            }}
                                            className={`w-14 h-14 rounded-full border-4 flex items-center justify-center text-2xl transition-all ${
                                                submissions[p.id] !== undefined ? 'border-[#00ff00] bg-[#00ff00]/20 shadow-[0_0_20px_#00ff0044]' : 'border-white/10'
                                            }`}
                                        >
                                            {p.avatar}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full relative z-10 max-w-5xl"
                    >
                        <h2 className="text-6xl font-black text-white/40 uppercase tracking-[0.4em] mb-16 italic">ACCURACY RANKINGS</h2>
                        <div className="grid grid-cols-1 gap-6 w-full">
                            {Object.entries(submissions)
                                .sort((a: any, b: any) => b[1] - a[1])
                                .map(([pid, score]: [string, any], idx) => (
                                    <motion.div
                                        key={pid}
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-10 rounded-[3rem] border-8 flex items-center justify-between transition-all duration-700 relative overflow-hidden bg-[#1a1f3a] ${idx === 0 ? 'border-[#ffff00] shadow-[0_0_80px_rgba(255,255,0,0.3)]' : 'border-white/10'}`}
                                    >
                                        <div className="flex items-center gap-10">
                                            <div className="w-20 h-20 rounded-2xl bg-[#0d0f1a] border-4 border-white/10 flex items-center justify-center text-4xl font-black text-white/40">
                                                #{idx + 1}
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="text-6xl">{players[pid]?.avatar}</span>
                                                <span className="text-5xl font-black text-white uppercase italic">{players[pid]?.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-7xl font-black italic tracking-tighter ${idx === 0 ? 'text-[#ffff00]' : 'text-[#00ffff]'}`}>{Math.round(score)}%</span>
                                        </div>
                                        {idx === 0 && (
                                            <motion.div
                                                initial={{ scale: 5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 0.2, rotate: -15 }}
                                                className="absolute right-12 top-0 text-[#ffff00] font-black text-[12rem] pointer-events-none select-none"
                                            >
                                                ELITE
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillShowdownHost;