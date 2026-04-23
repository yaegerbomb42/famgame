import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface PollHostProps {
    gameState: any;
}

const PollHost: React.FC<PollHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { currentQuestion = "...", submissions = {}, correct = 50, timer: timeLeft } = gameData || {};

    if (phase === 'RESULTS' && gameData.currentRound === gameData.totalRounds - 1) {
        const hasLeaderboard = Object.values(players).some((p: any) => p.score > 0);
        if (hasLeaderboard) return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);
    const subCount = Object.keys(submissions).length;

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
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(255,255,0,0.5)] mb-8"
                        >
                            📊
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase leading-none">
                            POLL <span className="text-[#ffff00]">PARTY</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">WORLD STATISTICS CHALLENGE</p>
                    </motion.div>
                )}

                {phase === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="text-center mb-16 space-y-4">
                            <span className="text-2xl font-black text-[#ffff00] uppercase tracking-[0.4em] animate-pulse">GUESS THE STAT</span>
                            <h2 className="text-7xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_40px_rgba(0,255,255,0.4)] uppercase max-w-5xl">
                                "{currentQuestion}"
                            </h2>
                        </div>
                        
                        <div className="w-full max-w-4xl bg-white/5 h-20 rounded-[3rem] overflow-hidden border-4 border-white/5 mb-12 shadow-2xl relative p-2">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-[#00ffff] via-[#00ff00] to-[#ffff00] rounded-full shadow-[0_0_40px_rgba(0,255,255,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(subCount / Math.max(participants.length, 1)) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-md">
                                    {subCount} / {participants.length} GUESSES LOCKED
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8 max-w-6xl">
                            {participants.map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        scale: submissions[p.id] !== undefined ? 1.1 : 1,
                                        opacity: submissions[p.id] !== undefined ? 1 : 0.2
                                    }}
                                    className={`relative w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-5xl border-8 transition-all duration-500 bg-[#1a1f3a] ${
                                        submissions[p.id] !== undefined
                                            ? 'border-[#00ff00] shadow-[0_0_30px_rgba(0,255,0,0.5)]' 
                                            : 'border-white/10'
                                    }`}
                                >
                                    <span className="relative z-10">{p.avatar || '👤'}</span>
                                    {submissions[p.id] !== undefined && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-[#00ff00] text-black rounded-full p-2">
                                            ✅
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {timeLeft !== undefined && (
                            <div className="mt-16">
                                <TimerRing timeLeft={timeLeft} maxTime={20} size={120} accentColor="#ffff00" accentGlow="rgba(255,255,0,0.5)" />
                            </div>
                        )}
                    </motion.div>
                )}

                {(phase === 'REVEAL' || phase === 'RESULTS') && phase !== 'INTRO' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full h-full flex flex-col items-center justify-center pt-10"
                    >
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-black tracking-tighter text-white/40 italic uppercase italic max-w-4xl leading-tight">"{currentQuestion}"</h2>
                            <h3 className="text-9xl font-black uppercase tracking-tighter text-[#ffff00] mt-6 drop-shadow-[0_0_80px_rgba(255,255,0,0.8)] leading-none">
                                {correct}%
                            </h3>
                            <p className="text-3xl text-white/60 font-black uppercase tracking-[0.3em] mt-4">THE GLOBAL AVERAGE</p>
                        </div>

                        <div className="w-full max-w-7xl h-[40vh] relative flex items-end justify-center px-20 gap-4 pb-20">
                            {/* SCALE BAR */}
                            <div className="absolute bottom-0 left-20 right-20 h-4 bg-white/10 rounded-full">
                                {[0, 25, 50, 75, 100].map(val => (
                                    <div key={val} className="absolute h-8 w-1 bg-white/20 top-0 -translate-y-1/2" style={{ left: `${val}%` }}>
                                        <span className="absolute top-10 left-1/2 -translate-x-1/2 text-xl font-black text-white/20">{val}%</span>
                                    </div>
                                ))}
                            </div>

                            {/* PLAYER MARKERS */}
                            {participants.map((player: any) => {
                                const guess = submissions[player.id] || 0;
                                const diff = Math.abs(guess - correct);
                                const isClosest = diff === Math.min(...participants.map((p: any) => Math.abs((submissions[p.id] || 0) - correct)));

                                return (
                                    <motion.div
                                        key={player.id}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="absolute top-0 flex flex-col items-center"
                                        style={{ left: `calc(${guess}% + 80px)`, transform: 'translateX(-50%)' }}
                                    >
                                        <div className={`relative p-4 rounded-[2rem] border-4 ${isClosest ? 'border-[#ffff00] bg-[#ffff00] text-black scale-125 z-20 shadow-[0_0_40px_rgba(255,255,0,0.5)]' : 'border-white/20 bg-[#1a1f3a] text-white z-10'}`}>
                                            <div className="text-5xl mb-1">{player.avatar || '👤'}</div>
                                            <div className="text-2xl font-black leading-none">{guess}%</div>
                                            {isClosest && <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">👑</div>}
                                        </div>
                                        <div className={`w-1 h-32 ${isClosest ? 'bg-[#ffff00]' : 'bg-white/10'}`} />
                                    </motion.div>
                                );
                            })}
                            
                            {/* CORRECT INDICATOR */}
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: '60vh' }}
                                className="absolute bottom-0 w-4 bg-white shadow-[0_0_50px_white] rounded-t-full z-0 opacity-20"
                                style={{ left: `calc(${correct}% + 80px)`, transform: 'translateX(-50%)' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PollHost;