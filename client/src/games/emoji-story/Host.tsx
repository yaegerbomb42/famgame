import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import TimerRing from '../../components/ui/TimerRing';

interface EmojiStoryHostProps {
    gameState: any;
}

const EmojiStoryHost: React.FC<EmojiStoryHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { submissions = {}, votes = {}, timer: timeLeft, subPhase, prompt, aiWinner } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);

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
                            🎭
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase">
                            EMOJI <span className="text-[#ff00ff]">STORY</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">Decode the visual tales</p>
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'INPUT') && (
                    <motion.div
                        key="submitting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center w-full"
                    >
                        <div className="text-center space-y-4 mb-16">
                            <span className="text-2xl font-black uppercase tracking-[0.4em] text-white/30 block">PROMPT:</span>
                            <h2 className="text-7xl font-black text-[#ffff00] italic uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,0,0.3)]">
                                {prompt}
                            </h2>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mb-12">
                            {participants.map((p: any) => (
                                <motion.div
                                    key={p.id}
                                    animate={{ 
                                        scale: submissions[p.id] ? 1.1 : 1,
                                        opacity: submissions[p.id] ? 1 : 0.4
                                    }}
                                    className={`relative w-32 h-32 rounded-[3.5rem] flex items-center justify-center text-6xl border-8 transition-all duration-500 overflow-hidden ${
                                        submissions[p.id] 
                                            ? 'bg-[#1a1f3a] border-[#00ff00] shadow-[0_0_40px_rgba(0,255,0,0.5)]' 
                                            : 'bg-[#1a1f3a] border-white/10'
                                    }`}
                                >
                                    <span className="relative z-10">{p.avatar || '👤'}</span>
                                </motion.div>
                            ))}
                        </div>
                        
                        {timeLeft !== undefined && (
                            <TimerRing timeLeft={timeLeft} maxTime={45} size={150} accentColor="#00ffff" />
                        )}
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'VOTE') && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full h-full flex flex-col items-center justify-center p-12"
                    >
                        <h2 className="text-5xl font-black text-[#ffff00] uppercase tracking-[0.4em] mb-16 drop-shadow-[0_0_30px_rgba(255,255,0,0.5)]">DECODE THE STORIES!</h2>
                        
                        <div className="grid grid-cols-2 gap-10 w-full max-w-7xl h-[60vh] overflow-y-auto scrollbar-hide p-4">
                            {Object.entries(submissions).map(([pid, emojis]: [string, any]) => (
                                <motion.div
                                    key={pid}
                                    className="glass-panel p-12 rounded-[4rem] border-4 border-white/5 flex flex-col items-center justify-center space-y-8 bg-white/5 backdrop-blur-3xl"
                                >
                                    <div className="text-[10rem] tracking-[0.2em] drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                        {emojis}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-black text-[#ff00ff] uppercase tracking-widest">
                                            {Object.values(votes).filter(v => v === pid).length} VOTES
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full flex flex-col items-center justify-center space-y-12"
                    >
                        <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter">THE VERDICT</h2>
                        
                        <div className="flex gap-12 items-center max-w-7xl">
                            {aiWinner && (
                                <motion.div 
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="flex-1 glass-panel p-12 rounded-[4rem] border-8 border-[#ffff00] bg-white/5 shadow-[0_0_60px_rgba(255,255,0,0.2)] text-center space-y-8"
                                >
                                    <div className="text-3xl font-black text-[#ffff00] uppercase tracking-[0.4em]">AI JUDGE'S PICK</div>
                                    <div className="text-[10rem]">{submissions[aiWinner.winnerId]}</div>
                                    <div className="text-4xl font-black text-white italic">"{aiWinner.reason}"</div>
                                    <div className="flex items-center justify-center gap-4 pt-6">
                                        <span className="text-6xl">{players[aiWinner.winnerId]?.avatar}</span>
                                        <span className="text-4xl font-black text-[#00ffff] uppercase">{players[aiWinner.winnerId]?.name}</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmojiStoryHost;