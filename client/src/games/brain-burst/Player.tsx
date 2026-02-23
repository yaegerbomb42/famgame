import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrainBurstPlayerProps {
    phase: 'INTRO' | 'QUESTION' | 'REVEAL' | 'CELEBRATION' | 'GAME_OVER';
    currentQuestion: { q: string; a: string[]; correct: number };
    tier: { level: number; prize: string; points: number };
    questionIndex: number;
    fiftyFiftyDisabled: number[];
    lifelineUsed: boolean;
    showResult: boolean;
    onAnswer: (index: number) => void;
    onUseLifeline: () => void;
}

const ANSWER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

// Simple haptic sound for phone
const usePlayerSounds = () => {
    const ctxRef = useRef<AudioContext | null>(null);

    const getCtx = useCallback(() => {
        if (!ctxRef.current) {
            const AC = window.AudioContext || (window as any).webkitAudioContext;
            ctxRef.current = new AC();
        }
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
        return ctxRef.current;
    }, []);

    const playTap = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    }, [getCtx]);

    const playCorrect = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        [523, 659, 784].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.08, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    }, [getCtx]);

    const playWrong = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }, [getCtx]);

    return { playTap, playCorrect, playWrong };
};

const BrainBurstPlayer: React.FC<BrainBurstPlayerProps> = ({
    phase, currentQuestion, tier, questionIndex,
    fiftyFiftyDisabled, lifelineUsed, showResult,
    onAnswer, onUseLifeline,
}) => {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [locked, setLocked] = useState(false);
    const sounds = usePlayerSounds();
    const lastQRef = useRef(questionIndex);

    // Reset state when question changes
    useEffect(() => {
        if (questionIndex !== lastQRef.current) {
            setSelectedIdx(null);
            setLocked(false);
            lastQRef.current = questionIndex;
        }
    }, [questionIndex]);

    // Sound on result
    useEffect(() => {
        if (showResult && selectedIdx !== null) {
            if (selectedIdx === currentQuestion.correct) {
                sounds.playCorrect();
            } else {
                sounds.playWrong();
            }
        }
    }, [showResult, selectedIdx, currentQuestion.correct, sounds]);

    const handleSelect = (i: number) => {
        if (locked || selectedIdx !== null || phase !== 'QUESTION') return;
        if (fiftyFiftyDisabled.includes(i)) return;
        sounds.playTap();
        setSelectedIdx(i);
        setLocked(true);
        onAnswer(i);
    };

    // INTRO / WAITING
    if (phase === 'INTRO') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '24px',
                    textAlign: 'center',
                }}
            >
                <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ fontSize: '5rem' }}
                >
                    💰
                </motion.div>
                <h2 style={{
                    fontSize: '2rem', fontWeight: 900,
                    background: 'linear-gradient(135deg, #f9ca24, #f0932b)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                    BRAIN BURST
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Get ready to answer!
                </p>
            </motion.div>
        );
    }

    // GAME OVER
    if (phase === 'GAME_OVER') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '16px',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: '5rem' }}>🏆</div>
                <h2 style={{
                    fontSize: '2rem', fontWeight: 900,
                    background: 'linear-gradient(135deg, #f9ca24, #f0932b)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                    GAME OVER!
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>Check the big screen for results!</p>
            </motion.div>
        );
    }

    // LOCKED / ANSWERED state
    if (locked && !showResult) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '20px',
                    textAlign: 'center',
                }}
            >
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    style={{
                        width: '80px', height: '80px', borderRadius: '20px',
                        backgroundColor: ANSWER_COLORS[selectedIdx!] + '30',
                        border: `3px solid ${ANSWER_COLORS[selectedIdx!]}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 900,
                    }}
                >
                    {ANSWER_LABELS[selectedIdx!]}
                </motion.div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Answer Locked!</h3>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Watch the big screen...
                </p>
            </motion.div>
        );
    }

    // REVEAL state
    if (showResult) {
        const isCorrect = selectedIdx === currentQuestion.correct;
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '16px',
                    textAlign: 'center',
                }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.3, 1] }}
                    transition={{ duration: 0.5 }}
                    style={{ fontSize: '5rem' }}
                >
                    {isCorrect ? '🎉' : (selectedIdx !== null ? '😬' : '⏰')}
                </motion.div>
                <h3 style={{
                    fontSize: '1.6rem', fontWeight: 900,
                    color: isCorrect ? '#2ecc71' : (selectedIdx !== null ? '#e74c3c' : '#f39c12'),
                }}>
                    {isCorrect ? 'CORRECT!' : (selectedIdx !== null ? 'WRONG!' : "TIME'S UP!")}
                </h3>
                {isCorrect && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        style={{
                            padding: '8px 24px', borderRadius: '12px',
                            backgroundColor: 'rgba(46,204,113,0.15)',
                            border: '1px solid rgba(46,204,113,0.3)',
                            fontSize: '1.1rem', fontWeight: 700, color: '#2ecc71',
                        }}
                    >
                        +{tier.points} pts
                    </motion.div>
                )}
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '16px' }}>
                    Wait for next question...
                </p>
            </motion.div>
        );
    }

    // QUESTION — Main answer grid
    return (
        <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            padding: '12px', gap: '12px',
        }}>
            {/* Tier + Lifeline Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px' }}>
                <div style={{
                    fontSize: '0.85rem', fontWeight: 800, color: '#f9ca24',
                    letterSpacing: '0.1em',
                }}>
                    Q{questionIndex + 1} • {tier.prize}
                </div>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        if (!lifelineUsed) {
                            sounds.playTap();
                            onUseLifeline();
                        }
                    }}
                    disabled={lifelineUsed}
                    style={{
                        padding: '8px 16px', borderRadius: '12px', border: 'none',
                        backgroundColor: lifelineUsed ? 'rgba(255,255,255,0.05)' : 'rgba(249,202,36,0.15)',
                        color: lifelineUsed ? 'rgba(255,255,255,0.15)' : '#f9ca24',
                        fontSize: '0.85rem', fontWeight: 800, cursor: lifelineUsed ? 'default' : 'pointer',
                        textDecoration: lifelineUsed ? 'line-through' : 'none',
                        WebkitTapHighlightColor: 'transparent',
                    }}
                >
                    50:50
                </motion.button>
            </div>

            {/* Answer Buttons — 2×2 grid, maximum tap area */}
            <div style={{
                flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '10px',
            }}>
                <AnimatePresence>
                    {currentQuestion.a.map((answer, i) => {
                        const isDisabled = fiftyFiftyDisabled.includes(i);
                        return (
                            <motion.button
                                key={`${questionIndex}-${i}`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{
                                    scale: isDisabled ? 0.85 : 1,
                                    opacity: isDisabled ? 0.2 : 1,
                                }}
                                whileTap={!isDisabled ? { scale: 0.92 } : {}}
                                transition={{ delay: i * 0.06 }}
                                onClick={() => handleSelect(i)}
                                disabled={isDisabled}
                                style={{
                                    background: `linear-gradient(135deg, ${ANSWER_COLORS[i]}cc, ${ANSWER_COLORS[i]}88)`,
                                    border: 'none', borderRadius: '20px',
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    gap: '6px', padding: '16px 12px',
                                    cursor: isDisabled ? 'default' : 'pointer',
                                    color: 'white',
                                    boxShadow: isDisabled ? 'none' : `0 8px 24px ${ANSWER_COLORS[i]}40`,
                                    WebkitTapHighlightColor: 'transparent',
                                    position: 'relative', overflow: 'hidden',
                                    minHeight: '0',
                                }}
                            >
                                {/* Glossy top edge */}
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
                                    borderRadius: '20px 20px 0 0', pointerEvents: 'none',
                                }} />
                                <span style={{
                                    fontSize: 'clamp(2rem, 8vw, 3.5rem)', fontWeight: 900,
                                    lineHeight: 1, opacity: 0.9,
                                }}>
                                    {ANSWER_LABELS[i]}
                                </span>
                                <span style={{
                                    fontSize: 'clamp(0.7rem, 2.5vw, 1rem)', fontWeight: 700,
                                    lineHeight: 1.2, textAlign: 'center',
                                    maxWidth: '100%', overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    opacity: 0.85,
                                }}>
                                    {answer}
                                </span>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BrainBurstPlayer;
