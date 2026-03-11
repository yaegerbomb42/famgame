import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Timer } from '../../components/Shared/Timer';
import { useGameStore } from '../../store/useGameStore';
import type { Player } from '../../store/useGameStore';
import type { TriviaGameData, TriviaQuestion } from '../../types/game';
import { useNarratorStore } from '../../store/useNarratorStore';

interface TriviaHostProps {
    question: TriviaQuestion | null;
    timer: number;
    showResult: boolean;
}

const TriviaHost: React.FC<TriviaHostProps> = ({ question, timer, showResult }) => {
    const { gameState, gameInput } = useGameStore();
    const gameData = gameState?.gameData;
    const phase = gameData?.phase;

    const [selectedCategory, setSelectedCategory] = useState('Any');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Any');
    const [customTopic, setCustomTopic] = useState('');

    // Safely access data
    const safeQ = question as TriviaQuestion;
    const qText = safeQ?.q || "Loading...";
    const answers = useMemo(() => safeQ?.a || [], [safeQ?.a]);
    const correctIndex = safeQ?.correct;
    const category = safeQ?.category || "General Knowledge";

    const { speak } = useNarratorStore();

    // Trigger narrator when a new question appears
    const prevQRef = useRef('');
    useEffect(() => {
        if (qText && qText !== prevQRef.current && phase === 'ROUND') {
            if (gameData?.isCustomAI && gameData?.customIntro && gameData?.questionIndex === 0) {
                // Speak the custom intro for the FIRST question of an AI game
                speak(gameData.customIntro);
            } else {
                const intros = [
                    `Question incoming. Try not to embarrass yourselves more than usual.`,
                    `Next question. Let's see who's been paying attention to life.`,
                    `Here we go. A topic I know everything about, and you know... well, nothing.`,
                    `Let's test your pathetic human brains. Hope you brought yours today.`,
                    `I hope you studied... nah, who am I kidding. You're just guessing.`,
                    `Confidence is key. Or in your case, a very expensive delusion.`,
                    `Go ahead, bet high. I love watching digital fortunes crumble.`
                ];
                speak(intros[Math.floor(Math.random() * intros.length)]);
            }
            prevQRef.current = qText;
        }
    }, [qText, phase, speak, gameData?.isCustomAI, gameData?.customIntro, gameData?.questionIndex]);

    // Trigger narrator when answer is revealed
    const prevShowResultRef = useRef(false);
    useEffect(() => {
        if (showResult && !prevShowResultRef.current && answers[correctIndex]) {
            const reveals = [
                `The answer is ${answers[correctIndex]}. Obviously. Even my toaster knew that.`,
                `If you didn't guess ${answers[correctIndex]}, I weep for the future of your species.`,
                `It's ${answers[correctIndex]}. Some of you got that right. Pure luck, I'm sure.`,
                `The correct human string is ${answers[correctIndex]}. How... expected.`,
                `${answers[correctIndex]}. My databanks confirm, and your bank accounts suffer.`,
                `Wait, did someone actually bet 10 on that? Brave. Or stupid. Mostly stupid.`
            ];
            speak(reveals[Math.floor(Math.random() * reveals.length)]);
        }
        prevShowResultRef.current = showResult;
    }, [showResult, answers, correctIndex, speak]);

    // Get scores for podium
    const players = Object.values(gameState?.players || {})
        .filter((p: Player) => !p.isHost)
        .sort((a: Player, b: Player) => b.score - a.score);

    if (phase === 'SETTINGS') {
        return (
            <div className="flex flex-col h-full w-full justify-center items-center px-8 relative font-display z-10">
                <h2 className="text-6xl font-black text-white mb-12 uppercase tracking-widest drop-shadow-lg text-center">
                    Trivia Settings
                </h2>

                <div className="flex gap-12 bg-white/5 p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="flex flex-col gap-4">
                        <label className="text-cyan-400 font-bold uppercase tracking-widest text-lg ml-2">Category</label>
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="bg-black/60 border-2 border-white/20 rounded-2xl p-4 text-white text-2xl font-bold uppercase appearance-none outline-none focus:border-cyan-500 min-w-[300px]"
                        >
                            {(gameData?.availableCategories as string[] | undefined)?.map((c) => (
                                <option key={c} value={c} className="bg-slate-900">{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-fuchsia-400 font-bold uppercase tracking-widest text-lg ml-2">Difficulty</label>
                        <select
                            value={selectedDifficulty}
                            onChange={e => setSelectedDifficulty(e.target.value)}
                            className="bg-black/60 border-2 border-white/20 rounded-2xl p-4 text-white text-2xl font-bold uppercase appearance-none outline-none focus:border-fuchsia-500 min-w-[300px]"
                        >
                            {(gameData?.availableDifficulties as string[] | undefined)?.map((d) => (
                                <option key={d} value={d} className="bg-slate-900">{d}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-white/40 font-black uppercase tracking-[0.2em] text-sm">OR TYPE CUSTOM TOPIC</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="e.g. Rick and Morty, Space History..."
                                value={customTopic || ''}
                                onChange={(e) => setCustomTopic(e.target.value)}
                                className="bg-black/60 border-2 border-white/20 rounded-2xl p-4 text-white text-2xl font-bold appearance-none outline-none focus:border-cyan-500 w-[500px]"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(6, 182, 212, 0.6)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (customTopic?.trim()) {
                                        gameInput({
                                            action: 'GENERATE_CUSTOM_TRIVIA',
                                            topic: customTopic.trim()
                                        });
                                    }
                                }}
                                className="px-8 py-4 bg-cyan-600 text-white rounded-2xl font-black text-2xl uppercase tracking-widest border border-cyan-400/50"
                            >
                                GENERATE
                            </motion.button>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0, 255, 255, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        gameInput({
                            action: 'START_TRIVIA',
                            category: selectedCategory,
                            difficulty: selectedDifficulty
                        });
                    }}
                    className="mt-16 px-16 py-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full font-black text-3xl uppercase tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-400/50"
                >
                    Start Game
                </motion.button>
            </div>
        );
    }
    if (phase === 'GENERATING') {
        return (
            <div className="flex flex-col h-full w-full justify-center items-center px-8 relative font-display z-10 text-center">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="text-9xl mb-12 filter drop-shadow-[0_0_50px_rgba(6,182,212,0.8)]"
                >
                    🤖
                </motion.div>
                <h2 className="text-7xl font-black text-white mb-6 uppercase tracking-tighter text-glow">
                    SWARM GENERATING
                </h2>
                <div className="text-4xl font-bold text-cyan-400 animate-pulse uppercase tracking-[0.2em]">
                    Constructing: {gameData?.topic || 'The Future'}
                </div>
                <div className="mt-16 w-[500px] h-4 bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 15, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-400 rounded-full shadow-[0_0_30px_#06b6d4]"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-w-[90rem] justify-center items-center px-8 relative font-display">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]" />
            <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="w-[200vw] h-[200vw] -ml-[50vw] -mt-[50vw] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"
                />
            </div>

            {/* Header / Category */}
            <motion.div
                key={category}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full flex flex-col items-center"
            >
                <div className="px-8 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 font-bold uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    {gameData?.isCustomAI ? (gameData?.customTitle || 'AI GENERATED') : category}
                </div>
                {gameData?.isCustomAI && (
                    <div className="mt-2 text-[#ff00ff] font-black uppercase tracking-widest text-xs animate-pulse">
                        DESIGNED BY {gameData?.customCreator || 'SWARM'}
                    </div>
                )}
            </motion.div>

            <div className="absolute top-8 right-8 z-20 scale-125">
                <Timer seconds={timer} total={45} />
            </div>

            {/* Main Stage */}
            <div className="z-10 w-full flex flex-col items-center">
                <motion.div
                    key={qText}
                    initial={{ scale: 0.9, opacity: 0, rotateX: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="mb-16 text-center max-w-5xl"
                >
                    <h2 className="text-6xl md:text-8xl font-black leading-[0.95] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-400 drop-shadow-2xl">
                        {qText}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 gap-6 w-full max-w-6xl">
                    {answers.map((answer: string, i: number) => {
                        const isCorrect = showResult && i === correctIndex;
                        const isDimmed = showResult && i !== correctIndex;

                        return (
                            <motion.div
                                key={`${qText}-${i}`}
                                initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
                                animate={{
                                    x: 0,
                                    opacity: isDimmed ? 0.2 : 1,
                                    scale: isCorrect ? 1.05 : 1,
                                    borderColor: isCorrect ? 'var(--color-success)' : 'rgba(255,255,255,0.1)'
                                }}
                                transition={{ delay: i * 0.1 }}
                                className={`
                                    relative p-8 rounded-[2rem] border-4 flex items-center gap-8
                                    backdrop-blur-xl transition-all duration-500
                                    ${isCorrect ? 'bg-green-500/20 border-green-400 shadow-[0_0_50px_rgba(74,222,128,0.4)]' : 'bg-white/5 border-white/10'}
                                `}
                            >
                                <div className={`
                                    w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black
                                    ${isCorrect ? 'bg-green-500 text-black' : 'bg-white/10 text-white/50'}
                                `}>
                                    {['A', 'B', 'C', 'D'][i]}
                                </div>
                                <span className={`text-4xl font-bold ${isCorrect ? 'text-white' : 'text-white/80'}`}>{answer}</span>

                                {isCorrect && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1.5 }}
                                        className="absolute right-6 text-5xl"
                                    >
                                        ✅
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Live Leaderboard (Mini Podiums) */}
            <div className="absolute bottom-0 inset-x-0 h-32 flex items-end justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent pb-4 z-20">
                {players.slice(0, 5).map((p, i) => (
                    <motion.div
                        key={p.id}
                        layout
                        className="flex flex-col items-center"
                    >
                        <div className="mb-2 flex flex-col items-center">
                            <span className="text-sm font-bold text-white/70">{p.name}</span>
                            <span className="text-xs font-mono text-blue-400">{p.score}</span>
                        </div>
                        <motion.div
                            className={`w-16 rounded-t-xl bg-gradient-to-b ${i === 0 ? 'from-yellow-400 to-yellow-600 h-24' : i === 1 ? 'from-slate-300 to-slate-500 h-16' : 'from-amber-700 to-amber-900 h-12'}`}
                            initial={{ height: 0 }}
                            animate={{ height: i === 0 ? 96 : i === 1 ? 64 : 48 }}
                        />
                    </motion.div>
                ))}
            </div>
        </div >
    );
};

export default TriviaHost;