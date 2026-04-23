import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

/** Full oscillation period (ms) — pulse crosses the sweet spot twice per cycle. */
/** Minimum gap between scored hits so one crossing cannot count twice. */
const MIN_HIT_GAP_MS = 380;
/** Half-width of hit zone on 0–1 track (center = 0.5). */
const ZONE_HALF = 0.065;

const CompetePlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();

    const [tapCount, setTapCount] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [markerX, setMarkerX] = useState(0.5);
    const [hitFlash, setHitFlash] = useState<'perfect' | 'miss' | null>(null);

    const tapCountRef = useRef(0);
    const playStartRef = useRef(0);
    const lastGoodHitRef = useRef(0);
    const rafRef = useRef<number>(0);

    const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
    const phase = gameData.phase as string | undefined;
    const { challengerIds = [], challengeType, target, winnerId } = gameData;

    const isCompeting = challengerIds.includes(socket?.id || '');
    const isWinner = winnerId === socket?.id;

    const tapTarget = challengeType === 'TAP' && typeof target === 'number' ? target : 20;

    /** Base period (ms) for the pulse cycle. */
    const BASE_CYCLE_MS = 1600;
    /** Current period after scaling with tapCount. */
    const currentCycleMs = Math.max(700, BASE_CYCLE_MS - (tapCount * 45));

    useEffect(() => {
        if (phase === 'PLAYING' && challengeType === 'TAP') {
            tapCountRef.current = 0;
            setTapCount(0);
            lastGoodHitRef.current = 0;
            playStartRef.current = performance.now();
            setHitFlash(null);
        }
    }, [phase, challengeType]);

    useEffect(() => {
        if (phase !== 'PLAYING' || challengeType !== 'TAP') {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }

        const tick = () => {
            const elapsed = performance.now() - playStartRef.current;
            const omega = (2 * Math.PI) / currentCycleMs;
            const x = 0.5 + 0.45 * Math.sin(elapsed * omega);
            setMarkerX(x);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [phase, challengeType, currentCycleMs]);

    useEffect(() => {
        if (!hitFlash) return;
        const t = window.setTimeout(() => setHitFlash(null), 450);
        return () => clearTimeout(t);
    }, [hitFlash]);

    const tryPulseHit = useCallback(() => {
        if (challengeType !== 'TAP' || phase !== 'PLAYING') return;

        const now = performance.now();
        // Use the current markerX directly for hit detection to ensure sync with visual
        const inZone = Math.abs(markerX - 0.5) <= ZONE_HALF;

        if (inZone) {
            if (now - lastGoodHitRef.current < MIN_HIT_GAP_MS) {
                playClick();
                return;
            }
            lastGoodHitRef.current = now;
            const next = tapCountRef.current + 1;
            tapCountRef.current = next;
            setTapCount(next);
            socket?.emit('gameInput', { score: next });
            playSuccess();
            setHitFlash('perfect');
        } else {
            playError();
            setHitFlash('miss');
        }
    }, [challengeType, phase, socket, playClick, playSuccess, playError, markerX]);

    const handlePulsePointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            tryPulseHit();
        },
        [tryPulseHit]
    );

    useEffect(() => {
        if (challengeType === 'TYPE' && phase === 'PLAYING') {
            socket?.emit('gameInput', { score: typedText.length });
            if (typedText.length > 0) playClick();
        }
    }, [typedText, challengeType, phase, socket, playClick]);

    if (!isCompeting) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12">
                <div className="text-[12rem] animate-pulse">🍿</div>
                <h3 className="text-5xl font-black uppercase tracking-tighter text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">AUDIENCE MODE</h3>
                <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose">
                    Grab your snacks!<br/>Watch the battle on screen.
                </p>
                <div className="w-full h-px bg-white/10" />
            </div>
        );
    }

    if (phase === 'INTRO' || phase === 'COUNTDOWN') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 bg-gradient-to-b from-[#0d0f1a] to-[#1a1f3a]">
                <div className="text-[15rem] drop-shadow-[0_0_50px_rgba(255,255,0,0.5)] animate-pulse">⚡</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic">GET READY!</h2>
                    <p className="text-2xl text-[#ffff00] font-black uppercase tracking-widest animate-pulse">1V1 INCOMING</p>
                </div>
                <div className="w-full h-px bg-white/10" />
                <p className="text-white/40 text-xl font-black uppercase tracking-widest italic text-center px-4">
                    {challengeType === 'TAP'
                        ? 'Wait for the glow — tap when the pulse is dead center.'
                        : 'Prepare to TYPE'}
                </p>
            </div>
        );
    }

    if (phase === 'RESULTS') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 text-center">
                <div className="text-[15rem] leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                    {isWinner ? '🏆' : '💀'}
                </div>
                <div className={`p-12 glass-panel border-8 w-full rounded-[4rem] ${isWinner ? 'border-[#00ff00] shadow-[0_0_60px_rgba(0,255,0,0.4)]' : 'border-[#ff00ff] shadow-[0_0_60px_rgba(255,0,255,0.2)]'}`}>
                    <h2 className={`text-6xl font-black uppercase tracking-tighter italic ${isWinner ? 'text-[#00ff00]' : 'text-[#ff00ff]'}`}>
                        {isWinner ? 'VICTORY!' : 'ELIMINATED!'}
                    </h2>
                    <p className="text-2xl text-white/40 font-black uppercase tracking-widest mt-4">
                        {isWinner ? 'CHAMPION ENERGY' : 'BETTER LUCK NEXT BATTLE'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#0d0f1a]">
            <AnimatePresence mode="wait">
                {challengeType === 'TAP' && (
                    <motion.div
                        key="tap-challenge"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center w-full space-y-8 touch-manipulation select-none"
                    >
                        <div className="text-center space-y-2">
                            <span className="text-lg font-black uppercase tracking-[0.35em] text-white/35">CENTER HITS</span>
                            <div className="text-8xl sm:text-9xl font-black font-mono leading-none text-[#ffff00] drop-shadow-[0_0_40px_rgba(255,255,0,0.5)]">
                                {tapCount}
                                <span className="text-white/25 text-4xl sm:text-5xl"> / {tapTarget}</span>
                            </div>
                        </div>

                        <div
                            role="button"
                            tabIndex={0}
                            onPointerDown={handlePulsePointerDown}
                            onKeyDown={(ev) => {
                                if (ev.key === ' ' || ev.key === 'Enter') {
                                    ev.preventDefault();
                                    tryPulseHit();
                                }
                            }}
                            className="relative w-full max-w-lg py-4 cursor-pointer rounded-[3rem] border-4 border-white/15 bg-[#12152a]/90 shadow-[0_0_50px_rgba(0,255,255,0.15)] overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/50"
                            style={{ touchAction: 'manipulation' }}
                        >
                            <div className="relative h-28 sm:h-32 mx-4 rounded-2xl bg-[#0a0c18] border-2 border-white/10 overflow-hidden">
                                {/* Sweet zone */}
                                <div
                                    className="absolute top-0 bottom-0 w-[18%] left-1/2 -translate-x-1/2 bg-gradient-to-b from-emerald-400/25 via-cyan-400/20 to-emerald-400/25 border-x border-cyan-300/40"
                                    aria-hidden
                                />
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300/70">
                                    hit zone
                                </div>
                                {/* Wave shimmer */}
                                <div
                                    className="absolute inset-0 opacity-30 pointer-events-none"
                                    style={{
                                        background:
                                            'repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,255,255,0.06) 12px, rgba(0,255,255,0.06) 14px)',
                                    }}
                                />
                                {/* Moving pulse */}
                                <div
                                    className="absolute top-1 bottom-1 w-1.5 rounded-full bg-gradient-to-b from-[#ff00ff] via-white to-[#00ffff] shadow-[0_0_24px_rgba(255,255,255,0.9)] pointer-events-none"
                                    style={{
                                        left: `calc(${markerX * 100}% - 3px)`,
                                        transition: 'none',
                                    }}
                                />
                            </div>

                            <p className="text-center mt-4 text-sm font-black uppercase tracking-[0.25em] text-white/45 px-6">
                                Tap when the bar crosses the green zone
                            </p>

                            <AnimatePresence>
                                {hitFlash && (
                                    <motion.div
                                        key={hitFlash}
                                        initial={{ opacity: 0, y: 8, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className={`absolute inset-x-0 bottom-6 text-center text-2xl font-black uppercase tracking-[0.3em] pointer-events-none ${
                                            hitFlash === 'perfect' ? 'text-emerald-400' : 'text-rose-400'
                                        }`}
                                    >
                                        {hitFlash === 'perfect' ? '⚡ on beat' : 'off beat'}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {challengeType === 'TYPE' && (
                    <motion.div
                        key="type-challenge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center justify-center w-full space-y-12"
                    >
                        <div className="w-full space-y-6 text-center">
                            <span className="text-xl font-black uppercase tracking-[0.4em] text-white/30">Type Exactly:</span>
                            <div className="p-10 glass-panel border-4 border-[#00ffff] rounded-[3rem] shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                                <h3 className="text-5xl font-black text-white uppercase italic tracking-widest leading-none drop-shadow-lg">
                                    "{target}"
                                </h3>
                            </div>
                        </div>

                        <div className="w-full space-y-8">
                            <input
                                type="text"
                                value={typedText}
                                onChange={(e) => setTypedText(e.target.value)}
                                placeholder="GO GO GO!"
                                className="w-full py-10 px-8 bg-[#1a1f3a] border-4 border-white/10 rounded-[3rem] text-center text-5xl font-black text-white focus:outline-none focus:border-[#ff00ff] focus:shadow-[0_0_40px_rgba(255,0,255,0.4)] transition-all placeholder:text-white/10 uppercase"
                                autoFocus
                                autoComplete="off"
                                autoCorrect="off"
                            />

                            <div className="w-full h-8 bg-white/5 rounded-full overflow-hidden border-2 border-white/10 p-1">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-[#00ffff] to-[#ff00ff] rounded-full shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(typedText.length / (target?.length || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompetePlayer;
