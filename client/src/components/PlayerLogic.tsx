import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import TriviaPlayer from '../games/trivia/Player';
import BuzzPlayer from '../games/buzz/Player';
import RoastMasterPlayer from '../games/roast-master/Player';
import { useSound } from '../context/SoundContext';

const AVATARS = ['🙂', '😂', '😎', '🤔', '😍', '🤩', '🤯', '🥳', '👻', '👽', '🤖', '💩', '🐱', '🐶', '🦄', '🐲'];
/* const GAMES = [
    { id: 'TRIVIA', name: 'Trivia', icon: '🧠' },
    { id: '2TRUTHS', name: '2 Truths', icon: '🤥' },
    { id: 'HOT_TAKES', name: 'Hot Takes', icon: '🔥' },
    { id: 'POLL', name: 'Poll Party', icon: '📊' },
    { id: 'BUZZ_IN', name: 'Buzz In', icon: '🔔' },
    { id: 'WORD_RACE', name: 'Word Race', icon: '⌨️' },
    { id: 'REACTION', name: 'Reaction', icon: '⚡' },
    { id: 'EMOJI_STORY', name: 'Emoji Story', icon: '📖' },
    { id: 'BLUFF', name: 'Bluff', icon: '🎭' },
    { id: 'THIS_OR_THAT', name: 'This or That', icon: '⚖️' },
    { id: 'SPEED_DRAW', name: 'Speed Draw', icon: '🎨' },
    { id: 'CHAIN_REACTION', name: 'Chain Reaction', icon: '⛓️' },
    { id: 'MIND_MELD', name: 'Mind Meld', icon: '🧠' },
    { id: 'COMPETE', name: 'Compete', icon: '⚔️' },
    { id: 'ROAST_MASTER', name: 'Roast Master', icon: '🔥' },
]; */

const PlayerLogic = () => {
    const { gameState, isConnected, socket, joinRoom, initSocket } = useGameStore();
    const { playClick, playSuccess, playError } = useSound();

    const [joinStep, setJoinStep] = useState<'CODE' | 'DETAILS'>('CODE');
    const [roomCode, setRoomCode] = useState('');
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('🙂');
    const [hasJoined, setHasJoined] = useState(false);

    const autoFillAttempted = useRef(false);

    useEffect(() => {
        initSocket();
    }, [initSocket]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code && code.length === 4 && !autoFillAttempted.current) {
            autoFillAttempted.current = true;
            setTimeout(() => {
                setRoomCode(code.toUpperCase());
                setJoinStep('DETAILS');
            }, 0);
        }
    }, []);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            playError();
            return;
        }
        joinRoom(name, roomCode.toUpperCase(), avatar);
        setHasJoined(true);
        playSuccess();
    };

    if (!isConnected) {
        return (
            <div className="fixed inset-0 bg-game-bg flex flex-col items-center justify-center p-8 text-center space-y-6">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl"
                >
                    📡
                </motion.div>
                <p className="text-xl font-black tracking-[0.3em] text-game-secondary animate-pulse">CONNECTING TO FAM...</p>
            </div>
        )
    }

    if (hasJoined && gameState) {
        const me = gameState.players[socket?.id || ''];
        if (!me) return (
            <div className="fixed inset-0 bg-game-bg flex items-center justify-center">
                <p className="text-white/20 font-black text-2xl animate-pulse uppercase tracking-widest">Joining room...</p>
            </div>
        );

        return (
            <div className="fixed inset-0 bg-game-bg flex flex-col overflow-hidden font-sans">
                {/* Mobile Header */}
                <header className="p-4 flex justify-between items-center bg-white/5 border-b border-white/10 z-50">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl transform -rotate-12">{me.avatar}</div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Player</span>
                            <span className="font-black text-xl leading-none truncate max-w-[150px]">{me.name}</span>
                        </div>
                    </div>
                    <div className="bg-game-secondary/10 px-5 py-2 rounded-full border border-game-secondary/30">
                        <span className="text-game-secondary font-black text-xl tabular-nums">{me.score}</span>
                    </div>
                </header>

                <main className="flex-1 relative p-6 flex flex-col overflow-hidden">
                    <AnimatePresence mode='wait'>
                        {gameState.status === 'LOBBY' && (
                            <motion.div
                                key="lobby"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="flex-1 flex flex-col items-center justify-center space-y-8 text-center"
                            >
                                <div className="text-[8rem] animate-bounce-slow">👀</div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter">
                                    You're <span className="text-game-primary">IN!</span>
                                </h2>
                                <p className="text-white/40 text-lg font-medium max-w-[280px]">
                                    Look at the <span className="text-white">Big Screen</span>. Your journey begins shortly.
                                </p>
                            </motion.div>
                        )}

                        {gameState.status === 'GAME_SELECT' && (
                            <motion.div
                                key="select"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-8"
                            >
                                <div className="text-8xl animate-pulse grayscale opacity-50">🎙️</div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-game-secondary mb-2">Social Hub</h2>
                                    <p className="text-white/40 text-lg font-medium">
                                        Voice channels are open. <br />
                                        <span className="text-white/60">Chat with the room!</span>
                                    </p>
                                </div>

                                <div className="w-full max-w-xs bg-white/5 rounded-2xl p-6 border border-white/10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                        <span className="text-xs font-black uppercase tracking-widest text-white/40">Status</span>
                                    </div>
                                    <div className="text-left space-y-2">
                                        <p className="text-white font-bold">Connected to Room</p>
                                        <p className="text-white/40 text-sm">Waiting for games to be installed...</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {gameState.status === 'PLAYING' && (
                            <motion.div
                                key="playing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col h-full"
                            >
                                {gameState.currentGame === 'TRIVIA' && (
                                    <TriviaPlayer />
                                )}
                                {gameState.currentGame === 'BUZZ_IN' && (
                                    <BuzzPlayer />
                                )}
                                {gameState.currentGame === 'ROAST_MASTER' && (
                                    <RoastMasterPlayer />
                                )}

                                {!['TRIVIA', 'BUZZ_IN'].includes(gameState.currentGame || '') && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="text-6xl grayscale opacity-50">🕹️</div>
                                        <h3 className="text-2xl font-black uppercase tracking-widest">{gameState.currentGame?.replace('_', ' ')}</h3>
                                        <p className="text-white/20 italic">Eyes on the TV!</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {gameState.status === 'RESULTS' && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-game-primary/20 via-transparent to-game-secondary/20 pointer-events-none" />
                                <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 uppercase tracking-tighter italic drop-shadow-glow">FINISH!</h2>
                                <div className="relative group">
                                    <div className="absolute inset-x-0 -inset-y-4 bg-gradient-to-r from-game-primary to-game-secondary blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                                    <div className="bg-white/10 backdrop-blur-3xl p-12 rounded-[5rem] flex flex-col items-center border-[6px] border-white/20 relative z-10 shadow-2xl">
                                        <span className="text-xs font-black uppercase text-white/40 tracking-[0.4em] mb-4">Total Score</span>
                                        <motion.span
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            className="text-9xl font-black tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] text-white"
                                        >
                                            {me.score.toLocaleString()}
                                        </motion.span>
                                    </div>
                                </div>
                                <p className="text-white/50 font-black uppercase tracking-widest animate-pulse">Wait for the Host to go again</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        )
    }

    // Join Screen
    return (
        <div className="fixed inset-0 bg-game-bg flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-md space-y-12 py-12">
                <header className="text-center space-y-2">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-game-secondary to-blue-500"
                    >
                        JOIN
                    </motion.h1>
                    <p className="text-white/30 font-black tracking-[0.4em] text-xs uppercase">
                        {joinStep === 'CODE' ? 'Enter Room Code' : 'Pick Your Legend'}
                    </p>
                </header>

                <AnimatePresence mode="wait">
                    {joinStep === 'CODE' ? (
                        <motion.form
                            key="code-form"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            onSubmit={(e) => { e.preventDefault(); if (roomCode.length === 4) { playClick(); setJoinStep('DETAILS'); } }}
                            className="space-y-8"
                        >
                            <input
                                type="text"
                                placeholder="----"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full bg-white/5 border-4 border-white/10 rounded-[2.5rem] px-4 py-12 text-center text-8xl font-black uppercase tracking-[0.3em] focus:outline-none focus:border-game-secondary shadow-2xl transition-all placeholder:text-white/5"
                                maxLength={4}
                                autoFocus
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={roomCode.length !== 4}
                                className="w-full bg-game-secondary text-game-bg font-black text-4xl py-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,255,255,0.3)] disabled:opacity-20 transition-all uppercase tracking-widest"
                            >
                                Next ➔
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="details-form"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            onSubmit={handleJoin}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-4 gap-3 bg-white/5 p-4 rounded-[2.5rem] border-2 border-white/10">
                                {AVATARS.map((a) => (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => { playClick(); setAvatar(a); }}
                                        className={`text-4xl p-3 rounded-2xl transition-all duration-200 transform ${avatar === a
                                            ? 'bg-game-primary scale-110 shadow-[0_0_30px_rgba(255,0,255,0.5)] rotate-6'
                                            : 'hover:bg-white/10 grayscale opacity-40 hover:grayscale-0'
                                            }`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                placeholder="YOUR NAME"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border-4 border-white/10 rounded-[2.5rem] px-8 py-8 text-center text-4xl font-black uppercase focus:outline-none focus:border-game-primary shadow-2xl transition-all text-white placeholder:text-white/5 tracking-tight"
                                maxLength={10}
                                autoFocus
                            />

                            <div className="flex flex-col gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!name.trim()}
                                    className="w-full bg-game-primary text-white font-black text-4xl py-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,0,255,0.3)] disabled:opacity-20 transition-all uppercase tracking-widest"
                                >
                                    Jump In! 🎮
                                </motion.button>
                                <button
                                    type="button"
                                    onClick={() => { playClick(); setJoinStep('CODE'); }}
                                    className="w-full py-4 text-xl font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PlayerLogic;