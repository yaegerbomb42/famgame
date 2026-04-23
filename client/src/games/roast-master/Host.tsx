import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface RoastMasterHostProps {
    gameState: { phase?: string; gameData: any; players: Record<string, any>; };
}

const RoastMasterHost: React.FC<RoastMasterHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        currentRoastIdx: currentRoastIndex = 0,
        timer: timeLeft,
        roasts = [],
        assignments = {},
        subPhase
    } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost) as any[];
    const submissionList = (roasts || []).map((r: any) => ({
        target: r.targetName,
        text: r.text,
        trait: r.trait,
        author: players[r.authorId]?.name || "???"
    }));

    const currentRoast = submissionList[currentRoastIndex];

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            {/* AMBIENT FIRE EFFECTS */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#ff0000] to-transparent animate-pulse" />
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#ffaa00] rounded-full blur-[150px] animate-blob" />
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#ff00ff] rounded-full blur-[150px] animate-blob animation-delay-2000" />
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
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(255,100,0,0.6)] mb-8"
                        >
                            🔥
                        </motion.div>
                        <h1 className="text-[12rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] mb-4 uppercase leading-none">
                            ROAST <span className="text-[#ffaa00]">MASTER</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">Bring the heat or get smoked</p>
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'WRITING') && (
                    <motion.div
                        key="writing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full relative z-10"
                    >
                        <div className="text-center mb-16 space-y-4">
                            <span className="text-3xl font-black text-[#ffaa00] uppercase tracking-[0.4em] animate-pulse">INCINERATION IN PROGRESS</span>
                            {timeLeft !== undefined && (
                                <TimerRing timeLeft={timeLeft} maxTime={30} size={100} accentColor="var(--game-roast)" accentGlow="var(--game-roast-glow)" className="my-4" />
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-7xl">
                            {participants.map((p, idx) => (
                                <motion.div
                                    key={p.id || idx}
                                    animate={{ 
                                        y: assignments[p.id]?.roast ? [0, -20, 0] : 0,
                                        scale: assignments[p.id]?.roast ? 1.1 : 1,
                                        opacity: assignments[p.id]?.roast ? 1 : 0.3
                                    }}
                                    className={`relative w-32 h-32 rounded-[3.5rem] flex items-center justify-center text-6xl border-8 transition-all duration-500 bg-[#1a1f3a] ${
                                        assignments[p.id]?.roast 
                                            ? 'border-[#ffaa00] shadow-[0_0_40px_rgba(255,170,0,0.5)]' 
                                            : 'border-white/10'
                                    }`}
                                >
                                    <span className="relative z-10">{p.avatar || '👤'}</span>
                                    {(assignments[p.id]?.roast) && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-[#ffaa00] text-[#0d0f1a] w-12 h-12 rounded-full flex items-center justify-center text-3xl font-black shadow-lg">✓</motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'READING') && currentRoast && (
                    <motion.div
                        key="reading"
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="max-w-6xl w-full relative z-10"
                    >
                        <div className="glass-panel p-20 rounded-[5rem] border-8 border-[#ffaa00] shadow-[0_0_100px_rgba(255,170,0,0.3)] bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-3xl relative overflow-hidden">
                            {/* SPICE OVERLAY */}
                            <div className="absolute top-0 right-0 p-12">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], rotate: [12, 15, 12] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="bg-[#ff0000] text-white font-black text-3xl px-8 py-4 rounded-full shadow-2xl skew-x-12 border-4 border-white"
                                >
                                    EXTREME HEAT! 🔥
                                </motion.div>
                            </div>

                            <div className="flex flex-col space-y-12">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black text-[#ffaa00] uppercase tracking-[0.5em]">THE TARGET:</span>
                                        <span className="text-xl font-bold text-white/40 uppercase tracking-widest italic">{currentRoast.trait}</span>
                                    </div>
                                    <h2 className="text-[9rem] font-black text-white italic tracking-tighter leading-none uppercase">
                                        {currentRoast.target}
                                    </h2>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 12, ease: "linear" }}
                                        className="h-full bg-gradient-to-r from-[#ffaa00] to-[#ff0000]"
                                    />
                                </div>
                                <div className="relative">
                                    <p className="text-7xl font-black text-white leading-[1.1] font-display italic relative z-10">
                                        "{currentRoast.text}"
                                    </p>
                                    <div className="absolute -top-10 -left-10 text-[15rem] opacity-5 pointer-events-none text-white font-black italic">"</div>
                                </div>
                                <div className="pt-8 border-t border-white/5 flex justify-end">
                                    <span className="text-2xl font-black text-white/20 uppercase tracking-[0.3em]">DELIVERED BY: {currentRoast.author}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'VOTING') && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center relative z-10"
                    >
                        <motion.div 
                            animate={{ y: [0, -30, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-[12rem] drop-shadow-[0_0_50px_rgba(255,255,0,0.5)] mb-8"
                        >
                            🗳️
                        </motion.div>
                        <h1 className="text-9xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-8 uppercase">
                            WHO <span className="text-[#ffff00]">COOKED</span> THEM?
                        </h1>
                        
                        <div className="flex items-center gap-12">
                            <div className="text-4xl text-white/40 font-black uppercase tracking-[0.4em]">ALL VOTES COMING IN</div>
                            <TimerRing timeLeft={timeLeft} maxTime={30} size={100} accentColor="var(--game-roast)" accentGlow="var(--game-roast-glow)" className="my-4" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoastMasterHost;