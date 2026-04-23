import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface HotTakesHostProps {
    gameState: any;
}

const HotTakesHost: React.FC<HotTakesHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { submissions = {}, votes = {}, timeLeft, prompt = "WHAT'S YOUR TAKE?", subPhase } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
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
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(255,100,0,0.5)] mb-8"
                        >
                            🔥
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase">
                            HOT <span className="text-[#ff4500]">TAKES</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em] mb-4">Spicy opinions ONLY</p>
                        <div className="bg-[#ff4500]/20 border-4 border-[#ff4500]/50 p-6 rounded-3xl max-w-4xl backdrop-blur-md">
                            <p className="text-3xl text-white font-bold leading-relaxed">
                                Write your most unhinged take on the topic. Then, vote for the take you agree with most. Let the chaos begin.
                            </p>
                        </div>
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'INPUT') && (
                    <motion.div
                        key="submitting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="text-center mb-16 space-y-4">
                            <span className="text-2xl font-black text-[#ff4500] uppercase tracking-[0.4em] animate-pulse">CURRENT TOPIC</span>
                            <h2 className="text-8xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                                "{prompt}"
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
                                <TimerRing timeLeft={timeLeft} maxTime={30} size={100} accentColor="var(--game-hot-takes)" accentGlow="var(--game-hot-takes-glow)" className="my-4" />
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'VOTE') && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full h-full flex flex-col items-center pt-12"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-5xl font-black tracking-tighter text-white/40 italic max-w-4xl mx-auto uppercase">
                                "{prompt}"
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-10 w-full max-w-7xl overflow-y-auto scrollbar-hide px-8 pb-32">
                            {Object.entries(submissions).map(([pid, text]: [string, any]) => {
                                const entryVotes = Object.values(votes).filter(v => v === pid);
                                return (
                                    <motion.div
                                        key={pid}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="glass-panel p-12 rounded-[4rem] border-4 border-white/5 flex flex-col items-center justify-center text-center min-h-[400px] relative bg-white/5 backdrop-blur-3xl group hover:border-[#ff4500]/30 transition-all shadow-2xl"
                                    >
                                        <div className="absolute top-8 left-10 text-8xl opacity-5 font-black italic text-[#ff4500] select-none">
                                            SPICY
                                        </div>
                                        <span className="text-5xl font-black leading-tight z-10 text-white italic drop-shadow-lg px-4">
                                            "{text}"
                                        </span>

                                        <div className="flex flex-wrap justify-center gap-4 mt-12 min-h-[5rem]">
                                            {entryVotes.map((voterId: any, vIdx) => (
                                                <motion.div
                                                    key={voterId + vIdx}
                                                    initial={{ scale: 0, rotate: -20 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    className="w-20 h-20 rounded-[1.5rem] bg-[#1a1f3a] border-4 border-[#00ffff] flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(0,255,255,0.4)]"
                                                >
                                                    {players[voterId as string]?.avatar || '👾'}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HotTakesHost;