import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface TriviaHostProps {
    gameState: any;
}

const TriviaHost: React.FC<TriviaHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        question, 
        availableCategories = [], 
        votes = {}, 
        submissions = {}, 
        timer: hostTimer,
        timeLeft: hostTimeLeft,
        round = 0,
        totalRounds = 5,
        roundResults = {}
    } = gameData || {};
    const serverTimeLeft = hostTimer ?? hostTimeLeft ?? 0;

    const [localTimeLeft, setLocalTimeLeft] = useState(serverTimeLeft);

    useEffect(() => {
        setLocalTimeLeft(serverTimeLeft);
        if (serverTimeLeft <= 0 || (phase !== 'PLAYING' && phase !== 'VOTING')) return;
        
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - start) / 1000;
            setLocalTimeLeft(Math.max(0, serverTimeLeft - elapsed));
        }, 100);
        return () => clearInterval(interval);
    }, [serverTimeLeft, phase]);
    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach((cat: any) => {
        voteCounts[cat] = (voteCounts[cat] || 0) + 1;
    });

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            {/* AMBIENT BRAINWAVES + SPOTLIGHT */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--game-trivia)11,transparent_70%)]" />
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-spotlight" />
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
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(0,255,255,0.6)] mb-8"
                        >
                            🧠
                        </motion.div>
                        <h1 className="text-[12rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase leading-none">
                            PURE <span className="text-cyan-400">TRIVIA</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em] mb-4">The ultimate brain flex</p>
                        <p className="text-3xl text-cyan-400 font-black uppercase tracking-widest mt-4">Answer fast to keep your streak alive!</p>
                        <motion.div className="mt-8 flex gap-3">
                            {['❓','💡','🧪','📚','🔬'].map((e, i) => (
                                <motion.span key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} className="text-5xl">{e}</motion.span>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {phase === 'LOADING' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center text-center relative z-10"
                    >
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="w-32 h-32 border-8 border-[#00ffff] border-t-transparent rounded-full mb-8 shadow-[0_0_30px_#00ffff44]"
                        />
                        <h2 className="text-5xl font-black text-white uppercase italic tracking-widest animate-pulse">
                            GENERATING <span className="text-[#00ffff]">LIVE</span> QUESTIONS...
                        </h2>
                    </motion.div>
                )}

                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full relative z-10 max-w-7xl"
                    >
                        <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#ff00ff] uppercase tracking-widest mb-16 italic text-center drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                            SELECT CATEGORY
                        </h2>
                        <div className="flex flex-wrap justify-center gap-6 w-full max-h-[60vh] overflow-y-auto px-4 py-8 custom-scrollbar">
                            {availableCategories.map((cat: string, index: number) => {
                                const votes = voteCounts[cat] || 0;
                                const isLeading = votes > 0 && votes === Math.max(...Object.values(voteCounts));
                                return (
                                <motion.div
                                    key={cat}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 min-w-[280px] flex-1 max-w-[400px] transition-all duration-500 overflow-hidden ${
                                        isLeading 
                                            ? 'bg-gradient-to-br from-[#00ffff]/20 to-[#ff00ff]/20 border-4 border-[#00ffff] shadow-[0_0_50px_rgba(0,255,255,0.3)] scale-105 z-10' 
                                            : 'bg-white/5 border-2 border-white/10 hover:border-white/30 backdrop-blur-xl'
                                    }`}
                                >
                                    {isLeading && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ffff]/10 to-transparent -translate-x-[200%] animate-[shimmer_2s_infinite]" />
                                    )}
                                    <span className={`text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-center leading-tight drop-shadow-lg ${isLeading ? 'text-white' : 'text-white/70'}`}>
                                        {cat}
                                    </span>
                                    
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {[...Array(votes)].map((_, i) => (
                                            <motion.div 
                                                key={i} 
                                                initial={{ scale: 0, rotate: -180 }} 
                                                animate={{ scale: 1, rotate: 0 }}
                                                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00ffff] to-[#ff00ff] border-4 border-[#0d0f1a] shadow-[0_0_20px_rgba(0,255,255,0.5)] flex items-center justify-center" 
                                            >
                                                <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    {votes === 0 && (
                                        <span className="text-white/20 font-bold uppercase tracking-widest text-sm">No votes yet</span>
                                    )}
                                </motion.div>
                            )})}
                        </div>
                        <div className="mt-16 text-2xl font-black text-white/50 uppercase tracking-widest animate-pulse bg-white/5 px-8 py-4 rounded-full border border-white/10">
                            Waiting for Host or Majority Vote...
                        </div>
                    </motion.div>
                )}

                {phase === 'PLAYING' && question && (() => {
                    const options = Array.isArray(question.a) && question.a.length > 0 ? question.a : (Array.isArray(question.options) ? question.options : ['','','','']);
                    return (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full relative z-10 max-w-7xl"
                    >
                        <div className="mb-12 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-6">
                                <span className="bg-white/10 px-8 py-3 rounded-full text-2xl font-black text-white/60 tracking-widest uppercase border-2 border-white/5">
                                    Question {round + 1} / {totalRounds}
                                </span>
                                <div className="h-4 w-48 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                                    <motion.div 
                                        className="h-full bg-[#00ffff] rounded-full shadow-[0_0_15px_#00ffff]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((round + 1) / totalRounds) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.span 
                                    key={question.difficulty}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className={`text-xl font-black uppercase tracking-[0.3em] px-4 py-1 rounded ${
                                        question.difficulty === 'Hard' ? 'text-red-500 bg-red-500/10' :
                                        question.difficulty === 'Medium' ? 'text-yellow-500 bg-yellow-500/10' :
                                        'text-emerald-500 bg-emerald-500/10'
                                    }`}
                                >
                                    {question.difficulty || 'Normal'} Mode
                                </motion.span>
                            </AnimatePresence>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-tight drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] mb-10 md:mb-16 uppercase max-w-6xl">
                            {question.q}
                        </h2>

                        <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-6xl">
                            {options.map((ans: any, i: number) => {
                                const text = typeof ans === 'string' ? ans : (ans?.text || ans?.answer || '');
                                return (
                                <motion.div
                                    key={i}
                                    initial={{ x: i % 2 === 0 ? -100 : 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-[#1a1f3a] p-6 sm:p-10 rounded-[2.5rem] border-4 border-white/10 flex items-center gap-6 sm:gap-8 text-left h-full"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-[#00ffff] text-[#0d0f1a] flex-shrink-0 flex items-center justify-center text-4xl font-black">
                                        {['A', 'B', 'C', 'D'][i]}
                                    </div>
                                    <span className="text-2xl sm:text-3xl font-black text-white uppercase italic break-words leading-tight">{text}</span>
                                </motion.div>
                                );
                            })}
                        </div>

                        <div className="mt-16 flex items-center gap-12">
                            <div className="flex -space-x-4">
                                {participants.map((p: any) => (
                                    <motion.div
                                        key={p.id}
                                        animate={{ 
                                            y: submissions[p.id] !== undefined ? [0, -20, 0] : 0,
                                            scale: submissions[p.id] !== undefined ? 1.2 : 1,
                                            opacity: submissions[p.id] !== undefined ? 1 : 0.2
                                        }}
                                        className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl transition-all ${
                                            submissions[p.id] !== undefined ? 'border-[#ff00ff] bg-[#ff00ff]/20 shadow-[0_0_30px_#ff00ff44]' : 'border-white/10'
                                        }`}
                                    >
                                        {p.avatar}
                                    </motion.div>
                                ))}
                            </div>
                            <TimerRing timeLeft={localTimeLeft} maxTime={25} size={140} accentColor="var(--game-trivia)" accentGlow="var(--game-trivia-glow)" />
                        </div>
                    </motion.div>
                    );
                })}

                {phase === 'REVEAL' && question && (() => {
                    const options = Array.isArray(question.a) && question.a.length > 0 ? question.a : (Array.isArray(question.options) ? question.options : ['','','','']);
                    const correctAns = options[question.correct];
                    const correctText = typeof correctAns === 'string' ? correctAns : (correctAns?.text || correctAns?.answer || '');
                    
                    return (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center relative z-10 w-full max-w-7xl px-4"
                    >
                        <h2 className="text-6xl md:text-8xl font-black text-white uppercase tracking-widest mb-10 animate-pulse transition-all drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">THE ANSWER IS...</h2>
                        <motion.div 
                            initial={{ scale: 0.8, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-[#00ff00] p-12 md:p-16 rounded-[3rem] shadow-[0_0_100px_rgba(0,255,0,0.4)] border-8 border-white w-full max-w-5xl"
                        >
                            <span className="text-5xl md:text-7xl font-black text-[#0d0f1a] uppercase italic tracking-tighter drop-shadow-md break-words leading-tight">
                                {correctText}
                            </span>
                        </motion.div>
                        
                        <div className="mt-20 flex gap-4">
                            {participants.filter((p: any) => roundResults[p.id]?.correct).map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="bg-white/10 px-6 py-4 rounded-[2rem] flex items-center gap-4 border-2 border-[#00ff00]"
                                >
                                    <span className="text-4xl">{p.avatar}</span>
                                    <span className="text-2xl font-black text-white uppercase italic">{p.name} GOT IT!</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default TriviaHost;