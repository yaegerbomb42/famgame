import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface WordRaceHostProps {
    gameState: any;
}

const WordRaceHost: React.FC<WordRaceHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        rounds = [], 
        currentRound = 0, 
        winnerId,
        wrongGuesses = {},
        timer: timeLeft 
    } = gameData || {};

    const currentRiddle = rounds[currentRound] || { riddle: "...", answer: "..." };

    if (phase === 'RESULTS' && gameData.currentRound === gameData.totalRounds - 1) {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            <GameTransition phase={phase as any} />

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
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-[12rem] drop-shadow-[0_0_50px_rgba(255,255,0,0.4)] mb-8"
                        >
                            🧩
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase leading-none">
                            RIDDLE <span className="text-[#ffff00]">RACE</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">ROUND {currentRound + 1} OF 5</p>
                    </motion.div>
                )}

                {phase === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full relative z-10"
                    >
                        <div className="w-full max-w-6xl p-16 glass-panel border-8 border-[#00ffff] rounded-[4rem] shadow-[0_0_80px_rgba(0,255,255,0.3)] bg-white/5 backdrop-blur-3xl mb-16 relative">
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#00ffff] text-[#0d0f1a] px-12 py-4 rounded-full text-3xl font-black uppercase tracking-widest">THE RIDDLE</span>
                            <h2 className="text-6xl font-black text-white italic tracking-tight leading-tight uppercase">
                                "{currentRiddle.riddle}"
                            </h2>
                        </div>

                        {/* WRONG GUESSES CLOUD */}
                        <div className="flex-1 w-full max-w-7xl relative min-h-[300px]">
                            <AnimatePresence>
                                {Object.entries(wrongGuesses).map(([pid, guesses]: [string, any]) => (
                                    guesses.map((guess: string, idx: number) => (
                                        <motion.div
                                            key={`${pid}-${guess}-${idx}`}
                                            initial={{ opacity: 0, scale: 0, x: Math.random() * 400 - 200, y: 100 }}
                                            animate={{ opacity: 1, scale: 1, y: -200 - Math.random() * 200 }}
                                            exit={{ opacity: 0, scale: 1.5 }}
                                            className="absolute left-1/2 bg-white/5 border-2 border-white/10 px-8 py-4 rounded-full"
                                        >
                                            <span className="text-3xl font-black text-white/30 uppercase line-through italic">{guess}</span>
                                        </motion.div>
                                    ))
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="mt-16">
                            <TimerRing timeLeft={timeLeft} maxTime={25} size={120} accentColor="#00ffff" accentGlow="rgba(0,255,255,0.5)" />
                        </div>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center p-20 glass-panel rounded-[5rem] border-8 border-[#00ff00] shadow-[0_0_100px_rgba(0,255,0,0.4)]"
                    >
                        <div className="text-4xl uppercase tracking-[0.4em] mb-12 font-black text-white/40">THE ANSWER WAS</div>
                        <div className="text-[15rem] font-black bg-gradient-to-r from-[#00ff00] to-[#ffff00] bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] uppercase italic leading-none mb-12">
                            {currentRiddle.answer}
                        </div>
                        
                        {winnerId ? (
                            <div className="flex flex-col items-center gap-6">
                                <p className="text-3xl font-black uppercase text-white/60 tracking-widest">SOLVED BY</p>
                                <div className="flex items-center gap-8 bg-white/10 p-8 rounded-[3rem] border-4 border-white/20">
                                    <span className="text-9xl">{players[winnerId]?.avatar}</span>
                                    <span className="text-7xl font-black text-white uppercase italic">{players[winnerId]?.name}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-5xl font-black text-[#ff00ff] uppercase tracking-tighter italic animate-pulse bg-black/40 px-12 py-6 rounded-[2rem] border-4 border-[#ff00ff]">
                                NOBODY SOLVED IT!
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WordRaceHost;