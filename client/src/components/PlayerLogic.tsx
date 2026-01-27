import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import TriviaPlayer from '../games/trivia/Player';
import BuzzPlayer from '../games/buzz/Player';
import { useSound } from '../context/SoundContext';

const AVATARS = ['🙂', '😂', '😎', '🤔', '😍', '🤩', '🤯', '🥳', '👻', '👽', '🤖', '💩', '🐱', '🐶', '🦄', '🐲'];

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
                                className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="text-7xl"
                                >
                                    🎡
                                </motion.div>
                                <p className="text-2xl font-black uppercase tracking-widest text-white/30">
                                    Host is picking a game...
                                </p>
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
                                <h2 className="text-6xl font-black text-game-accent uppercase tracking-tighter italic">FINISH!</h2>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-game-secondary blur-3xl opacity-20 animate-pulse" />
                                    <div className="bg-white/5 p-12 rounded-[4rem] flex flex-col items-center border-4 border-white/10 relative z-10">
                                        <span className="text-xs font-black uppercase text-white/30 tracking-[0.3em] mb-4">Your Final Score</span>
                                        <span className="text-8xl font-black tabular-nums drop-shadow-2xl">{me.score}</span>
                                    </div>
                                </div>
                                <p className="text-white/40 font-medium">Wait for the Host to restart</p>
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
                            onSubmit={(e) => { e.preventDefault(); if(roomCode.length === 4) { playClick(); setJoinStep('DETAILS'); } }}
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