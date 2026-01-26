import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const PollPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess } = useSound();
    const [votedId, setVotedId] = useState<string | null>(null);

    const phase = gameState?.gameData?.phase || 'VOTING';
    const prompt = gameState?.gameData?.prompt || '';
    const players = gameState?.players || {};
    const participants = Object.values(players).filter(p => !p.isHost);

    const handleVote = (pid: string) => {
        if (votedId) return;
        socket?.emit('submitPollVote', pid);
        setVotedId(pid);
        playClick();
        playSuccess();
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col p-4 overflow-hidden"
                    >
                        {votedId ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">📈</div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic">VOTE REGISTERED!</h3>
                                <div className="p-8 bg-game-secondary/10 rounded-[2.5rem] border-4 border-game-secondary flex flex-col items-center gap-4">
                                    <span className="text-7xl">{players[votedId]?.avatar}</span>
                                    <span className="text-2xl font-black uppercase">{players[votedId]?.name}</span>
                                </div>
                                <p className="text-white/40 text-lg font-black uppercase tracking-[0.3em] animate-pulse">Waiting for the fam...</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center space-y-2 mb-8">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-game-secondary">Live Poll</span>
                                    <h3 className="text-3xl font-black leading-tight tracking-tight italic">"{prompt}"</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-20 custom-scrollbar pr-2">
                                    {participants.map((p) => (
                                        <motion.button
                                            key={p.id}
                                            whileHover={{ scale: 0.98 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleVote(p.id)}
                                            className="bg-white/5 p-6 rounded-[2.5rem] border-4 border-white/10 flex flex-col items-center gap-4 hover:border-game-secondary hover:bg-game-secondary/10 transition-all active:scale-95"
                                        >
                                            <div className="text-6xl drop-shadow-xl">{p.avatar}</div>
                                            <div className="font-black text-xl truncate w-full uppercase tracking-tighter">{p.name}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {phase === 'RESULTS' && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="text-[10rem] animate-pulse">📊</div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter text-game-secondary">POLL COMPLETE!</h3>
                        <p className="text-white/30 text-xl font-bold uppercase tracking-widest">Look at the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PollPlayer;