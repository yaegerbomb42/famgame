import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

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
    socket: any;
    scores: Record<string, number>;
    myId: string;
}

// ---- CIRCLE DRAW ----
function CircleDraw({ onSubmit }: { onSubmit: (data: any) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<{ x: number; y: number }[]>([]);
    const drawingRef = useRef(false);

    const getPos = (e: React.TouchEvent | React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const touch = 'touches' in e ? e.touches[0] : e;
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };

    const startDraw = (e: any) => {
        e.preventDefault();
        drawingRef.current = true;
        pointsRef.current = [getPos(e)];
        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.clearRect(0, 0, 300, 300);
        ctx.beginPath();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        const p = getPos(e);
        ctx.moveTo(p.x, p.y);
    };

    const draw = (e: any) => {
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

        // Calculate circularity: find center, avg radius, then variance
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        const radii = pts.map(p => Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2));
        const avgR = radii.reduce((s, r) => s + r, 0) / radii.length;
        const variance = radii.reduce((s, r) => s + (r - avgR) ** 2, 0) / radii.length;
        const stdDev = Math.sqrt(variance);
        const circularity = Math.max(0, 100 - (stdDev / avgR) * 100);

        onSubmit({ circularity: Math.round(circularity * 10) / 10 });
    };

    return (
        <div className="ss-player-circle">
            <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="ss-canvas"
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
            />
            <p className="ss-hint">Draw with your finger, then lift to submit</p>
        </div>
    );
}

// ---- MEMORY GRID ----
function MemoryGrid({ grid, onSubmit }: { grid: boolean[]; onSubmit: (data: any) => void }) {
    const [showPattern, setShowPattern] = useState(true);
    const [playerGrid, setPlayerGrid] = useState(Array(16).fill(false));
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowPattern(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const toggle = (i: number) => {
        if (showPattern || submitted) return;
        setPlayerGrid(prev => {
            const next = [...prev];
            next[i] = !next[i];
            return next;
        });
    };

    const submit = () => {
        if (submitted) return;
        setSubmitted(true);
        onSubmit({ grid: playerGrid });
    };

    return (
        <div className="ss-player-memory">
            <div className="ss-grid">
                {(showPattern ? grid : playerGrid).map((lit, i) => (
                    <button
                        key={i}
                        className={`ss-grid-btn ${lit ? 'lit' : ''} ${showPattern ? 'preview' : ''}`}
                        onClick={() => toggle(i)}
                    />
                ))}
            </div>
            {!showPattern && !submitted && (
                <button className="ss-submit-btn" onClick={submit}>SUBMIT</button>
            )}
            {showPattern && <p className="ss-hint">Memorize!</p>}
            {submitted && <p className="ss-hint">Submitted! ✓</p>}
        </div>
    );
}

// ---- TEMPO TAP ----
function TempoTap({ targetBPM, onSubmit }: { targetBPM: number; onSubmit: (data: any) => void }) {
    const tapsRef = useRef<number[]>([]);
    const [tapCount, setTapCount] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const tap = useCallback(() => {
        if (submitted) return;
        const now = Date.now();
        tapsRef.current.push(now);
        setTapCount(c => c + 1);

        if (tapsRef.current.length >= 12) {
            // Calculate consistency
            const intervals = [];
            for (let i = 1; i < tapsRef.current.length; i++) {
                intervals.push(tapsRef.current[i] - tapsRef.current[i - 1]);
            }
            const targetInterval = 60000 / targetBPM;
            const avgDiff = intervals.reduce((s, iv) => s + Math.abs(iv - targetInterval), 0) / intervals.length;
            const consistency = Math.max(0, 100 - (avgDiff / targetInterval) * 100);
            setSubmitted(true);
            onSubmit({ consistency: Math.round(consistency * 10) / 10 });
        }
    }, [submitted, targetBPM, onSubmit]);

    return (
        <div className="ss-player-tempo">
            <motion.button
                className="ss-tap-btn"
                whileTap={{ scale: 0.9, backgroundColor: '#ff00ff' }}
                onClick={tap}
                disabled={submitted}
            >
                {submitted ? '✓' : '👆'}
            </motion.button>
            <p className="ss-hint">{submitted ? 'Submitted!' : `Tap ${12 - tapCount} more times`}</p>
        </div>
    );
}

// ---- COLOR MATCH ----
function ColorMatch({ target, onSubmit }: { target: { r: number; g: number; b: number }; onSubmit: (data: any) => void }) {
    const [r, setR] = useState(128);
    const [g, setG] = useState(128);
    const [b, setB] = useState(128);
    const [submitted, setSubmitted] = useState(false);

    const submit = () => {
        if (submitted) return;
        setSubmitted(true);
        onSubmit({ color: { r, g, b } });
    };

    return (
        <div className="ss-player-color">
            <div className="ss-color-compare">
                <div className="ss-color-box">
                    <div className="ss-color-swatch-sm" style={{ backgroundColor: `rgb(${target.r},${target.g},${target.b})` }} />
                    <span className="ss-color-lbl">Target</span>
                </div>
                <div className="ss-color-box">
                    <div className="ss-color-swatch-sm" style={{ backgroundColor: `rgb(${r},${g},${b})` }} />
                    <span className="ss-color-lbl">Yours</span>
                </div>
            </div>
            <div className="ss-sliders">
                <label className="ss-slider-row">
                    <span style={{ color: '#ff4444' }}>R</span>
                    <input type="range" min="0" max="255" value={r} onChange={e => setR(+e.target.value)} disabled={submitted} />
                </label>
                <label className="ss-slider-row">
                    <span style={{ color: '#44ff44' }}>G</span>
                    <input type="range" min="0" max="255" value={g} onChange={e => setG(+e.target.value)} disabled={submitted} />
                </label>
                <label className="ss-slider-row">
                    <span style={{ color: '#4444ff' }}>B</span>
                    <input type="range" min="0" max="255" value={b} onChange={e => setB(+e.target.value)} disabled={submitted} />
                </label>
            </div>
            {!submitted && <button className="ss-submit-btn" onClick={submit}>LOCK IN</button>}
            {submitted && <p className="ss-hint">Submitted! ✓</p>}
        </div>
    );
}

// ---- ANGLE GUESS ----
function AngleGuess({ onSubmit }: { onSubmit: (data: any) => void }) {
    const [angle, setAngle] = useState(90);
    const [submitted, setSubmitted] = useState(false);

    const submit = () => {
        if (submitted) return;
        setSubmitted(true);
        onSubmit({ angle });
    };

    return (
        <div className="ss-player-angle">
            <div className="ss-angle-value">{angle}°</div>
            <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={e => setAngle(+e.target.value)}
                disabled={submitted}
                className="ss-angle-slider"
            />
            {!submitted && <button className="ss-submit-btn" onClick={submit}>SUBMIT</button>}
            {submitted && <p className="ss-hint">Submitted! ✓</p>}
        </div>
    );
}

// ---- MAIN COMPONENT ----
export default function SkillShowdownPlayer({ phase, challengeIndex, challenge, submitted: alreadySubmitted, socket, scores, myId }: SkillShowdownPlayerProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Reset submission state on new challenge
    useEffect(() => {
        setHasSubmitted(false);
    }, [challengeIndex]);

    const handleSubmit = (data: any) => {
        if (hasSubmitted || alreadySubmitted) return;
        setHasSubmitted(true);
        socket.emit('submitSkillResult', data);
    };

    const isSubmitted = hasSubmitted || alreadySubmitted;

    return (
        <div className="ss-player">
            {phase === 'PREVIEW' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="ss-player-preview"
                >
                    <div className="ss-p-title">{challenge.title}</div>
                    <div className="ss-p-instruction">{challenge.instruction}</div>
                    <motion.div
                        className="ss-p-ready"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        GET READY...
                    </motion.div>
                </motion.div>
            )}

            {phase === 'PLAYING' && !isSubmitted && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ss-player-game"
                >
                    {challenge.type === 'CIRCLE_DRAW' && <CircleDraw onSubmit={handleSubmit} />}
                    {challenge.type === 'MEMORY_GRID' && challenge.grid && <MemoryGrid grid={challenge.grid} onSubmit={handleSubmit} />}
                    {challenge.type === 'TEMPO_TAP' && <TempoTap targetBPM={challenge.targetBPM || 120} onSubmit={handleSubmit} />}
                    {challenge.type === 'COLOR_MATCH' && challenge.targetColor && <ColorMatch target={challenge.targetColor} onSubmit={handleSubmit} />}
                    {challenge.type === 'ANGLE_GUESS' && <AngleGuess onSubmit={handleSubmit} />}
                </motion.div>
            )}

            {phase === 'PLAYING' && isSubmitted && (
                <div className="ss-player-waiting">
                    <div className="ss-waiting-icon">✓</div>
                    <div className="ss-waiting-text">Waiting for others...</div>
                </div>
            )}

            {phase === 'REVEAL' && (
                <div className="ss-player-reveal">
                    <div className="ss-reveal-title">Results</div>
                    {scores[myId] !== undefined && (
                        <motion.div
                            className="ss-my-score"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            {scores[myId]}%
                        </motion.div>
                    )}
                </div>
            )}

            <style>{`
                .ss-player {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100%;
                    padding: 20px;
                }
                .ss-player-preview, .ss-player-game, .ss-player-waiting, .ss-player-reveal {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    text-align: center;
                    width: 100%;
                }
                .ss-p-title {
                    font-size: 2rem;
                    font-weight: 900;
                    background: linear-gradient(135deg, #ff00ff, #00ffff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .ss-p-instruction {
                    font-size: 1rem;
                    color: rgba(255,255,255,0.6);
                }
                .ss-p-ready {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: #f9ca24;
                    letter-spacing: 0.2em;
                    margin-top: 16px;
                }
                .ss-canvas {
                    border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 20px;
                    background: rgba(255,255,255,0.03);
                    touch-action: none;
                    max-width: 100%;
                }
                .ss-hint {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.4);
                    margin-top: 8px;
                }
                .ss-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 6px;
                    width: min(280px, 80vw);
                    aspect-ratio: 1;
                }
                .ss-grid-btn {
                    border-radius: 10px;
                    border: 2px solid rgba(255,255,255,0.15);
                    background: rgba(255,255,255,0.05);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ss-grid-btn.lit {
                    background: #00ffff;
                    border-color: #00ffff;
                    box-shadow: 0 0 15px rgba(0,255,255,0.4);
                }
                .ss-grid-btn.preview {
                    pointer-events: none;
                }
                .ss-submit-btn {
                    margin-top: 12px;
                    padding: 12px 40px;
                    background: linear-gradient(135deg, #ff00ff, #00ffff);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    font-size: 1.1rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(255,0,255,0.3);
                }
                .ss-tap-btn {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    border: 4px solid rgba(255,0,255,0.5);
                    background: rgba(255,0,255,0.1);
                    font-size: 3rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .ss-color-compare {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .ss-color-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                }
                .ss-color-swatch-sm {
                    width: 80px;
                    height: 80px;
                    border-radius: 16px;
                    border: 2px solid rgba(255,255,255,0.2);
                }
                .ss-color-lbl {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.4);
                    text-transform: uppercase;
                    font-weight: 700;
                }
                .ss-sliders {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: 100%;
                    max-width: 280px;
                }
                .ss-slider-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 900;
                    font-size: 1rem;
                }
                .ss-slider-row input[type="range"] {
                    flex: 1;
                    accent-color: #00ffff;
                }
                .ss-angle-value {
                    font-size: 3rem;
                    font-weight: 900;
                    color: #00ffff;
                    font-family: monospace;
                }
                .ss-angle-slider {
                    width: 100%;
                    max-width: 280px;
                    accent-color: #00ffff;
                }
                .ss-waiting-icon {
                    font-size: 4rem;
                    color: #00ffff;
                }
                .ss-waiting-text {
                    font-size: 1.1rem;
                    color: rgba(255,255,255,0.4);
                    font-weight: 700;
                }
                .ss-reveal-title {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: rgba(255,255,255,0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                }
                .ss-my-score {
                    font-size: 4rem;
                    font-weight: 900;
                    color: #00ffff;
                    font-family: monospace;
                }
                .ss-player-circle {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .ss-player-memory {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                .ss-player-tempo {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .ss-player-color {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .ss-player-angle {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
            `}</style>
        </div>
    );
}
