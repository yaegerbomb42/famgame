import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const DrawChainPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess } = useSound();
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [prompts, setPrompts] = useState(['', '', '']);
    const [guess, setGuess] = useState('');
    const lastPos = useRef({ x: 0, y: 0 });

    const { phase, gameData } = (gameState as any) || {};
    const { 
        subPhase, 
        assignments = {}, 
        drawings = {}, 
        guesses = {},
        currentDrawingIndex = 0,
    } = gameData || {};

    
    const myId = socket?.id || '';
    const myAssignment = assignments[myId];
    const drawingsList = Object.entries(drawings);
    const currentDrawingPid = drawingsList[currentDrawingIndex]?.[0];
    const hasGuessedCurrent = guesses[currentDrawingPid]?.[myId];

    useEffect(() => {
        setHasSubmitted(false);
        setGuess('');
    }, [subPhase, currentDrawingIndex]);

    useEffect(() => {
        if (subPhase === 'DRAWING' && !hasSubmitted) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [subPhase, hasSubmitted]);

    const getPos = (e: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const startDraw = (e: any) => { if (!hasSubmitted) { setIsDrawing(true); lastPos.current = getPos(e); } };
    const draw = (e: any) => {
        if (!isDrawing || hasSubmitted) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.stroke();
        lastPos.current = pos;
    };

    const handleSubmitPrompts = () => {
        if (prompts.some(p => !p.trim())) return;
        socket?.emit('gameInput', { prompts });
        setHasSubmitted(true);
        playSuccess();
    };

    const handleSubmitDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas || hasSubmitted) return;
        setHasSubmitted(true);
        socket?.emit('gameInput', { drawing: canvas.toDataURL('image/png', 0.5) });
        playSuccess();
    };

    const handleSubmitGuess = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!guess.trim() || hasGuessedCurrent) return;
        socket?.emit('gameInput', { guess });
        setGuess('');
        playSuccess();
    };

    if (phase === 'INTRO' || phase === 'REVEAL') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0d0f1a]">
                <div className="text-[10rem] animate-pulse">⛓️</div>
                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">
                    {phase === 'INTRO' ? "DRAW CHAIN" : "CHAIN COMPLETE"}
                </h2>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-4 bg-[#0d0f1a] overflow-hidden safe-area-inset-bottom">
            <AnimatePresence mode="wait">
                {subPhase === 'SUBMIT_PROMPTS' && (
                    <motion.div key="prompts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col space-y-6">
                        {hasSubmitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">🧠</div>
                                <h3 className="text-4xl font-black text-[#00ff00] uppercase">PROMPTS SEEDED!</h3>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col space-y-4">
                                <h2 className="text-3xl font-black text-white uppercase italic">3 RANDOM THINGS</h2>
                                {prompts.map((p, i) => (
                                    <input
                                        key={i}
                                        value={p}
                                        onChange={e => {
                                            const next = [...prompts];
                                            next[i] = e.target.value;
                                            setPrompts(next);
                                        }}
                                        placeholder={`Item ${i + 1}...`}
                                        className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-2xl text-white font-bold text-xl focus:border-[#00ffff] outline-none"
                                    />
                                ))}
                                <button onClick={handleSubmitPrompts} className="bg-[#00ffff] text-black p-6 rounded-2xl font-black text-2xl uppercase mt-auto">SEND IT</button>
                            </div>
                        )}
                    </motion.div>
                )}

                {subPhase === 'DRAWING' && (
                    <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col space-y-4">
                        {hasSubmitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">🖌️</div>
                                <h3 className="text-4xl font-black text-[#00ff00] uppercase italic">SKETCH SENT!</h3>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">YOUR TARGET</p>
                                    <h2 className="text-xl font-black text-[#ff00ff] uppercase italic leading-tight">"{myAssignment}"</h2>
                                </div>
                                <div className="flex-1 bg-white rounded-[2rem] overflow-hidden border-4 border-white/5 relative min-h-[300px]">
                                    <canvas ref={canvasRef} width={600} height={800} className="w-full h-full" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)} />
                                </div>
                                <button onClick={handleSubmitDrawing} className="bg-[#ff00ff] text-white p-5 rounded-2xl font-black text-2xl uppercase">SUBMIT ART</button>
                            </>
                        )}
                    </motion.div>
                )}

                {subPhase === 'GUESSING' && (
                    <motion.div key="guessing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col space-y-6">
                        <div className="text-center py-8">
                            {currentDrawingPid === myId ? (
                                <div className="space-y-4">
                                    <div className="text-8xl animate-bounce">👀</div>
                                    <h3 className="text-4xl font-black text-[#00ffff] uppercase">YOUR ART!</h3>
                                    <p className="text-white/40 font-bold uppercase tracking-widest">Can they guess "{myAssignment}"?</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitGuess} className="space-y-6">
                                    <h2 className="text-3xl font-black text-white uppercase italic">WHAT IS THIS?</h2>
                                    <input
                                        value={guess}
                                        onChange={e => setGuess(e.target.value)}
                                        placeholder="Type your guess..."
                                        disabled={!!hasGuessedCurrent}
                                        className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-2xl text-white font-bold text-xl focus:border-[#00ffff] outline-none"
                                    />
                                    <button type="submit" disabled={!!hasGuessedCurrent} className={`w-full p-6 rounded-2xl font-black text-2xl uppercase ${hasGuessedCurrent ? 'bg-[#00ff00] text-black' : 'bg-[#00ffff] text-black'}`}>
                                        {hasGuessedCurrent ? 'GUESS SENT' : 'SEND GUESS'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DrawChainPlayer;
