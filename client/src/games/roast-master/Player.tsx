import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import type { GameStore } from '../../store/useGameStore';

// Removed unused 'Assignment' interface

interface RoastToVote {
    authorId: string;
    targetId: string;
    text: string;
    votes: number;
    personaName: string;
    targetName?: string;
}

const ROAST_TEMPLATES = [
    "I've seen better style in a ...",
    "{target} is the reason why we use warning labels.",
    "It's impressive how {target} manages to be wrong about...",
    "{target} looks like they just crawled out of...",
    "I'm not saying {target} is ugly, but...",
    "If confusion was a person, it would look like {target}."
];

const RoastMasterPlayer: React.FC = () => {
    const { gameState, gameInput, socket } = useGameStore((state: GameStore) => ({
        gameState: state.gameState,
        gameInput: state.gameInput,
        socket: state.socket
    }));
    const [roast, setRoast] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [votedIdx, setVotedIdx] = useState<number | null>(null);

    const gameData = gameState?.gameData;
    const me = socket?.id ? gameState?.players[socket.id] : null;

    // Pattern: Adjust state during rendering to reset on phase change
    const [prevPhase, setPrevPhase] = useState(gameData?.phase);

    if (gameData?.phase !== prevPhase) {
        setPrevPhase(gameData?.phase);
        setSubmitted(false);
        setRoast('');
        setVotedIdx(null);
    }

    if (!gameData || !me) return null;

    const myRealAssignment = gameData.assignments?.[me.id];

    // Fallback if structure varies
    const targetPersona = myRealAssignment ? myRealAssignment.persona : null;
    const targetPlayer = myRealAssignment ? gameState.players[myRealAssignment.targetId] : null;
    const roastsToVote = (gameData.roastsToVote || []) as RoastToVote[];

    const handleSubmit = () => {
        if (!roast.trim() || !myRealAssignment) return;
        gameInput({
            type: 'SUBMIT_ROAST',
            targetId: myRealAssignment.targetId,
            text: roast
        });
        setSubmitted(true);
    };

    const handleVote = (idx: number) => {
        if (votedIdx !== null) return;
        gameInput({ type: 'VOTE', roastIdx: idx });
        setVotedIdx(idx);
    };

    const sendReaction = (emoji: string) => {
        gameInput({ type: 'REACTION', emoji });
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const sendSticker = (emoji: string) => {
        gameInput({ type: 'REACTION', emoji }); // Host handles this as sticker
        if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
    };

    const useRoastAssist = () => {
        const template = ROAST_TEMPLATES[Math.floor(Math.random() * ROAST_TEMPLATES.length)];
        const targetName = targetPlayer?.name || "this person";
        setRoast(template.replace("{target}", targetName));
        if (navigator.vibrate) navigator.vibrate(20);
    };

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950 font-display text-white overflow-hidden selection:bg-orange-500/50">
            <header className="p-6 bg-zinc-900 border-b border-white/5 flex justify-between items-center shadow-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white/20 shadow-inner">
                        {gameData?.players[me.id]?.avatar || '👤'}
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-zinc-800 rounded-full text-xs font-mono text-zinc-400 border border-white/5">
                    {gameData?.phase || 'WAITING'}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col">
                <AnimatePresence mode="wait">
                    {gameData?.phase === 'INTRO' && (
                        <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                            <div className="text-8xl mb-4 animate-[bounce_3s_infinite]">🔥</div>
                            <h2 className="text-4xl font-black text-white px-8 leading-tight">Prepare Your<br /><span className="text-orange-500">Worst.</span></h2>
                            <p className="text-zinc-400 max-w-xs mx-auto text-lg">Wait for the host to start the inferno.</p>

                            <div className="w-full max-w-sm mt-8 overflow-hidden relative">
                                <motion.div animate={{ x: ["100%", "-100%"] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="whitespace-nowrap text-zinc-500 font-mono text-sm">
                                    TIP: RHYMES ARE CHEESY BUT EFFECTIVE • TIP: GO FOR THE HAIRCUT FIRST • TIP: DON'T HOLD BACK
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {gameData?.phase === 'WRITING' && targetPlayer && (
                        <motion.div key="writing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📜</div>
                                    <h3 className="text-2xl font-bold text-green-400">Burn Submitted</h3>
                                    <p className="text-zinc-500">Sharpening knives...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-2">Your Victim</div>
                                        <div className="text-4xl font-black text-white">{targetPlayer.name}</div>
                                        <div className="text-sm text-zinc-500 italic mt-1">"{targetPersona?.trait}"</div>
                                    </div>

                                    <div className="relative group">
                                        <textarea
                                            value={roast}
                                            onChange={(e) => setRoast(e.target.value)}
                                            placeholder={`Destroy ${targetPlayer.name} here...`}
                                            className="w-full h-64 bg-zinc-900/50 border-2 border-white/10 rounded-[2rem] p-6 text-xl focus:border-orange-500 focus:bg-zinc-900 focus:outline-none transition-all resize-none shadow-inner text-white placeholder:text-zinc-600 leading-relaxed"
                                        />
                                        <div className="absolute bottom-6 right-6 w-12 h-12 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="24" cy="24" r="20" className="stroke-white/10" strokeWidth="4" fill="none" />
                                                <motion.circle cx="24" cy="24" r="20" className={`${roast.length > 100 ? 'stroke-red-500' : 'stroke-orange-500'}`} strokeWidth="4" fill="none" strokeDasharray={125} strokeDashoffset={125 - (Math.min(roast.length, 140) / 140) * 125} strokeLinecap="round" />
                                            </svg>
                                            <span className="absolute text-xs font-bold text-zinc-400">{140 - roast.length}</span>
                                        </div>
                                        <button onClick={useRoastAssist} className="absolute bottom-6 left-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 active:bg-orange-500 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full backdrop-blur-md transition-colors border border-white/10">
                                            <span>🧠</span><span>Assist</span>
                                        </button>
                                    </div>

                                    <button onClick={handleSubmit} disabled={!roast.trim()} className="mt-8 w-full bg-gradient-to-r from-orange-600 to-red-600 py-6 rounded-2xl font-black text-xl uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/20">
                                        Send It 🚀
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}

                    {gameData?.phase === 'READING' && (
                        <motion.div key="reading" className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="flex-1 flex items-center justify-center text-center p-8">
                                <h3 className="text-3xl font-black text-white/20 animate-pulse">WATCH THE BIG SCREEN</h3>
                            </div>
                            <div className="mt-auto">
                                <div className="flex justify-center gap-4 mb-8">
                                    {['🍅', '🌹', '💯'].map((sticker) => (
                                        <button key={sticker} onClick={() => sendSticker(sticker)} className="w-20 h-20 bg-zinc-800 rounded-2xl text-5xl flex items-center justify-center shadow-lg active:scale-75 active:rotate-12 transition-all border-b-4 border-black hover:bg-zinc-700">
                                            {sticker}
                                        </button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-4 gap-3 bg-zinc-900/80 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
                                    {['🔥', '💀', '😭', '🤯'].map((emoji) => (
                                        <button key={emoji} onClick={() => sendReaction(emoji)} className="aspect-square bg-white/5 hover:bg-white/10 rounded-2xl text-3xl transition-all active:scale-90 flex items-center justify-center">
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameData?.phase === 'VOTING' && (
                        <motion.div key="voting" className="flex-1 flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <h2 className="text-center text-2xl font-bold text-white mb-4">Tap to Vote!</h2>
                            <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-20">
                                {roastsToVote.map((roast, idx) => (
                                    <button key={idx} onClick={() => handleVote(idx)} className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-3xl text-left hover:border-orange-500/50 active:bg-orange-600 active:border-orange-500 active:text-white transition-all group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-active:to-orange-500/20 transition-all" />
                                        <div className="relative z-10">
                                            <div className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wide group-active:text-orange-200">Target: {roast.targetName}</div>
                                            <div className="text-xl font-medium leading-normal">"{roast.text}"</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {gameData?.phase === 'WINNER' && (
                        <motion.div key="winner" className="flex-1 flex flex-col items-center justify-center text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="text-8xl mb-6 animate-bounce">👑</div>
                            <h2 className="text-4xl font-black text-white mb-2">All Hail!</h2>
                            <p className="text-xl text-orange-400 font-bold">{gameData.winner?.name}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default RoastMasterPlayer;
