import { useState } from 'react';
import { motion } from 'framer-motion';

interface PollPlayerProps {
    phase: 'VOTING' | 'RESULTS';
    prompt: string;
    players: Record<string, { id: string; name: string }>;
    onVote: (targetId: string) => void;
    myId: string;
}

const PollPlayer: React.FC<PollPlayerProps> = ({ phase, prompt, players, onVote }) => {
    const [voted, setVoted] = useState(false);

    if (phase === 'VOTING') {
        if (voted) {
            return (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-12 space-y-8">
                    <div className="text-huge animate-bounce">📊</div>
                    <h3 className="text-5xl font-black gradient-text-primary uppercase">OPINION LOGGED.</h3>
                    <p className="text-white/40 text-2xl uppercase tracking-widest">Seeing what the fam thinks...</p>
                </div>
            )
        }

        return (
            <div className="flex-1 flex flex-col p-8 overflow-y-auto pb-32 custom-scrollbar">
                <div className="mb-12 text-center space-y-3">
                    <span className="text-2xl uppercase tracking-[0.5em] font-black text-game-accent">Live Poll</span>
                    <h3 className="text-4xl font-black leading-tight uppercase tracking-tighter">{prompt}</h3>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {Object.values(players).map((p) => (
                        <motion.button
                            key={p.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { onVote(p.id); setVoted(true); }}
                            className="p-10 bg-white/5 rounded-[3rem] border-4 border-white/5 flex flex-col items-center gap-6 hover:bg-white/10 hover:border-game-primary hover:shadow-[0_0_50px_rgba(255,0,255,0.3)] transition-all"
                        >
                            <div className="text-8xl drop-shadow-2xl">👤</div>
                            <div className="font-black text-3xl truncate w-full uppercase tracking-tighter">{p.name}</div>
                        </motion.button>
                    ))}
                </div>
            </div>
        )
    }

    // --- RESULTS PHASE ---
    if (phase === 'RESULTS') {
        return (
            <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                <h3 className="text-2xl font-bold">Look at the Data!</h3>
            </div>
        )
    }

    return null;
};

export default PollPlayer;
