import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useNarratorStore } from '../../store/useNarratorStore';
import { useEffect, useRef } from 'react';

const ReactionHost = () => {
    const { gameState } = useGameStore();
    const gameData = gameState?.gameData;
    const phase = gameData?.phase;

    // Get scores for podium
    const players = Object.values(gameState?.players || {})
        .filter((p: any) => !p.isHost)
        .sort((a: any, b: any) => b.score - a.score);

    const { speak } = useNarratorStore();

    // Narrator Triggers
    const prevPhaseRef = useRef<string | undefined>(undefined);
    const prevRoundRef = useRef<number>(0);

    useEffect(() => {
        if (phase !== prevPhaseRef.current || gameData?.round !== prevRoundRef.current) {
            if (phase === 'INSTRUCT') {
                speak("Lightning React. Hit the button when the screen turns green. Do not jump the gun, or I will publicly shame you.");
            } else if (phase === 'WAITING' && prevPhaseRef.current !== 'WAITING') {
                const waits = [
                    "Wait for it...",
                    "Hold your horses...",
                    "Steady now...",
                    "Don't do it yet...",
                    "Patience is a virtue you probably lack."
                ];
                speak(waits[Math.floor(Math.random() * waits.length)]);
            } else if (phase === 'GO') {
                speak("GO!");
            } else if (phase === 'RESULT' && prevPhaseRef.current !== 'RESULT') {
                // Find someone who tapped early
                const earlyTapper = Object.entries(gameData?.roundScores || {})
                    .find(([_id, data]: [string, any]) => data.early)?.[0];

                if (earlyTapper && gameState?.players[earlyTapper]) {
                    speak(`Too early, ${gameState.players[earlyTapper].name}. Typical.`);
                } else {
                    const results = [
                        "Let's see who has the reflexes of a dead cat.",
                        "Analyzing your pitiful reaction times.",
                        "Well, that was pathetic.",
                        "Some of you might actually survive the apocalypse."
                    ];
                    speak(results[Math.floor(Math.random() * results.length)]);
                }
            }
        }
        prevPhaseRef.current = phase;
        prevRoundRef.current = gameData?.round || 0;
    }, [phase, gameData?.round, gameData?.roundScores, gameState?.players, speak]);

    const getPhaseContent = () => {
        if (phase === 'INSTRUCT') {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center justify-center text-center space-y-8"
                >
                    <div className="text-[8rem]">⚡️</div>
                    <h2 className="text-7xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 drop-shadow-2xl">
                        Lightning React
                    </h2>
                    <p className="text-3xl text-white/80 font-bold max-w-2xl leading-relaxed">
                        Wait for the screen to turn GREEN, then tap as FAST as you can! Don't tap too early!
                    </p>
                    <div className="text-5xl font-mono text-yellow-400 font-bold mt-12 animate-pulse">
                        {Math.ceil(gameData?.timer || 0)}
                    </div>
                </motion.div>
            );
        }

        if (phase === 'WAITING') {
            return (
                <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center w-full h-full"
                >
                    <div className="text-[12rem] animate-pulse">🛑</div>
                    <h2 className="text-8xl font-black uppercase text-red-500 tracking-widest mt-8">Wait For It...</h2>
                </motion.div>
            );
        }

        if (phase === 'GO') {
            return (
                <motion.div
                    key="go"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center w-full h-full"
                >
                    <h2 className="text-[15rem] font-black uppercase text-green-400 tracking-tighter leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                        GO!
                    </h2>
                </motion.div>
            );
        }

        if (phase === 'RESULT') {
            const results = Object.entries(gameData?.roundScores || {})
                .map(([id, data]: [string, any]) => ({
                    player: gameState?.players[id],
                    ...data
                }))
                .filter(r => r.player)
                .sort((a, b) => {
                    if (a.early && !b.early) return 1;
                    if (!a.early && b.early) return -1;
                    if (a.time === null && b.time !== null) return 1;
                    if (a.time !== null && b.time === null) return -1;
                    return a.time - b.time;
                });

            return (
                <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center w-full h-full"
                >
                    <h2 className="text-6xl font-black text-white uppercase tracking-widest mb-12 flex items-center gap-4">
                        <span className="text-yellow-400">Round {gameData?.round}</span> Results
                    </h2>

                    <div className="flex gap-8 items-end justify-center h-[50vh] w-full max-w-6xl">
                        {results.slice(0, 5).map((r, i) => (
                            <motion.div
                                key={r.player.id}
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center w-48"
                            >
                                <span className="text-5xl mb-4 filter drop-shadow-lg">{r.player.avatar}</span>
                                <span className="text-xl font-bold text-white truncate w-full text-center">
                                    {r.player.name}
                                </span>

                                <div className={`w-full rounded-t-3xl mt-4 flex flex-col items-center justify-end pb-6 relative
                                    ${i === 0 && !r.early && r.time !== null ? 'bg-gradient-to-t from-yellow-600 to-yellow-400 h-96' :
                                        i === 1 && !r.early && r.time !== null ? 'bg-gradient-to-t from-slate-400 to-slate-300 h-72' :
                                            i === 2 && !r.early && r.time !== null ? 'bg-gradient-to-t from-amber-800 to-amber-600 h-56' :
                                                'bg-zinc-800/50 h-32 border-t border-white/10'}`}
                                >
                                    {r.early ? (
                                        <div className="text-center">
                                            <span className="text-red-400 font-bold uppercase text-lg bg-red-900/50 px-3 py-1 rounded-full">-50</span>
                                            <p className="text-red-300 text-xs uppercase font-bold mt-2">Too Early</p>
                                        </div>
                                    ) : r.time === null ? (
                                        <span className="text-white/30 font-bold uppercase text-lg">Missed</span>
                                    ) : (
                                        <>
                                            <span className="text-white font-black text-4xl">+{r.points}</span>
                                            <span className="text-black/60 font-mono text-sm mt-2 font-bold bg-white/30 px-2 py-1 rounded-md">{r.time}ms</span>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col h-full w-full justify-center items-center p-8 relative font-display overflow-hidden transition-colors duration-200"
            style={{ backgroundColor: phase === 'GO' ? '#22c55e' : '#0f172a' }}>

            <AnimatePresence mode="wait">
                <div className="z-10 w-full h-full flex flex-col items-center justify-center">
                    {getPhaseContent()}
                </div>
            </AnimatePresence>

            {/* Live Leaderboard (Persistent) */}
            {phase !== 'RESULT' && (
                <div className="absolute top-8 right-8 bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/10 z-20 w-80 shadow-2xl">
                    <h3 className="text-xl font-bold text-white/50 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Leaderboard</h3>
                    <div className="space-y-3">
                        {players.slice(0, 5).map((p: any, i: number) => (
                            <div key={p.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-white/30 font-mono w-4">{i + 1}.</span>
                                    <span className="text-2xl">{p.avatar}</span>
                                    <span className="text-white font-bold truncate max-w-[100px]">{p.name}</span>
                                </div>
                                <span className="text-blue-400 font-mono font-bold">{p.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReactionHost;