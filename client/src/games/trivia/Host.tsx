import { motion } from 'framer-motion';
import { Timer } from '../../components/Shared/Timer';
import { useGameStore } from '../../store/useGameStore';

interface TriviaQuestion {
    q: string;
    a: string[];
    correct: number;
    category?: string;
}

interface TriviaHostProps {
    question: any; // Keep 'any' but cast internally
    timer: number;
    showResult: boolean;
}

const TriviaHost: React.FC<TriviaHostProps> = ({ question, timer, showResult }) => {
    // Safely access data
    const safeQ = question as TriviaQuestion;
    const qText = safeQ?.q || "Loading...";
    const answers = safeQ?.a || [];
    const correctIndex = safeQ?.correct;
    const category = safeQ?.category || "General Knowledge";

    // Get scores for podium
    const { gameState } = useGameStore();
    const players = Object.values(gameState?.players || {})
        .filter((p: any) => !p.isHost)
        .sort((a: any, b: any) => b.score - a.score);

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
                className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
            >
                <div className="px-8 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 font-bold uppercase tracking-[0.4em] drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    {category}
                </div>
            </motion.div>

            <div className="absolute top-8 right-8 z-20 scale-125">
                <Timer seconds={timer} total={20} />
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
                {players.slice(0, 5).map((p: any, i: number) => (
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
        </div>
    );
};

export default TriviaHost;