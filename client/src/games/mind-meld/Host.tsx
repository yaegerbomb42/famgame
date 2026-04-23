import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface MindMeldHostProps {
    gameState: any;
}

const MindMeldHost: React.FC<MindMeldHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        prompt: currentQuestion = "SYNC YOUR THOUGHTS!", 
        submissions = {}, 
        matches = [], 
        timer: timeLeft 
    } = gameData || {};

    if (phase === 'RESULTS') {
        const hasLeaderboard = Object.values(players).some((p: any) => p.score > 0);
        if (hasLeaderboard) return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);

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
                        className="flex flex-col items-center text-center"
                    >
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(180deg)', 'hue-rotate(0deg)']
                            }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(255,0,255,0.5)] mb-8"
                        >
                            🔮
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase">
                            MIND <span className="text-[#00ffff]">MELD</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">Synchronize your brainwaves</p>
                    </motion.div>
                )}

                {(phase === 'PLAYING' || phase === 'PROCESSING') && (
                    <motion.div
                        key="submitting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="text-center mb-16 space-y-4">
                            <span className="text-2xl font-black text-[#00ffff] uppercase tracking-[0.4em] animate-pulse">TELEPATHIC PROMPT</span>
                            <h2 className="text-8xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_40px_rgba(0,255,255,0.3)]">
                                "{currentQuestion}"
                            </h2>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-8 max-w-6xl">
                            {participants.map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        y: submissions[p.id] ? [0, -20, 0] : 0,
                                        opacity: submissions[p.id] ? 1 : 0.4,
                                        scale: submissions[p.id] ? 1.1 : 1
                                    }}
                                    className={`relative w-32 h-32 rounded-[3.5rem] flex items-center justify-center text-6xl border-8 transition-all duration-500 bg-[#1a1f3a] ${
                                        submissions[p.id] 
                                            ? 'border-[#00ff00] shadow-[0_0_40px_rgba(0,255,0,0.5)]' 
                                            : 'border-white/10'
                                    }`}
                                >
                                    <span className="relative z-10">{p.avatar || '👤'}</span>
                                </motion.div>
                            ))}
                        </div>
                        
                        {timeLeft !== undefined && (
                            <motion.div 
                                className="mt-20 text-7xl font-black font-mono text-white/20 tracking-widest"
                                animate={{ opacity: [0.2, 0.5, 0.2] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <TimerRing timeLeft={timeLeft} maxTime={30} size={100} accentColor="var(--game-mind-meld)" accentGlow="var(--game-mind-meld-glow)" className="my-4" />
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {phase === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full h-full flex flex-col items-center pt-10 px-12"
                    >
                        <h2 className="text-7xl font-black mb-16 text-white uppercase tracking-tighter italic">
                            THE <span className="text-[#ffff00]">MELD</span> IS COMPLETE
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-7xl">
                            {/* MATCHES COLUMN */}
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-[#00ff00] uppercase tracking-widest italic flex items-center gap-6">
                                    <span>PERFECT MATCHES</span>
                                    <div className="h-1 flex-1 bg-[#00ff00]/20" />
                                </h3>
                                <div className="space-y-6 max-h-[50vh] overflow-y-auto scrollbar-hide p-4">
                                    {matches.length > 0 ? matches.map((match: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: -50, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="glass-panel p-8 rounded-[3rem] border-4 border-[#ffff00] flex items-center justify-between shadow-[0_0_40px_rgba(255,255,0,0.3)] bg-white/5"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex -space-x-4">
                                                    <div className="w-16 h-16 rounded-full bg-[#1a1f3a] border-4 border-white flex items-center justify-center text-4xl z-10">{players[match.p1]?.avatar}</div>
                                                    <div className="w-16 h-16 rounded-full bg-[#1a1f3a] border-4 border-white flex items-center justify-center text-4xl">{players[match.p2]?.avatar}</div>
                                                </div>
                                                <div>
                                                    <div className="text-3xl font-black text-white uppercase italic leading-none">"{match.answer}"</div>
                                                    <div className="text-sm font-black text-white/40 uppercase tracking-widest mt-1">
                                                        {players[match.p1]?.name} + {players[match.p2]?.name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-5xl font-black text-[#ffff00] italic">+1000</div>
                                        </motion.div>
                                    )) : (
                                        <div className="p-12 border-4 border-dashed border-white/5 rounded-[3rem] text-center">
                                            <p className="text-3xl font-black text-white/20 uppercase tracking-widest italic">NO BRAINWAVES MATCHED</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ALL ANSWERS COLUMN */}
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black text-white/20 uppercase tracking-widest italic flex items-center gap-6">
                                    <span>ALL THOUGHTS</span>
                                    <div className="h-1 flex-1 bg-white/5" />
                                </h3>
                                <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto scrollbar-hide p-4">
                                    {Object.entries(submissions).map(([id, ans]: [string, any], idx) => (
                                        <motion.div 
                                            key={id} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white/5 backdrop-blur-3xl p-6 rounded-[2.5rem] border-4 border-transparent hover:border-white/10 transition-all flex items-center gap-6"
                                        >
                                            <div className="text-4xl w-16 h-16 bg-[#1a1f3a] rounded-full flex items-center justify-center border-2 border-white/10">
                                                {players[id]?.avatar}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black uppercase text-white/30 tracking-widest">{players[id]?.name}</div>
                                                <div className="text-2xl font-black text-white italic">"{ans}"</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MindMeldHost;