import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';

interface BuzzInHostProps {
    gameState: any;
}

const BuzzInHost: React.FC<BuzzInHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { winnerId, reactionTime, active } = gameData || {};

    const winner = winnerId ? players[winnerId] : null;

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            <GameTransition phase={phase} gameState={gameState} isHost={true} />

            <AnimatePresence mode="wait">
                {phase === 'INTRO' && (
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
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase leading-none">
                            BUZZ <span className="text-[#ffff00]">IN</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">BE THE FASTEST TO REACT</p>
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
                        {!active ? (
                            <div className="text-center space-y-8">
                                <h2 className="text-8xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_0_40px_rgba(255,0,0,0.6)] animate-pulse">
                                    WAIT FOR IT...
                                </h2>
                                <p className="text-4xl text-white/40 font-black uppercase tracking-[0.4em]">DON'T BUZZ YET!</p>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-center space-y-8 bg-[#00ff00]/20 p-20 rounded-[4rem] border-8 border-[#00ff00] shadow-[0_0_100px_rgba(0,255,0,0.5)] w-full max-w-5xl"
                            >
                                <h2 className="text-9xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_0_60px_rgba(0,255,0,0.8)]">
                                    BUZZ NOW!
                                </h2>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        {winner ? (
                            <div className="space-y-12">
                                <span className="text-3xl font-black text-[#ffff00] uppercase tracking-[0.4em]">FASTEST FINGERS</span>
                                <div className="p-16 bg-[#1a1f3a] border-8 border-[#00ffff] rounded-[4rem] shadow-[0_0_80px_rgba(0,255,255,0.4)] flex flex-col items-center gap-8 min-w-[600px]">
                                    <div className="text-9xl mb-4">{winner.avatar || '👤'}</div>
                                    <h3 className="text-7xl font-black text-white uppercase tracking-tighter">{winner.name}</h3>
                                    <div className="text-5xl font-black text-[#00ff00] bg-black/50 px-8 py-4 rounded-full border-4 border-[#00ff00]/30 mt-4">
                                        {(reactionTime / 1000).toFixed(3)}s
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="text-[12rem] animate-pulse">🐢</div>
                                <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">TOO SLOW!</h2>
                                <p className="text-4xl text-white/40 font-black uppercase tracking-[0.4em]">NOBODY BUZZED IN TIME</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BuzzInHost;
