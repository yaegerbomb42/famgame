import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNarratorStore } from '../../store/useNarratorStore';

interface GlobalAveragesHostProps {
    phase: 'WAITING' | 'REVEAL';
    question: string;
    correct: number;
    guesses: Record<string, number>;
    players: Record<string, { name: string; avatar?: string; score: number; isHost?: boolean }>;
    closestPid?: string;
    pointsAwarded?: number;
    timerEnd?: number;
    submissionCount?: number;
    totalPlayers?: number;
}

export default function GlobalAveragesHost({ phase, question, correct, guesses, players, closestPid, pointsAwarded, timerEnd, submissionCount, totalPlayers }: GlobalAveragesHostProps) {
    const [revealedPercent, setRevealedPercent] = useState(0);
    const [showGuesses, setShowGuesses] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(30);
    const speak = useNarratorStore(s => s.speak);
    const lastNarratedRef = useRef<string>('');

    // Narrator — question announcements and reveals
    useEffect(() => {
        let text = '';
        if (phase === 'WAITING' && question) {
            const intros = [
                `Alright everyone... ${question}`,
                `Here's a tricky one. ${question}`,
                `Time to guess! ${question}`,
                `Lock in your answers. ${question}`,
            ];
            text = intros[Math.floor(Math.random() * intros.length)];
        } else if (phase === 'REVEAL' && closestPid) {
            const winner = players[closestPid];
            if (winner) {
                const reveals = [
                    `The answer is ${correct} percent! ${winner.name} was the closest! Impressive.`,
                    `${correct} percent! And ${winner.name} nailed it. Or at least got the least wrong.`,
                    `It's ${correct} percent, and ${winner.name} takes the crown this round!`,
                ];
                text = reveals[Math.floor(Math.random() * reveals.length)];
            }
        }
        if (text && text !== lastNarratedRef.current) {
            lastNarratedRef.current = text;
            speak(text);
        }
    }, [phase, question, closestPid]);

    // Countdown timer
    useEffect(() => {
        if (phase !== 'WAITING' || !timerEnd) return;
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
            setSecondsLeft(remaining);
        }, 250);
        return () => clearInterval(interval);
    }, [phase, timerEnd]);

    // Trigger reveal flow
    useEffect(() => {
        if (phase === 'REVEAL') {
            setTimeout(() => setRevealedPercent(correct), 500);
            setTimeout(() => setShowGuesses(true), 2500);
        } else {
            setRevealedPercent(0);
            setShowGuesses(false);
        }
    }, [phase, correct]);

    const subCount = submissionCount || Object.keys(guesses).length;
    const total = totalPlayers || Object.values(players).filter(p => !p.isHost).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '40px', alignItems: 'center', justifyContent: 'center' }}>

            {/* Timer + Submission Progress */}
            {phase === 'WAITING' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '30px' }}>
                    {/* Countdown Ring */}
                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <svg width="80" height="80" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                            <circle
                                cx="40" cy="40" r="34"
                                fill="none"
                                stroke={secondsLeft <= 5 ? '#ff4757' : '#00d4ff'}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 34}`}
                                strokeDashoffset={`${2 * Math.PI * 34 * (1 - secondsLeft / 30)}`}
                                transform="rotate(-90 40 40)"
                                style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                            />
                        </svg>
                        <div style={{
                            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem', fontWeight: 900, color: secondsLeft <= 5 ? '#ff4757' : '#fff',
                            fontFamily: 'monospace'
                        }}>
                            {secondsLeft}
                        </div>
                    </div>
                    {/* Submission Count */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#00ff88' }}>{subCount}</span>
                        <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}> / {total} locked in</span>
                    </div>
                </div>
            )}

            {/* The Question */}
            <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    fontSize: '3.5rem', fontWeight: 900, textAlign: 'center', marginBottom: '60px',
                    maxWidth: '1200px', lineHeight: 1.2
                }}
            >
                {question}
            </motion.h1>

            {/* The Giant Percentage Bar */}
            <div style={{ position: 'relative', width: '80%', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '60px', overflow: 'hidden' }}>

                {/* The correct answer fill */}
                <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: phase === 'REVEAL' ? `${revealedPercent}%` : '0%' }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    style={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        background: 'linear-gradient(90deg, #ff007a, #7000ff)',
                        boxShadow: '0 0 40px rgba(112, 0, 255, 0.5)'
                    }}
                />

                {/* The correct answer text */}
                <AnimatePresence>
                    {phase === 'REVEAL' && revealedPercent === correct && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 2 }}
                            style={{
                                position: 'absolute', left: `${correct}%`, top: '50%', transform: 'translate(-50%, -50%)',
                                fontSize: '4rem', fontWeight: 900, textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                                zIndex: 10
                            }}
                        >
                            {correct}%
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Player Pins */}
                <AnimatePresence>
                    {showGuesses && Object.entries(guesses).map(([pid, guess], i) => {
                        const player = players[pid];
                        if (!player) return null;
                        const isClosest = pid === closestPid;

                        return (
                            <motion.div
                                key={pid}
                                initial={{ opacity: 0, y: -50, scale: 0 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: i * 0.2, type: 'spring' }}
                                style={{
                                    position: 'absolute',
                                    left: `${guess}%`,
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: isClosest ? 20 : 5,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <div style={{
                                    fontSize: isClosest ? '3.5rem' : '2rem',
                                    background: isClosest ? '#f9ca24' : 'rgba(0,0,0,0.5)',
                                    padding: '10px', borderRadius: '50%',
                                    boxShadow: isClosest ? '0 0 30px rgba(249, 202, 36, 0.8)' : 'none',
                                    border: isClosest ? '4px solid #fff' : '2px solid rgba(255,255,255,0.2)'
                                }}>
                                    {player.avatar || '👤'}
                                </div>
                                <div style={{
                                    background: 'rgba(0,0,0,0.8)', padding: '4px 12px', borderRadius: '12px',
                                    fontWeight: 800, fontSize: '1.2rem', color: isClosest ? '#f9ca24' : '#fff'
                                }}>
                                    {guess}%
                                </div>
                                {isClosest && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        style={{ color: '#00ff88', fontWeight: 900, fontSize: '1.5rem', textShadow: '0 0 10px #00ff88' }}
                                    >
                                        +{pointsAwarded}
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

            </div>

            {/* Status */}
            <div style={{ marginTop: '60px' }}>
                <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                    {phase === 'WAITING' ? `WAITING FOR PLAYERS... (${secondsLeft}s)` : 'LOADING NEXT QUESTION...'}
                </div>
            </div>
        </div>
    );
}
