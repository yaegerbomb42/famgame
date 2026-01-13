import { useState } from 'react';
import { motion } from 'framer-motion';

interface HotTakesPlayerProps {
    phase: 'INPUT' | 'VOTING' | 'RESULTS';
    prompt: string;
    inputs: Record<string, string>; // { playerId: text }
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
                <div className="flex-1 flex items-center justify-center flex-col text-center p-12 space-y-8">
                    <div className="text-huge animate-bounce">🔥</div>
                    <h3 className="text-5xl font-black gradient-text-secondary uppercase">TAKE SERVED.</h3>
                    <p className="text-white/40 text-2xl uppercase tracking-widest">Waiting for more heat...</p>
                </div>
            )
        }

        return (
            <div className="flex-1 flex flex-col p-8 space-y-8">
                <div className="text-center space-y-2">
                    <span className="text-2xl uppercase tracking-[0.5em] font-black text-game-accent">Hot Topic</span>
                    <h3 className="text-4xl font-black leading-tight uppercase tracking-tighter">{prompt}</h3>
                </div>

                <textarea
                    value={take}
                    onChange={(e) => setTake(e.target.value)}
                    placeholder="DROP YOUR BOLD TAKE HERE..."
                    className="w-full flex-1 bg-white/5 border-4 border-white/10 rounded-[3rem] p-10 text-4xl font-black focus:outline-none focus:border-game-primary resize-none placeholder:text-white/10"
                    maxLength={100}
                    autoFocus
                />

                <button
                    onClick={() => { onSubmit(take); setSubmitted(true); }}
                    disabled={!take.trim()}
                    className="w-full py-12 bg-game-primary rounded-[3rem] font-black text-4xl shadow-[0_20px_50px_rgba(255,0,255,0.4)] disabled:opacity-20 transition-all uppercase tracking-widest"
                >
                    POST THE TRUTH 🚀
                </button>
            </div>
        )
    }

    // --- VOTING PHASE ---
    if (phase === 'VOTING') {
        if (voted) {
            return (
                <div className="flex-1 flex items-center justify-center flex-col text-center p-12 space-y-8">
                    <div className="text-huge animate-pulse">🗳️</div>
                    <h3 className="text-5xl font-black gradient-text-primary uppercase">VOTE LOCKED.</h3>
                </div>
            )
        }

        return (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto pb-32 custom-scrollbar">
                <h3 className="text-center text-3xl font-black mb-12 text-white/40 uppercase tracking-widest">Pick the Best Take</h3>
                <div className="space-y-6">
                    {Object.entries(inputs).map(([pid, text]: [string, string]) => {
                        if (pid === myId) return null; // Don't vote for yourself

                        return (
                            <motion.button
                                key={pid}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { onVote(pid); setVoted(true); }}
                                className="w-full p-10 bg-white/5 rounded-[2.5rem] border-4 border-white/5 text-left font-black text-3xl hover:bg-white/10 hover:border-game-primary hover:shadow-[0_0_40px_rgba(255,0,255,0.3)] transition-all"
                            >
                                <span className="block leading-tight uppercase tracking-tight">"{text}"</span>
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
