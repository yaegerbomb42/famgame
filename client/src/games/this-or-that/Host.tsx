import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface HigherLowerHostProps {
    gameState: any;
}

const HigherLowerHost: React.FC<HigherLowerHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        cardA,
        cardB,
        statLabel,
        submissions = {}, 
        round,
        totalRounds,
        timer 
    } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);
    const correctChoice = cardB?.value > cardA?.value ? 'HIGHER' : 'LOWER';

    const formatValue = (val: number) => {
        if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val.toLocaleString();
    };

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            {/* Dynamic background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#1a1f3a] to-black" />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border-[200px] border-white/5 rounded-full"
                />
            </div>

            <GameTransition phase={phase} gameState={gameState} isHost={true} />

            <AnimatePresence mode="wait">
                {(phase === 'INTRO' || phase === 'COUNTDOWN') && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex flex-col items-center text-center relative z-10"
                    >
                        <div className="text-[12rem] mb-8 animate-bounce">📈</div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white uppercase leading-none mb-4">
                            HIGHER <span className="text-[#00ffff]">OR</span> <span className="text-[#ff00ff]">LOWER</span>
                        </h1>
                        <div className="px-10 py-3 bg-white/5 border-2 border-white/20 rounded-full text-3xl font-black text-white/60 uppercase tracking-[0.5em]">
                            Round {round} / {totalRounds}
                        </div>
                    </motion.div>
                )}

                {(phase === 'PLAYING' || phase === 'REVEAL') && (
                    <motion.div
                        key="gameplay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col gap-12 w-full max-w-7xl items-center relative z-10"
                    >
                        <div className="text-center space-y-4">
                            <span className="text-3xl font-black text-[#ffff00] tracking-[0.3em] uppercase block">Comparing {statLabel}</span>
                        </div>

                        <div className="flex items-center justify-center gap-12 w-full">
                            {/* CARD A (Fixed) */}
                            <motion.div
                                initial={{ x: -200, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex-1 max-w-lg aspect-[3/4] glass-panel rounded-[4rem] border-4 border-white/20 p-12 flex flex-col items-center justify-between relative overflow-hidden group shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                <span className="text-2xl font-black text-white/40 uppercase tracking-[0.4em] relative z-10">THE BASE</span>
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8 relative z-10">
                                    <h3 className="text-6xl font-black text-white text-center uppercase tracking-tight">{cardA?.name}</h3>
                                    <div className="text-8xl font-black text-[#00ffff] drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                                        {formatValue(cardA?.value)}
                                    </div>
                                </div>
                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        className="h-full bg-[#00ffff]"
                                    />
                                </div>
                            </motion.div>

                            <div className="text-6xl font-black text-white/20 italic">VS</div>

                            {/* CARD B (Subject) */}
                            <motion.div
                                initial={{ x: 200, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className={`flex-1 max-w-lg aspect-[3/4] glass-panel rounded-[4rem] border-8 p-12 flex flex-col items-center justify-between relative overflow-hidden transition-all duration-1000 ${
                                    phase === 'REVEAL' 
                                        ? (correctChoice === 'HIGHER' ? 'border-[#00ff00] shadow-[0_0_100px_rgba(0,255,0,0.3)]' : 'border-[#ff00ff] shadow-[0_0_100px_rgba(255,0,255,0.3)]')
                                        : 'border-white/10'
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent opacity-50" />
                                <span className="text-2xl font-black text-white/40 uppercase tracking-[0.4em] relative z-10">THE CHALLENGER</span>
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8 relative z-10">
                                    <h3 className="text-6xl font-black text-white text-center uppercase tracking-tight">{cardB?.name}</h3>
                                    <AnimatePresence mode="wait">
                                        {phase === 'PLAYING' ? (
                                            <motion.div 
                                                key="hidden"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 1.5, opacity: 0 }}
                                                className="text-9xl font-black text-white/20"
                                            >
                                                ?
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="revealed"
                                                initial={{ y: 50, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className={`text-8xl font-black drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] ${
                                                    cardB?.value > cardA?.value ? 'text-[#00ff00]' : 'text-[#ff00ff]'
                                                }`}
                                            >
                                                {formatValue(cardB?.value)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="text-center relative z-10">
                                    {phase === 'REVEAL' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`text-5xl font-black uppercase tracking-widest ${
                                                cardB?.value > cardA?.value ? 'text-[#00ff00]' : 'text-[#ff00ff]'
                                            }`}
                                        >
                                            {cardB?.value > cardA?.value ? 'HIGHER' : 'LOWER'}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {phase === 'PLAYING' && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex -space-x-4">
                                    {participants.map((p: any) => (
                                        <motion.div
                                            key={p.id}
                                            animate={{ opacity: submissions[p.id] ? 1 : 0.2, scale: submissions[p.id] ? 1.2 : 1 }}
                                            className="w-16 h-16 rounded-full bg-[#0d0f1a] border-4 border-white/20 flex items-center justify-center text-3xl shadow-lg"
                                        >
                                            {p.avatar}
                                        </motion.div>
                                    ))}
                                </div>
                                <TimerRing timeLeft={timer} maxTime={20} size={100} accentColor="#ffff00" />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HigherLowerHost;