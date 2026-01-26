import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const SpeedDrawPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess } = useSound();
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [votedId, setVotedId] = useState<string | null>(null);
    const lastPos = useRef({ x: 0, y: 0 });

    const phase = gameState?.gameData?.phase || 'DRAWING';
    const prompt = gameState?.gameData?.prompt || '';
    const timer = gameState?.gameData?.timer || 0;
    const drawings = gameState?.gameData?.drawings || {};
    const players = gameState?.players || {};
    const myId = socket?.id || '';

    useEffect(() => {
        if (phase === 'DRAWING' && !hasSubmitted) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [phase, hasSubmitted]);

    const getPos = (e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
        setIsDrawing(true);
        lastPos.current = getPos(e);
    };

    const draw = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.stroke();
        lastPos.current = pos;
    };

    const endDraw = () => setIsDrawing(false);

    const submitDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas || hasSubmitted) return;
        setHasSubmitted(true);
        socket?.emit('submitDrawing', canvas.toDataURL());
        playSuccess();
    };

    const handleVote = (id: string) => {
        if (votedId || id === myId) return;
        setVotedId(id);
        socket?.emit('voteDrawing', id);
        playClick();
        playSuccess();
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'DRAWING' && (
                    <motion.div
                        key="drawing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden"
                    >
                        {hasSubmitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">🎨</div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic text-game-accent">MASTERPIECE SAVED!</h3>
                                <p className="text-white/40 text-xl font-black uppercase tracking-[0.3em] animate-pulse">Wait for the gallery...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center px-2">
                                    <div className="text-left">
                                        <span className="text-xs uppercase tracking-[0.4em] font-black text-white/20">Draw</span>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter">{prompt}</h3>
                                    </div>
                                    <div className="bg-game-secondary/10 px-4 py-2 rounded-2xl border-2 border-game-secondary shadow-glow">
                                        <span className="text-2xl font-black font-mono text-game-secondary">{timer}s</span>
                                    </div>
                                </div>

                                <div className="flex-1 relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white/10">
                                    <canvas
                                        ref={canvasRef}
                                        width={800}
                                        height={800}
                                        className="w-full h-full touch-none cursor-crosshair"
                                        onMouseDown={startDraw}
                                        onMouseMove={draw}
                                        onMouseUp={endDraw}
                                        onMouseLeave={endDraw}
                                        onTouchStart={startDraw}
                                        onTouchMove={draw}
                                        onTouchEnd={endDraw}
                                    />
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={submitDrawing}
                                    className="w-full py-6 bg-game-primary rounded-[2rem] font-black text-2xl shadow-xl uppercase tracking-widest border-t-4 border-white/20"
                                >
                                    I'M DONE! 🎨
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                )}

                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col p-4 overflow-hidden"
                    >
                        {votedId ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-pulse">⭐️</div>
                                <h3 className="text-5xl font-black text-game-secondary uppercase tracking-tighter">VOTE CAST!</h3>
                                <p className="text-white/40 text-xl font-bold uppercase tracking-widest">Which art was the finest?</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-center text-2xl font-black mb-6 text-white/40 uppercase tracking-[0.2em]">Pick the best art</h3>
                                <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-20 custom-scrollbar pr-2">
                                    {Object.entries(drawings).map(([id, dataUrl]: [string, any]) => {
                                        if (id === myId) return null;
                                        return (
                                            <motion.button
                                                key={id}
                                                whileHover={{ scale: 0.98 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleVote(id)}
                                                className="bg-white/5 p-4 rounded-[2rem] border-4 border-white/10 flex flex-col items-center gap-4 hover:border-game-primary hover:bg-game-primary/10 transition-all active:scale-95"
                                            >
                                                <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden p-2">
                                                    <img src={dataUrl} alt="" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="font-black text-lg truncate w-full text-center uppercase tracking-tighter">
                                                    {players[id]?.avatar} {players[id]?.name}
                                                </div>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {phase === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="text-[12rem] animate-bounce">🏛️</div>
                        <h3 className="text-5xl font-black text-game-accent uppercase tracking-tighter italic">GALLERY OPEN!</h3>
                        <p className="text-white/30 text-xl font-bold uppercase tracking-widest">Look at the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpeedDrawPlayer;