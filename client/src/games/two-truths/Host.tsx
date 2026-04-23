import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface TwoTruthsHostProps {
    gameState: any;
}

const TwoTruthsHost: React.FC<TwoTruthsHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        playerOrder = [], 
        subjectIndex = 0, 
        submissions = {}, 
        timer: timeLeft,
        subPhase 
    } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const currentSubjectId = playerOrder[subjectIndex];
    const subject = currentSubjectId ? players[currentSubjectId] : null;
    const submission = currentSubjectId ? submissions[currentSubjectId] : null;
    
    // Combine truths and lie into a list for display
    const statements = (submission && submission.statements) ? submission.statements.map((text: string, i: number) => ({
        text,
        isLie: i === submission.lieIndex
    })) : [];

    const participants = Object.values(players).filter((p: any) => !p.isHost);

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            {/* AMBIENT POLARIZED ATMOSPHERE */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#ff00ff22,transparent_50%)]" />
                <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#00ffff22,transparent_50%)]" />
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
                            animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(255,170,0,0.6)] mb-8"
                        >
                            🤥
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase">
                            TWO TRUTHS <span className="text-[#ff00ff]">ONE LIE</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">Trust is a luxury</p>
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'INPUT') && (
                    <motion.div
                        key="writing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full relative z-10"
                    >
                        <div className="text-center mb-16 space-y-4">
                            <span className="text-3xl font-black text-[#ff00ff] uppercase tracking-[0.4em] animate-pulse">CRAFTING DECEPTIONS</span>
                            {timeLeft !== undefined && (
                                <TimerRing timeLeft={timeLeft} maxTime={30} size={100} accentColor="var(--game-two-truths)" accentGlow="var(--game-two-truths-glow)" className="my-4" />
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 max-w-7xl">
                            {participants.map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        y: submissions[p.id] ? [0, -20, 0] : 0,
                                        scale: submissions[p.id] ? 1.1 : 1,
                                        opacity: submissions[p.id] ? 1 : 0.3
                                    }}
                                    className={`relative w-28 h-28 rounded-[3rem] flex items-center justify-center text-5xl border-8 transition-all duration-500 bg-[#1a1f3a] ${
                                        submissions[p.id] 
                                            ? 'border-[#ff00ff] shadow-[0_0_40px_rgba(255,0,255,0.5)]' 
                                            : 'border-white/10'
                                    }`}
                                >
                                    <span className="relative z-10">{p.avatar || '👤'}</span>
                                    {submissions[p.id] && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-[#ff00ff] text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl font-black shadow-lg">✓</motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'VOTING' || phase === 'REVEAL') && subject && (
                    <motion.div
                        key="gameplay"
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="max-w-6xl w-full relative z-10"
                    >
                        <div className="flex flex-col items-center mb-12">
                            <div className="text-8xl mb-4 bg-white/5 p-8 rounded-full border-4 border-[#ffaa00] shadow-2xl">{subject.avatar}</div>
                            <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                                {subject.name}'S <span className="text-[#ffaa00]">SECRETS</span>
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {statements.map((st: any, i: number) => {
                                const isBest = phase === 'REVEAL' && st.isLie;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ 
                                            x: 0, 
                                            opacity: 1,
                                            scale: isBest ? 1.05 : 1
                                        }}
                                        transition={{ delay: i * 0.2 }}
                                        className={`p-10 rounded-[3rem] border-8 flex items-center justify-between transition-all duration-700 relative overflow-hidden ${
                                            isBest 
                                                ? 'border-[#ff00ff] shadow-[0_0_100px_rgba(255,0,255,0.4)] bg-[#ff00ff]/20' 
                                                : 'border-white/10 bg-[#1a1f3a]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-10">
                                            <div className={`w-20 h-20 rounded-2xl border-4 flex items-center justify-center text-3xl font-black ${isBest ? 'bg-white text-[#ff00ff] border-white' : 'bg-[#0d0f1a] text-white/20 border-white/20'}`}>
                                                {i + 1}
                                            </div>
                                            <p className="text-4xl font-black text-white italic leading-tight uppercase font-display">
                                                "{st.text}"
                                            </p>
                                        </div>

                                        <div className="flex -space-x-4">
                                            {Object.entries(gameData.votes || {})
                                                .filter(([, voteIdx]) => (voteIdx as number) === i)
                                                .map(([pid]) => (
                                                    <motion.div
                                                        key={pid}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="w-14 h-14 rounded-full bg-[#00ffff] border-4 border-[#1a1f3a] flex items-center justify-center text-2xl shadow-lg border-2 border-white/20"
                                                    >
                                                        {players[pid]?.avatar}
                                                    </motion.div>
                                                ))
                                            }
                                        </div>

                                        {isBest && (
                                            <motion.div
                                                initial={{ scale: 5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1, rotate: -15 }}
                                                className="absolute right-12 top-0 text-[#ff00ff] font-black text-[10rem] pointer-events-none drop-shadow-2xl opacity-40 select-none"
                                            >
                                                LIE!
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {(phase === 'PLAYING' && subPhase === 'VOTING') && (
                            <motion.div className="mt-12 text-center">
                                <span className="text-3xl font-black text-[#00ffff] uppercase tracking-[0.5em] animate-pulse">VOTES ROLLING IN</span>
                                <TimerRing timeLeft={timeLeft} maxTime={30} size={100} accentColor="var(--game-two-truths)" accentGlow="var(--game-two-truths-glow)" className="my-4" />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TwoTruthsHost;