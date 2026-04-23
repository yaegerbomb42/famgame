import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const BluffPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();
    
    const [myClaim, setMyClaim] = useState('');
    const [amLying, setAmLying] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
    const phase = gameState?.phase as string | undefined;
    const { subPhase, subjectId, submissions = {}, round } = gameData;
    const isSubject = socket?.id === subjectId;
    const subjectName = gameState?.players[subjectId || '']?.name || 'Player';
    const mySubmission = submissions[socket?.id || ''];

    // Reset local state on round change
    useEffect(() => {
        setMyClaim('');
        setAmLying(false);
        setHasSubmitted(false);
    }, [round]);

    const handleVote = (vote: boolean) => {
        if (hasSubmitted) return;
        setHasSubmitted(true);
        socket?.emit('gameInput', { vote });
        playClick();
        playSuccess();
    };

    const handleSubmitClaim = () => {
        if (!myClaim.trim()) {
            playError();
            return;
        }
        setHasSubmitted(true);
        socket?.emit('gameInput', { claim: myClaim, isLying: amLying });
        playSuccess();
    };

    if (phase === 'INTRO' || phase === 'COUNTDOWN') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="text-[10rem] animate-pulse">🤥</div>
                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    GET READY!
                </h2>
                <p className="text-2xl text-white/50 font-black uppercase tracking-widest leading-tight">
                    Everyone writes a claim. One gets picked. Everyone votes.
                </p>
            </div>
        );
    }

    if (phase === 'RESULTS') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="text-9xl animate-bounce">🏆</div>
                <h2 className="text-5xl font-black text-yellow-400 uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,0,0.5)]">GAME OVER</h2>
                <p className="text-2xl text-white/50 font-black uppercase tracking-widest">Look at the leaderboard!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center p-6 space-y-8 bg-[#0d0f1a]">
            <AnimatePresence mode="wait">
                {phase === 'PLAYING' && subPhase === 'INPUT' && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="w-full flex-1 flex flex-col space-y-8"
                    >
                        {(hasSubmitted || mySubmission) ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                                <div className="text-[12rem] animate-pulse">✍️</div>
                                <h3 className="text-5xl font-black text-[#00ffff] uppercase italic tracking-tighter">CLAIM RECORDED</h3>
                                <p className="text-2xl text-white/40 font-black uppercase tracking-widest">Waiting for the others to finish their tales...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col space-y-8 pt-4">
                                <h3 className="text-4xl font-black text-center text-[#ff00ff] uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,255,0.7)]">Write Your Claim</h3>
                                <p className="text-white/60 text-center font-bold text-lg">Include your nickname or a fun fact about yourself!</p>
                                
                                <textarea
                                    value={myClaim}
                                    onChange={(e) => setMyClaim(e.target.value)}
                                    placeholder="e.g. My name is Alex and I once ate 50 wings..."
                                    className="w-full h-48 bg-[#1a1f3a] border-4 border-[#ff00ff]/30 rounded-[2.5rem] p-8 text-2xl font-bold focus:outline-none focus:border-[#ff00ff] focus:shadow-[0_0_30px_rgba(255,0,255,0.4)] resize-none text-white placeholder:text-white/20"
                                    maxLength={140}
                                />

                                <div className="grid grid-cols-2 gap-6">
                                    <button
                                        onClick={() => { playClick(); setAmLying(false); }}
                                        className={`py-8 rounded-[2rem] font-black text-2xl transition-all border-4 ${!amLying ? 'bg-[#00ff00] border-[#aaffaa] text-[#0d0f1a] shadow-[0_0_30px_rgba(0,255,0,0.6)]' : 'bg-[#1a1f3a] border-white/10 text-white/60'}`}
                                    >
                                        TRUTH ✅
                                    </button>
                                    <button
                                        onClick={() => { playClick(); setAmLying(true); }}
                                        className={`py-8 rounded-[2rem] font-black text-2xl transition-all border-4 ${amLying ? 'bg-[#ff00ff] border-[#ff00ff] text-white shadow-[0_0_30px_rgba(255,0,255,0.6)]' : 'bg-[#1a1f3a] border-white/10 text-white/60'}`}
                                    >
                                        LIE 🤥
                                    </button>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmitClaim}
                                    disabled={!myClaim.trim() || hasSubmitted}
                                    className="w-full py-10 bg-gradient-to-r from-[#ff00ff] to-[#00ffff] rounded-[2.5rem] font-black text-4xl shadow-[0_0_40px_rgba(255,0,255,0.4)] disabled:opacity-20 uppercase tracking-widest text-[#0d0f1a]"
                                >
                                    SUBMIT CLAIM
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'PLAYING' && subPhase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex-1 flex flex-col space-y-10"
                    >
                        {isSubject ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                                <div className="text-[12rem] animate-bounce">😬</div>
                                <h3 className="text-5xl font-black text-[#00ffff] uppercase italic tracking-tighter">YOU ARE THE SUBJECT!</h3>
                                <p className="text-2xl text-white/50 font-black uppercase tracking-[0.2em]">Try to keep a straight face while they judge you...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col space-y-12">
                                <div className="p-10 glass-panel rounded-[3rem] border-4 border-[#ffff00] shadow-[0_0_20px_rgba(255,255,0,0.2)]">
                                    <h4 className="text-sm uppercase tracking-widest text-white/30 mb-4 font-black">{subjectName}'s Claim:</h4>
                                    <p className="text-3xl font-black text-white italic leading-tight">"{gameData.submissions[subjectId]?.claim}"</p>
                                </div>

                                <div className="flex-1 flex flex-col gap-6 justify-center">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleVote(false)}
                                        disabled={hasSubmitted}
                                        className={`flex-1 flex flex-col items-center justify-center p-8 rounded-[3rem] border-4 ${hasSubmitted && gameData.votes[socket?.id || ''] === false ? 'bg-[#00ff00]/20 border-[#00ff00]' : hasSubmitted ? 'opacity-20 border-white/10' : 'bg-[#1a1f3a] border-[#00ff00] shadow-[0_0_20px_rgba(0,255,0,0.3)]'}`}
                                    >
                                        <div className="text-8xl mb-4">✅</div>
                                        <div className="text-3xl font-black text-[#00ff00] uppercase tracking-widest">TRUTH</div>
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleVote(true)}
                                        disabled={hasSubmitted}
                                        className={`flex-1 flex flex-col items-center justify-center p-8 rounded-[3rem] border-4 ${hasSubmitted && gameData.votes[socket?.id || ''] === true ? 'bg-[#ff00ff]/20 border-[#ff00ff]' : hasSubmitted ? 'opacity-20 border-white/10' : 'bg-[#1a1f3a] border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.3)]'}`}
                                    >
                                        <div className="text-8xl mb-4">🤥</div>
                                        <div className="text-3xl font-black text-[#ff00ff] uppercase tracking-widest">BLUFF</div>
                                    </motion.button>
                                </div>
                                
                                {hasSubmitted && (
                                    <div className="text-center py-4 bg-white/5 rounded-full border border-white/10">
                                        <p className="text-xl font-black uppercase tracking-widest text-[#00ffff] animate-pulse">Vote Locked In</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-10"
                    >
                        <div className="text-[12rem] animate-pulse">📢</div>
                        <h3 className="text-6xl font-black text-[#ffff00] uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,0,0.6)]">REVEAL!</h3>
                        <p className="text-2xl text-white/50 font-black uppercase tracking-[0.3em]">Check the Main Screen!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BluffPlayer;