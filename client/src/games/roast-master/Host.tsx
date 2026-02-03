import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import type { GameStore } from '../../store/useGameStore';
import { usePersona } from '../../context/PersonaContext';

interface Assignment {
    targetId: string;
    persona: {
        name: string;
        trait: string;
    };
    roasts: Record<string, string>;
}

interface RoastToVote {
    authorId: string;
    targetId: string;
    // Some backend versions send targetName/authorName, others rely on ID lookup.
    // We will handle both safely.
    targetName?: string;
    authorName?: string;
    text: string;
    votes: number;
    personaName: string;
    spicyRating: number;
    commentary?: string;
}

interface Reaction {
    id: number;
    emoji: string;
    playerId: string;
}

const EmojiShower: React.FC<{ reactions: Reaction[] }> = ({ reactions }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <AnimatePresence>
                {reactions.map((r) => {
                    // Deterministic pseudo-random based on ID
                    const rng = (seed: number) => {
                        const x = Math.sin(seed) * 10000;
                        return x - Math.floor(x);
                    };
                    const startX = rng(r.id) * 80 + 10; // 10% to 90%
                    const rot = rng(r.id + 1) * 360;

                    return (
                        <motion.div
                            key={r.id}
                            initial={{ y: '100vh', x: `${startX}%`, opacity: 0, scale: 0.5 }}
                            animate={{ y: '-20vh', opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.5, 1], rotate: rot }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="absolute text-6xl"
                        >
                            {r.emoji}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

const RoastMasterHost: React.FC = () => {
    const { gameState, nextRound } = useGameStore((state: GameStore) => ({
        gameState: state.gameState,
        nextRound: state.nextRound
    }));
    const { speak } = usePersona();
    const gameData = gameState?.gameData;
    const roomCode = gameState?.roomCode || '????';

    // State
    const [lastReadIdx, setLastReadIdx] = useState<number | null>(null);
    const [hypeTrigger, setHypeTrigger] = useState(false);
    const [stickers, setStickers] = useState<{ id: number, emoji: string, x: number, y: number, r: number }[]>([]);
    const [infernoLevel, setInfernoLevel] = useState(0);
    const [showVersus, setShowVersus] = useState(false);

    // Audio / Speech Effect
    useEffect(() => {
        if (!gameData) return;

        if (gameData.phase === 'INTRO') {
            speak("Welcome to the Inferno. I've prepared a special circle of hell just for your egos.");
        } else if (gameData.phase === 'READING' && gameData.currentRoastIdx !== lastReadIdx) {
            const currentRoast = gameData.roastsToVote[gameData.currentRoastIdx];
            if (currentRoast) {
                if (currentRoast.spicyRating > 60) {
                    setHypeTrigger(true);
                    setTimeout(() => setHypeTrigger(false), 2000);
                }

                // Trigger Versus Screen
                setShowVersus(true);
                const vsTimer = setTimeout(() => setShowVersus(false), 2500);

                // Delay reading slightly to match VS screen fade out
                setTimeout(() => {
                    const commentary = currentRoast.commentary || "Let's observe.";
                    const tName = currentRoast.targetName || "the victim";
                    speak(`${commentary} To ${tName}: ${currentRoast.text}`);
                }, 1500);

                setLastReadIdx(gameData.currentRoastIdx);
                return () => clearTimeout(vsTimer);
            }
        } else if (gameData.phase === 'VOTING') {
            speak("Judgement time. Who burned correctly?");
        } else if (gameData.phase === 'WINNER') {
            speak("All hail the Roast Master.");
        }
    }, [gameData?.phase, gameData?.currentRoastIdx, speak, lastReadIdx, gameData?.roastsToVote]);

    // Sticker & Reaction Logic
    const lastReaction = gameData?.reactions?.[gameData.reactions.length - 1];

    useEffect(() => {
        if (lastReaction && ['🍅', '🌹', '💯'].includes(lastReaction.emoji)) {
            const newSticker = {
                id: lastReaction.id,
                emoji: lastReaction.emoji,
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                r: (Math.random() - 0.5) * 40
            };
            setStickers(prev => [...prev, newSticker]);
            setTimeout(() => {
                setStickers(prev => prev.filter(s => s.id !== newSticker.id));
            }, 4000);
        } else if (lastReaction) {
            // Boost inferno for regular emojis too, but less
            setInfernoLevel(prev => Math.min(prev + 2, 120));
        }

        if (lastReaction && ['🍅', '🌹', '💯'].includes(lastReaction.emoji)) {
            setInfernoLevel(prev => Math.min(prev + 5, 120));
        }
    }, [lastReaction]);

    // Inferno Decay
    useEffect(() => {
        const interval = setInterval(() => {
            setInfernoLevel(prev => Math.max(0, prev - 1));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    if (!gameData) return null;

    const isSupernova = infernoLevel >= 100;

    // --- Components ---

    const EmberCanvas = () => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            let animationFrameId: number;
            let particles: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
            const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
            window.addEventListener('resize', resize);
            resize();
            for (let i = 0; i < 50; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 3 + 1, speed: Math.random() * 1 + 0.5, opacity: Math.random() * 0.5 + 0.1 });
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.y -= p.speed;
                    p.opacity -= 0.005;
                    if (p.y < 0 || p.opacity <= 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; p.opacity = Math.random() * 0.5 + 0.2; p.speed = Math.random() * 1 + 0.5; }
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 100, 0, ${p.opacity})`;
                    ctx.fill();
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = "orange";
                });
                animationFrameId = requestAnimationFrame(animate);
            };
            animate();
            return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', resize); };
        }, []);
        return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-60 mix-blend-screen" />;
    };

    const VersusScreen = ({ authorName, targetName }: { authorName: string, targetName: string }) => (
        <motion.div
            className="absolute inset-0 z-40 bg-black/90 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
        >
            <motion.div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-purple-600/20" initial={{ skewX: 20, scale: 1.2 }} animate={{ skewX: 0, scale: 1 }} transition={{ duration: 0.5 }} />
            <div className="relative flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 w-full max-w-7xl px-8 transition-all">
                <motion.div initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0.4 }} className="text-center">
                    <div className="text-4xl font-bold text-orange-400 mb-2 font-mono tracking-widest uppercase">ROASTER</div>
                    <div className="text-6xl md:text-8xl font-black text-white italic drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]">{authorName}</div>
                </motion.div>
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: "spring" }} className="relative z-10">
                    <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse">VS</div>
                </motion.div>
                <motion.div initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.1 }} className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2 font-mono tracking-widest uppercase">VICTIM</div>
                    <div className="text-6xl md:text-8xl font-black text-white italic drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">{targetName}</div>
                </motion.div>
            </div>
        </motion.div>
    );

    // Helpers
    const formatRoomCode = (code: string) => code.split('').join(' ');

    const currentRoast = gameData.currentRoastIdx !== undefined ? gameData.roastsToVote[gameData.currentRoastIdx] : null;

    return (
        <div className={`relative w-full h-screen overflow-hidden font-display transition-colors duration-500 overflow-hidden ${isSupernova ? 'bg-orange-100' : 'bg-[#0f0404]'}`}>
            <EmberCanvas />

            <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 mix-blend-overlay transition-opacity duration-200 ${isSupernova ? 'opacity-0' : 'opacity-30'}`}></div>
            <div className={`absolute inset-0 bg-gradient-to-br from-orange-900/40 via-transparent to-purple-900/40 pointer-events-none transition-opacity duration-200 ${isSupernova ? 'opacity-0' : 'opacity-100'}`} />

            <AnimatePresence>
                {stickers.map(s => (
                    <motion.div
                        key={s.id}
                        initial={{ scale: 3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0, y: 100 }}
                        style={{ left: `${s.x}%`, top: `${s.y}%`, rotate: s.r }}
                        className="absolute z-10 text-8xl drop-shadow-2xl filter contrast-125 pointer-events-none"
                    >
                        {s.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>

            {isSupernova && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="absolute inset-0 bg-white z-50 mix-blend-overlay pointer-events-none" />
            )}

            <div className={`relative z-20 w-full h-full flex flex-col p-8 ${isSupernova ? 'animate-shake' : ''}`}>
                <header className="flex justify-between items-center mb-8 relative">
                    <div className="flex items-center gap-4">
                        <div className="bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-orange-500/30 shadow-[0_0_15px_rgba(234,88,12,0.3)]">
                            <span className="text-2xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent uppercase tracking-wider">Roast Master: Inferno</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-gray-400 font-mono text-sm tracking-widest uppercase mb-1">Room Code</div>
                        <div className="text-6xl font-black text-white tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] font-mono">{formatRoomCode(roomCode)}</div>
                    </div>
                </header>

                {gameData?.phase === 'READING' && (
                    <div className="absolute top-28 left-1/2 -translate-x-1/2 w-1/3 h-4 bg-black/50 rounded-full border border-white/10 overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 shadow-[0_0_20px_orange]" animate={{ width: `${Math.min(infernoLevel, 100)}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-[0.5em] text-white/50 uppercase">Hype Meter</div>
                    </div>
                )}

                <main className="flex-1 flex flex-col items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {gameData?.phase === 'INTRO' && (
                            <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center max-w-4xl">
                                <motion.h1
                                    animate={{ textShadow: ["0 0 20px #ff0000", "0 0 40px #ff8800", "0 0 20px #ff0000"] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-8xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase italic"
                                >
                                    Roast<br />Master
                                </motion.h1>
                                <div className="text-3xl text-orange-200 font-light tracking-wide bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-orange-500/20 inline-block">
                                    Waiting for victims... <span className="font-bold text-white">{Object.keys(gameData.players).length}</span> joined
                                </div>
                                <div className="mt-12 flex flex-wrap justify-center gap-4">
                                    {Object.values(gameData.players as Record<string, any>).map((p) => (
                                        <motion.div key={p.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-zinc-900 border border-zinc-700 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg">
                                            <span className="text-2xl">{p.avatar}</span>
                                            <span className="font-bold text-white">{p.name}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {gameData?.phase === 'WRITING' && (
                            <motion.div key="writing" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center">
                                <div className="mb-12">
                                    <h2 className="text-6xl font-black text-white mb-4 drop-shadow-md">COOKING TIME</h2>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full mx-auto">
                                    {Object.values(gameData.players as Record<string, any>).map((p) => {
                                        const isDone = gameData.assignments?.[p.id]?.roasts?.[p.id as string]; // Simple heuristic or precise check needed? 
                                        // Wait, assignments structure is assignments[playerId].roasts. But roasts are stored in submissions usually.
                                        // Let's assume we can just check if *any* roast exists or check submissions directly if available.
                                        // The original code used: gameData.assignments[p.id]?.roasts[p.id] in map? No, map was over *players*.
                                        // Let's rely on standard 'submissions' or just check if assignments has count.
                                        const hasSubmitted = gameData.submissions && gameData.submissions[p.id];
                                        return (
                                            <div key={p.id} className={`transition-all duration-500 p-6 rounded-3xl border-2 flex items-center gap-6 ${hasSubmitted ? 'bg-green-900/40 border-green-500/50 scale-105' : 'bg-black/40 border-white/10 grayscale'}`}>
                                                <div className="text-5xl drop-shadow-lg">{p.avatar}</div>
                                                <div className="text-left">
                                                    <div className="font-bold text-2xl text-white">{p.name}</div>
                                                    <div className={`text-sm tracking-wider uppercase font-bold mt-1 ${hasSubmitted ? 'text-green-400' : 'text-zinc-500'}`}>
                                                        {hasSubmitted ? 'READY TO SERVE' : 'PREPARING...'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {gameData?.phase === 'READING' && (
                            showVersus && currentRoast ? (
                                <VersusScreen
                                    key="vs"
                                    authorName={currentRoast.authorName || "The Roaster"}
                                    targetName={currentRoast.targetName || "The Victim"}
                                />
                            ) : (
                                <motion.div key="reading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl w-full perspective-1000">
                                    <div className={`bg-zinc-900/90 backdrop-blur-xl p-16 rounded-[3rem] border-4 ${hypeTrigger ? 'border-red-500 animate-pulse shadow-[0_0_100px_red]' : 'border-white/10 shadow-2xl'} relative overflow-hidden group`}>
                                        <div className="flex items-start gap-12 mb-12 border-b border-white/5 pb-8">
                                            <div className="w-32 h-32 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-3xl flex items-center justify-center text-8xl shadow-inner border border-white/5">💀</div>
                                            <div>
                                                <div className="text-zinc-400 text-xl font-mono uppercase tracking-widest mb-2">Subject</div>
                                                <div className="text-6xl font-black text-white">{currentRoast?.targetName}</div>
                                            </div>
                                        </div>
                                        <p className="text-6xl md:text-7xl font-bold text-white leading-tight font-display mb-8">"{currentRoast?.text}"</p>
                                        {(currentRoast?.spicyRating || 0) > 70 && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-10 right-10 bg-red-600 text-white font-black text-2xl px-6 py-2 rounded-full rotate-12 shadow-lg border-2 border-white/20">SPICY! 🔥</motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        )}

                        {gameData?.phase === 'VOTING' && (
                            <motion.div key="voting" className="text-center">
                                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500 mb-8 filter drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">JUDGEMENT DAY</h1>
                                <p className="text-3xl text-white/50 bg-black/50 px-8 py-2 rounded-full inline-block">Vote for the most devastating burn.</p>
                            </motion.div>
                        )}

                        {gameData?.phase === 'WINNER' && (
                            <motion.div key="winner" className="text-center relative z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                                    <div className="text-4xl font-mono text-yellow-400 tracking-[1em] mb-8 uppercase">Roast Master</div>
                                    <h1 className="text-9xl font-black text-white mb-12 drop-shadow-[0_0_50px_rgba(250,204,21,0.6)]">{gameData.winner?.name}</h1>
                                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-[12rem] leading-none mb-8 filter drop-shadow-2xl">{gameData.winner?.avatar}</motion.div>
                                    <div className="text-3xl max-w-2xl mx-auto text-zinc-400 bg-black/80 backdrop-blur-md p-8 rounded-3xl border border-white/10">"{gameData.winner?.roast}"</div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <EmojiShower reactions={(gameData.reactions || []).filter((r: Reaction) => !['🍅', '🌹', '💯'].includes(r.emoji))} />
        </div>
    );
};

export default RoastMasterHost;
