import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';

const EMOJI_OPTIONS = ['😀', '😢', '😱', '🤔', '❤️', '💔', '🎉', '🔥', '💀', '👻', '🌟', '🌈', '🏠', '🚗', '✈️', '🎸', '📱', '💰', '🎁', '🍕', '🐕', '🐈', '🌳', '⛈️', '☀️', '🌙', '💪', '🏃', '💤', '🎮'];

const EmojiStoryPlayer: React.FC = () => {
    const { socket, gameState } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();
    
    const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);

    const { phase, gameData } = (gameState as any) || {};
    const { 
        submissions = {}, 
        votes = {}, 
        subPhase, 
        prompt: sharedPrompt,
        aiWinner
    } = gameData || {};

    const myPrompt = sharedPrompt || "TELL A TALE!";
    const hasSubmitted = !!submissions[socket?.id || ''];
    const hasVoted = !!votes[socket?.id || ''];
    const isAiWinner = aiWinner?.winnerId === socket?.id;

    React.useEffect(() => {
        if (phase !== 'PLAYING') {
            setSelectedEmojis([]);
        }
    }, [phase]);

    const addEmoji = (emoji: string) => {
        if (selectedEmojis.length < 5) {
            setSelectedEmojis([...selectedEmojis, emoji]);
            playClick();
        } else {
            playError();
        }
    };

    const removeLastEmoji = () => {
        setSelectedEmojis(selectedEmojis.slice(0, -1));
        playClick();
    };

    const handleSubmitStory = () => {
        if (selectedEmojis.length === 0) return;
        socket?.emit('gameInput', { emoji: selectedEmojis.join('') });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const handleVote = (targetId: string) => {
        if (targetId === socket?.id) {
            playError();
            return;
        }
        socket?.emit('gameInput', { vote: targetId });
        playSuccess();
        if (navigator.vibrate) navigator.vibrate(50);
    };

    if (phase === 'INTRO' || phase === 'RESULTS' || phase === 'COUNTDOWN') {
        const isIntro = phase === 'INTRO';
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem] animate-pulse">{isIntro ? '📖' : '📜'}</div>
                <div className="text-center space-y-4">
                    <h2 className="text-7xl font-black text-white uppercase italic tracking-tighter italic">
                        {isIntro ? "STORYTIME" : "TALE ENDED"}
                    </h2>
                    <p className="text-2xl text-[#ff00ff] font-black uppercase tracking-widest animate-pulse">
                        {isIntro ? "EMOJI MAGIC" : "FINAL REVEAL"}
                    </p>
                </div>
            </div>
        );
    }

    if (phase === 'REVEAL') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12 bg-[#0d0f1a]">
                <div className="text-[12rem]">{isAiWinner ? '🏆' : '🏁'}</div>
                <div className="text-center space-y-4">
                    <h2 className={`text-7xl font-black uppercase italic tracking-tighter ${isAiWinner ? 'text-[#ffff00]' : 'text-[#00ffff]'}`}>
                        {isAiWinner ? "AI PICKED YOU!" : "ROUND OVER"}
                    </h2>
                    <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose">
                        Check the big screen for the verdict
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6 space-y-8 bg-[#0d0f1a]">
            <AnimatePresence mode="wait">
                {(phase === 'PLAYING' && subPhase === 'INPUT') && (
                    <motion.div
                        key="submitting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col space-y-10"
                    >
                        {hasSubmitted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="text-[12rem]">✍️</motion.div>
                                <h3 className="text-6xl font-black uppercase tracking-tighter text-[#00ffff] italic">STORY PUBLISHED!</h3>
                                <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose">Waiting for other authors...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-10">
                                <div className="text-center space-y-4 w-full">
                                    <span className="text-xl font-black uppercase tracking-[0.4em] text-white/30">YOUR PROMPT:</span>
                                    <div className="p-8 glass-panel border-4 border-[#ffff00] rounded-[3rem] shadow-[0_0_30px_rgba(255,255,0,0.3)] bg-white/5 backdrop-blur-3xl transform -rotate-1">
                                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">{myPrompt}</h3>
                                    </div>
                                </div>

                                <div className="w-full p-8 glass-panel border-4 border-[#00ffff] rounded-[3rem] shadow-[0_0_40px_rgba(0,255,255,0.2)] bg-white/5 backdrop-blur-3xl min-h-[140px] flex items-center justify-center">
                                    <span className="text-8xl tracking-[0.3em] drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                                        {selectedEmojis.join('') || '...'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-5 gap-4 bg-white/5 p-6 rounded-[3.5rem] border-4 border-white/5 w-full">
                                    {EMOJI_OPTIONS.map((emoji) => (
                                        <motion.button
                                            key={emoji}
                                            whileTap={{ scale: 0.8 }}
                                            onClick={() => addEmoji(emoji)}
                                            className="text-5xl p-4 hover:bg-white/10 rounded-[2rem] transition-all bg-[#1a1f3a] border-2 border-white/5 shadow-lg active:border-[#00ffff]"
                                        >
                                            {emoji}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="flex gap-6 w-full h-24">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={removeLastEmoji}
                                        className="w-32 bg-[#1a1f3a] border-4 border-[#ff00ff] rounded-[2.5rem] font-black text-4xl text-[#ff00ff] shadow-lg active:shadow-[#ff00ff]/40 transition-all flex items-center justify-center p-6"
                                    >
                                        ⌫
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubmitStory}
                                        disabled={selectedEmojis.length === 0}
                                        className="flex-1 bg-gradient-to-r from-[#00ffff] to-[#00ff00] text-[#0d0f1a] rounded-[2.5rem] font-black text-3xl uppercase tracking-widest shadow-[0_0_40px_rgba(0,255,0,0.4)] border-4 border-white/20 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center p-6"
                                    >
                                        SUBMIT STORY
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {(phase === 'PLAYING' && subPhase === 'VOTE') && (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col space-y-10"
                    >
                        {hasVoted ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-[12rem]">🗳️</motion.div>
                                <h3 className="text-6xl font-black uppercase tracking-tighter text-[#ffff00] italic">VOTE CAST!</h3>
                                <p className="text-2xl text-white/40 font-black uppercase tracking-widest leading-loose">Waiting for final rankings...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center w-full space-y-10">
                                <div className="text-center space-y-4">
                                    <span className="text-xl font-black uppercase tracking-[0.4em] text-white/30">PICK THE BEST TALE:</span>
                                    <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">WHO NAILED IT?</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-6 w-full max-h-[60vh] overflow-y-auto scrollbar-hide px-4">
                                    {Object.entries(submissions).map(([pid, emojis]: [string, any]) => (
                                        <motion.button
                                            key={pid}
                                            whileTap={{ scale: pid === socket?.id ? 1 : 0.97 }}
                                            onClick={() => handleVote(pid)}
                                            disabled={pid === socket?.id}
                                            className={`p-10 glass-panel border-4 rounded-[3.5rem] transition-all flex flex-col items-center justify-center space-y-6 relative group ${pid === socket?.id ? 'border-white/5 opacity-50 grayscale' : 'border-white/10 hover:border-[#ff00ff]/50 bg-white/5 active:bg-[#ff00ff]/10 shadow-2xl'}`}
                                        >
                                            <div className="text-9xl group-active:scale-95 transition-transform">{emojis}</div>
                                            {pid === socket?.id && (
                                                <span className="absolute inset-0 flex items-center justify-center bg-[#0d0f1a]/80 font-black text-white/30 uppercase tracking-[0.5em] rounded-[3rem]">OUR TALE</span>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmojiStoryPlayer;