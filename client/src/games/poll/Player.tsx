import { useState } from 'react';
import { motion } from 'framer-motion';

interface PollPlayerProps {
    phase: 'VOTING' | 'RESULTS';
    prompt: string;
    players: any;
    onVote: (targetId: string) => void;
    myId: string;
}

const PollPlayer: React.FC<PollPlayerProps> = ({ phase, prompt, players, onVote }) => {
    const [voted, setVoted] = useState(false);

    if (phase === 'VOTING') {
        if (voted) {
            return (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                    <h3 className="text-2xl font-bold">Vote Cast.</h3>
                    <p className="text-white/50">Who else agrees with you?</p>
                </div>
            )
        }

        return (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto pb-20">
                <div className="mb-8 text-center">
                    <span className="text-xs uppercase tracking-widest text-game-accent">Poll</span>
                    <h3 className="text-xl font-bold leading-tight mt-2">{prompt}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {Object.values(players).map((p: any) => (
                        <motion.button
                            key={p.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { onVote(p.id); setVoted(true); }}
                            className="p-6 bg-white/10 rounded-2xl border border-white/5 flex flex-col items-center gap-2 hover:bg-white/20 hover:border-game-primary transition-colors"
                        >
                            <div className="text-3xl">👤</div>
                            <div className="font-bold truncate w-full">{p.name}</div>
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
