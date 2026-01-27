import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const BluffPlayer = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();
    
    const [myClaim, setMyClaim] = useState('');
    const [amLying, setAmLying] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [votedLying, setVotedLying] = useState<boolean | null>(null);

    const phase = gameState?.gameData?.phase || 'CLAIM';
    const isMyTurn = socket?.id === gameState?.gameData?.currentClaimerId;
    const claim = gameState?.gameData?.claim || '';
    const claimerName = gameState?.players[gameState?.gameData?.currentClaimerId || '']?.name || 'Player';

    const handleVote = (lying: boolean) => {
        if (hasVoted) return;
        setHasVoted(true);
        setVotedLying(lying);
        socket?.emit('voteBluff', lying);
        playClick();
        playSuccess();
    };

    const handleSubmitClaim = () => {
        if (!myClaim.trim()) {
            playError();
            return;
        }
        socket?.emit('submitClaim', { claim: myClaim, isLying: amLying });
        playSuccess();
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <AnimatePresence mode="wait">
                {phase === 'CLAIM' && (
                    <motion.div
                        key="claim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col p-4 space-y-6"
                    >
                        {isMyTurn ? (
                            <div className="flex-1 flex flex-col space-y-6">
                                <h3 className="text-3xl font-black text-center uppercase tracking-tighter text-game-primary italic">Make Your Move</h3>
                                <textarea
                                    value={myClaim}
                                    onChange={(e) => setMyClaim(e.target.value)}
                                    placeholder="TELL A TRUTH... OR A LIE..."
                                    className="w-full flex-1 bg-white/5 border-4 border-white/10 rounded-[2.5rem] p-8 text-3xl font-black focus:outline-none focus:border-game-primary resize-none placeholder:text-white/5 uppercase"
                                    maxLength={100}
                                    autoFocus
                                />

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { playClick(); setAmLying(false); }}
                                        className={`flex-1 py-6 rounded-2xl font-black text-lg transition-all border-4 ${!amLying ? 'bg-game-secondary border-white text-game-bg shadow-lg' : 'bg-white/5 border-white/10 opacity-40'}`}
                                    >
                                        ✅ TRUTH
                                    </button>
                                    <button
                                        onClick={() => { playClick(); setAmLying(true); }}
                                        className={`flex-1 py-6 rounded-2xl font-black text-lg transition-all border-4 ${amLying ? 'bg-red-500 border-white text-white shadow-lg' : 'bg-white/5 border-white/10 opacity-40'}`}
                                    >
                                        🤥 BLUFF
                                    </button>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmitClaim}
                                    disabled={!myClaim.trim()}
                                    className="w-full py-8 bg-game-primary rounded-[2rem] font-black text-3xl shadow-2xl disabled:opacity-20 transition-all uppercase tracking-widest border-t-4 border-white/20"
                                >
                                    DROP IT! ➔
                                </motion.button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-spin-slow">⏳</div>
                                <h3 className="text-4xl font-black uppercase tracking-tighter italic">{claimerName}</h3>
                                <p className="text-white/40 text-xl font-black uppercase tracking-[0.3em] animate-pulse">Is thinking of a story...</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {phase === 'VOTING' && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col p-4 space-y-8"
                    >
                        {isMyTurn ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem] animate-pulse">😏</div>
                                <h3 className="text-5xl font-black text-game-primary uppercase tracking-tighter italic">STAY COOL!</h3>
                                <p className="text-white/40 text-xl font-bold uppercase tracking-widest">They are judging you...</p>
                            </div>
                        ) : hasVoted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <div className="text-[10rem]">{votedLying ? '🤥' : '✅'}</div>
                                <h3 className="text-5xl font-black uppercase tracking-tighter italic">VOTE LOCKED!</h3>
                                <p className="text-white/40 text-xl font-bold uppercase tracking-widest">You think it's a {votedLying ? 'BLUFF' : 'TRUTH'}</p>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col">
                                <div className="text-center mb-6 space-y-2">
                                    <span className="text-xs uppercase tracking-[0.4em] font-black text-white/20">{claimerName}'s Claim</span>
                                    <div className="p-8 bg-white/5 rounded-[2.5rem] border-4 border-white/10 italic">
                                        <p className="text-2xl font-black uppercase leading-tight italic">"{claim}"</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 flex-1 justify-center">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleVote(false)}
                                        className="flex-1 bg-game-secondary/10 border-4 border-game-secondary rounded-[2.5rem] flex flex-col items-center justify-center gap-2 group"
                                    >
                                        <span className="text-8xl group-active:scale-125 transition-transform">✅</span>
                                        <span className="text-3xl font-black text-game-secondary uppercase tracking-widest italic">TRUTH</span>
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleVote(true)}
                                        className="flex-1 bg-red-500/10 border-4 border-red-500 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 group"
                                    >
                                        <span className="text-8xl group-active:scale-125 transition-transform">🤥</span>
                                        <span className="text-3xl font-black text-red-500 uppercase tracking-widest italic">BLUFF</span>
                                    </motion.button>
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
                        className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="text-[12rem] animate-bounce">🤭</div>
                        <h3 className="text-5xl font-black text-game-accent uppercase tracking-tighter italic">MOMENT OF TRUTH!</h3>
                        <p className="text-white/30 text-xl font-bold uppercase tracking-widest">Look at the TV!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BluffPlayer;