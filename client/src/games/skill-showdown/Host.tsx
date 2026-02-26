import { motion, AnimatePresence } from 'framer-motion';

interface SkillShowdownHostProps {
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
    submissions: Record<string, any>;
    scores: Record<string, number>;
    players: Record<string, { name: string; avatar?: string; score: number; isHost?: boolean }>;
}

export default function SkillShowdownHost({ phase, challengeIndex, challenge, submissions, scores, players }: SkillShowdownHostProps) {
    const totalChallenges = 5;
    const submitCount = Object.keys(submissions).length;
    const playerCount = Object.keys(players).filter(p => !players[p].isHost).length;

    return (
        <div className="skill-showdown-host">
            {/* Progress bar */}
            <div className="ss-progress">
                {Array.from({ length: totalChallenges }).map((_, i) => (
                    <div
                        key={i}
                        className={`ss-progress-dot ${i < challengeIndex ? 'done' : ''} ${i === challengeIndex ? 'active' : ''}`}
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* PREVIEW PHASE */}
                {phase === 'PREVIEW' && (
                    <motion.div
                        key={`preview-${challengeIndex}`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="ss-preview"
                    >
                        <motion.div
                            className="ss-challenge-number"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            Challenge {challengeIndex + 1}/{totalChallenges}
                        </motion.div>
                        <div className="ss-challenge-title">{challenge.title}</div>
                        <div className="ss-challenge-instruction">{challenge.instruction}</div>
                        <motion.div
                            className="ss-get-ready"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            GET READY...
                        </motion.div>
                    </motion.div>
                )}

                {/* PLAYING PHASE */}
                {phase === 'PLAYING' && (
                    <motion.div
                        key={`playing-${challengeIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="ss-playing"
                    >
                        <div className="ss-challenge-title-small">{challenge.title}</div>

                        {/* Challenge-specific host visuals */}
                        {challenge.type === 'MEMORY_GRID' && challenge.grid && (
                            <div className="ss-grid-display">
                                {challenge.grid.map((lit, i) => (
                                    <div key={i} className={`ss-grid-cell ${lit ? 'lit' : ''}`} />
                                ))}
                            </div>
                        )}

                        {challenge.type === 'COLOR_MATCH' && challenge.targetColor && (
                            <div className="ss-color-target">
                                <div className="ss-color-label">MATCH THIS COLOR</div>
                                <div
                                    className="ss-color-swatch"
                                    style={{
                                        backgroundColor: `rgb(${challenge.targetColor.r}, ${challenge.targetColor.g}, ${challenge.targetColor.b})`
                                    }}
                                />
                            </div>
                        )}

                        {challenge.type === 'ANGLE_GUESS' && challenge.targetAngle !== undefined && (
                            <div className="ss-angle-display">
                                <svg viewBox="0 0 200 200" className="ss-angle-svg">
                                    <line x1="100" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                                    <line
                                        x1="100" y1="100"
                                        x2={100 + 80 * Math.cos((challenge.targetAngle * Math.PI) / 180)}
                                        y2={100 - 80 * Math.sin((challenge.targetAngle * Math.PI) / 180)}
                                        stroke="#00ffff" strokeWidth="3"
                                    />
                                    <circle cx="100" cy="100" r="4" fill="#00ffff" />
                                    <path
                                        d={`M 130 100 A 30 30 0 ${challenge.targetAngle > 180 ? 1 : 0} 0 ${100 + 30 * Math.cos((challenge.targetAngle * Math.PI) / 180)} ${100 - 30 * Math.sin((challenge.targetAngle * Math.PI) / 180)}`}
                                        fill="none" stroke="#f9ca24" strokeWidth="2"
                                    />
                                    <text x="100" y="160" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="14">?°</text>
                                </svg>
                            </div>
                        )}

                        {challenge.type === 'CIRCLE_DRAW' && (
                            <div className="ss-circle-prompt">
                                <motion.div
                                    className="ss-circle-ghost"
                                    animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.1, 0.2, 0.1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                />
                                <div className="ss-circle-text">Players are drawing...</div>
                            </div>
                        )}

                        {challenge.type === 'TEMPO_TAP' && (
                            <div className="ss-tempo-display">
                                <motion.div
                                    className="ss-tempo-pulse"
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 60 / (challenge.targetBPM || 120) }}
                                />
                                <div className="ss-tempo-bpm">{challenge.targetBPM || 120} BPM</div>
                            </div>
                        )}

                        {/* Submission counter */}
                        <div className="ss-submit-counter">
                            <motion.span
                                key={submitCount}
                                initial={{ scale: 1.5 }}
                                animate={{ scale: 1 }}
                            >
                                {submitCount}
                            </motion.span>
                            /{playerCount} submitted
                        </div>
                    </motion.div>
                )}

                {/* REVEAL PHASE */}
                {phase === 'REVEAL' && (
                    <motion.div
                        key={`reveal-${challengeIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="ss-reveal"
                    >
                        <div className="ss-challenge-title-small">{challenge.title} — Results</div>

                        {challenge.type === 'ANGLE_GUESS' && challenge.targetAngle !== undefined && (
                            <div className="ss-reveal-answer">Answer: {challenge.targetAngle}°</div>
                        )}

                        <div className="ss-scores-list">
                            {Object.entries(scores)
                                .sort((a, b) => b[1] - a[1])
                                .map(([pid, score], idx) => (
                                    <motion.div
                                        key={pid}
                                        initial={{ x: -30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`ss-score-row ${idx === 0 ? 'winner' : ''}`}
                                    >
                                        <span className="ss-score-rank">
                                            {idx === 0 ? '🏆' : `#${idx + 1}`}
                                        </span>
                                        <span className="ss-score-name">
                                            {players[pid]?.name || 'Unknown'}
                                        </span>
                                        <span className="ss-score-value">{score}%</span>
                                    </motion.div>
                                ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .skill-showdown-host {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 40px;
                    gap: 20px;
                }
                .ss-progress {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .ss-progress-dot {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    border: 2px solid rgba(255,255,255,0.2);
                    transition: all 0.3s;
                }
                .ss-progress-dot.done {
                    background: #00ffff;
                    border-color: #00ffff;
                    box-shadow: 0 0 10px rgba(0,255,255,0.5);
                }
                .ss-progress-dot.active {
                    background: #f9ca24;
                    border-color: #f9ca24;
                    box-shadow: 0 0 15px rgba(249,202,36,0.6);
                    transform: scale(1.3);
                }
                .ss-preview, .ss-playing, .ss-reveal {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    text-align: center;
                }
                .ss-challenge-number {
                    font-size: clamp(1rem, 2.5vw, 1.5rem);
                    color: rgba(255,255,255,0.4);
                    text-transform: uppercase;
                    letter-spacing: 0.3em;
                    font-weight: 900;
                }
                .ss-challenge-title {
                    font-size: clamp(3rem, 8vw, 6rem);
                    font-weight: 900;
                    background: linear-gradient(135deg, #ff00ff, #00ffff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    line-height: 1.1;
                }
                .ss-challenge-title-small {
                    font-size: clamp(1.5rem, 4vw, 2.5rem);
                    font-weight: 900;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .ss-challenge-instruction {
                    font-size: clamp(1.2rem, 3vw, 2rem);
                    color: rgba(255,255,255,0.6);
                    max-width: 600px;
                }
                .ss-get-ready {
                    font-size: clamp(1.5rem, 4vw, 3rem);
                    font-weight: 900;
                    color: #f9ca24;
                    text-transform: uppercase;
                    letter-spacing: 0.3em;
                    margin-top: 20px;
                }
                .ss-grid-display {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    width: min(300px, 60vw);
                    aspect-ratio: 1;
                }
                .ss-grid-cell {
                    border-radius: 12px;
                    background: rgba(255,255,255,0.08);
                    border: 2px solid rgba(255,255,255,0.1);
                    transition: all 0.3s;
                }
                .ss-grid-cell.lit {
                    background: #00ffff;
                    border-color: #00ffff;
                    box-shadow: 0 0 20px rgba(0,255,255,0.4);
                }
                .ss-color-target {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .ss-color-label {
                    font-size: 1.2rem;
                    color: rgba(255,255,255,0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    font-weight: 800;
                }
                .ss-color-swatch {
                    width: min(200px, 50vw);
                    height: min(200px, 50vw);
                    border-radius: 24px;
                    border: 4px solid rgba(255,255,255,0.3);
                    box-shadow: 0 0 40px rgba(0,0,0,0.5);
                }
                .ss-angle-display {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ss-angle-svg {
                    width: min(300px, 60vw);
                    height: min(300px, 60vw);
                }
                .ss-circle-prompt {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .ss-circle-ghost {
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                    border: 3px dashed rgba(255,255,255,0.15);
                }
                .ss-circle-text {
                    color: rgba(255,255,255,0.4);
                    font-size: 1.2rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                }
                .ss-tempo-display {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .ss-tempo-pulse {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: radial-gradient(circle, #ff00ff, transparent);
                    opacity: 0.6;
                }
                .ss-tempo-bpm {
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #ff00ff;
                    letter-spacing: 0.1em;
                }
                .ss-submit-counter {
                    font-size: 1.3rem;
                    color: rgba(255,255,255,0.4);
                    font-weight: 700;
                    margin-top: 20px;
                }
                .ss-reveal-answer {
                    font-size: 1.5rem;
                    color: #00ffff;
                    font-weight: 800;
                }
                .ss-scores-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    width: min(500px, 90vw);
                    margin-top: 10px;
                }
                .ss-score-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    border-radius: 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .ss-score-row.winner {
                    background: linear-gradient(135deg, rgba(249,202,36,0.15), rgba(240,147,43,0.15));
                    border-color: rgba(249,202,36,0.4);
                }
                .ss-score-rank {
                    font-size: 1.3rem;
                    font-weight: 900;
                    color: rgba(255,255,255,0.5);
                    min-width: 40px;
                }
                .ss-score-name {
                    flex: 1;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: white;
                }
                .ss-score-value {
                    font-size: 1.2rem;
                    font-weight: 900;
                    color: #00ffff;
                    font-family: monospace;
                }
            `}</style>
        </div>
    );
}
