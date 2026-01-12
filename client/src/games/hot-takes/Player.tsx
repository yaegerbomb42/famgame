import { useState } from 'react';
import { motion } from 'framer-motion';

interface HotTakesPlayerProps {
    phase: 'INPUT' | 'VOTING' | 'RESULTS';
    prompt: string;
    inputs: any; // { playerId: text }
    onSubmit: (text: string) => void;
    onVote: (targetId: string) => void;
    myId: string;
}

const HotTakesPlayer: React.FC<HotTakesPlayerProps> = ({ phase, prompt, inputs, onSubmit, onVote, myId }) => {
    const [take, setTake] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [voted, setVoted] = useState(false);

    // --- INPUT PHASE ---
    if (phase === 'INPUT') {
        if (submitted) {
            return (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                    <div className="text-6xl mb-4">🔥</div>
                    <h3 className="text-2xl font-bold">Hot Take Served.</h3>
                    <p className="text-white/50">Waiting for the others...</p>
                </div>
            )
        }

        return (
            <div className="flex-1 flex flex-col p-6">
                <div className="mb-4 text-center">
                    <span className="text-xs uppercase tracking-widest text-game-accent">Topic</span>
                    <h3 className="text-xl font-bold leading-tight mt-2">{prompt}</h3>
                </div>

                <textarea
                    value={take}
                    onChange={(e) => setTake(e.target.value)}
                    placeholder="Your answer..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-xl font-bold focus:outline-none focus:border-game-primary resize-none mb-6"
                    maxLength={100}
                    autoFocus
                />

                <button
                    onClick={() => { onSubmit(take); setSubmitted(true); }}
                    disabled={!take.trim()}
                    className="w-full py-6 bg-game-primary rounded-2xl font-bold text-xl disabled:opacity-50"
                >
                    FIRE IT OFF
                </button>
            </div>
        )
    }

    // --- VOTING PHASE ---
    if (phase === 'VOTING') {
        if (voted) {
            return (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                    <h3 className="text-2xl font-bold">Vote Locked.</h3>
                </div>
            )
        }

        return (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto pb-20">
                <h3 className="text-center text-lg font-bold mb-6 text-white/50">Pick the best one</h3>
                <div className="space-y-4">
                    {Object.entries(inputs).map(([pid, text]: [string, any]) => {
                        if (pid === myId) return null; // Don't vote for yourself

                        return (
                            <motion.button
                                key={pid}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { onVote(pid); setVoted(true); }}
                                className="w-full p-6 bg-white/10 rounded-2xl border border-white/5 text-left font-bold text-lg hover:bg-white/20"
                            >
                                {text}
                            </motion.button>
                        )
                    })}
                </div>
            </div>
        )
    }

    // --- RESULTS PHASE ---
    if (phase === 'RESULTS') {
        return (
            <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                <h3 className="text-2xl font-bold">Check the Big Screen!</h3>
            </div>
        )
    }

    return null;
};

export default HotTakesPlayer;
