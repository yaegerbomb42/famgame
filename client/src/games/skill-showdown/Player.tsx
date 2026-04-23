import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

// ---- CIRCLE DRAW (Re-implementation with S-Tier Aesthetics) ----
const CircleDraw = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<{ x: number; y: number }[]>([]);
    const drawingRef = useRef(false);
    const { playClick } = useSound();

    const getPos = (e: any) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        return { 
            x: (touch.clientX - rect.left) * (300 / rect.width), 
            y: (touch.clientY - rect.top) * (300 / rect.height) 
        };
    };

    const startDraw = (e: any) => {
        drawingRef.current = true;
        pointsRef.current = [getPos(e)];
        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.clearRect(0, 0, 300, 300);
        ctx.beginPath();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const p = getPos(e);
        ctx.moveTo(p.x, p.y);
        playClick();
    };

    const draw = (e: any) => {
        if (!drawingRef.current) return;
        const p = getPos(e);
        pointsRef.current.push(p);
        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    };

    const endDraw = () => {
        drawingRef.current = false;
        if (pointsRef.current.length < 15) return;
        const pts = pointsRef.current;
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        const radii = pts.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2));
        const avgR = radii.reduce((s, r) => s + r, 0) / radii.length;
        const stdDev = Math.sqrt(radii.reduce((s, r) => s + (r - avgR) ** 2, 0) / radii.length);
        const circularity = Math.max(0, 100 - (stdDev / avgR) * 150);
        onSubmit({ circularity: Math.round(circularity) });
    };

    return (
        <div className="flex flex-col items-center gap-10 w-full animate-in fade-in zoom-in duration-500">
            <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#00ffff] to-[#ff00ff] rounded-[3.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <canvas 
                    ref={canvasRef} 
                    width={300} 
                    height={300} 
                    className="relative bg-[#1a1f3a] border-8 border-white/10 rounded-[3rem] touch-none shadow-2xl cursor-crosshair" 
                    onTouchStart={startDraw} 
                    onTouchMove={draw} 
                    onTouchEnd={endDraw} 
                    onMouseDown={startDraw} 
                    onMouseMove={draw} 
                    onMouseUp={endDraw} 
                />
            </div>
            <div className="text-center space-y-2">
                <p className="text-3xl font-black uppercase text-white italic tracking-tighter italic">DRAW A PERFECT CIRCLE</p>
                <p className="text-xl font-black uppercase text-white/30 tracking-widest">NO PRESSURE.</p>
            </div>
        </div>
    );
};

// ---- COLOR MATCH (Re-implementation with S-Tier Aesthetics) ----
const ColorMatch = ({ target, onSubmit }: { target: any, onSubmit: (data: any) => void }) => {
    const [r, setR] = useState(128);
    const [g, setG] = useState(128);
    const [b, setB] = useState(128);

    const handleUpdate = (type: 'r'|'g'|'b', val: number) => {
        if (type === 'r') setR(val);
        if (type === 'g') setG(val);
        if (type === 'b') setB(val);
    };

    return (
        <div className="flex flex-col items-center gap-12 w-full max-w-md animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex gap-6 w-full h-48 relative">
                <div className="absolute inset-0 bg-white/5 rounded-[3rem] blur-2xl" />
                <div className="flex-1 rounded-[2.5rem] border-8 border-white/10 shadow-inner relative overflow-hidden" style={{ backgroundColor: `rgb(${target.r},${target.g},${target.b})` }}>
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-black text-white/40 uppercase tracking-widest">GOAL</span>
                </div>
                <div className="flex-1 rounded-[2.5rem] border-8 border-white/20 shadow-2xl relative overflow-hidden transition-all duration-300 transform scale-105" style={{ backgroundColor: `rgb(${r},${g},${b})` }}>
                    <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-black text-white/40 uppercase tracking-widest">YOURS</span>
                </div>
            </div>

            <div className="w-full space-y-10 bg-[#1a1f3a] p-10 rounded-[3rem] border-4 border-white/5 shadow-inner">
                {[
                    { l: 'RED', v: r, s: (v: number) => handleUpdate('r', v), c: 'from-[#ff4444] to-[#ff0000]' },
                    { l: 'GREEN', v: g, s: (v: number) => handleUpdate('g', v), c: 'from-[#44ff44] to-[#00ff00]' },
                    { l: 'BLUE', v: b, s: (v: number) => handleUpdate('b', v), c: 'from-[#4444ff] to-[#0000ff]' }
                ].map(x => (
                    <div key={x.l} className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-black text-white/30 uppercase tracking-[0.3em]">
                            <span>{x.l}</span>
                            <span>{x.v}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="255" 
                            value={x.v} 
                            aria-label={`Adjust ${x.l} channel`}
                            onChange={e => x.s(+e.target.value)} 
                            className="w-full h-4 rounded-full appearance-none bg-[#0d0f1a] overflow-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:shadow-[-100vw_0_0_100vw_rgba(255,255,255,0.2)]"
                        />
                    </div>
                ))}
            </div>

            <motion.button 
                whileTap={{ scale: 0.9 }}
                className="w-full py-10 bg-gradient-to-r from-[#ff00ff] to-[#00ffff] rounded-[2.5rem] text-4xl font-black uppercase italic tracking-tighter text-white shadow-[0_0_60px_rgba(255,0,255,0.3)] border-4 border-white/20" 
                onClick={() => onSubmit({ color: { r, g, b } })}
            >
                MATCH TINT
            </motion.button>
        </div>
    );
};

// ---- MEMORY GRID (Re-implementation with S-Tier Aesthetics) ----
const MemoryGrid = ({ grid, onSubmit }: { grid: boolean[], onSubmit: (data: any) => void }) => {
    const [showPattern, setShowPattern] = useState(true);
    const [playerGrid, setPlayerGrid] = useState(Array(16).fill(false));

    useEffect(() => {
        const timer = setTimeout(() => setShowPattern(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const toggle = (i: number) => {
        if (showPattern) return;
        const next = [...playerGrid];
        next[i] = !next[i];
        setPlayerGrid(next);
        if (navigator.vibrate) navigator.vibrate(20);
    };

    return (
        <div className="flex flex-col items-center gap-12 w-full animate-in zoom-in-50 duration-500">
            <div className="text-center space-y-2">
                <span className="text-xl font-black uppercase text-white/20 tracking-[0.4em] block">{showPattern ? 'WATCH THE PATTERN' : 'REPLICATE IT'}</span>
                <h3 className="text-6xl font-black text-white uppercase italic tracking-tighter italic">{showPattern ? 'EYES UP!' : 'BRAIN ON!'}</h3>
            </div>

            <div className={`grid grid-cols-4 gap-6 p-10 bg-[#1a1f3a] rounded-[4rem] border-8 border-white/5 shadow-2xl transition-all duration-500 ${showPattern ? 'scale-110 border-[#00ffff]/20' : 'scale-100'}`}>
                {(showPattern ? grid : playerGrid).map((lit, i) => (
                    <motion.button 
                        key={i} 
                        initial={false}
                        animate={{ 
                            scale: lit ? [1, 1.2, 1] : 1,
                            backgroundColor: lit ? '#00ffff' : '#0d0f1a'
                        }}
                        className={`aspect-square rounded-2xl border-4 ${lit ? 'border-white shadow-[0_0_30px_#00ffff]' : 'border-white/5 font-black text-white/5'}`} 
                        onClick={() => toggle(i)}
                    />
                ))}
            </div>

            {!showPattern && (
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="w-full max-w-md py-8 bg-[#00ffff] rounded-[2.5rem] text-4xl font-black uppercase italic tracking-tighter text-[#0d0f1a] shadow-[0_20px_50px_rgba(0,255,255,0.3)] border-4 border-white/20" 
                    onClick={() => onSubmit({ grid: playerGrid })}
                >
                    COMMIT
                </motion.button>
            )}
        </div>
    );
};

const PrecisionTap = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [pos, setPos] = useState(0);
    const posRef = useRef(0);
    const [direction, setDirection] = useState(1);
    const [isLocked, setIsLocked] = useState(false);
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        const animate = (time: number) => {
            if (lastTimeRef.current !== 0) {
                const deltaTime = time - lastTimeRef.current;
                setPos((prev: number) => {
                    let next = prev + direction * (deltaTime * 0.25);
                    if (next > 100) {
                        next = 100;
                        setDirection(-1);
                    } else if (next < 0) {
                        next = 0;
                        setDirection(1);
                    }
                    posRef.current = next;
                    return next;
                });
            }
            lastTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [direction]);

    const handleTap = () => {
        if (isLocked) return;
        setIsLocked(true);
        cancelAnimationFrame(requestRef.current);
        onSubmit({ stopPoint: posRef.current });
    };

    return (
        <div className="flex flex-col items-center gap-12 w-full animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
                <span className="text-xl font-black uppercase text-[#00ffff] tracking-[0.4em] block animate-pulse">PRECISION STRIKE</span>
                <h3 className="text-5xl font-black text-white uppercase italic tracking-tighter italic">WAIT FOR THE SWEET SPOT</h3>
            </div>

            <div className="w-full max-w-xl h-32 bg-[#1a1f3a] rounded-[2.5rem] border-8 border-white/5 relative overflow-hidden shadow-2xl">
                {/* TARGET ZONE (85% centered) */}
                <div 
                    className="absolute h-full bg-[#00ff00] opacity-20 blur-xl"
                    style={{ left: '75%', width: '20%' }}
                />
                <div 
                    className="absolute h-full bg-[#00ff00] opacity-40"
                    style={{ left: '80%', width: '10%' }}
                />
                <div 
                    className="absolute h-full border-x-4 border-white shadow-[0_0_30px_#00ff00] z-20"
                    style={{ left: '82.5%', width: '5%' }}
                />
                
                {/* MOVING MARKER */}
                <motion.div 
                    className="absolute top-0 bottom-0 w-4 bg-white shadow-[0_0_40px_#ffffff] z-30"
                    style={{ left: `${pos}%` }}
                />

                {/* TRACK GUIDES */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-white/10" />
            </div>

            <motion.button 
                whileTap={{ scale: 0.95 }}
                disabled={isLocked}
                className={`w-full max-w-md py-12 rounded-[3rem] text-5xl font-black uppercase italic tracking-tighter shadow-2xl border-4 transition-all duration-300 ${
                    isLocked 
                        ? 'bg-white/10 border-white/5 text-white/20' 
                        : 'bg-gradient-to-r from-[#ff00ff] to-[#00ffff] border-white/20 text-white hover:brightness-110'
                }`} 
                onClick={handleTap}
            >
                {isLocked ? 'STRIKE LOCKED' : 'HIT IT!'}
            </motion.button>
        </div>
    );
};

const SkillShowdownPlayer: React.FC = () => {
    const { gameState, socket } = useGameStore();
    const { playSuccess } = useSound();
    
    const { phase, gameData } = (gameState as any) || {};
    const { 
        challenge, 
        submissions = {}
    } = gameData || {};

    const myId = socket?.id || '';
    const mySubmission = submissions[myId];

    const handleSubmit = (data: any) => {
        if (mySubmission !== undefined) return;
        socket?.emit('gameInput', data);
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '⚡️' : '🏁'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic text-center">
                        {isIntro ? "SKILL SHOWDOWN" : "CLUTCH OVER"}
                    </h2>
                    <p className="text-2xl text-[#ffff00] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "STAY SHARP" : "BEHOLD THE ELITE"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-6 bg-[#0d0f1a] overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'PLAYING' && !mySubmission && (
                    <motion.div 
                        key="playing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex-1 flex flex-col items-center justify-center"
                    >
                        {challenge?.type === 'CIRCLE_DRAW' && <CircleDraw onSubmit={handleSubmit} />}
                        {challenge?.type === 'MEMORY_GRID' && <MemoryGrid grid={challenge.grid} onSubmit={handleSubmit} />}
                        {challenge?.type === 'COLOR_MATCH' && <ColorMatch target={challenge.targetColor} onSubmit={handleSubmit} />}
                        
                        {challenge?.type === 'PRECISION_TAP' && <PrecisionTap onSubmit={handleSubmit} />}
                        
                        {challenge?.type === 'ANGLE_GUESS' && (
                            <div className="text-center p-12 bg-[#1a1f3a] rounded-[3rem] border-8 border-[#ff00ff]/20 shadow-2xl">
                                <h3 className="text-4xl font-black text-white mb-8 italic uppercase tracking-tighter italic">{challenge.title}</h3>
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    className="px-16 py-8 bg-[#ff00ff] text-white rounded-[2rem] font-black text-3xl uppercase italic tracking-tighter italic shadow-[0_0_50px_rgba(255,0,255,0.4)]"
                                    onClick={() => handleSubmit({ mock: true })}
                                >
                                    READY? GO!
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}

                {(phase === 'PLAYING' && mySubmission !== undefined) && (
                    <motion.div 
                        key="waiting"
                        initial={{ scale: 0.8 }} 
                        animate={{ scale: 1 }} 
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
                    >
                        <div className="text-[12rem] animate-pulse">🛰️</div>
                        <div className="space-y-4">
                            <h3 className="text-5xl font-black italic text-[#00ff00] uppercase tracking-tighter italic font-black">TRANSMISSION SENT</h3>
                            <p className="text-2xl text-white/30 font-black uppercase tracking-widest leading-loose">Waiting for the other amateurs to catch up...</p>
                        </div>
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div 
                        key="reveal"
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
                    >
                        <div className="text-center space-y-4">
                            <span className="text-xl font-black text-white/20 uppercase tracking-[0.4em]">YOUR PRECISION</span>
                            <div className="text-[12rem] font-black text-[#ffff00] italic tracking-tighter italic leading-none drop-shadow-[0_0_80px_rgba(255,255,0,0.5)]">
                                {Math.round(mySubmission)}%
                            </div>
                        </div>
                        <p className="text-3xl font-black text-white/40 uppercase tracking-widest italic animate-pulse">EYES ON THE TV FOR THE RANKINGS</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillShowdownPlayer;