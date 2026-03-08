import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const ReactionPlayer = () => {
    const { gameState, gameInput, socket } = useGameStore();
    const { playError, playSuccess } = useSound();

    const gameData = gameState?.gameData;
    const phase = gameData?.phase;
    const me = socket?.id ? gameState?.players[socket.id] : null;

    // Local state for instant UI feedback
    const [hasTapped, setHasTapped] = useState(false);
    const [tapStatus, setTapStatus] = useState<'early' | 'success' | null>(null);

    // Reset local state when round changes or phase reverts to waiting
    const [prevPhase, setPrevPhase] = useState<string | undefined>(undefined);
    if (phase !== prevPhase) {
        setPrevPhase(phase);
        if (phase === 'WAITING') {
            setHasTapped(false);
            setTapStatus(null);
        }
    }

    const handleTap = () => {
        if (hasTapped || phase === 'INSTRUCT' || phase === 'RESULT') return;

        setHasTapped(true);
        gameInput({ action: 'tap' });

        if (navigator.vibrate) navigator.vibrate(50);

        if (phase === 'WAITING') {
            setTapStatus('early');
            playError();
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } else if (phase === 'GO') {
            setTapStatus('success');
            playSuccess();
        }
    };

    if (phase === 'INSTRUCT') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-6 space-y-6 text-center">
                <div className="text-6xl animate-pulse">⚡️</div>
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">How to Play</h2>
                    <p className="text-zinc-400 font-bold uppercase text-lg leading-relaxed">
                        Wait for the <span className="text-green-500">GREEN</span> screen.<br /><br />
                        Tap as <span className="text-yellow-500">fast</span> as you can. <br /><br />
                        Don't tap <span className="text-red-500">too early</span>!
                    </p>
                </div>
                <div className="text-5xl font-mono text-zinc-600 font-black mt-8">
                    {Math.ceil(gameData?.timer || 0)}
                </div>
            </div>
        );
    }

    if (phase === 'RESULT') {
        const roundScore = gameData?.roundScores?.[socket?.id || ''];
        const isEarly = roundScore?.early;
        const pts = roundScore?.points || 0;
        const timeMs = roundScore?.time;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex-1 flex flex-col items-center justify-center p-6 space-y-8
                    ${isEarly ? 'bg-red-900/30' : timeMs === null ? 'bg-zinc-900' : 'bg-green-900/30'}`}
            >
                {isEarly ? (
                    <>
                        <div className="text-8xl">🐢</div>
                        <h2 className="text-5xl font-black text-red-500 uppercase tracking-tighter text-center">Too Early!</h2>
                        <div className="text-3xl font-bold text-red-400">-50 PTS</div>
                    </>
                ) : timeMs === null ? (
                    <>
                        <div className="text-8xl">😴</div>
                        <h2 className="text-5xl font-black text-zinc-500 uppercase tracking-tighter">Missed It</h2>
                        <div className="text-xl font-bold text-zinc-600">0 PTS</div>
                    </>
                ) : (
                    <>
                        <div className="text-8xl drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]">⚡️</div>
                        <h2 className="text-5xl font-black text-green-400 uppercase tracking-tighter">Nice Reflexes!</h2>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-5xl font-black text-white">+{pts} PTS</span>
                            <span className="text-2xl font-mono text-green-300 bg-green-900/50 px-4 py-2 rounded-xl mt-4">
                                {timeMs} ms
                            </span>
                        </div>
                    </>
                )}
            </motion.div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950">
            <header className="flex justify-between items-center p-6 shrink-0 z-10 pointer-events-none">
                <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Total Score</span>
                    <span className="text-3xl font-black text-white">{me?.score || 0}</span>
                </div>
                <div className="px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                    <span className="text-xs font-mono text-white/50">ROUND {gameData?.round || 1}/5</span>
                </div>
            </header>

            <button
                onPointerDown={handleTap}
                disabled={hasTapped}
                className={`
                    absolute inset-0 w-full h-full flex items-center justify-center outline-none transition-colors duration-200
                    ${phase === 'GO' && !hasTapped ? 'bg-green-500 active:bg-green-600' :
                        phase === 'WAITING' && !hasTapped ? 'bg-red-600 active:bg-red-700' :
                            tapStatus === 'early' ? 'bg-red-900' :
                                tapStatus === 'success' ? 'bg-green-900' : 'bg-zinc-900'}
                `}
            >
                <div className="flex flex-col items-center pointer-events-none">
                    {!hasTapped ? (
                        <>
                            <span className="text-[10rem] drop-shadow-2xl mb-8">
                                {phase === 'GO' ? '⚡️' : '🛑'}
                            </span>
                            <span className={`text-4xl font-black uppercase tracking-widest ${phase === 'GO' ? 'text-green-950' : 'text-red-950'}`}>
                                {phase === 'GO' ? 'TAP NOW!' : 'WAIT...'}
                            </span>
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-8xl mb-8">
                                {tapStatus === 'early' ? '🤡' : '🔥'}
                            </span>
                            <span className={`text-3xl font-black uppercase tracking-widest ${tapStatus === 'early' ? 'text-red-500' : 'text-green-400'}`}>
                                {tapStatus === 'early' ? 'FALSE START' : 'LOCKED IN'}
                            </span>
                        </motion.div>
                    )}
                </div>
            </button>
        </div>
    );
};

export default ReactionPlayer;