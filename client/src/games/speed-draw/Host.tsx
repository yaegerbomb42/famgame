import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface SpeedDrawHostProps {
    gameState: any;
}

const SpeedDrawHost: React.FC<SpeedDrawHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        submissions: drawings = {}, 
        votes = {}, 
        timer: timeLeft,
        subPhase
    } = gameData || {};

    if (phase === 'RESULTS') {
        const hasLeaderboard = Object.values(players).some((p: any) => p.score > 0);
        if (hasLeaderboard) return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach((votedId: any) => {
        voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
    });



    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            {/* AMBIENT ARTISTIC FLOW */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#00ffff22,transparent_70%)]" />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] border-[20px] border-dashed border-[#ff00ff]/10 rounded-full"
                />
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
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="text-[15rem] drop-shadow-[0_0_50px_rgba(0,255,255,0.6)] mb-8"
                        >
                            🎨
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase">
                            SPEED <span className="text-[#00ffff]">DRAW</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">The canvas is your battlefield</p>
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'DRAWING') && (
                    <motion.div
                        key="drawing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center w-full relative z-10"
                    >
                        <div className="text-center mb-10 space-y-4">
                            <span className="text-2xl font-black text-[#00ffff] uppercase tracking-[0.4em] animate-pulse">CREATIVE DIRECTIVES</span>
                            <h2 className="text-7xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_50px_rgba(0,255,255,0.4)] uppercase">
                                CHECK YOUR PHONES!
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 w-full max-w-7xl px-8">
                            {participants.map((p: any) => {
                                const liveData = gameData.liveDrawings?.[p.id];
                                return (
                                    <motion.div
                                        key={p.id}
                                        animate={{ 
                                            scale: drawings[p.id] ? 1.05 : 1,
                                            opacity: 1
                                        }}
                                        className={`relative aspect-square rounded-[3rem] p-6 flex flex-col items-center justify-center border-8 transition-all duration-500 bg-white shadow-2xl ${
                                            drawings[p.id] 
                                                ? 'border-[#00ff00] shadow-[0_0_60px_rgba(0,255,0,0.4)]' 
                                                : 'border-[#1a1f3a]'
                                        }`}
                                    >
                                        <div className="w-full h-full bg-[#f0f0f0] rounded-[2rem] overflow-hidden flex items-center justify-center relative">
                                            {liveData ? (
                                                <img src={liveData} alt="" className="w-full h-full object-contain filter contrast-125" />
                                            ) : (
                                                <div className="text-9xl opacity-10 grayscale">{p.avatar || '👤'}</div>
                                            )}
                                            {!drawings[p.id] && !liveData && (
                                              <div className="absolute inset-0 flex items-center justify-center text-black/20 font-black uppercase tracking-widest text-xl rotate-12">
                                                Waiting for ink...
                                              </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">{p.avatar}</div>
                                                <div className="text-xl font-black text-[#0d0f1a] uppercase truncate max-w-[120px]">{p.name}</div>
                                            </div>
                                            {drawings[p.id] && (
                                                <div className="text-[10px] font-bold text-black/40 uppercase tracking-tighter text-center italic">
                                                    Prompt: "{gameData.playerPrompts?.[p.id]}"
                                                </div>
                                            )}
                                        </div>

                                        {drawings[p.id] && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-6 -right-6 bg-[#00ff00] text-[#0d0f1a] w-16 h-16 rounded-full flex items-center justify-center text-4xl font-black shadow-lg border-4 border-white">✓</motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {timeLeft !== undefined && (
                            <div className="mt-20 flex flex-col items-center">
                                <TimerRing timeLeft={timeLeft} maxTime={60} size={150} strokeWidth={12} accentColor="#00ffff" />
                                <motion.span 
                                    animate={timeLeft <= 10 ? { scale: [1, 1.2, 1], color: ['#fff', '#ff00ff', '#fff'] } : {}}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="text-6xl font-black font-mono text-white/40 mt-4"
                                >
                                    {Math.ceil(timeLeft)}s
                                </motion.span>
                            </div>
                        )}
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'VOTING') && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex flex-col items-center pt-8 relative z-10"
                    >
                        <div className="text-center mb-12">
                            <span className="text-xl font-black text-white/30 uppercase tracking-[0.4em]">EXHIBITION PHASE</span>
                            <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mt-2">
                                PICK THE <span className="text-[#00ffff]">BEST ARTWORK</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-7xl overflow-y-auto scrollbar-hide px-6 pb-20">
                            {Object.entries(drawings).map(([id, dataUrl]: [string, any], i) => (
                                <motion.div
                                    key={id}
                                    initial={{ opacity: 0, y: 30, rotate: i % 2 === 0 ? -2 : 2 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-8 rounded-[4rem] border-8 border-[#1a1f3a] shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 relative group transform hover:rotate-0 transition-transform"
                                >
                                    <div className="w-full aspect-square bg-[#f0f0f0] rounded-[3rem] overflow-hidden p-6 border-4 border-[#0d0f1a]/10">
                                        <img src={dataUrl} alt="" className="w-full h-full object-contain filter contrast-125" />
                                    </div>
                                    <div className="flex flex-col items-center gap-2 w-full px-4">
                                        <div className="flex items-center gap-6 w-full">
                                            <div className="text-5xl bg-[#1a1f3a] w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/10 shrink-0">{players[id]?.avatar}</div>
                                            <div className="text-3xl font-black uppercase tracking-tighter text-[#0d0f1a] truncate">{players[id]?.name}</div>
                                        </div>
                                        <div className="text-sm font-bold text-black/60 italic text-center">
                                            "{gameData.playerPrompts?.[id]}"
                                        </div>
                                    </div>
                                    {votes[id] && (
                                        <div className="absolute -top-6 -right-6 bg-[#ffff00] text-[#0d0f1a] px-6 py-2 rounded-full font-black text-2xl shadow-xl rotate-12 border-4 border-[#0d0f1a]">VOTED</div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-12 relative z-10 w-full"
                    >
                        <h2 className="text-9xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,0,0.5)]">
                            THE <span className="text-[#ffff00]">WINNER</span>
                        </h2>

                        <div className="flex gap-12 items-center justify-center w-full max-w-7xl">
                            {Object.entries(drawings)
                                .sort((a, b) => (voteCounts[b[0]] || 0) - (voteCounts[a[0]] || 0))
                                .slice(0, 3)
                                .map(([id, dataUrl]: [string, any], idx: number) => {
                                    const count = voteCounts[id] || 0;
                                    const isWin = idx === 0 && count > 0;
                                    return (
                                        <motion.div
                                            key={id}
                                            initial={{ y: 100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.2 }}
                                            className={`bg-white p-8 rounded-[4rem] border-8 shadow-2xl flex flex-col items-center gap-6 relative ${isWin ? 'border-[#ffff00] scale-110 z-20 shadow-[0_0_100px_rgba(255,255,0,0.5)]' : 'border-[#1a1f3a] scale-90 opacity-80'}`}
                                        >
                                            <div className="w-80 h-80 bg-[#f0f0f0] rounded-[3rem] overflow-hidden p-6">
                                                <img src={dataUrl} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="text-6xl">{players[id]?.avatar}</div>
                                                <div className="text-2xl font-black uppercase text-[#0d0f1a] truncate w-full px-4 text-center">{players[id]?.name}</div>
                                                <div className={`text-4xl font-black ${isWin ? 'text-[#ff00ff]' : 'text-black/40'} tracking-widest mt-2`}>{count} VOTES</div>
                                            </div>
                                            {isWin && (
                                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }} className="absolute -top-12 -right-12 text-9xl">👑</motion.div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            }
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpeedDrawHost;