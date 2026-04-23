import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';

interface BuzzHostProps {
    gameState: any;
}

const BuzzHost: React.FC<BuzzHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { winnerId, active = false } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const winner = winnerId ? players[winnerId] : null;

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
                            ⚡
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase">
                            QUICK <span className="text-[#ffff00]">BUZZ</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">Fastest Finger Wins</p>
                    </motion.div>
                )}

                {phase === 'PLAYING' && !active && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-12"
                    >
                        <div className="text-[12rem] animate-pulse">👀</div>
                        <h2 className="text-8xl font-black text-white uppercase tracking-tighter italic">
                            WATCH <span className="text-[#00ffff] animate-pulse">CLOSELY...</span>
                        </h2>
                    </motion.div>
                )}

                {phase === 'PLAYING' && active && (
                    <motion.div
                        key="active"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="relative"
                    >
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                textShadow: [
                                    "0 0 40px #ff00ff",
                                    "0 0 80px #ffff00",
                                    "0 0 40px #ff00ff"
                                ]
                            }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="text-[25rem] font-black leading-none bg-gradient-to-r from-[#ff00ff] via-[#ffff00] to-[#00ffff] bg-clip-text text-transparent drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"
                        >
                            BUZZ!
                        </motion.div>
                        <motion.div 
                            animate={{ 
                                opacity: [0.2, 0.5, 0.2],
                                background: [
                                    "radial-gradient(circle, rgba(255,0,255,0.4) 0%, transparent 70%)",
                                    "radial-gradient(circle, rgba(255,255,0,0.4) 0%, transparent 70%)",
                                    "radial-gradient(circle, rgba(0,255,255,0.4) 0%, transparent 70%)"
                                ]
                            }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="absolute inset-0 blur-[120px] -z-10 scale-[1.5]" 
                        />
                    </motion.div>
                )}

                {phase === 'REVEAL' && winner && (
                    <motion.div
                        key="buzzed"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center p-16 glass-panel rounded-[4rem] border-8 border-[#00ffff] shadow-[0_0_100px_rgba(0,255,255,0.4)] relative"
                    >
                        <div className="text-4xl uppercase tracking-[0.4em] mb-10 font-black text-[#ffff00] drop-shadow-[0_0_20px_rgba(255,255,0,0.5)]">
                            CHAMPION SPEED!
                        </div>
                        <div className="flex items-center gap-12">
                            <motion.span 
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-[12rem] drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                            >
                                {winner.avatar || '👤'}
                            </motion.span>
                            <div className="text-[10rem] font-black bg-gradient-to-r from-[#ff00ff] to-[#00ffff] bg-clip-text text-transparent tracking-tighter uppercase italic leading-none">
                                {winner.name}
                            </div>
                        </div>
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-5xl mt-12 font-black bg-[#00ff00] px-12 py-5 rounded-[2rem] text-[#0d0f1a] shadow-[0_0_50px_rgba(0,255,0,0.6)] uppercase tracking-widest"
                        >
                            +500 POINTS
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BuzzHost;