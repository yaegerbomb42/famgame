import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BrainBurstHostProps {
    phase: 'INTRO' | 'QUESTION' | 'REVEAL' | 'CELEBRATION' | 'GAME_OVER';
    currentQuestion: { q: string; a: string[]; correct: number };
    tier: { level: number; prize: string; points: number };
    tiers: { level: number; prize: string; points: number }[];
    timer: number;
    showResult: boolean;
    answers: Record<string, number>;
    fiftyFiftyDisabled: number[];
    questionIndex: number;
    players: Record<string, { name: string; score: number; avatar?: string }>;
    streaks: Record<string, number>;
}

// Synthesized sound engine — no external files needed
const useBrainBurstSounds = () => {
    const ctxRef = useRef<AudioContext | null>(null);

    const getCtx = useCallback(() => {
        if (!ctxRef.current) {
            const AC = window.AudioContext || (window as any).webkitAudioContext;
            ctxRef.current = new AC();
        }
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
        return ctxRef.current;
    }, []);

    const playIntroStinger = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Epic ascending power chord
        [220, 277, 330, 440, 554, 660, 880].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = i < 3 ? 'sawtooth' : 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, now + i * 0.12);
            gain.gain.linearRampToValueAtTime(0.08, now + i * 0.12 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.8);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.8);
        });
    }, [getCtx]);

    const playQuestionAppear = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Suspenseful low hum + rising tone
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.connect(bassGain);
        bassGain.connect(ctx.destination);
        bass.type = 'sine';
        bass.frequency.setValueAtTime(80, now);
        bass.frequency.linearRampToValueAtTime(120, now + 1.5);
        bassGain.gain.setValueAtTime(0.06, now);
        bassGain.gain.linearRampToValueAtTime(0.001, now + 1.5);
        bass.start(now);
        bass.stop(now + 1.5);

        // Sparkle ping
        [600, 800, 1000].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.04, now + 0.3 + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 + i * 0.15 + 0.3);
            osc.start(now + 0.3 + i * 0.15);
            osc.stop(now + 0.3 + i * 0.15 + 0.3);
        });
    }, [getCtx]);

    const playCorrect = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Triumphant ascending arpeggio
        [523, 659, 784, 1047, 1319].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.08, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.5);
        });
        // Shimmer
        const noise = ctx.createOscillator();
        const nGain = ctx.createGain();
        noise.connect(nGain);
        nGain.connect(ctx.destination);
        noise.type = 'sine';
        noise.frequency.setValueAtTime(2000, now + 0.35);
        noise.frequency.exponentialRampToValueAtTime(4000, now + 0.7);
        nGain.gain.setValueAtTime(0.03, now + 0.35);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        noise.start(now + 0.35);
        noise.stop(now + 0.7);
    }, [getCtx]);

    const playWrong = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // "Wah wah" descending
        [300, 280, 200, 150].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.06, now + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.25);
            osc.start(now + i * 0.2);
            osc.stop(now + i * 0.2 + 0.25);
        });
    }, [getCtx]);

    const playTierUp = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Epic rising scale with harmonics
        [262, 330, 392, 523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = i < 4 ? 'triangle' : 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.06, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.6);
        });
    }, [getCtx]);

    const playFinalFanfare = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        // Full orchestral-style celebration
        const chords = [
            [262, 330, 392], // C major
            [330, 415, 494], // E major
            [349, 440, 523], // F major
            [392, 494, 587], // G major
            [523, 659, 784], // C major (octave up)
        ];
        chords.forEach((chord, ci) => {
            chord.forEach((freq) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = ci < 3 ? 'triangle' : 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.05, now + ci * 0.3);
                gain.gain.exponentialRampToValueAtTime(0.001, now + ci * 0.3 + 0.5);
                osc.start(now + ci * 0.3);
                osc.stop(now + ci * 0.3 + 0.5);
            });
        });
        // Sparkle pops
        for (let i = 0; i < 8; i++) {
            const pop = ctx.createOscillator();
            const pGain = ctx.createGain();
            pop.connect(pGain);
            pGain.connect(ctx.destination);
            pop.type = 'sine';
            pop.frequency.setValueAtTime(2000 + Math.random() * 3000, now + 1.2 + i * 0.12);
            pGain.gain.setValueAtTime(0.04, now + 1.2 + i * 0.12);
            pGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2 + i * 0.12 + 0.15);
            pop.start(now + 1.2 + i * 0.12);
            pop.stop(now + 1.2 + i * 0.12 + 0.15);
        }
    }, [getCtx]);

    const playTickUrgent = useCallback(() => {
        const ctx = getCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    }, [getCtx]);

    return { playIntroStinger, playQuestionAppear, playCorrect, playWrong, playTierUp, playFinalFanfare, playTickUrgent };
};

// Confetti particle component
const ConfettiExplosion = () => {
    const particles = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
        color: ['#f9ca24', '#00d4ff', '#ff00ff', '#00ff88', '#ff6b6b', '#fff'][Math.floor(Math.random() * 6)],
        rotation: Math.random() * 360,
        duration: Math.random() * 2 + 2,
    }));

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ y: '50vh', x: `${p.x}vw`, opacity: 1, scale: 1, rotate: 0 }}
                    animate={{
                        y: [null, `${-20 - Math.random() * 40}vh`, `${110}vh`],
                        x: [null, `${p.x + (Math.random() - 0.5) * 30}vw`],
                        opacity: [1, 1, 0],
                        rotate: p.rotation + 720,
                        scale: [1, 1.5, 0],
                    }}
                    transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        width: p.size,
                        height: p.size * 0.6,
                        backgroundColor: p.color,
                        borderRadius: '1px',
                    }}
                />
            ))}
        </div>
    );
};

const ANSWER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

const BrainBurstHost: React.FC<BrainBurstHostProps> = ({
    phase, currentQuestion, tier, tiers, timer, showResult, answers,
    fiftyFiftyDisabled, questionIndex, players, streaks,
}) => {
    const sounds = useBrainBurstSounds();
    const lastPhaseRef = useRef(phase);
    const lastTimerRef = useRef(timer);

    // Sound triggers based on phase transitions
    useEffect(() => {
        if (phase !== lastPhaseRef.current) {
            if (phase === 'INTRO') sounds.playIntroStinger();
            if (phase === 'QUESTION') sounds.playQuestionAppear();
            if (phase === 'REVEAL') {
                // Check if anyone got it right
                const correctIdx = currentQuestion.correct;
                const anyCorrect = Object.values(answers).some(a => a === correctIdx);
                if (anyCorrect) {
                    sounds.playCorrect();
                } else {
                    sounds.playWrong();
                }
            }
            if (phase === 'GAME_OVER') sounds.playFinalFanfare();
            lastPhaseRef.current = phase;
        }
    }, [phase, sounds, currentQuestion, answers]);

    // Urgent tick sound when timer is low
    useEffect(() => {
        if (phase === 'QUESTION' && timer <= 5 && timer > 0 && timer !== lastTimerRef.current) {
            sounds.playTickUrgent();
        }
        lastTimerRef.current = timer;
    }, [timer, phase, sounds]);

    const answerCount = Object.keys(answers).length;
    const playerCount = Object.keys(players).length;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'linear-gradient(170deg, #0c0a2a 0%, #1a0a3e 40%, #0c0a2a 100%)',
            color: 'white', fontFamily: "'Outfit', system-ui, sans-serif", overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Ambient glow orbs */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,202,36,0.15) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

            <AnimatePresence mode="wait">
                {/* INTRO PHASE */}
                {phase === 'INTRO' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                            style={{ fontSize: 'clamp(5rem, 12vw, 10rem)', lineHeight: 1 }}
                        >
                            💰
                        </motion.div>
                        <motion.h1
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            style={{
                                fontSize: 'clamp(4rem, 10vw, 9rem)', fontWeight: 900, textAlign: 'center',
                                background: 'linear-gradient(135deg, #f9ca24, #f0932b, #f9ca24)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                textShadow: 'none', letterSpacing: '-0.02em',
                            }}
                        >
                            BRAIN BURST
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700 }}
                        >
                            10 Questions • Who Takes the Million?
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 1 }}
                            style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)', marginTop: '40px' }}
                        >
                            Starting...
                        </motion.div>
                    </motion.div>
                )}

                {/* QUESTION / REVEAL PHASE */}
                {(phase === 'QUESTION' || phase === 'REVEAL') && (
                    <motion.div
                        key={`question-${questionIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ flex: 1, display: 'flex', position: 'relative' }}
                    >
                        {/* Prize Ladder - Left Side */}
                        <div style={{
                            width: '220px', padding: '24px 16px', display: 'flex', flexDirection: 'column',
                            justifyContent: 'center', gap: '4px', borderRight: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            {[...tiers].reverse().map((t) => {
                                const isCurrent = t.level === tier.level;
                                const isPast = t.level < tier.level;
                                return (
                                    <motion.div
                                        key={t.level}
                                        animate={isCurrent ? {
                                            backgroundColor: 'rgba(249,202,36,0.2)',
                                            borderColor: 'rgba(249,202,36,0.6)',
                                            boxShadow: '0 0 20px rgba(249,202,36,0.3)',
                                        } : {}}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '6px 14px', borderRadius: '8px',
                                            border: `1px solid ${isCurrent ? 'rgba(249,202,36,0.6)' : 'transparent'}`,
                                            opacity: isPast ? 0.3 : isCurrent ? 1 : 0.5,
                                            fontSize: isCurrent ? '1.1rem' : '0.85rem',
                                            fontWeight: isCurrent ? 900 : 600,
                                            color: isCurrent ? '#f9ca24' : 'rgba(255,255,255,0.6)',
                                            transition: 'all 0.3s ease',
                                        }}
                                    >
                                        <span style={{ fontFamily: 'monospace' }}>{t.level}</span>
                                        <span>{t.prize}</span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Main Content Area */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '40px' }}>
                            {/* Current Tier Badge */}
                            <motion.div
                                key={tier.level}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{
                                    fontSize: 'clamp(1rem, 2vw, 1.5rem)', fontWeight: 800,
                                    color: '#f9ca24', letterSpacing: '0.3em', textTransform: 'uppercase',
                                }}
                            >
                                Question {questionIndex + 1} • For {tier.prize}
                            </motion.div>

                            {/* Question */}
                            <motion.h2
                                key={currentQuestion.q}
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    fontSize: 'clamp(2rem, 4.5vw, 4.5rem)', fontWeight: 800, textAlign: 'center',
                                    maxWidth: '1100px', lineHeight: 1.2, letterSpacing: '-0.01em',
                                }}
                            >
                                {currentQuestion.q}
                            </motion.h2>

                            {/* Answer Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', maxWidth: '1000px' }}>
                                {currentQuestion.a.map((answer, i) => {
                                    const isDisabled = fiftyFiftyDisabled.includes(i);
                                    const isCorrect = i === currentQuestion.correct;
                                    const isRevealing = showResult;

                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
                                            animate={{
                                                x: 0, opacity: isDisabled ? 0.15 : 1,
                                                backgroundColor: isRevealing
                                                    ? isCorrect ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.15)'
                                                    : ANSWER_COLORS[i] + '18',
                                                borderColor: isRevealing
                                                    ? isCorrect ? '#2ecc71' : 'rgba(231,76,60,0.3)'
                                                    : ANSWER_COLORS[i] + '60',
                                                scale: isRevealing && isCorrect ? 1.03 : 1,
                                                boxShadow: isRevealing && isCorrect
                                                    ? '0 0 40px rgba(46,204,113,0.4), 0 0 80px rgba(46,204,113,0.2)'
                                                    : 'none',
                                            }}
                                            transition={{ delay: i * 0.1 + (isRevealing ? 0.3 : 0), duration: 0.4 }}
                                            style={{
                                                padding: 'clamp(16px, 3vh, 32px) 24px',
                                                borderRadius: '20px',
                                                border: '2px solid',
                                                display: 'flex', alignItems: 'center', gap: '16px',
                                                position: 'relative', overflow: 'hidden',
                                            }}
                                        >
                                            {/* Letter Badge */}
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                backgroundColor: ANSWER_COLORS[i] + (isRevealing && isCorrect ? 'ff' : '40'),
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.4rem', fontWeight: 900, flexShrink: 0,
                                                transition: 'all 0.3s',
                                            }}>
                                                {isRevealing && isCorrect ? '✓' : ANSWER_LABELS[i]}
                                            </div>
                                            <span style={{
                                                fontSize: 'clamp(1.2rem, 2.5vw, 2rem)', fontWeight: 700,
                                                textDecoration: isDisabled ? 'line-through' : 'none',
                                                color: isDisabled ? 'rgba(255,255,255,0.2)' : 'white',
                                            }}>
                                                {answer}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Timer Bar */}
                            {phase === 'QUESTION' && (
                                <div style={{ width: '100%', maxWidth: '800px' }}>
                                    <div style={{
                                        height: '8px', borderRadius: '4px',
                                        background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
                                    }}>
                                        <motion.div
                                            animate={{ width: `${(timer / 20) * 100}%` }}
                                            transition={{ ease: 'linear', duration: 0.9 }}
                                            style={{
                                                height: '100%', borderRadius: '4px',
                                                background: timer <= 5
                                                    ? 'linear-gradient(90deg, #e74c3c, #ff6b6b)'
                                                    : 'linear-gradient(90deg, #f9ca24, #00d4ff)',
                                            }}
                                        />
                                    </div>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', marginTop: '8px',
                                        fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600,
                                    }}>
                                        <span>{answerCount}/{playerCount} answered</span>
                                        <span style={{ color: timer <= 5 ? '#e74c3c' : 'rgba(255,255,255,0.5)', fontFamily: 'monospace', fontWeight: 900, fontSize: '1.2rem' }}>
                                            {timer}s
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Reveal: Show who got it right */}
                            {showResult && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
                                >
                                    {Object.entries(answers).map(([pid, ans]) => {
                                        const player = players[pid];
                                        if (!player) return null;
                                        const isCorrect = ans === currentQuestion.correct;
                                        const streak = streaks?.[pid] || 0;
                                        return (
                                            <motion.div
                                                key={pid}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', damping: 15 }}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '16px',
                                                    backgroundColor: isCorrect ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.15)',
                                                    border: `1px solid ${isCorrect ? 'rgba(46,204,113,0.4)' : 'rgba(231,76,60,0.3)'}`,
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    fontSize: '1rem', fontWeight: 700,
                                                }}
                                            >
                                                <span>{player.avatar || '👤'}</span>
                                                <span>{player.name}</span>
                                                <span style={{ color: isCorrect ? '#2ecc71' : '#e74c3c' }}>
                                                    {isCorrect ? `✓ +${tier.points}` : '✗'}
                                                </span>
                                                {isCorrect && streak >= 2 && (
                                                    <span style={{ color: '#f9ca24', fontSize: '0.8rem' }}>
                                                        🔥{streak}
                                                    </span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* GAME OVER PHASE */}
                {phase === 'GAME_OVER' && (
                    <motion.div
                        key="gameover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '40px', gap: '40px',
                        }}
                    >
                        <ConfettiExplosion />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.6 }}
                            style={{ fontSize: 'clamp(6rem, 15vw, 12rem)' }}
                        >
                            🏆
                        </motion.div>
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 900,
                                background: 'linear-gradient(135deg, #f9ca24, #f0932b)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                textAlign: 'center',
                            }}
                        >
                            GAME OVER!
                        </motion.h1>

                        {/* Final Scoreboard */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                        >
                            {Object.values(players)
                                .filter(p => !('isHost' in p && (p as any).isHost))
                                .sort((a, b) => b.score - a.score)
                                .map((player, i) => (
                                    <motion.div
                                        key={player.name}
                                        initial={{ x: -40, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 1 + i * 0.2 }}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '16px 24px', borderRadius: '16px',
                                            background: i === 0
                                                ? 'linear-gradient(135deg, rgba(249,202,36,0.2), rgba(240,147,43,0.1))'
                                                : 'rgba(255,255,255,0.05)',
                                            border: `2px solid ${i === 0 ? 'rgba(249,202,36,0.4)' : 'rgba(255,255,255,0.05)'}`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{
                                                fontSize: '2rem', fontWeight: 900,
                                                color: i === 0 ? '#f9ca24' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.3)',
                                            }}>
                                                {i === 0 ? '👑' : `#${i + 1}`}
                                            </span>
                                            <span style={{ fontSize: '1.5rem' }}>{player.avatar}</span>
                                            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{player.name}</span>
                                        </div>
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 1.2 + i * 0.2, type: 'spring' }}
                                            style={{
                                                fontSize: '1.6rem', fontWeight: 900, fontFamily: 'monospace',
                                                color: i === 0 ? '#f9ca24' : '#00d4ff',
                                            }}
                                        >
                                            {player.score}
                                        </motion.span>
                                    </motion.div>
                                ))
                            }
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persistent subtle CSS */}
            <style>{`
                @keyframes pulse-gold {
                    0%, 100% { box-shadow: 0 0 20px rgba(249,202,36,0.3); }
                    50% { box-shadow: 0 0 40px rgba(249,202,36,0.5); }
                }
            `}</style>
        </div>
    );
};

export default BrainBurstHost;
