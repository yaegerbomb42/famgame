import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface AIMashupHostProps {
    gameState: any;
}

const AIMashupHost: React.FC<AIMashupHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { submissions = {}, timer = 0 } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);
    const submissionList = Object.entries(submissions).map(([pid, sub]: [string, any]) => ({
        playerId: pid,
        prompt: sub.prompt,
        timestamp: sub.timestamp
    }));

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0a0a0a]">
            {/* AMBIENT AI NEURAL NETWORK BOKEH */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ 
                            x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                            y: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                            scale: [1, 1.5, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ 
                            duration: 10 + Math.random() * 20, 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-[#00ffff22] to-[#ff00ff22] blur-3xl"
                        style={{ left: "-10%", top: "-10%" }}
                    />
                ))}
            </div>

            <GameTransition phase={phase} gameState={gameState} isHost={true} />

            <AnimatePresence mode="wait">
                {(phase === 'INTRO' || phase === 'COUNTDOWN') && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center relative z-10"
                    >
                        <motion.div 
                            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                            className="text-[15rem] drop-shadow-[0_0_80px_rgba(0,255,255,0.4)] mb-8"
                        >
                            🤖
                        </motion.div>
                        <h1 className="text-[12rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase leading-none">
                            AI <span className="text-[#ff00ff]">MASHUP</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">De-synthesizing reality</p>
                    </motion.div>
                )}

                {phase === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full relative z-10 max-w-7xl"
                    >
                        <div className="mb-16">
                            <span className="text-3xl font-black text-white/20 uppercase tracking-[0.4em] block mb-4">INJECTING DATA</span>
                            <h2 className="text-[10rem] font-black text-[#00ffff] italic tracking-tighter leading-none drop-shadow-[0_0_60px_#00ffff44] uppercase">
                                PROMPT TIME
                            </h2>
                        </div>

                        <div className="flex-1 w-full grid grid-cols-3 gap-8 p-10">
                            {participants.map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        y: submissions[p.id] ? [0, -20, 0] : 0,
                                        scale: submissions[p.id] ? 1.05 : 1,
                                        borderColor: submissions[p.id] ? '#ff00ff' : 'rgba(255,255,255,0.05)',
                                        backgroundColor: submissions[p.id] ? 'rgba(255,0,255,0.1)' : 'rgba(255,255,255,0.05)'
                                    }}
                                    className="p-10 rounded-[3.5rem] border-8 flex flex-col items-center gap-6 relative overflow-hidden backdrop-blur-3xl"
                                >
                                    <div className="text-8xl scale-125 mb-4">{p.avatar || '👤'}</div>
                                    <span className="text-3xl font-black text-white uppercase italic tracking-tighter truncate w-full">{p.name}</span>
                                    {submissions[p.id] && (
                                        <motion.div 
                                            initial={{ scale: 0 }} 
                                            animate={{ scale: 1 }}
                                            className="absolute top-4 right-4 bg-[#ff00ff] text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl font-black shadow-lg"
                                        >
                                            ✓
                                        </motion.div>
                                    )}
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${submissions[p.id] ? 'bg-[#ff00ff] animate-pulse' : 'bg-white/10'}`} />
                                        <span className="text-xs font-black text-white/20 uppercase tracking-widest">
                                            {submissions[p.id] ? 'UPLINK COMPLETE' : 'WAITING FOR DATA'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-20 flex flex-col items-center gap-4">
                            <span className="text-2xl font-black text-white/20 uppercase tracking-[0.5em]">SYSTEM STABILITY</span>
                            <div className="w-96 h-4 bg-white/5 rounded-full overflow-hidden border-2 border-white/10 p-1">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-[#00ffff] to-[#ff00ff]"
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${(timer / 45) * 100}%` }}
                                />
                            </div>
                            <TimerRing timeLeft={timer} maxTime={45} size={100} accentColor="var(--game-ai-mashup)" accentGlow="var(--game-ai-mashup-glow)" className="my-4" />
                        </div>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full relative z-10 max-w-7xl overflow-hidden h-[80vh]"
                    >
                        <h2 className="text-6xl font-black text-white/40 uppercase tracking-[0.4em] mb-12 italic">DATA RECONSTRUCTION</h2>
                        
                        <div className="flex-1 w-full overflow-y-auto scrollbar-hide px-20 pb-20">
                            <div className="grid grid-cols-2 gap-12">
                                {submissionList.map((sub: any, i: number) => (
                                    <motion.div
                                        key={sub.playerId}
                                        initial={{ x: i % 2 === 0 ? -100 : 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.2 }}
                                        className="bg-[#1a1f3a] p-12 rounded-[4rem] border-8 border-[#00ffff]/20 shadow-2xl relative group flex flex-col items-center gap-10"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#00ffff11] to-transparent opacity-50" />
                                        <div className="flex items-center gap-6 relative z-10 w-full">
                                            <div className="w-24 h-24 rounded-3xl bg-[#0d0f1a] border-4 border-white/10 flex items-center justify-center text-6xl shadow-inner">
                                                {players[sub.playerId]?.avatar}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <span className="text-sm font-black text-[#00ffff] uppercase tracking-widest block mb-1">DATA SOURCE</span>
                                                <span className="text-4xl font-black text-white uppercase italic tracking-tighter truncate block">{players[sub.playerId]?.name}</span>
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-white/10 relative z-10" />
                                        <p className="text-5xl font-black text-white italic tracking-tighter relative z-10 uppercase leading-tight line-clamp-3">
                                            "{sub.prompt}"
                                        </p>
                                        <div className="absolute top-4 right-8 text-[10rem] font-black text-[#00ffff] opacity-[0.03] pointer-events-none select-none italic tracking-tighter leading-none">
                                            MASH {i + 1}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIMashupHost;