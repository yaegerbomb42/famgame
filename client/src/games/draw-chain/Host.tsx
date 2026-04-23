import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface DrawChainHostProps {
    gameState: any;
}

const DrawChainHost: React.FC<DrawChainHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        subPhase,
        drawings = {},
        guesses = {},
        currentDrawingIndex = 0,
        timer: timeLeft
    } = gameData || {};


    if (phase === 'RESULTS') {
        const hasLeaderboard = Object.values(players).some((p: any) => p.score > 0);
        if (hasLeaderboard) return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost) as any[];

    const drawingsList = Object.entries(drawings);
    const currentDrawingPid = drawingsList[currentDrawingIndex]?.[0];
    const currentDrawingUrl = drawingsList[currentDrawingIndex]?.[1] as string;

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            <GameTransition phase={phase} gameState={gameState} isHost={true} />

            <AnimatePresence mode="wait">
                {subPhase === 'SUBMIT_PROMPTS' && (
                    <motion.div
                        key="submit"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center space-y-12"
                    >
                        <h1 className="text-[8rem] font-black italic text-white uppercase tracking-tighter">
                            PLANT THE <span className="text-[#00ffff]">SEEDS</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.4em]">Submit 3 crazy ideas on your phone!</p>
                        <div className="flex gap-8">
                            {participants.map(p => (
                                <div key={p.id} className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl border-4 ${gameData.userPrompts[p.id] ? 'border-[#00ff00] bg-[#00ff00]/20' : 'border-white/10 bg-white/5 grayscale'}`}>
                                    {p.avatar}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {subPhase === 'DRAWING' && (
                    <motion.div
                        key="drawing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <h2 className="text-[8rem] font-black text-white italic tracking-tighter uppercase mb-12">
                            TIME TO <span className="text-[#ff00ff]">SKETCH</span>
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl">
                            {participants.map(p => (
                                <div key={p.id} className={`bg-white/5 p-6 rounded-[3rem] border-4 transition-all ${drawings[p.id] ? 'border-[#00ff00] shadow-[0_0_40px_rgba(0,255,0,0.2)]' : 'border-white/5'}`}>
                                    <div className="text-6xl mb-4">{p.avatar}</div>
                                    <div className="text-2xl font-black text-white uppercase truncate">{p.name}</div>
                                    <div className="text-sm text-[#00ffff] font-bold mt-2 uppercase tracking-widest">
                                        {drawings[p.id] ? 'FINISHED' : 'DRAWING...'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {subPhase === 'GUESSING' && currentDrawingUrl && (
                    <motion.div
                        key={`guessing-${currentDrawingIndex}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center w-full max-w-5xl"
                    >
                        <div className="bg-white p-12 rounded-[5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-[16px] border-white/10 relative mb-12">
                            <img src={currentDrawingUrl} alt="Guess this" className="w-[600px] h-[600px] object-contain filter contrast-125" />
                            <div className="absolute -top-12 -left-12 bg-[#ff00ff] text-white px-8 py-4 rounded-full font-black text-4xl shadow-2xl rotate-[-5deg]">WHOSE ART?</div>
                            <div className="absolute -bottom-10 -right-10 bg-[#0d0f1a] border-4 border-[#00ffff] p-6 rounded-[3rem] flex items-center gap-4">
                                <div className="text-6xl">{players[currentDrawingPid]?.avatar}</div>
                                <div className="text-2xl font-black text-white uppercase italic">{players[currentDrawingPid]?.name}</div>
                            </div>
                        </div>

                        <div className="w-full flex flex-wrap justify-center gap-4">
                            {Object.entries(guesses[currentDrawingPid] || {}).map(([pid, g]: [string, any]) => (
                                <motion.div
                                    key={pid}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className={`px-6 py-3 rounded-full font-black text-2xl border-4 ${g.correct ? 'bg-[#00ff00] text-[#0d0f1a] border-white' : 'bg-white/10 text-white border-white/20'}`}
                                >
                                    {players[pid]?.avatar} {g.text || g}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {timeLeft !== undefined && (
                <div className="absolute bottom-12 right-12 flex items-center gap-6 bg-black/40 backdrop-blur-xl p-6 rounded-[3rem] border border-white/10">
                    <TimerRing timeLeft={timeLeft} maxTime={subPhase === 'DRAWING' ? 60 : 30} size={80} strokeWidth={8} accentColor={subPhase === 'DRAWING' ? '#ff00ff' : '#00ffff'} />
                    <div className="text-5xl font-black font-mono text-white italic">
                        {Math.ceil(timeLeft)}s
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrawChainHost;
