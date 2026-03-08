import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';
import { Timer } from '../../components/Shared/Timer';

const AIMashupPlayer = () => {
    const { gameState, socket } = useGameStore();
    const { playClick, playSuccess } = useSound();

    const [idea, setIdea] = useState('');
    const [ideaSubmitted, setIdeaSubmitted] = useState(false);

    const [promptAnswer, setPromptAnswer] = useState('');
    const [answerSubmitted, setAnswerSubmitted] = useState(false);

    const gameData = gameState?.gameData;
    const phase = gameData?.phase;

    // Reset submissions on phase change or round change
    const [prevPhase, setPrevPhase] = useState<string | undefined>();
    const [prevRoundIdx, setPrevRoundIdx] = useState<number | undefined>();

    if (phase !== prevPhase) {
        setPrevPhase(phase);
        if (phase === 'GATHER') {
            setIdeaSubmitted(false);
            setIdea('');
        }
    }

    if (gameData?.roundIndex !== prevRoundIdx) {
        setPrevRoundIdx(gameData?.roundIndex);
        setAnswerSubmitted(false);
        setPromptAnswer('');
    }

    const submitIdea = () => {
        if (!idea.trim()) return;
        socket?.emit('submitMashupIdea', idea.trim());
        setIdeaSubmitted(true);
        playSuccess();
        if (navigator.vibrate) navigator.vibrate([50]);
    };

    const submitTrivia = (idx: number) => {
        if (answerSubmitted) return;
        socket?.emit('submitMashupAnswer', idx);
        setAnswerSubmitted(true);
        playClick();
        if (navigator.vibrate) navigator.vibrate(30);
    };

    const submitPrompt = () => {
        if (!promptAnswer.trim() || answerSubmitted) return;
        socket?.emit('submitMashupAnswer', promptAnswer.trim());
        setAnswerSubmitted(true);
        playSuccess();
        if (navigator.vibrate) navigator.vibrate([50]);
    };

    if (phase === 'GATHER') {
        if (ideaSubmitted) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
                    <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">✅</div>
                    <h2 className="text-3xl font-black uppercase tracking-widest text-fuchsia-400">Locked In</h2>
                    <p className="text-white/50 font-bold uppercase text-sm">Look at the big screen!</p>
                </div>
            );
        }

        return (
            <div className="flex-1 flex flex-col p-6 items-center justify-center space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500 mb-2 drop-shadow-lg">
                        Feed the AI
                    </h2>
                    <p className="text-white/40 uppercase font-bold text-xs tracking-widest">
                        What should this mini-game be about?
                    </p>
                </div>

                <input
                    type="text"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitIdea()}
                    placeholder="e.g. Pirates, Math, Grandma..."
                    className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-4 text-center text-xl font-bold text-white focus:border-fuchsia-500 focus:outline-none placeholder-white/20"
                    maxLength={30}
                    autoFocus
                />

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={submitIdea}
                    disabled={!idea.trim()}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 font-black text-xl uppercase tracking-widest text-white disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)]"
                >
                    Submit Idea
                </motion.button>
            </div>
        );
    }

    if (phase === 'GENERATE') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 border-4 border-t-fuchsia-500 border-white/10 rounded-full mb-8 shadow-[0_0_20px_rgba(217,70,239,0.5)]"
                />
                <h2 className="text-2xl font-black uppercase tracking-widest animate-pulse">Forging...</h2>
            </div>
        );
    }

    if (phase === 'PLAYING') {
        const round = gameData?.currentRound;
        const isResult = gameData?.showResult;

        if (isResult) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-3xl font-black uppercase tracking-widest text-fuchsia-400 mb-4">Round Over</h2>
                    <p className="text-white/50 font-bold uppercase text-sm">Check the big screen for results!</p>
                </div>
            );
        }

        if (answerSubmitted) {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="text-4xl text-fuchsia-400">✔️</div>
                    <h2 className="text-3xl font-black uppercase tracking-widest text-white">Submitted</h2>
                </div>
            );
        }

        if (round?.type === 'TRIVIA') {
            const colors = [
                'bg-pink-600 shadow-pink-600/40 border-pink-400',
                'bg-blue-600 shadow-blue-600/40 border-blue-400',
                'bg-green-600 shadow-green-600/40 border-green-400',
                'bg-orange-600 shadow-orange-600/40 border-orange-400'
            ];
            const labels = ['A', 'B', 'C', 'D'];

            return (
                <div className="flex-1 flex flex-col p-4 w-full h-full pb-8">
                    <div className="mb-4 flex justify-between items-center px-2">
                        <span className="text-white/50 font-black uppercase text-xs tracking-widest">Select Answer</span>
                        <Timer seconds={gameData?.timer || 0} total={30} />
                    </div>
                    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
                        {labels.map((label, i) => (
                            <motion.button
                                key={label}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => submitTrivia(i)}
                                className={`
                                    relative flex flex-col items-center justify-center rounded-3xl border-b-[8px] border-r-4
                                    active:border-b-0 active:translate-y-2 transition-all group overflow-hidden
                                    ${colors[i]} shadow-lg
                                `}
                            >
                                <div className="absolute inset-0 bg-white/20 mix-blend-overlay opacity-0 group-active:opacity-100 transition-opacity" />
                                <span className="text-6xl font-black text-white mix-blend-overlay opacity-50 absolute pointer-events-none">
                                    {label}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            );
        }

        if (round?.type === 'PROMPT') {
            return (
                <div className="flex-1 flex flex-col p-6 items-center justify-center space-y-6">
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-black uppercase text-fuchsia-400 mb-2">Prompt Battle</h2>
                        <p className="text-white/40 uppercase font-bold text-[10px] tracking-widest">
                            Look at screen for the prompt. Type your answer.
                        </p>
                    </div>

                    <textarea
                        value={promptAnswer}
                        onChange={(e) => setPromptAnswer(e.target.value)}
                        placeholder="Type something funny..."
                        className="w-full bg-black/40 border-2 border-white/10 rounded-2xl p-4 text-left text-lg font-bold text-white focus:border-fuchsia-500 focus:outline-none placeholder-white/20 resize-none h-32"
                    />

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={submitPrompt}
                        disabled={!promptAnswer.trim()}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 font-black text-xl uppercase tracking-widest text-white disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)]"
                    >
                        Send It
                    </motion.button>
                </div>
            );
        }
    }

    return null;
};

export default memo(AIMashupPlayer);
