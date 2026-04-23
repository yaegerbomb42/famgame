import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface BluffHostProps {
    gameState: any;
}

const BluffHost: React.FC<BluffHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { subPhase, subjectId, submissions = {}, votes = {}, round, totalRounds, timer } = gameData || {};
    
    const subject = subjectId ? players[subjectId] : null;
    const claimData = subjectId ? submissions[subjectId] : null;
    
    const truthVotesCount = Object.values(votes).filter(v => v === false).length; // Voted "False" for isLying
    const lieVotesCount = Object.values(votes).filter(v => v === true).length;    // Voted "True" for isLying

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);

    return (
        <div className="flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden bg-[#0d0f1a]">
            <GameTransition phase={phase} gameState={gameState} isHost={true} />

            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff00ff]/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00ffff]/20 blur-[120px] rounded-full" />
            </div>

            <AnimatePresence mode="wait">
                {(phase === 'INTRO' || phase === 'COUNTDOWN') && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center relative z-10"
                    >
                        <div className="inline-block px-10 py-4 bg-[#1a1f3a] text-[#ff00ff] rounded-full text-3xl font-black mb-12 uppercase tracking-[0.4em] border-4 border-[#ff00ff] shadow-[0_0_40px_rgba(255,0,255,0.4)] animate-pulse">
                            Round {round} / {totalRounds}
                        </div>
                        <h2 className="text-[12rem] font-black mb-16 tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            <span className="text-[#ff00ff]">THE</span> <span className="text-[#00ffff]">BLUFF</span>
                        </h2>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em] max-w-2xl">
                            Write a claim about yourself. It can be a hard truth or a clever lie.
                        </p>
                    </motion.div>
                )}

                {phase === 'PLAYING' && subPhase === 'INPUT' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center text-center relative z-10 w-full max-w-6xl"
                    >
                        <h2 className="text-8xl font-black text-white uppercase mb-16 tracking-tighter italic">
                            Constructing <span className="text-[#00ffff]">TALES...</span>
                        </h2>
                        
                        <div className="grid grid-cols-4 lg:grid-cols-6 gap-8 w-full">
                            {participants.map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ scale: 0 }}
                                    animate={{ 
                                        scale: 1,
                                        opacity: submissions[p.id] ? 1 : 0.4
                                    }}
                                    className={`p-6 rounded-[2rem] border-4 flex flex-col items-center gap-4 transition-all duration-500 ${
                                        submissions[p.id] 
                                            ? 'bg-[#00ff00]/10 border-[#00ff00] shadow-[0_0_30px_rgba(0,255,0,0.2)]' 
                                            : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    <div className="text-6xl">{p.avatar}</div>
                                    <div className="text-xl font-black text-white uppercase tracking-widest truncate w-full text-center">{p.name}</div>
                                    {submissions[p.id] && (
                                        <div className="text-[#00ff00] font-black text-xs uppercase tracking-widest animate-bounce">READY</div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-20 flex flex-col items-center gap-6">
                            <TimerRing timeLeft={timer} maxTime={90} size={150} accentColor="#00ffff" />
                            <p className="text-3xl text-white/60 font-black uppercase tracking-[0.3em]">Waiting for all bluffs</p>
                        </div>
                    </motion.div>
                )}

                {phase === 'PLAYING' && subPhase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center w-full max-w-6xl relative z-10"
                    >
                        <div className="flex items-center gap-8 mb-12">
                            <span className="text-[10rem]">{subject?.avatar || '👤'}</span>
                            <div className="text-left">
                                <h2 className="text-7xl font-black text-white uppercase tracking-tight italic mb-2">{subject?.name}'s Claim</h2>
                                <span className="text-2xl font-black text-[#00ffff] uppercase tracking-[0.4em]">Is this a lie?</span>
                            </div>
                        </div>

                        <div className="p-16 glass-panel rounded-[4rem] border-4 border-[#ffff00] shadow-[0_0_100px_rgba(255,255,0,0.3)] mb-20 w-full transform -rotate-1">
                            <p className="text-7xl font-black leading-tight text-white tracking-tight italic">
                                "{claimData?.claim}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-24 w-full">
                            <div className="flex flex-col items-center gap-6 p-10 glass-panel rounded-[3rem] border-4 border-[#00ff00]/30">
                                <div className="text-4xl font-black uppercase tracking-[0.4em] text-[#00ff00] text-glow">TRUTH</div>
                                <div className="text-9xl font-black text-white">{truthVotesCount}</div>
                                <div className="flex flex-wrap justify-center gap-3 min-h-[4rem]">
                                    {Object.entries(votes).filter(([, v]) => v === false).map(([bid]) => (
                                        <motion.div key={bid} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl">{players[bid]?.avatar || '👤'}</motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-6 p-10 glass-panel rounded-[3rem] border-4 border-[#ff00ff]/30">
                                <div className="text-4xl font-black uppercase tracking-[0.4em] text-[#ff00ff] text-glow">BLUFF</div>
                                <div className="text-9xl font-black text-white">{lieVotesCount}</div>
                                <div className="flex flex-wrap justify-center gap-3 min-h-[4rem]">
                                    {Object.entries(votes).filter(([, v]) => v === true).map(([bid]) => (
                                        <motion.div key={bid} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl">{players[bid]?.avatar || '👤'}</motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                             <TimerRing timeLeft={timer} maxTime={45} size={100} accentColor="#ffff00" />
                        </div>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center relative z-10"
                    >
                        <motion.div 
                            initial={{ scale: 10, rotate: 90 }}
                            animate={{ scale: 1, rotate: claimData?.isLying ? -10 : 0 }}
                            transition={{ type: "spring", damping: 12 }}
                            className={`text-[20rem] font-black uppercase italic leading-none mb-12 drop-shadow-[0_0_100px_rgba(255,255,255,0.4)] ${
                                claimData?.isLying ? 'text-[#ff00ff]' : 'text-[#00ff00]'
                            }`}
                        >
                            {claimData?.isLying ? 'BLUFF!' : 'TRUTH!'}
                        </motion.div>
                        
                        <div className="text-[15rem] mb-12">
                            {claimData?.isLying ? '🤥' : '✅'}
                        </div>

                        <div className="p-12 glass-panel rounded-[4rem] border-4 border-[#00ffff] shadow-[0_0_60px_rgba(0,255,255,0.4)] max-w-4xl">
                            <h3 className="text-6xl font-black uppercase tracking-tighter text-white mb-4">
                                {subject?.name} was {claimData?.isLying ? 'BAMBOOZLING YOU!' : 'TELLING THE GOSPEL!'}
                            </h3>
                            <p className="text-3xl text-white/60 font-bold italic">"{claimData?.claim}"</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BluffHost;