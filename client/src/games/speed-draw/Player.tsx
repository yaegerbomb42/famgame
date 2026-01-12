import { useRef, useState, useEffect } from 'react';

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
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            {phase === 'DRAWING' && !hasSubmitted && (
                <div className="w-full max-w-sm">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold">Draw: {prompt}</span>
                        <span className="text-2xl font-mono text-game-accent">{timer}s</span>
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={300}
                        height={300}
                        className="w-full aspect-square bg-white rounded-xl touch-none"
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={endDraw}
                        onMouseLeave={endDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={endDraw}
                    />

                    <button
                        onClick={submitDrawing}
                        className="w-full mt-4 py-4 bg-game-primary rounded-xl font-bold text-xl"
                    >
                        Submit Drawing
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
                <div className="w-full">
                    <h2 className="text-xl font-bold text-center mb-4">Vote for the best!</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(drawings)
                            .filter(([id]) => id !== myId)
                            .map(([id, dataUrl]) => (
                                <button
                                    key={id}
                                    onClick={() => handleVote(id)}
                                    disabled={hasVoted}
                                    className={`glass-card p-2 rounded-xl ${hasVoted ? 'opacity-50' : 'hover:border-game-primary'}`}
                                >
                                    <img src={dataUrl} alt="" className="w-full aspect-square object-contain bg-white rounded-lg" />
                                    <div className="text-sm mt-1">{players[id]?.name}</div>
                                </button>
                            ))
                        }
                    </div>
                    {hasVoted && <p className="text-center text-game-secondary mt-4">Vote submitted! ✓</p>}
                </div>
            )}

            {phase === 'RESULTS' && (
                <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-xl">Check the TV!</p>
                </div>
            )}
        </div>
    );
};

export default SpeedDrawPlayer;
