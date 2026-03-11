import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from '../../components/Shared/Timer';
import { DynamicGameUI } from '../../components/DynamicGameUI';

interface FinalBossRound {
    q: string;
    a?: string[];
    correct?: number;
    context?: string;
    blocks?: {
        playerUI: string;
        hostUI: string;
        targetValue?: string | number | { x: number; y: number };
        options?: string[];
        label?: string;
        points?: { x: number; y: number; label?: string }[];
        blocks?: any[];
        onAction?: (action: string, payload: { text?: string; index?: number; value?: any; values?: any[] }) => void;
    };
}

interface FinalBossHostProps {
    phase: 'GENERATING' | 'ROUND';
    subMode: 'TRIVIA' | 'PROMPT_BATTLE' | 'GROUP_POLL' | 'FREESTYLE';
    title?: string;
    tagline?: string;
    currentRound?: FinalBossRound;
    answers?: Record<string, { action: string; index?: number; text?: string }>;
    showResult: boolean;
    timer: number;
    players: Record<string, { name: string; avatar?: string; color?: string; score: number }>;
    creator?: string;
}

const FinalBossHost = ({
    phase,
    subMode,
    title,
    tagline,
    currentRound,
    answers,
    showResult,
    timer,
    players,
    creator
}: FinalBossHostProps) => {

    if (phase === 'GENERATING') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[radial-gradient(circle_at_center,_#ff00ff10_0%,transparent_70%)] animate-pulse" />
                </div>

                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="z-10 relative"
                >
                    <div className="text-[12rem] filter drop-shadow-[0_0_50px_rgba(255,0,255,0.8)] animate-bounce-slow">
                        🧬
                    </div>
                </motion.div>

                <div className="z-10 mt-20 space-y-8">
                    <h2 className="text-9xl font-black text-white uppercase tracking-tighter text-glow italic">
                        Forging The End
                    </h2>
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-4xl font-bold text-[#ff00ff] uppercase tracking-[0.5em] animate-pulse">
                            Constructing AI Reality
                        </p>
                        <p className="text-xl text-white/30 uppercase tracking-widest font-black">
                            SOURCE IDEA BY <span className="text-white">{creator}</span>
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="z-10 w-[600px] h-4 bg-white/5 rounded-full mt-20 overflow-hidden border border-white/10 p-1">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "105%" }}
                        transition={{ duration: 15, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-[#ff00ff] to-[#00ffff] rounded-full shadow-[0_0_20px_#ff00ff]"
                    />
                </div>
            </div>
        );
    }

    const renderTrivia = () => {
        const colors = [
            'bg-rose-600 shadow-rose-600/50',
            'bg-indigo-600 shadow-indigo-600/50',
            'bg-emerald-600 shadow-emerald-600/50',
            'bg-amber-600 shadow-amber-600/50'
        ];
        const labels = ['A', 'B', 'C', 'D'];

        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center w-full max-w-7xl mx-auto space-y-16">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="space-y-4"
                >
                    <h3 className="text-2xl font-black text-[#00ffff] uppercase tracking-[0.4em] mb-4">Ultimate Trivia</h3>
                    <h2 className="text-7xl font-black text-white leading-tight text-glow">
                        {currentRound?.q}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 gap-8 w-full">
                    {currentRound?.a?.map((opt: string, i: number) => {
                        const isCorrect = i === currentRound.correct;
                        const isRevealed = showResult;

                        return (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`
                                    p-10 rounded-[3rem] border-4 flex items-center gap-8 relative overflow-hidden transition-all duration-500
                                    ${isRevealed && isCorrect ? 'border-green-400 bg-green-500/20 scale-105 shadow-[0_0_50px_rgba(74,222,128,0.4)]' :
                                        isRevealed && !isCorrect ? 'border-red-500/30 bg-black/40 opacity-40 grayscale' :
                                            'border-white/10 bg-white/5'}
                                `}
                            >
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black text-white ${colors[i]}`}>
                                    {labels[i]}
                                </div>
                                <div className="text-4xl font-black text-white text-left">{opt}</div>
                                {isRevealed && isCorrect && (
                                    <motion.div
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="absolute right-10 text-4xl"
                                    >
                                        👑
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {showResult && currentRound?.context && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white/5 border-2 border-[#00ffff]/20 p-8 rounded-3xl"
                    >
                        <p className="text-2xl font-bold text-[#00ffff] uppercase tracking-widest mb-2">Did You Know?</p>
                        <p className="text-3xl text-white font-medium italic">"{currentRound.context}"</p>
                    </motion.div>
                )}
            </div>
        );
    };

    const renderPromptBattle = () => {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center w-full max-w-7xl mx-auto space-y-16">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-4"
                >
                    <h3 className="text-2xl font-black text-[#ff00ff] uppercase tracking-[0.4em] mb-4">Prompt Battle</h3>
                    <h2 className="text-7xl font-black text-white leading-tight text-glow">
                        {currentRound?.q}
                    </h2>
                </motion.div>

                {!showResult ? (
                    <div className="flex flex-wrap justify-center gap-6">
                        {Object.keys(players).map((pid) => (
                            <motion.div
                                key={pid}
                                animate={{
                                    scale: answers?.[pid] ? 1.1 : 1,
                                    opacity: answers?.[pid] ? 1 : 0.3
                                }}
                                className={`px-8 py-4 rounded-full border-2 ${answers?.[pid] ? 'border-green-400 bg-green-400/10' : 'border-white/10 bg-white/5'} text-xl font-bold text-white uppercase tracking-widest`}
                            >
                                {players[pid].name} {answers?.[pid] ? '✓' : '...'}
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
                        {Object.entries(answers || {}).map(([pid, data]: [string, { text?: string }], i) => (
                            <motion.div
                                key={pid}
                                initial={{ y: 50, opacity: 0, rotate: -5 }}
                                animate={{ y: 0, opacity: 1, rotate: Math.random() * 6 - 3 }}
                                transition={{ delay: i * 0.2 }}
                                className="glass-card p-10 rounded-[2.5rem] border-2 border-[#ff00ff]/30 space-y-6"
                            >
                                <div className="text-3xl font-black text-white italic">"{data.text}"</div>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-3xl">{players[pid]?.avatar}</span>
                                    <span className="text-sm font-black text-white/40 uppercase tracking-widest">{players[pid]?.name}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderPoll = () => {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center w-full max-w-7xl mx-auto space-y-16">
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-4"
                >
                    <h3 className="text-2xl font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Chaos Poll</h3>
                    <h2 className="text-7xl font-black text-white leading-tight text-glow">
                        {currentRound?.q}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 gap-12 w-full">
                    {currentRound?.a?.map((opt: string, i: number) => {
                        const totalVotes = Object.values(answers || {}).length;
                        const votes = Object.values(answers || {}).filter((a: any) => a.index === i).length;
                        const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

                        return (
                            <div key={i} className="flex flex-col gap-4">
                                <div className="flex justify-between items-end px-4 font-black">
                                    <span className="text-3xl text-white uppercase">{opt}</span>
                                    {showResult && <span className="text-4xl text-amber-500">{Math.round(percent)}%</span>}
                                </div>
                                <div className="h-16 bg-white/5 rounded-full border-2 border-white/10 overflow-hidden relative p-1">
                                    <AnimatePresence>
                                        {showResult && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                                            />
                                        )}
                                    </AnimatePresence>
                                    {!showResult && (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/20 font-black tracking-widest uppercase">
                                            Collecting Votes...
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderFreestyle = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center w-full max-w-7xl mx-auto space-y-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
            >
                <h3 className="text-2xl font-black text-white/40 uppercase tracking-[0.4em] mb-4 italic">The AI's Invention</h3>
                <h2 className="text-7xl font-black text-white leading-tight text-glow">
                    {currentRound?.q}
                </h2>
            </motion.div>

            <DynamicGameUI
                blocks={currentRound?.blocks?.blocks}
                type={currentRound?.blocks?.hostUI || 'REVEAL_VALUE'}
                data={{
                    targetValue: currentRound?.blocks?.targetValue,
                    options: currentRound?.blocks?.options,
                    points: currentRound?.blocks?.points,
                    label: currentRound?.blocks?.label
                }}
                players={players}
                answers={answers}
                showResult={showResult}
            />
        </div>
    );

    return (
        <div className="absolute inset-0 z-50 bg-[#050505] flex flex-col overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 pointer-events-none opacity-50">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/10 blur-[150px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>

            {/* Header */}
            <header className="z-10 p-12 flex justify-between items-start">
                <div className="space-y-2">
                    <motion.h1
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-6xl font-black text-white uppercase tracking-tighter"
                    >
                        {title}
                    </motion.h1>
                    <p className="text-2xl font-bold text-white/30 italic">"{tagline}"</p>
                </div>
                <div className="flex flex-col items-end gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-full border border-white/20 flex items-center gap-6">
                        <span className="text-xl font-black text-white/50 tracking-[0.3em]">FINAL BATTLE</span>
                        <Timer seconds={timer} total={timer > 20 ? 35 : 20} />
                    </div>
                    <div className="text-sm font-black text-white/20 uppercase tracking-widest">
                        CURATED BY <span className="text-white/40">{creator}</span>
                    </div>
                </div>
            </header>

            {/* Content Switcher */}
            <main className="z-10 flex-1 flex flex-col items-center justify-center">
                {subMode === 'TRIVIA' && renderTrivia()}
                {subMode === 'PROMPT_BATTLE' && renderPromptBattle()}
                {subMode === 'GROUP_POLL' && renderPoll()}
                {subMode === 'FREESTYLE' && renderFreestyle()}
            </main>

            {/* Footer Decals */}
            <footer className="z-10 p-12 flex justify-center gap-20 opacity-20">
                <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="text-xs font-mono tracking-[1em] text-white">SYSTEM_REBOOT_SEQUX_V4</div>
                <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-white to-transparent" />
            </footer>
        </div>
    );
};

export default memo(FinalBossHost);
