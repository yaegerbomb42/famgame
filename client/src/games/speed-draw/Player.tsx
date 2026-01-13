import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SpeedDrawPlayerProps {
    phase: 'DRAWING' | 'VOTING' | 'RESULTS';
    prompt: string;
    timer: number;
    drawings: Record<string, string>;
    players: Record<string, { id: string; name: string }>;
    myId: string;
    onSubmitDrawing: (dataUrl: string) => void;
    onVote: (playerId: string) => void;
}

const SpeedDrawPlayer = ({ phase, prompt, timer, drawings, players, myId, onSubmitDrawing, onVote }: SpeedDrawPlayerProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

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
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
        lastPos.current = pos;
    };

    const endDraw = () => setIsDrawing(false);

    const submitDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas || hasSubmitted) return;
        setHasSubmitted(true);
        onSubmitDrawing(canvas.toDataURL());
    };

    const handleVote = (id: string) => {
        if (!hasVoted && id !== myId) {
            setHasVoted(true);
            onVote(id);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto">
            {phase === 'DRAWING' && !hasSubmitted && (
                <div className="w-full space-y-8">
                    <div className="flex justify-between items-end mb-4 border-b-4 border-white/5 pb-6">
                        <div className="text-left">
                            <span className="text-2xl uppercase tracking-[0.5em] font-black text-game-accent block mb-2">Draw:</span>
                            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">{prompt}</h2>
                        </div>
                        <div className="text-5xl font-black font-mono text-game-secondary animate-pulse">{timer}s</div>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-br from-game-primary to-game-secondary rounded-[3.5rem] blur-2xl opacity-20 transition-all group-hover:opacity-40" />
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={600}
                            className="w-full aspect-square bg-white rounded-[3rem] touch-none shadow-2xl relative z-10 border-8 border-white/10"
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={endDraw}
                            onMouseLeave={endDraw}
                            onTouchStart={startDraw}
                            onTouchMove={draw}
                            onTouchEnd={endDraw}
                        />
                    </div>

                    <button
                        onClick={submitDrawing}
                        className="w-full py-12 bg-game-primary rounded-[3.5rem] font-black text-4xl shadow-[0_20px_50px_rgba(255,0,255,0.4)] transition-all uppercase tracking-widest border-t-8 border-white/20 active:scale-95"
                    >
                        FINISH MASTERPIECE 🎨
                    </button>
                </div>
            )}

            {phase === 'DRAWING' && hasSubmitted && (
                <div className="text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-xl text-game-secondary">Drawing submitted!</p>
                </div>
            )}

            {phase === 'VOTING' && (
                <div className="w-full space-y-10">
                    <h2 className="text-5xl font-black text-center uppercase tracking-widest gradient-text-primary">Vote For the Best!</h2>
                    <div className="grid grid-cols-2 gap-8">
                        {Object.entries(drawings)
                            .filter(([id]) => id !== myId)
                            .map(([id, dataUrl]) => (
                                <motion.button
                                    key={id}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVote(id)}
                                    disabled={hasVoted}
                                    className={`glass-card p-4 rounded-[3rem] border-4 transition-all flex flex-col items-center gap-4 ${hasVoted ? 'opacity-30' : 'border-white/5 hover:border-game-primary hover:shadow-[0_0_60px_rgba(255,0,255,0.3)]'}`}
                                >
                                    <img src={dataUrl} alt="" className="w-full aspect-square object-contain bg-white rounded-[2rem] border-4 border-black/5" />
                                    <div className="text-2xl font-black uppercase tracking-widest text-white/60">{players[id]?.name}</div>
                                </motion.button>
                            ))
                        }
                    </div>
                    {hasVoted && (
                        <div className="text-center animate-bounce">
                            <p className="text-4xl font-black text-game-secondary uppercase tracking-[0.2em]">Vote Cast! ✓</p>
                        </div>
                    )}
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center space-y-8">
                    <div className="text-huge">🎨</div>
                    <p className="text-4xl font-black uppercase tracking-widest text-white/40">Check the TV gallery!</p>
                </div>
            )}
        </div>
    );
};

export default SpeedDrawPlayer;
