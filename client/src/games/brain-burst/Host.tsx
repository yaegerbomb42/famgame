import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';

interface BrainBurstHostProps {
    gameState: any;
}

const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

const BrainBurstHost: React.FC<BrainBurstHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        question: currentQuestion, 
        tier, 
        tiers, 
        timer, 
        submissions, 
        fiftyFiftyDisabled = [],
        questionIndex
    } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const answerCount = Object.keys(submissions || {}).length;
    const playerCount = Object.values(players).filter((p: any) => !p.isHost).length;

    return (
        <div className="flex w-full h-full relative overflow-hidden">
            <GameTransition phase={phase} gameState={gameState} isHost={true} />
            
            <AnimatePresence mode="wait">
                {(phase === 'INTRO' || phase === 'COUNTDOWN') && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex-1 flex flex-col items-center justify-center gap-12"
                    >
                        <motion.div
                            animate={{ 
                                rotate: [0, -5, 5, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="text-[15rem] drop-shadow-[0_0_60px_rgba(0,255,255,0.5)]"
                        >
                            🧠
                        </motion.div>
                        <div className="text-center">
                            <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4">
                                BRAIN <span className="text-[#00ffff]">BURST</span>
                            </h1>
                            <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">The High-Stakes Trivia</p>
                        </div>
                    </motion.div>
                )}

                {(phase === 'PLAYING' || phase === 'REVEAL') && currentQuestion && (
                    <motion.div
                        key={`q-${questionIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex"
                    >
                        {/* THE LADDER */}
                        <div className="w-80 p-8 flex flex-col justify-center gap-3 bg-[#1a1f3a]/80 backdrop-blur-xl border-r-4 border-white/5">
                            {[...tiers].reverse().map((t) => {
                                const isCurrent = t.level === tier.level;
                                const isPast = t.level < tier.level;
                                return (
                                    <motion.div
                                        key={t.level}
                                        animate={isCurrent ? {
                                            x: 20,
                                            backgroundColor: 'rgba(0,255,255,0.2)',
                                            borderColor: '#00ffff'
                                        } : {}}
                                        className={`flex justify-between items-center px-6 py-3 rounded-[2rem] border-4 transition-all duration-500
                                            ${isCurrent ? 'text-[#00ffff] font-black shadow-[0_0_30px_rgba(0,255,255,0.2)]' : 'text-white/10 border-transparent'}
                                            ${isPast ? 'opacity-20' : ''}
                                        `}
                                    >
                                        <span className="text-sm font-black opacity-50">L{t.level}</span>
                                        <span className="text-xl font-black">{t.points} </span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* CONTENT AREA */}
                        <div className="flex-1 flex flex-col items-center justify-center p-20 gap-16 relative">
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="px-10 py-3 bg-[#1a1f3a] border-4 border-[#00ffff]/30 rounded-full text-[#00ffff] font-black uppercase tracking-[0.4em] text-xs shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                            >
                                Round {questionIndex + 1} • {tier.points} Points
                            </motion.div>

                            <h2 className="text-8xl font-black text-center leading-[1.1] tracking-tighter text-white max-w-6xl">
                                {currentQuestion.q}
                            </h2>

                            <div className="grid grid-cols-2 gap-10 w-full max-w-6xl">
                                {currentQuestion.a.map((answer: string, i: number) => {
                                    const isDisabled = fiftyFiftyDisabled.includes(i);
                                    const isCorrect = i === currentQuestion.correct;
                                    const showReveal = phase === 'REVEAL';

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ y: 50, opacity: 0 }}
                                            animate={{ 
                                                y: 0, 
                                                opacity: isDisabled ? 0.05 : 1,
                                                scale: showReveal && isCorrect ? 1.05 : 1,
                                                borderColor: showReveal && isCorrect ? '#00ff00' : 'rgba(255,255,255,0.1)',
                                                backgroundColor: showReveal && isCorrect ? 'rgba(0,255,0,0.1)' : 'rgba(26,31,58,0.8)'
                                            }}
                                            className={`p-10 flex items-center gap-8 border-4 rounded-[3rem] backdrop-blur-md transition-all duration-500`}
                                            style={{
                                                boxShadow: showReveal && isCorrect ? '0 0 60px rgba(0,255,0,0.3)' : 'none'
                                            }}
                                        >
                                            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-4xl font-black
                                                ${showReveal && isCorrect ? 'bg-[#00ff00] text-[#0d0f1a]' : 'bg-white/5 text-white/30'}
                                            `}>
                                                {ANSWER_LABELS[i]}
                                            </div>
                                            <span className="text-4xl font-black text-white italic tracking-tight">{answer}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* TIMER & STATS */}
                            {phase === 'PLAYING' && (
                                <div className="absolute bottom-20 w-full max-w-5xl px-12 space-y-4">
                                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1">
                                        <motion.div
                                            animate={{ width: `${(timer / 20) * 100}%` }}
                                            className={`h-full rounded-full ${timer <= 5 ? 'bg-[#ffff00] animate-pulse' : 'bg-gradient-to-r from-[#00ffff] to-[#00ff00]'} shadow-[0_0_20px_rgba(0,255,255,0.3)]`}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-white/40 font-black uppercase tracking-[0.3em]">
                                        <span>{answerCount} / {playerCount} SUBMITTED</span>
                                        <span className={`text-4xl ${timer <= 5 ? 'text-[#ffff00] animate-bounce' : ''}`}>{timer}S</span>
                                    </div>
                                </div>
                            )}

                            {phase === 'REVEAL' && (
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="flex flex-wrap justify-center gap-6 absolute bottom-20 w-full"
                                >
                                    {Object.entries(submissions || {}).map(([pid, ans]) => {
                                        const player = players[pid];
                                        if (!player) return null;
                                        const isCorrect = ans === currentQuestion.correct;
                                        return (
                                            <motion.div 
                                                key={pid}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`flex items-center gap-4 px-6 py-3 rounded-[2rem] border-4 ${isCorrect ? 'bg-[#00ff00]/20 border-[#00ff00]' : 'bg-white/5 border-white/10 opacity-30'}`}
                                            >
                                                <span className="text-3xl">{player.avatar || '👤'}</span>
                                                <span className="font-black text-xl text-white">{player.name}</span>
                                                {isCorrect && <span className="text-[#00ff00] font-black text-xl">+{tier.points}</span>}
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BrainBurstHost;