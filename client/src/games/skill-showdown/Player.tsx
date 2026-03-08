import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

import type { Socket } from 'socket.io-client';

type SkillSubmitData =
    | { circularity: number }
    | { grid: boolean[] }
    | { consistency: number }
    | { color: { r: number; g: number; b: number } }
    | { angle: number };

interface SkillShowdownPlayerProps {
    phase: 'PREVIEW' | 'PLAYING' | 'REVEAL';
    challengeIndex: number;
    challenge: {
        type: string;
        title: string;
        instruction: string;
        timeLimit: number;
        grid?: boolean[];
        targetColor?: { r: number; g: number; b: number };
        targetAngle?: number;
        targetBPM?: number;
    };
    submitted: boolean;
    socket: Socket;
    scores: Record<string, number>;
    myId: string;
}

// ---- CIRCLE DRAW ----
function CircleDraw({ onSubmit }: { onSubmit: (data: SkillSubmitData) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<{ x: number; y: number }[]>([]);
    const drawingRef = useRef(false);

    const getPos = (e: React.TouchEvent | React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const touch = 'touches' in e ? e.touches[0] : e;
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };

    const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        drawingRef.current = true;
        pointsRef.current = [getPos(e)];
        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.clearRect(0, 0, 300, 300);
        ctx.beginPath();
        ctx.strokeStyle = '#22d3ee'; // cyan-400
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const p = getPos(e);
        ctx.moveTo(p.x, p.y);
        if (navigator.vibrate) navigator.vibrate(5);
    };

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        if (!drawingRef.current) return;
        const p = getPos(e);
        pointsRef.current.push(p);
        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    };

    const endDraw = () => {
        drawingRef.current = false;
        const pts = pointsRef.current;
        if (pts.length < 10) return;

        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        const radii = pts.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2));
        const avgR = radii.reduce((s, r) => s + r, 0) / radii.length;
        const variance = radii.reduce((s, r) => s + (r - avgR) ** 2, 0) / radii.length;
        const stdDev = Math.sqrt(variance);
        const circularity = Math.max(0, 100 - (stdDev / avgR) * 100);

        if (navigator.vibrate) navigator.vibrate(20);
        onSubmit({ circularity: Math.round(circularity * 10) / 10 });
    };

    return (
        <div className="flex flex-col items-center">
            <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="bg-zinc-900/50 border-2 border-white/5 rounded-3xl touch-none shadow-2xl"
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
            />
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Draw a Circle & Release</p>
        </div>
    );
}

// ---- MEMORY GRID ----
function MemoryGrid({ grid, onSubmit }: { grid: boolean[]; onSubmit: (data: SkillSubmitData) => void }) {
    const [showPattern, setShowPattern] = useState(true);
    const [playerGrid, setPlayerGrid] = useState(Array(16).fill(false));
    const [isInternalSubmitted, setInternalSubmitted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowPattern(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const toggle = (i: number) => {
        if (showPattern || isInternalSubmitted) return;
        if (navigator.vibrate) navigator.vibrate(10);
        setPlayerGrid(prev => {
            const next = [...prev];
            next[i] = !next[i];
            return next;
        });
    };

    const submit = () => {
        if (isInternalSubmitted) return;
        setInternalSubmitted(true);
        if (navigator.vibrate) navigator.vibrate(30);
        onSubmit({ grid: playerGrid });
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-4 gap-3 w-[280px]">
                {(showPattern ? grid : playerGrid).map((lit, i) => (
                    <motion.button
                        key={i}
                        whileTap={!showPattern && !isInternalSubmitted ? { scale: 0.9 } : {}}
                        className={`aspect-square rounded-xl border-2 transition-all duration-300 ${lit
                            ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                            : 'bg-white/5 border-white/5 hover:border-white/20'
                            } ${showPattern ? 'pointer-events-none' : ''}`}
                        onClick={() => toggle(i)}
                    />
                ))}
            </div>
            {!showPattern && !isInternalSubmitted && (
                <button
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-cyan-900/20"
                    onClick={submit}
                >
                    Confirm Pattern
                </button>
            )}
            {showPattern && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 animate-pulse">Memorize Now!</p>}
        </div>
    );
}

// ---- TEMPO TAP ----
function TempoTap({ targetBPM, onSubmit }: { onSubmit: (data: SkillSubmitData) => void; targetBPM: number }) {
    const tapsRef = useRef<number[]>([]);
    const [tapCount, setTapCount] = useState(0);
    const [isInternalSubmitted, setInternalSubmitted] = useState(false);

    const tap = useCallback(() => {
        if (isInternalSubmitted) return;
        const now = Date.now();
        tapsRef.current.push(now);
        setTapCount(c => c + 1);
        if (navigator.vibrate) navigator.vibrate(15);

        if (tapsRef.current.length >= 12) {
            const intervals = [];
            for (let i = 1; i < tapsRef.current.length; i++) {
                intervals.push(tapsRef.current[i] - tapsRef.current[i - 1]);
            }
            const targetInterval = 60000 / targetBPM;
            const avgDiff = intervals.reduce((s, iv) => s + Math.abs(iv - targetInterval), 0) / intervals.length;
            const consistency = Math.max(0, 100 - (avgDiff / targetInterval) * 100);
            setInternalSubmitted(true);
            if (navigator.vibrate) navigator.vibrate(50);
            onSubmit({ consistency: Math.round(consistency * 10) / 10 });
        }
    }, [isInternalSubmitted, targetBPM, onSubmit]);

    return (
        <div className="flex flex-col items-center gap-8">
            <motion.button
                className="w-40 h-40 rounded-full border-4 border-fuchsia-500/50 bg-fuchsia-500/10 flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(217,70,239,0.2)]"
                whileTap={{ scale: 0.85, backgroundColor: 'rgba(217,70,239,0.3)', boxShadow: '0_0_60px_rgba(217,70,239,0.5)' }}
                onClick={tap}
                disabled={isInternalSubmitted}
            >
                {isInternalSubmitted ? '✨' : '👆'}
            </motion.button>
            <div className="text-center">
                <p className="text-4xl font-black text-white italic tracking-tighter mb-2">
                    {isInternalSubmitted ? 'SYNCED' : `${12 - tapCount}`}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                    {isInternalSubmitted ? 'Transmission Received' : 'Taps Remaining'}
                </p>
            </div>
        </div>
    );
}

// ---- COLOR MATCH ----
function ColorMatch({ target, onSubmit }: { onSubmit: (data: SkillSubmitData) => void; target: { r: number; g: number; b: number } }) {
    const [r, setR] = useState(128);
    const [g, setG] = useState(128);
    const [b, setB] = useState(128);
    const [isInternalSubmitted, setInternalSubmitted] = useState(false);

    const submit = () => {
        if (isInternalSubmitted) return;
        setInternalSubmitted(true);
        if (navigator.vibrate) navigator.vibrate(30);
        onSubmit({ color: { r, g, b } });
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-sm">
            <div className="flex gap-4 w-full h-32">
                <div className="flex-1 flex flex-col gap-2">
                    <motion.div
                        initial={false}
                        animate={{ backgroundColor: `rgb(${target.r},${target.g},${target.b})` }}
                        className="flex-1 rounded-3xl border-2 border-white/10 shadow-inner"
                    />
                    <span className="text-[9px] font-black uppercase text-center text-white/40 tracking-widest">Target</span>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <motion.div
                        initial={false}
                        animate={{ backgroundColor: `rgb(${r},${g},${b})` }}
                        className="flex-1 rounded-3xl border-2 border-white/20 shadow-2xl"
                    />
                    <span className="text-[9px] font-black uppercase text-center text-white/40 tracking-widest">Yours</span>
                </div>
            </div>

            <div className="w-full space-y-6 bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5">
                {[
                    { label: 'R', val: r, set: setR, color: 'text-red-500' },
                    { label: 'G', val: g, set: setG, color: 'text-green-500' },
                    { label: 'B', val: b, set: setB, color: 'text-blue-500' }
                ].map(s => (
                    <div key={s.label} className="flex items-center gap-4">
                        <span className={`w-4 font-black text-xs ${s.color}`}>{s.label}</span>
                        <input
                            type="range" min="0" max="255" value={s.val}
                            aria-label={`Adjust ${s.label} channel`}
                            onChange={e => {
                                if (!isInternalSubmitted) {
                                    s.set(+e.target.value);
                                    if (navigator.vibrate) navigator.vibrate(5);
                                }
                            }}
                            disabled={isInternalSubmitted}
                            className="flex-1 accent-white h-8 opacity-60 hover:opacity-100"
                        />
                    </div>
                ))}
            </div>

            {!isInternalSubmitted && (
                <button
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-fuchsia-900/20"
                    onClick={submit}
                >
                    Lock Tint
                </button>
            )}
        </div>
    );
}

// ---- ANGLE GUESS ----
function AngleGuess({ onSubmit }: { onSubmit: (data: SkillSubmitData) => void }) {
    const [angle, setAngle] = useState(90);
    const [isInternalSubmitted, setInternalSubmitted] = useState(false);

    const submit = () => {
        if (isInternalSubmitted) return;
        setInternalSubmitted(true);
        if (navigator.vibrate) navigator.vibrate(30);
        onSubmit({ angle });
    };

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-sm">
            <div className="relative w-48 h-48 rounded-full border-4 border-white/5 bg-zinc-900/50 flex items-center justify-center shadow-2xl">
                <motion.div
                    style={{ rotate: angle }}
                    className="absolute w-32 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-cyan-400 origin-[center_center]"
                >
                    <div className="absolute right-0 -top-1 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                </motion.div>
                <span className="text-4xl font-black text-white italic tabular-nums">{angle}°</span>
            </div>

            <div className="w-full bg-zinc-900/50 p-6 rounded-[2.5rem] border border-white/5 text-center">
                <input
                    type="range" min="0" max="360" value={angle}
                    aria-label="Adjust Trajectory Angle"
                    onChange={e => {
                        if (!isInternalSubmitted) {
                            setAngle(+e.target.value);
                            if (navigator.vibrate) navigator.vibrate(5);
                        }
                    }}
                    disabled={isInternalSubmitted}
                    className="w-full accent-cyan-400 h-12"
                />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Adjust Trajectory</p>
            </div>

            {!isInternalSubmitted && (
                <button
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-cyan-900/20"
                    onClick={submit}
                >
                    Final Angle
                </button>
            )}
        </div>
    );
}

// ---- MAIN COMPONENT ----
export default function SkillShowdownPlayer({ phase, challengeIndex, challenge, submitted: alreadySubmitted, socket, scores, myId }: SkillShowdownPlayerProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [prevChallengeIndex, setPrevChallengeIndex] = useState(challengeIndex);

    // Pattern: Adjust state during rendering to reset on challenge change
    if (challengeIndex !== prevChallengeIndex) {
        setHasSubmitted(false);
        setPrevChallengeIndex(challengeIndex);
    }

    const handleSubmit = (data: SkillSubmitData) => {
        if (hasSubmitted || alreadySubmitted) return;
        setHasSubmitted(true);
        socket.emit('submitSkillResult', data);
    };

    const isSubmitted = hasSubmitted || alreadySubmitted;

    return (
        <div className="flex flex-col h-full bg-zinc-950 p-6 items-center justify-center relative overflow-hidden text-white">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-500/5 blur-[100px] rounded-full pointer-events-none" />

            {phase === 'PREVIEW' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6 text-center max-w-sm"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="text-6xl mb-4"
                    >
                        {challenge.type === 'CIRCLE_DRAW' ? '🔘' : challenge.type === 'MEMORY_GRID' ? '🧩' : challenge.type === 'TEMPO_TAP' ? '🥁' : challenge.type === 'COLOR_MATCH' ? '🎨' : '📐'}
                    </motion.div>
                    <div className="text-4xl font-black uppercase tracking-tighter leading-none">{challenge.title}</div>
                    <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs px-8 italic">{challenge.instruction}</div>
                    <motion.div
                        className="mt-12 text-yellow-400 font-black tracking-[0.3em] text-sm animate-pulse"
                    >
                        STAY FOCUSED...
                    </motion.div>
                </motion.div>
            )}

            {phase === 'PLAYING' && !isSubmitted && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-sm"
                >
                    {challenge.type === 'CIRCLE_DRAW' && <CircleDraw onSubmit={handleSubmit} />}
                    {challenge.type === 'MEMORY_GRID' && challenge.grid && <MemoryGrid grid={challenge.grid} onSubmit={handleSubmit} />}
                    {challenge.type === 'TEMPO_TAP' && <TempoTap targetBPM={challenge.targetBPM || 120} onSubmit={handleSubmit} />}
                    {challenge.type === 'COLOR_MATCH' && challenge.targetColor && <ColorMatch target={challenge.targetColor} onSubmit={handleSubmit} />}
                    {challenge.type === 'ANGLE_GUESS' && <AngleGuess onSubmit={handleSubmit} />}
                </motion.div>
            )}

            {phase === 'PLAYING' && isSubmitted && (
                <div className="flex flex-col items-center gap-6">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-7xl"
                    >
                        📡
                    </motion.div>
                    <div className="text-center">
                        <div className="text-2xl font-black uppercase tracking-tight">Signal Sent</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-1">Awaiting Competitors</div>
                    </div>
                </div>
            )}

            {phase === 'REVEAL' && (
                <div className="flex flex-col items-center gap-8 text-center">
                    <div className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Sync Score</div>
                    {scores[myId] !== undefined && (
                        <div className="flex flex-col items-center">
                            <motion.div
                                className="text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: -5 }}
                                transition={{ type: 'spring', damping: 10 }}
                            >
                                {scores[myId]}%
                            </motion.div>
                            <p className="mt-8 text-white/50 font-bold uppercase text-[10px] tracking-widest italic">Look at the TV for global rankings</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
