import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '../context/PersonaContext';
import { useGameStore } from '../store/useGameStore';
import { useMemo } from 'react';

export const Persona = () => {
    const { isSpeaking } = usePersona();
    const gameState = useGameStore(s => s.gameState);

    const players = useMemo(
        () => Object.values(gameState?.players || {}).filter(p => !p.isHost),
        [gameState?.players]
    );
    const playerCount = players.length;

    return (
        <div className="fixed top-32 left-8 z-[70] pointer-events-none flex items-center gap-4 font-['Outfit'] max-w-[min(100vw-2rem,24rem)]">
            {/* Room + headcount — top-left so it does not cover the host Standings rail (right). */}
            <AnimatePresence>
                {gameState && (
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/40 backdrop-blur-2xl px-4 py-2 rounded-[1.5rem] border border-white/10 flex items-center gap-4 shadow-2xl pointer-events-auto"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-cyan-400 opacity-50 uppercase tracking-[0.2em]">Room</span>
                            <span className="text-xl font-black text-white tabular-nums">{gameState.roomCode}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] font-black text-pink-500 opacity-50 uppercase tracking-[0.2em]">Fam</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xl font-black text-white tabular-nums">{playerCount}</span>
                                <span className="text-sm">👤</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Holographic Speech Bubble */}
            {isSpeaking && (
                <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="hidden sm:flex bg-black/60 backdrop-blur-xl border border-cyan-500/30 px-4 py-2 rounded-2xl text-cyan-300 font-black text-[10px] uppercase tracking-[0.25em] shadow-[0_0_24px_rgba(34,211,238,0.15)] pointer-events-none"
                >
                    <span className="animate-pulse">Host speaking…</span>
                </motion.div>
            )}
        </div>
    );
};
