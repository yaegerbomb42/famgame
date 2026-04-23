import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const TwoTruthsPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();
    
    const [stmts, setStmts] = useState(['', '', '']);
    const [lieIdx, setLieIdx] = useState<number | null>(null);
    const [votedIdx, setVotedIdx] = useState<number | null>(null);

    const { phase, gameData } = (gameState as any) || {};
    const { 
        subPhase, 
        submissions = {}, 
        playerOrder = [], 
        subjectIndex = 0, 
        votes = {} 
    } = gameData || {};

    const myId = socket?.id || '';
    const mySubmission = submissions[myId];
    const subjectId = playerOrder[subjectIndex];
    const isSubject = myId === subjectId;
    const myVote = votes[myId];

    const handleSubmit = () => {
        if (stmts.some(s => !s.trim()) || lieIdx === null) {
            playError();
            return;
        }
        socket?.emit('gameInput', { statements: stmts, lieIndex: lieIdx });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleVote = (idx: number) => {
        if (votedIdx !== null || myVote !== undefined || isSubject) return;
        setVotedIdx(idx);
        socket?.emit('gameInput', { voteIndex: idx });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'RESULTS') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '🤥' : '🕵️‍♂️'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic text-center">
                        {isIntro ? "TWO TRUTHS" : "CASE CLOSED"}
                    </h2>
                    <p className="text-2xl text-[#ff00ff] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "ONE LIE" : "THE TRUTH HURTS"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-6 bg-[#0d0f1a] overflow-hidden">
            <AnimatePresence mode="wait">
                {(phase === 'PLAYING' && subPhase === 'INPUT') && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col space-y-6"
                    >
                        {mySubmission ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[12rem] animate-bounce">🤐</div>
                                <h3 className="text-5xl font-black uppercase tracking-tighter text-[#00ff00] italic">SECRETS LOCKED!</h3>
                                <p className="text-2xl text-white/40 font-black uppercase tracking-widest">Waiting for the other liars...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col space-y-6">
                                <h3 className="text-3xl font-black text-center text-white/40 uppercase tracking-widest">CRAFT YOUR DECEPTION</h3>
                                
                                <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                                    {stmts.map((st, i) => (
                                        <div 
                                            key={i}
                                            className={`p-6 rounded-[3rem] border-4 transition-all duration-300 ${
                                                lieIdx === i 
                                                    ? 'border-[#ff00ff] bg-[#ff00ff]/5 shadow-[0_0_30px_rgba(255,0,255,0.2)]' 
                                                    : 'border-white/5 bg-[#1a1f3a]'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-xs font-black text-white/20 uppercase tracking-[0.3em]">STATEMENT {i + 1}</span>
                                                <button
                                                    onClick={() => { playClick(); setLieIdx(i); }}
                                                    className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border-2 transition-all ${
                                                        lieIdx === i 
                                                            ? 'bg-[#ff00ff] border-[#ff00ff] text-white shadow-lg' 
                                                            : 'bg-transparent border-white/20 text-white/40 hover:border-white/60'
                                                    }`}
                                                >
                                                    {lieIdx === i ? 'THE LIE 🤥' : 'MARK AS LIE'}
                                                </button>
                                            </div>
                                            <textarea
                                                value={st}
                                                onChange={(e) => {
                                                    const next = [...stmts];
                                                    next[i] = e.target.value;
                                                    setStmts(next);
                                                }}
                                                placeholder="WRITE SOMETHING..."
                                                className="w-full bg-transparent text-2xl font-black text-white focus:outline-none resize-none placeholder:text-white/5 uppercase italic"
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmit}
                                    disabled={stmts.some(s => !s.trim()) || lieIdx === null}
                                    className="w-full bg-gradient-to-r from-[#ff00ff] to-[#ffaa00] text-white py-8 rounded-[2.5rem] font-black text-3xl uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(255,0,255,0.3)] border-4 border-white/20 disabled:opacity-20"
                                >
                                    LOCK 'EM IN
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}

                {subPhase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col space-y-8"
                    >
                        {isSubject ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                                <motion.div 
                                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="text-[15rem]"
                                >
                                    😰
                                </motion.div>
                                <div className="space-y-4">
                                    <h3 className="text-5xl font-black uppercase tracking-tighter text-[#ffff00] italic">UNDER OATH!</h3>
                                    <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose">Everyone is trying to spot your lie. STAY COOL.</p>
                                </div>
                            </div>
                        ) : (votedIdx !== null || myVote !== undefined) ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[12rem] animate-pulse">🕵️‍♂️</div>
                                <h3 className="text-5xl font-black uppercase tracking-tighter text-[#00ffff] italic">JUDGMENT CAST!</h3>
                                <p className="text-2xl text-white/40 font-black uppercase tracking-widest">Waiting for the reveal...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col justify-center space-y-12">
                                <div className="text-center space-y-2">
                                    <span className="text-xl font-black text-white/20 uppercase tracking-[0.4em]">WHICH ONE IS THE</span>
                                    <h2 className="text-7xl font-black text-[#ff00ff] uppercase italic tracking-tighter italic">LIE?</h2>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    {[0, 1, 2].map((i) => (
                                        <motion.button
                                            key={i}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleVote(i)}
                                            className="aspect-square bg-[#1a1f3a] rounded-[3rem] border-8 border-white/10 flex items-center justify-center text-8xl font-black text-white hover:border-[#ff00ff] hover:bg-[#ff00ff]/10 transition-all shadow-2xl"
                                        >
                                            {i + 1}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="text-center">
                                    <p className="text-xl font-black text-white/20 uppercase tracking-widest animate-pulse">REFER TO THE BIG SCREEN FOR THE STATEMENTS</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'REVEAL' && (
                    <motion.div
                        key="reveal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-12"
                    >
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="text-[12rem]"
                        >
                            🎭
                        </motion.div>
                        <h3 className="text-6xl font-black text-[#ff00ff] uppercase tracking-tighter italic drop-shadow-[0_0_30px_rgba(255,0,255,0.5)]">DID THEY LIE?</h3>
                        <p className="text-2xl text-white/40 font-black uppercase tracking-widest">The truth is coming out on the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TwoTruthsPlayer;