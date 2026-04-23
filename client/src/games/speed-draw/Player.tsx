import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';
import TimerRing from '../../components/ui/TimerRing';

const SpeedDrawPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess } = useSound();
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [votedId, setVotedId] = useState<string | null>(null);
    const lastPos = useRef({ x: 0, y: 0 });

    const { phase, gameData, players } = (gameState as any) || {};
    const { submissions = {}, votes = {}, timer: timeLeft, subPhase } = gameData || {};
    const myId = socket?.id || '';
    const mySubmission = submissions[myId];
    const myVote = votes[myId];
    const myPrompt = gameData.playerPrompts?.[myId] || "SOMETHING AMAZING";

    useEffect(() => {
        setHasSubmitted(false);
        setVotedId(null);
    }, [subPhase]);

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

    const getPos = (e: React.TouchEvent | React.MouseEvent | any) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const startDraw = (e: any) => {
        if (hasSubmitted) return;
        setIsDrawing(true);
        lastPos.current = getPos(e);
    };

    const draw = (e: any) => {
        if (!isDrawing || hasSubmitted) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        lastPos.current = pos;
    };

    const endDraw = () => setIsDrawing(false);

    // Live Broadcast: Send low-fidelity thumbnails every 2 seconds
    useEffect(() => {
        if (subPhase !== 'DRAWING' || hasSubmitted) return;

        const broadcastInterval = setInterval(() => {
            const canvas = canvasRef.current;
            if (!canvas || !isDrawing) return; // Only broadcast if they are actively drawing

            // Send small low-quality JPG to save bandwidth
            const liveData = canvas.toDataURL('image/jpeg', 0.1);
            socket?.emit('gameInput', { liveDrawing: liveData });
        }, 2500);

        return () => clearInterval(broadcastInterval);
    }, [subPhase, hasSubmitted, socket, isDrawing]);

    const handleSubmit = () => {
        const canvas = canvasRef.current;
        if (!canvas || hasSubmitted) return;
        setHasSubmitted(true);
        socket?.emit('gameInput', { drawing: canvas.toDataURL('image/png', 0.5) });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleVote = (targetId: string) => {
        if (votedId || targetId === myId) return;
        setVotedId(targetId);
        socket?.emit('gameInput', { targetPid: targetId });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '🎨' : '🏛️'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter text-center">
                        {isIntro ? "SPEED DRAW" : "GALLERY OPEN"}
                    </h2>
                    <p className="text-2xl text-[#00ffff] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "GRAB YOUR BRUSH" : "BEHOLD THE ART"}
                    </p>
                </div>
            </div>
        );
    }

    if (phase === 'REVEAL') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="text-[12rem]">🎨</motion.div>
                <div className="space-y-4">
                    <h3 className="text-6xl font-black uppercase tracking-tighter text-[#ff00ff] italic">DRAWINGS REVEALED!</h3>
                    <p className="text-2xl text-white/30 font-black uppercase tracking-[0.4em] animate-pulse">Watch the big screen!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-4 space-y-4 bg-[#0d0f1a] overflow-hidden safe-area-inset-bottom">
            <AnimatePresence mode="wait">
                {subPhase === 'DRAWING' && (
                    <motion.div
                        key="drawing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col space-y-4"
                    >
                        {hasSubmitted || mySubmission ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">🖌️</div>
                                <h3 className="text-5xl font-black uppercase tracking-tighter text-[#00ff00] italic">ART SUBMITTED!</h3>
                                <p className="text-xl text-white/40 font-black uppercase tracking-widest">Waiting for the other artists...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-3xl border border-white/10">
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-1">CANVAS DIRECTIVE</p>
                                        <h2 className="text-xl font-black text-[#00ffff] uppercase italic tracking-tighter leading-tight">"{myPrompt}"</h2>
                                    </div>
                                    <div className="ml-4">
                                        <TimerRing timeLeft={timeLeft || 0} maxTime={60} size={50} accentColor="#00ffff" />
                                    </div>
                                </div>

                                <div className="flex-1 bg-white rounded-[2rem] overflow-hidden border-4 border-white/5 shadow-inner touch-none relative min-h-[300px]">
                                    <canvas
                                        ref={canvasRef}
                                        width={600}
                                        height={800}
                                        className="w-full h-full cursor-crosshair"
                                        onMouseDown={startDraw}
                                        onMouseMove={draw}
                                        onMouseUp={endDraw}
                                        onMouseLeave={endDraw}
                                        onTouchStart={startDraw}
                                        onTouchMove={draw}
                                        onTouchEnd={endDraw}
                                    />
                                    {isDrawing && <div className="absolute top-4 left-4 bg-[#0d0f1a]/80 text-white font-black px-3 py-1 rounded-full text-[10px] animate-pulse">PAINTING...</div>}
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmit}
                                    className="w-full bg-gradient-to-r from-[#00ffff] to-[#00ff00] text-[#0d0f1a] py-5 rounded-[1.5rem] font-black text-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,255,255,0.3)] border-2 border-white/20"
                                >
                                    SHIP IT!
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                )}

                {subPhase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col space-y-6 overflow-hidden"
                    >
                        <h2 className="text-center text-3xl font-black text-[#ffff00] mb-4 uppercase italic">JUDGE THE GALLERY</h2>
                        
                        {votedId || myVote ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[12rem] animate-pulse">🎨</div>
                                <h3 className="text-5xl font-black text-[#ffff00] uppercase tracking-tighter italic shadow-2xl">VOTE CAST!</h3>
                                <p className="text-2xl text-white/40 font-black uppercase tracking-widest">Waiting for judgment day...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-10 scrollbar-hide">
                                {Object.entries(submissions).map(([id, dataUrl]: [string, any]) => {
                                    if (id === myId) return null;
                                    return (
                                        <motion.button
                                            key={id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleVote(id)}
                                            className="bg-white p-4 rounded-[3rem] border-8 border-white/5 flex flex-col items-center gap-4 group"
                                        >
                                            <div className="w-full aspect-square bg-[#f0f0f0] rounded-[2rem] overflow-hidden p-4">
                                                <img src={dataUrl} alt="" className="w-full h-full object-contain filter contrast-125" />
                                            </div>
                                            <div className="text-xl font-black text-[#0d0f1a] uppercase tracking-tighter truncate w-full px-2 text-center group-active:text-[#ff00ff]">
                                                {players?.[id]?.avatar} {players?.[id]?.name}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpeedDrawPlayer;