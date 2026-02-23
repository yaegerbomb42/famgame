import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalAveragesHostProps {
    phase: 'WAITING' | 'REVEAL';
    question: string;
    correct: number;
    guesses: Record<string, number>;
    players: Record<string, { name: string; avatar?: string; score: number; isHost?: boolean }>;
    closestPid?: string;
    pointsAwarded?: number;
}

export default function GlobalAveragesHost({ phase, question, correct, guesses, players, closestPid, pointsAwarded }: GlobalAveragesHostProps) {
    const [revealedPercent, setRevealedPercent] = useState(0);
    const [showGuesses, setShowGuesses] = useState(false);

    // Trigger reveal flow
    useEffect(() => {
        if (phase === 'REVEAL') {
            // First animate the bar to the correct percentage
            setTimeout(() => {
                setRevealedPercent(correct);
            }, 500);

            // Then splash all the player guesses onto the bar
            setTimeout(() => {
                setShowGuesses(true);
            }, 2500);
        } else {
            setRevealedPercent(0);
            setShowGuesses(false);
        }
    }, [phase, correct]);


    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '40px', alignItems: 'center', justifyContent: 'center' }}>

            {/* The Question */}
            <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    fontSize: '4rem', fontWeight: 900, textAlign: 'center', marginBottom: '80px',
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

            {/* Empty block to preserve space, manual buttons removed in favor of auto-timers */}
            <div style={{ marginTop: '60px' }}>
                <div style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                    {phase === 'WAITING' ? 'WAITING FOR PLAYERS...' : 'LOADING NEXT QUESTION...'}
                </div>
            </div>

        </div>
    );
}
