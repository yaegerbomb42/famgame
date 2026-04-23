import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const RoastMasterPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playSuccess, playError } = useSound();
    
    const [roastText, setRoastText] = useState('');
    const [votedIdx, setVotedIdx] = useState<number | null>(null);

    const { phase, gameData } = (gameState as any) || {};
    const { 
        subPhase, 
        assignments = {}, 
        roasts = []
    } = gameData || {};

    const myId = socket?.id || '';
    const myAssignment = assignments[myId];
    const targetName = myAssignment?.targetName || "???";
    const hasSubmitted = !!(myAssignment?.roast);

    const handleRoastSubmit = () => {
        if (!roastText.trim()) {
            playError();
            return;
        }
        socket?.emit('gameInput', { roast: roastText });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleVote = (idx: number) => {
        if (votedIdx !== null) return;
        setVotedIdx(idx);
        socket?.emit('gameInput', { voteIdx: idx });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const sendReaction = (emoji: string) => {
        socket?.emit('gameInput', { reaction: emoji });
        if (navigator.vibrate) navigator.vibrate(30);
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-gradient-to-b from-[#0d0f1a] to-[#1a1f3a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '🔥' : '👑'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic text-center">
                        {isIntro ? "ROAST MASTER" : "THE CHAMPION"}
                    </h2>
                    <p className="text-2xl text-[#ffaa00] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "READY THE BURN" : "SMOKE HAS CLEARED"}
                    </p>
                </div>
                <div className="w-full h-px bg-white/10" />
            </div>
        );
    }

    if (phase === 'REVEAL') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-10">
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-[12rem]">🎤</motion.div>
                <div className="space-y-4">
                    <h3 className="text-6xl font-black uppercase tracking-tighter text-[#ffaa00] italic">ROAST SESSION!</h3>
                    <p className="text-2xl text-white/30 font-black uppercase tracking-[0.4em] animate-pulse">Watch the big screen!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#0d0f1a]">
            <AnimatePresence mode="wait">
                {subPhase === 'WRITING' && (
                    <motion.div
                        key="writing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col space-y-8"
                    >
                        {hasSubmitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-bounce">📜</div>
                                <h3 className="text-6xl font-black uppercase tracking-tighter text-[#00ff00] italic">ROAST SEALED!</h3>
                                <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose text-center">Waiting for the other chefs to finish cooking...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-full p-8 glass-panel border-4 border-[#ffaa00] rounded-[3rem] shadow-[0_0_30px_rgba(255,170,0,0.2)] bg-white/5 backdrop-blur-3xl text-center">
                                    <span className="text-xl font-black uppercase text-white/30 tracking-[0.4em] mb-2 block">YOUR TARGET:</span>
                                    <h3 className="text-5xl font-black text-white uppercase italic tracking-tight">
                                        {targetName}
                                    </h3>
                                    <p className="text-[#ffaa00] text-sm font-black uppercase mt-2">"{myAssignment?.trait || "Just roast them."}"</p>
                                </div>

                                <textarea
                                    value={roastText}
                                    onChange={(e) => setRoastText(e.target.value)}
                                    placeholder="INCINERATE THEM HERE..."
                                    className="flex-1 w-full bg-[#1a1f3a] border-8 border-white/5 rounded-[4rem] p-10 text-3xl font-black text-white placeholder:text-white/10 focus:outline-none focus:border-[#ffaa00]/50 transition-all shadow-inner uppercase italic resize-none"
                                />

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleRoastSubmit}
                                    disabled={!roastText.trim()}
                                    className="w-full bg-gradient-to-r from-[#ffaa00] to-[#ff0000] text-[#0d0f1a] py-10 rounded-[3rem] font-black text-4xl uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(255,170,0,0.4)] border-4 border-white/20 disabled:opacity-30 transition-all"
                                >
                                    SERVE THE BURN
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                )}

                {subPhase === 'READING' && (
                    <motion.div
                        key="reading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col space-y-8"
                    >
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="text-[12rem] drop-shadow-2xl"
                            >
                                🎤
                            </motion.div>
                            <h3 className="text-5xl font-black text-[#ffaa00] uppercase tracking-tighter italic">WATCH THE BIG SCREEN</h3>
                            <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose">The roasts are being delivered!</p>
                        </div>

                        {/* REACTION BOARD */}
                        <div className="grid grid-cols-4 gap-4 pb-8">
                            {['🔥', '💀', '😭', '🤯', '🍅', '🌹', '💯', '😂'].map((emoji) => (
                                <motion.button
                                    key={emoji}
                                    whileTap={{ scale: 0.8 }}
                                    onClick={() => sendReaction(emoji)}
                                    className="aspect-square bg-white/5 border-2 border-white/10 rounded-3xl text-4xl flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {subPhase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col space-y-8"
                    >
                        <h2 className="text-center text-4xl font-black text-[#ffff00] mb-4 uppercase italic">PICK THE SICKEST BURN!</h2>
                        
                        <div className="flex-1 overflow-y-auto space-y-6 pb-24 scrollbar-hide">
                            {roasts.map((r: any, idx: number) => {
                                if (r.authorId === myId) return null; // Can't vote for self
                                return (
                                    <motion.button
                                        key={idx}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleVote(idx)}
                                        disabled={votedIdx !== null}
                                        className={`w-full p-8 rounded-[3rem] border-4 text-left transition-all ${
                                            votedIdx === idx 
                                                ? 'bg-[#ffff00]/10 border-[#ffff00] shadow-[0_0_30px_rgba(255,255,0,0.3)]' 
                                                : 'bg-white/5 border-white/10'
                                        }`}
                                    >
                                        <div className="text-sm font-black text-[#ffaa00] uppercase tracking-widest mb-2">TARGET: {r.targetName || '???'}</div>
                                        <div className="text-2xl font-black text-white italic leading-tight">"{r.text}"</div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoastMasterPlayer;