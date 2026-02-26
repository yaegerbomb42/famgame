import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlobalAveragesPlayerProps {
    phase: 'WAITING' | 'REVEAL';
    question: string;
    socket: any;
    hasGuessed: boolean;
}

export default function GlobalAveragesPlayer({ phase, question, socket, hasGuessed }: GlobalAveragesPlayerProps) {
    const [guess, setGuess] = useState(50);
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        setLocked(hasGuessed);
    }, [hasGuessed]);

    const submitGuess = () => {
        if (!locked) {
            socket.emit('submitAverageGuess', guess);
            setLocked(true);
        }
    };

    if (phase === 'REVEAL') {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Look at the TV!</h2>
                <div style={{ fontSize: '4rem' }}>📺</div>
                <p style={{ marginTop: '20px', fontSize: '1.2rem', color: '#aaa' }}>Finding out who was closest...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '40px', fontWeight: 800 }}>
                {question || 'Waiting for question...'}
            </h2>

            <div style={{
                position: 'relative', width: '100%', height: '80px',
                background: 'rgba(255,255,255,0.1)', borderRadius: '40px',
                marginBottom: '40px', overflow: 'hidden'
            }}>
                <motion.div
                    style={{
                        position: 'absolute', top: 0, left: 0, height: '100%',
                        background: 'linear-gradient(90deg, #ff007a, #7000ff)',
                        width: `${guess}%`
                    }}
                    transition={{ type: 'spring', damping: 20 }}
                />

                <input
                    type="range"
                    min="0" max="100"
                    value={guess}
                    onChange={(e) => setGuess(parseInt(e.target.value))}
                    disabled={locked}
                    style={{
                        position: 'absolute', inset: 0, opacity: 0, cursor: locked ? 'default' : 'pointer', width: '100%'
                    }}
                />

                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none', fontSize: '3rem', fontWeight: 900, textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                }}>
                    {guess}%
                </div>
            </div>

            <motion.button
                onClick={submitGuess}
                disabled={locked}
                whileHover={!locked ? { scale: 1.05 } : {}}
                whileTap={!locked ? { scale: 0.95 } : {}}
                style={{
                    padding: '20px 40px', fontSize: '1.8rem', fontWeight: 900, borderRadius: '20px',
                    border: 'none', cursor: locked ? 'not-allowed' : 'pointer',
                    background: locked ? '#444' : 'linear-gradient(135deg, #00d4ff, #00ff88)',
                    color: locked ? '#888' : '#000',
                    boxShadow: locked ? 'none' : '0 10px 30px rgba(0, 212, 255, 0.4)',
                    width: '100%'
                }}
            >
                {locked ? 'LOCKED IN 🔒' : 'LOCK IN GUESS'}
            </motion.button>
        </div>
    );
}
