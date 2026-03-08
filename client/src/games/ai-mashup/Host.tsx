import { memo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Timer } from '../../components/Shared/Timer';
import { useNarratorStore } from '../../store/useNarratorStore';

const AIMashupHost = () => {
    const { gameState } = useGameStore();
    const { speak } = useNarratorStore();
    const gameData = gameState?.gameData;
    const phase = gameData?.phase;

    // Speak during specific phases
    const prevPhaseRef = useRef(phase);
    useEffect(() => {
        if (phase !== prevPhaseRef.current) {
            if (phase === 'GATHER') {
                speak("It's time for the Grand Finale. Send me your wildest ideas and I will forge them into a nightmare mini-game.");
            } else if (phase === 'GENERATE') {
                speak("I am currently analyzing your chaotic inputs. My circuits are weeping. Please stand by.");
            } else if (phase === 'PLAYING') {
                const roundType = gameData?.currentRound?.type;
                if (roundType === 'TRIVIA') {
                    speak("Trivia time. " + (gameData?.currentRound?.prompt || "Try not to fail this one."));
                } else if (roundType === 'PROMPT') {
                    speak("A prompt for you. " + (gameData?.currentRound?.prompt || "Be funny, for once."));
                }
            }
            prevPhaseRef.current = phase;
        }
    }, [phase, gameData?.currentRound, speak]);

    // Speak when results are shown
    const prevShowResultRef = useRef(false);
    useEffect(() => {
        const isShowingResult = !!gameData?.showResult;
        if (isShowingResult && !prevShowResultRef.current && phase === 'PLAYING') {
            const roundType = gameData?.currentRound?.type;
            if (roundType === 'TRIVIA') {
                const correctIdx = gameData?.currentRound?.correctIndex;
                const correctText = gameData?.currentRound?.answers?.[correctIdx] || '';
                speak(`The answer was ${correctText}. Obviously.`);
            } else if (roundType === 'PROMPT') {
                speak("Let's see what you came up with. I'm sure it's deeply disappointing.");
            }
        }
        prevShowResultRef.current = isShowingResult;
    }, [gameData?.showResult, phase, gameData?.currentRound, speak]);

    if (phase === 'GATHER') {
        const ideasCount = Object.keys(gameData?.inputs || {}).length;

        return (
            <div className="flex flex-col h-full w-full justify-center items-center px-12 relative font-display">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-black to-fuchsia-900 opacity-50 z-0" />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="z-10 text-center flex flex-col items-center"
                >
                    <div className="mb-12">
                        <Timer seconds={gameData?.timer || 0} total={30} />
                    </div>
                    <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase tracking-tighter drop-shadow-2xl">
                        THE GRAND FINALE
                    </h1>
                    <p className="text-4xl text-white/50 mt-6 font-bold uppercase tracking-widest">
                        Enter a topic, scenario, or theme on your device!
                    </p>

                    <div className="mt-16 bg-white/5 border border-white/20 rounded-full px-12 py-6">
                        <p className="text-3xl font-black text-white">
                            IDEAS SUBMITTED: <span className="text-fuchsia-400 animate-pulse">{ideasCount}</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (phase === 'GENERATE') {
        return (
            <div className="flex flex-col h-full w-full justify-center items-center relative font-display text-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/40 via-black to-black z-0" />

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-48 h-48 border-t-8 border-b-8 border-fuchsia-500 rounded-full mb-16 z-10 filter drop-shadow-[0_0_30px_rgba(217,70,239,0.8)]"
                />
                <h2 className="text-6xl font-black text-white uppercase tracking-widest z-10 animate-pulse">
                    Forging the Chaos...
                </h2>
                <p className="text-2xl text-white/50 mt-4 font-bold uppercase z-10">
                    The AI is merging your broken ideas into a mini-game.
                </p>
            </div>
        );
    }

    if (phase === 'PLAYING') {
        const round = gameData?.currentRound;
        const isResult = gameData?.showResult;

        return (
            <div className="flex flex-col h-full w-full justify-center items-center px-12 relative font-display text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] z-0" />

                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
                    <div className="px-8 py-2 bg-fuchsia-500/20 border border-fuchsia-400/30 rounded-full text-fuchsia-300 font-bold uppercase tracking-[0.4em]">
                        {gameData?.game?.title || "AI MASHUP"} - Round {gameData?.roundIndex + 1}
                    </div>
                </div>

                {!isResult && (
                    <div className="absolute top-8 right-8 z-20 scale-125">
                        <Timer seconds={gameData?.timer || 0} total={30} />
                    </div>
                )}

                <motion.div
                    key={round?.prompt}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="z-10 w-full max-w-6xl mt-12"
                >
                    <h2 className="text-6xl md:text-8xl font-black leading-tight tracking-tight text-white drop-shadow-2xl mb-16 px-4">
                        {round?.prompt}
                    </h2>

                    {round?.type === 'TRIVIA' && (
                        <div className="grid grid-cols-2 gap-8 w-full mt-12">
                            {round.answers?.map((answer: string, i: number) => {
                                const isCorrect = isResult && i === round.correctIndex;
                                const isDimmed = isResult && i !== round.correctIndex;

                                return (
                                    <motion.div
                                        key={answer}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{
                                            opacity: isDimmed ? 0.2 : 1,
                                            scale: isCorrect ? 1.05 : 1,
                                            borderColor: isCorrect ? 'var(--color-success)' : 'rgba(255,255,255,0.1)'
                                        }}
                                        className={`
                                            relative p-8 rounded-[2rem] border-4 flex items-center gap-6
                                            backdrop-blur-xl transition-all duration-500 text-left
                                            ${isCorrect ? 'bg-green-500/20 border-green-400 shadow-[0_0_50px_rgba(74,222,128,0.4)]' : 'bg-white/5 border-white/10'}
                                        `}
                                    >
                                        <div className={`
                                            w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black shrink-0
                                            ${isCorrect ? 'bg-green-500 text-black' : 'bg-white/10 text-white/50'}
                                        `}>
                                            {['A', 'B', 'C', 'D'][i]}
                                        </div>
                                        <span className="text-4xl font-black text-white break-words">{answer}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {round?.type === 'PROMPT' && isResult && (
                        <div className="flex flex-col gap-6 mt-12 overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar">
                            {Object.entries(gameData?.answers || {}).map(([pId, ans]: [string, any]) => {
                                const player = gameState?.players[pId];
                                if (!player || !ans) return null;
                                return (
                                    <motion.div
                                        key={pId}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white/10 p-6 rounded-3xl border border-white/20 flex items-center gap-6 text-left"
                                    >
                                        <div className="text-5xl">{player.avatar}</div>
                                        <div className="flex flex-col">
                                            <span className="text-white/50 font-bold uppercase tracking-widest text-sm">{player.name}</span>
                                            <span className="text-3xl font-black text-white">"{ans}"</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    return null;
};

export default memo(AIMashupHost);
