import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { DynamicGameUI } from '../../components/DynamicGameUI';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';
import { Timer } from '../../components/Shared/Timer';

const FinalBossPlayer = () => {
    const { gameState, socket } = useGameStore();
    const { playClick, playSuccess } = useSound();

    // State for Prompt Battle
    const [promptAnswer, setPromptAnswer] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const gameData = gameState?.gameData;
    const subMode = gameData?.subMode;
    const phase = gameData?.phase;
    const isResult = gameData?.showResult;

    // Reset on round change
    const [prevRoundIdx, setPrevRoundIdx] = useState<number | undefined>();
    if (gameData?.roundIndex !== prevRoundIdx) {
        setPrevRoundIdx(gameData?.roundIndex);
        setPromptAnswer('');
        setIsSubmitted(false);
    }

    const submitSelection = (idx: number) => {
        if (isSubmitted || isResult) return;
        setIsSubmitted(true);
        socket?.emit('submitBossAnswer', { action: 'SELECT', index: idx });
        playClick();
        if (navigator.vibrate) navigator.vibrate(30);
    };

    const submitPrompt = () => {
        if (!promptAnswer.trim() || isSubmitted || isResult) return;
        setIsSubmitted(true);
        socket?.emit('submitBossAnswer', { action: 'PROMPT', text: promptAnswer.trim() });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate([50, 30]);
    };

    const handleFreestyleAction = (action: string, payload: { text?: string; index?: number; value?: any; values?: any[] }) => {
        if (action === 'SUBMIT') {
            if (isSubmitted || isResult) return;
            setIsSubmitted(true);
            socket?.emit('submitBossAnswer', {
                action: 'PROMPT',
                text: payload.text,
                index: payload.index,
                value: payload.value,
                values: payload.values
            });
            playSuccess();
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    if (phase === 'GENERATING') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="text-8xl mb-8 filter drop-shadow-[0_0_20px_#ff00ff]"
                >
                    💎
                </motion.div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-white animate-pulse">
                    Forging The Finale
                </h2>
                <p className="text-[#ff00ff] font-bold uppercase text-xs tracking-widest mt-4">
                    AI is processing player ideas...
                </p>
            </div>
        );
    }

    if (isResult) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black/40">
                <h2 className="text-4xl font-black uppercase tracking-widest text-[#00ffff] mb-4">Round Over</h2>
                <p className="text-white/40 font-bold uppercase text-sm tracking-widest">Look at the big screen!</p>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-8xl drop-shadow-[0_0_30px_#00ff00]"
                >
                    ⚡
                </motion.div>
                <h2 className="text-3xl font-black uppercase tracking-widest text-white">LOCKED IN</h2>
                <p className="text-white/30 uppercase text-xs font-bold tracking-widest italic animate-pulse">The Boss is watching...</p>
            </div>
        );
    }

    const renderTriviaOrPoll = () => {
        const colors = [
            'bg-rose-600 border-rose-400',
            'bg-indigo-600 border-indigo-400',
            'bg-emerald-600 border-emerald-400',
            'bg-amber-600 border-amber-400'
        ];
        const labels = ['A', 'B', 'C', 'D'];

        return (
            <div className="flex-1 flex flex-col p-4 space-y-4">
                <div className="flex justify-between items-center px-4">
                    <span className="text-white/50 font-black uppercase text-xs tracking-[0.3em]">
                        {subMode === 'TRIVIA' ? 'PICK THE TRUTH' : 'CAST YOUR VOTE'}
                    </span>
                    <Timer seconds={gameData?.timer || 0} total={gameData?.timer || 20} />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                    {labels.map((label, i) => (
                        <motion.button
                            key={label}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => submitSelection(i)}
                            className={`
                                relative flex items-center justify-center rounded-[2.5rem] border-b-[8px] border-r-4
                                active:border-b-0 active:translate-y-2 transition-all group overflow-hidden
                                ${colors[i]} shadow-[0_10px_30px_rgba(0,0,0,0.5)]
                            `}
                        >
                            <span className="text-7xl font-black text-white mix-blend-overlay opacity-60 absolute pointer-events-none">
                                {label}
                            </span>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    };

    const renderPromptBattle = () => (
        <div className="flex-1 flex flex-col p-6 space-y-8 justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-black uppercase text-[#ff00ff] tracking-tight mb-2">PROMPT BATTLE</h2>
                <p className="text-white/40 uppercase font-bold text-[10px] tracking-widest">Type your best response below</p>
            </div>

            <textarea
                value={promptAnswer}
                onChange={(e) => setPromptAnswer(e.target.value)}
                placeholder="Type something legendary..."
                className="w-full bg-white/5 border-2 border-white/10 rounded-3xl p-6 text-lg font-bold text-white focus:border-[#ff00ff] focus:outline-none placeholder-white/10 resize-none h-48 shadow-inner"
                autoFocus
            />

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={submitPrompt}
                disabled={!promptAnswer.trim()}
                className="w-full py-6 rounded-2xl bg-[#ff00ff] font-black text-2xl uppercase tracking-[0.2em] text-white disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(255,0,255,0.4)]"
            >
                UNLEASH
            </motion.button>
        </div>
    );

    const renderFreestyle = () => (
        <div className="flex-1 flex flex-col p-6 space-y-8 justify-center">
            <div className="text-center">
                <span className="text-[#00ffff] font-black uppercase text-xs tracking-[0.5em] mb-2 block">Dynamic Challenge</span>
                <p className="text-white/40 uppercase font-bold text-[10px] tracking-widest">{gameData?.currentRound?.q}</p>
            </div>

            <DynamicGameUI
                blocks={gameData?.currentRound?.blocks?.blocks}
                type={gameData?.currentRound?.blocks?.playerUI || 'INPUT_FIELD'}
                data={{
                    options: gameData?.currentRound?.blocks?.options,
                    label: gameData?.currentRound?.blocks?.label
                }}
                onAction={handleFreestyleAction}
            />

            <div className="flex justify-center">
                <Timer seconds={gameData?.timer || 0} total={gameData?.timer || 20} />
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-full w-full bg-[#050505]">
            {subMode === 'PROMPT_BATTLE' ? renderPromptBattle() :
                subMode === 'FREESTYLE' ? renderFreestyle() :
                    renderTriviaOrPoll()}
        </div>
    );
};

export default memo(FinalBossPlayer);
