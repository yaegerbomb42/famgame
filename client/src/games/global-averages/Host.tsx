import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface GlobalAveragesHostProps {
    gameState: any;
}

const GlobalAveragesHost: React.FC<GlobalAveragesHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        currentQuestion = '', 
        submissions = {}, 
        correct,
        timer: gameTimer
    } = gameData || {};

    const [revealedPercent, setRevealedPercent] = useState(0);
    const [showPins, setShowPins] = useState(false);

    useEffect(() => {
        if (phase === 'REVEAL' && correct !== undefined) {
            const t = setTimeout(() => {
                setRevealedPercent(correct);
                setTimeout(() => setShowPins(true), 1500);
            }, 1000);
            return () => clearTimeout(t);
        } else if (phase === 'INTRO' || phase === 'PLAYING') {
            setRevealedPercent(0);
            setShowPins(false);
        }
    }, [phase, correct]);

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);
    const isIntro = phase === 'INTRO';
    const showGame = phase === 'PLAYING' || phase === 'REVEAL' || isIntro;

    if (!showGame) return null;

    const subCount = Object.keys(submissions).length;

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden">
            {/* INSTRUCTIONS OVERLAY DURING INTRO */}
            <AnimatePresence>
                {isIntro && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0d0f1a]/95 backdrop-blur-xl"
                    >
                        <motion.div 
                            animate={{ scale: [1, 1.1, 1] }} 
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-[12rem] mb-8"
                        >
                            📊
                        </motion.div>
                        <h2 className="text-8xl font-black italic text-white uppercase tracking-tighter mb-4">
                            Global <span className="text-[#ffff00]">Averages</span>
                        </h2>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.4em] mb-12">Guess the world's opinion</p>
                        <div className="bg-[#ffff00]/10 border-4 border-[#ffff00]/30 p-12 rounded-[3rem] max-w-4xl">
                            <p className="text-3xl font-black text-white uppercase leading-tight italic">
                                "We'll show you a statement. You guess what percentage of people globally agree with it. Closest guess wins the round!"
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(0,255,0,0.5)] mb-8"
                        >
                            📊
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase text-center">
                            GLOBAL <span className="text-[#00ff00]">AVERAGES</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">Guess the world's pulse</p>
                    </motion.div>
                )}

                {(phase === 'PLAYING' || phase === 'REVEAL') && (
                    <motion.div
                        key="question-reveal"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col items-center max-w-7xl"
                    >
                        {/* QUESTION BOX */}
                        <div className="text-center mb-24 w-full">
                            <motion.h2 
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="text-7xl font-black text-white leading-tight drop-shadow-[0_0_40px_rgba(0,255,255,0.4)] uppercase italic tracking-tight"
                            >
                                {currentQuestion}
                            </motion.h2>
                        </div>

                        {/* PERCENTAGE BAR */}
                        <div className="relative w-full h-40 bg-[#1a1f3a]/80 backdrop-blur-3xl rounded-[4rem] border-8 border-white/5 shadow-2xl overflow-hidden mb-20 group">
                            {/* PRECISE TICKS */}
                            <div className="absolute inset-x-12 inset-y-0 flex justify-between pointer-events-none opacity-20">
                                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(t => (
                                    <div key={t} className="w-px h-full bg-white relative">
                                        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-black">{t}%</span>
                                    </div>
                                ))}
                            </div>

                            {/* THE REVEAL FILL */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${revealedPercent}%` }}
                                transition={{ duration: 2, ease: "circOut" }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#ffff00] shadow-[0_0_80px_rgba(255,0,255,0.6)]"
                            />

                            {/* ANSWER TEXT */}
                            <AnimatePresence>
                                {revealedPercent === correct && phase === 'REVEAL' && (
                                    <motion.div
                                        initial={{ scale: 2, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="absolute top-1/2 transform -translate-y-1/2 z-30"
                                        style={{ left: `${correct}%` }}
                                    >
                                        <div className="bg-[#ffff00] text-[#0d0f1a] px-8 py-3 rounded-2xl font-black text-6xl shadow-[0_0_50px_rgba(255,0,255,0.8)] -translate-x-1/2">
                                            {correct}%
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* PLAYER PINS */}
                            <AnimatePresence>
                                {showPins && Object.entries(submissions).map(([pid, val]: [string, any], idx) => {
                                    const p = players[pid];
                                    
                                    return (
                                        <motion.div
                                            key={pid}
                                            initial={{ y: -100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1, type: "spring" }}
                                            className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center gap-2 z-20"
                                            style={{ left: `${val}%` }}
                                        >
                                            <div className="w-16 h-16 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-4xl bg-[#1a1f3a]">
                                                {p?.avatar || '👤'}
                                            </div>
                                            <div className="bg-[#0d0f1a]/80 backdrop-blur-md px-3 py-1 rounded-xl border-2 border-white/20 text-xl font-black text-white">
                                                {val}%
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* SUBMISSION STATUS */}
                        {(phase === 'PLAYING') && (
                            <div className="flex items-center gap-12 bg-white/5 px-12 py-6 rounded-[3rem] border-4 border-white/5 backdrop-blur-xl">
                                <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full">
                                    <span className="text-white/40 font-black text-xl">TIMER</span>
                                    <TimerRing timeLeft={gameTimer || 0} maxTime={20} size={40} accentColor="#ffff00" />
                                </div>
                                <div className="text-5xl font-black text-[#00ff00]">
                                    {subCount} / {participants.length}
                                </div>
                                <div className="text-3xl font-black text-white/40 uppercase tracking-[0.3em] font-mono">
                                    {currentQuestion ? 'GUESSES LOCKED IN' : 'AI GENERATING DATA...'}
                                </div>
                                <div className="flex gap-3">
                                    {participants.map((p: any) => (
                                        <div key={p.id} className={`w-6 h-6 rounded-full transition-all duration-500 ${submissions[p.id] !== undefined ? 'bg-[#00ff00] shadow-[0_0_15px_#00ff00]' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalAveragesHost;