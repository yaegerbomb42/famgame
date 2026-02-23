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
    socket: any;
}

export default function GlobalAveragesHost({ phase, question, correct, guesses, players, closestPid, pointsAwarded, socket }: GlobalAveragesHostProps) {
    const [revealedPercent, setRevealedPercent] = useState(0);
    const [showGuesses, setShowGuesses] = useState(false);

    const playerCount = Object.keys(players).filter(p => !players[p].isHost).length;
    const guessCount = Object.keys(guesses).length;
    const allGuessed = guessCount >= playerCount && playerCount > 0;

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

    const revealAnswer = () => {
        if (phase === 'WAITING' && allGuessed) {
            socket.emit('revealGlobalAverages');
        }
    };

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

            {/* Waiting/Reveal Actions */}
            <div style={{ marginTop: '60px' }}>
                {phase === 'WAITING' ? (
                    <motion.button
                        onClick={revealAnswer}
                        disabled={!allGuessed}
                        style={{
                            padding: '20px 40px', fontSize: '2rem', fontWeight: 900, borderRadius: '20px',
                            background: allGuessed ? 'linear-gradient(135deg, #00d4ff, #00ff88)' : '#444',
                            color: allGuessed ? '#000' : '#888',
                            border: 'none', cursor: allGuessed ? 'pointer' : 'not-allowed',
                            boxShadow: allGuessed ? '0 0 40px rgba(0, 212, 255, 0.4)' : 'none',
                        }}
                    >
                        {allGuessed ? 'REVEAL ANSWER' : `WAITING FOR PLAYERS (${guessCount}/${playerCount})`}
                    </motion.button>
                ) : (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 5 }}
                        onClick={() => socket.emit('nextRound')}
                        style={{
                            padding: '20px 60px', fontSize: '1.8rem', fontWeight: 900, borderRadius: '20px',
                            background: '#fff', color: '#000', border: 'none', cursor: 'pointer',
                        }}
                    >
                        NEXT QUESTION
                    </motion.button>
                )}
            </div>

        </div>
    );
}
