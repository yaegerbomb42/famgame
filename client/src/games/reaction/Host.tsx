import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';

interface ReactionHostProps {
    gameState: any;
}

const ReactionHost: React.FC<ReactionHostProps> = ({ gameState }) => {
    const { phase, gameData, players } = gameState;
    const { 
        active = false, 
        ready = false,
        submissions = {}, 
        timer: timeLeft
    } = gameData || {};

    if (phase === 'RESULTS') {
        return <LeaderboardOverlay entries={Object.values(players).filter((p: any) => !p.isHost) as any} />;
    }

    const participants = Object.values(players).filter((p: any) => !p.isHost);

    return (
        <div className={`flex flex-col h-full w-full justify-center items-center px-8 relative overflow-hidden transition-colors duration-500 ${active ? 'bg-[#00ff00]' : 'bg-[#0d0f1a]'}`}>
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
                            animate={{ scale: [1, 1.2, 1], filter: ['drop-shadow(0 0 20px #00ffff)', 'drop-shadow(0 0 40px #00ffff)', 'drop-shadow(0 0 20px #00ffff)'] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-[15rem] mb-8"
                        >
                            ⚡
                        </motion.div>
                        <h1 className="text-[10rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] mb-4 uppercase">
                            LIGHTNING <span style={{ color: 'var(--game-reaction)' }}>REACT</span>
                        </h1>
                        <p className="text-4xl text-white/40 font-black uppercase tracking-[0.5em]">Fastest fingers win</p>
                    </motion.div>
                )}

                {phase === 'PLAYING' && (
                    <motion.div
                        key="playing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center text-center"
                    >
                        {!ready && !active && (
                            <div className="space-y-12">
                                <motion.div 
                                    className="text-[25rem] font-black text-white italic drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]"
                                >
                                    {Math.ceil(timeLeft)}
                                </motion.div>
                                <h2 className="text-[8rem] font-black text-[#ff00ff] italic tracking-tighter uppercase">
                                    GET READY...
                                </h2>
                            </div>
                        )}

                        {ready && !active && (
                            <div className="space-y-12">
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }} 
                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                    className="text-[20rem]"
                                >
                                    🛑
                                </motion.div>
                                <h2 className="text-[10rem] font-black text-white italic tracking-tighter uppercase animate-pulse">
                                    WAIT...
                                </h2>
                            </div>
                        )}

                        {active && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                className="space-y-8"
                            >
                                <h2 className="text-[25rem] font-black italic tracking-tighter text-[#0d0f1a] uppercase leading-none drop-shadow-[0_0_100px_rgba(255,255,255,1)]">
                                    GO!
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
                        className="w-full h-full flex flex-col items-center pt-20"
                    >
                        <h2 className="text-8xl font-black mb-24 text-white uppercase tracking-tighter italic">
                            THE <span className="text-[#00ff00]">FASTEST</span> FINGERS
                        </h2>

                        <div className="flex items-end justify-center gap-12 w-full h-[45vh] max-w-7xl pb-20 px-12">
                            {participants.map((player: any) => {
                                const time = submissions[player.id];
                                const isEarly = time === -1;
                                const isSuccess = time > 0;
                                
                                const heightPercent = isSuccess ? Math.max(15, (1 - time/1000) * 100) : 15;
                                const sortedResults = Object.values(submissions)
                                    .filter((t: any) => t > 0)
                                    .sort((a: any, b: any) => a - b);
                                const isWinner = isSuccess && time === sortedResults[0];

                                return (
                                    <motion.div
                                        key={player.id}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        className="flex flex-col items-center justify-end flex-1 max-w-[15rem] relative h-full"
                                    >
                                        <div className={`w-full h-full rounded-t-[3rem] relative transition-all duration-1000 border-x-8 border-t-8 ${
                                            isWinner 
                                                ? 'bg-gradient-to-t from-[#00ff00] to-[#ffff00] shadow-[0_0_80px_rgba(0,255,0,0.5)] border-white' 
                                                : isEarly 
                                                    ? 'bg-[#ff00ff]/20 border-[#ff00ff]/50'
                                                    : 'bg-[#1a1f3a] border-white/10'
                                        }`}>
                                            <div className="absolute -top-32 inset-x-0 text-center flex flex-col items-center">
                                                {isEarly ? (
                                                    <span className="text-[#ff00ff] font-black text-3xl uppercase tracking-tighter">TOO FAST!</span>
                                                ) : isSuccess ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[#00ff00] font-black text-6xl italic leading-none">{time}ms</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-white/20 font-black text-2xl uppercase">MISSED</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="absolute top-full pt-10 w-full text-center">
                                            <div className="text-6xl mb-4">{player.avatar || '👤'}</div>
                                            <div className={`text-2xl font-black uppercase tracking-tighter truncate w-full px-4 py-3 rounded-2xl border-4 ${isWinner ? 'bg-[#00ff00] text-[#0d0f1a] border-white' : 'bg-white/5 text-white/60 border-white/10'}`}>
                                                {player.name}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReactionHost;