import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface ChainReactionHostProps {
    gameState: any;
}

const ChainReactionHost: React.FC<ChainReactionHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { activePlayerId, chain: currentChain = [], timer: timeLeft } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const activePlayer = activePlayerId ? players[activePlayerId] : null;

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
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(0,255,255,0.5)] mb-8"
                        >
                            🔗
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase">
                            CHAIN <span style={{ color: 'var(--game-chain)' }}>REACTION</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">Don't Break The Link</p>
                        <motion.div className="mt-8 flex gap-3">
                            {['🔗','⛓️','💥','🔗','⛓️'].map((e, i) => (
                                <motion.span key={i} className="text-5xl animate-domino" style={{ animationDelay: `${i * 0.15}s` }}>{e}</motion.span>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {phase === 'PLAYING' && (
                    <motion.div
                        key="active"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col items-center"
                    >
                        {/* TIMER & STATUS */}
                        <div className="flex items-center gap-12 mb-16 bg-[#1a1f3a]/80 backdrop-blur-xl p-10 rounded-[3rem] border-4 border-white/5 shadow-2xl">
                            <TimerRing timeLeft={timeLeft} maxTime={10} size={180} accentColor="var(--game-chain)" accentGlow="var(--game-chain-glow)" />
                            <div className="text-left space-y-2">
                                <p className="text-2xl font-black text-white/30 uppercase tracking-[0.3em]">ACTIVE LINKER</p>
                                <div className="flex items-center gap-6">
                                    <span className="text-[6rem]">{activePlayer?.avatar || '👤'}</span>
                                    <h3 className="text-7xl font-black uppercase tracking-tighter text-white italic">
                                        {activePlayer?.name}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* THE CHAIN */}
                        <div className="flex flex-wrap justify-center gap-8 max-w-[90vw] overflow-y-auto px-10 pb-32 max-h-[50vh] scrollbar-hide">
                            {currentChain.map((item: any, i: number) => (
                                <motion.div
                                    key={i + item.word}
                                    initial={{ scale: 0, x: -50 }}
                                    animate={{ scale: 1, x: 0 }}
                                    className="flex items-center gap-8"
                                >
                                    <div className="glass-panel p-8 rounded-[2.5rem] border-4 border-[#00ff00] flex flex-col items-center min-w-[20rem] shadow-[0_0_40px_rgba(0,255,0,0.2)] relative group hover:scale-105 transition-transform">
                                        <div className="absolute -top-4 -right-4 bg-[#ffff00] text-[#0d0f1a] w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg">#{i+1}</div>
                                        <div className="text-5xl font-black uppercase tracking-tight mb-3 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{item.word}</div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{players[item.playerId]?.avatar || '👤'}</span>
                                            <span className="text-lg font-black uppercase text-white/40 tracking-widest">{players[item.playerId]?.name}</span>
                                        </div>
                                    </div>
                                    {i < currentChain.length - 1 && (
                                        <motion.div 
                                            animate={{ x: [0, 15, 0], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="text-6xl text-[#ff00ff] font-black drop-shadow-[0_0_20px_rgba(255,0,255,0.5)]"
                                        >
                                            →
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                            
                            {/* ACTIVE LINK TARGET */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="flex items-center gap-8"
                            >
                                <div className="text-6xl text-[#ffff00] font-black animate-pulse">→</div>
                                <div className="glass-panel p-8 rounded-[2.5rem] border-4 border-dashed border-[#00ffff] flex flex-col items-center justify-center min-w-[20rem] h-[12rem] bg-[#00ffff]/5 shadow-[0_0_40px_rgba(0,255,255,0.1)]">
                                    <div className="text-7xl font-black text-[#00ffff] animate-pulse">?</div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChainReactionHost;