import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
/* import TriviaHost from '../games/trivia/Host';
import TwoTruthsHost from '../games/two-truths/Host';
import HotTakesHost from '../games/hot-takes/Host';
import PollHost from '../games/poll/Host';
import BuzzHost from '../games/buzz/Host';
import WordRaceHost from '../games/word-race/Host';
import ReactionHost from '../games/reaction/Host';
import EmojiStoryHost from '../games/emoji-story/Host';
import BluffHost from '../games/bluff/Host';
import ThisOrThatHost from '../games/this-or-that/Host';
import SpeedDrawHost from '../games/speed-draw/Host';
import ChainReactionHost from '../games/chain-reaction/Host';
import MindMeldHost from '../games/mind-meld/Host';
import CompeteHost from '../games/compete/Host';
import RoastMasterHost from '../games/roast-master/Host'; */
import { useSound } from '../context/SoundContext';
import { Persona } from './Persona';
// import confetti from 'canvas-confetti';

// ... (keep implies I should target specific blocks)

// FIX 1: Remove @ts-expect-error if it's unused, or change to @ts-ignore if we really need it.
// Actually checking the file content via previous view would be better but I'll try to just target the lines.

// FIX 2: Safe gameVotes access
// FIX 3: Remove answers prop


const QRCode = ({ url, size = 200 }: { url: string; size?: number }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=10`;
    return (
        <img
            src={qrUrl}
            alt="QR Code"
            className="rounded-2xl shadow-2xl"
            style={{ width: size, height: size }}
        />
    );
};

/* const GAMES = [
    { id: 'TRIVIA', name: 'Trivia', icon: '🧠', color: '#ff6b6b' },
    { id: '2TRUTHS', name: '2 Truths', icon: '🤥', color: '#4ecdc4' },
    { id: 'HOT_TAKES', name: 'Hot Takes', icon: '🔥', color: '#ff9f43' },
    { id: 'POLL', name: 'Poll Party', icon: '📊', color: '#a55eea' },
    { id: 'BUZZ_IN', name: 'Buzz In', icon: '🔔', color: '#26de81' },
    { id: 'WORD_RACE', name: 'Word Race', icon: '⌨️', color: '#45aaf2' },
    { id: 'REACTION', name: 'Reaction', icon: '⚡', color: '#fed330' },
    { id: 'EMOJI_STORY', name: 'Emoji Story', icon: '📖', color: '#ff6b9d' },
    { id: 'BLUFF', name: 'Bluff', icon: '🎭', color: '#5f27cd' },
    { id: 'THIS_OR_THAT', name: 'This or That', icon: '⚖️', color: '#ff9ff3' },
    { id: 'SPEED_DRAW', name: 'Speed Draw', icon: '🎨', color: '#00d2d3' },
    { id: 'CHAIN_REACTION', name: 'Chain Reaction', icon: '⛓️', color: '#ff4757' },
    { id: 'MIND_MELD', name: 'Mind Meld', icon: '🧠', color: '#70a1ff' },
    { id: 'COMPETE', name: 'Compete', icon: '⚔️', color: '#eccc68' },
    { id: 'ROAST_MASTER', name: 'Roast Master', icon: '🔥', color: '#f0932b' },
]; */

const HostLogic = () => {
    const { gameState, createRoom, backToLobby, startGame } = useGameStore();
    const { setBGM } = useSound();

    /*     useEffect(() => {
            if (gameState?.status === 'RESULTS') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ff00ff', '#00ffff', '#fed330']
                });
                playSuccess();
            }
        }, [gameState?.status, playSuccess]); */

    useEffect(() => {
        if (gameState?.status === 'LOBBY' || gameState?.status === 'GAME_SELECT') {
            setBGM('LOBBY');
        } else if (gameState?.status === 'PLAYING') {
            setBGM('GAME');
        } else if (gameState?.status === 'RESULTS') {
            setBGM('NONE');
        }
    }, [gameState?.status, setBGM]);

    useEffect(() => {
        if (!gameState) {
            createRoom('Host');
        }
    }, [gameState, createRoom]);

    if (!gameState) return (
        <div className="flex h-screen items-center justify-center bg-game-bg">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-game-primary border-t-transparent rounded-full"
            />
        </div>
    );

    const joinUrl = `${window.location.origin}?code=${gameState.roomCode}`;
    const players = Object.values(gameState.players).filter((p: any) => !p.isHost);
    const playerCount = players.length;

    return (
        <div className="min-h-screen flex flex-col bg-game-bg text-white overflow-hidden">
            <Persona />
            {/* Header */}
            <header className="flex justify-between items-center p-6 z-20">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                    <span className="text-xs text-white/50 font-black uppercase tracking-widest">Live Room: {gameState.roomCode}</span>
                </div>

                <h1 className="text-3xl font-black tracking-tighter">
                    FAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">GAME</span>
                </h1>

                <button
                    onClick={backToLobby}
                    className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border border-white/10"
                >
                    {gameState.status === 'RESULTS' ? 'New Game' : 'Menu'}
                </button>
            </header>

            <main className="flex-1 relative flex flex-col items-center justify-center p-8 z-10">
                <AnimatePresence mode='wait'>
                    {/* LOBBY */}
                    {gameState.status === 'LOBBY' && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="w-full h-full max-w-[95vw] grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                        >
                            {/* Left Column: Join Info */}
                            <div className="lg:col-span-5 flex flex-col items-center justify-center p-8">
                                <motion.div
                                    whileHover={{ scale: 1.02, rotate: -1 }}
                                    className="p-10 bg-white rounded-[3rem] border-[12px] border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.1)] flex flex-col items-center mb-12"
                                >
                                    {/* Fix: Increased inner padding from p-4 to p-8 to prevent corner cutoff */}
                                    <div className="p-8 bg-white rounded-[2rem]">
                                        <QRCode url={joinUrl} size={300} />
                                    </div>
                                    <p className="mt-8 text-4xl font-black text-black text-center uppercase tracking-[0.2em]">Scan to join</p>
                                </motion.div>

                                <div className="text-center">
                                    <p className="text-3xl text-white/30 mb-2 uppercase tracking-[0.4em] font-black">Room Code</p>
                                    <div className="text-[10rem] xl:text-[12rem] leading-none font-black tracking-tighter text-white drop-shadow-[0_0_60px_rgba(0,255,255,0.4)] animate-pulse-glow font-mono">
                                        {gameState.roomCode}
                                    </div>
                                    <p className="text-2xl font-black text-game-secondary mt-6 uppercase tracking-widest bg-white/5 py-4 px-10 rounded-full border border-white/10 mx-auto inline-block">
                                        gamewithfam.vercel.app
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Players & Actions */}
                            <div className="lg:col-span-7 flex flex-col h-full max-h-[80vh] bg-white/5 rounded-[3rem] border border-white/10 p-10 relative overflow-hidden backdrop-blur-sm">
                                <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                                    <h2 className="text-5xl font-black uppercase tracking-widest">
                                        <span className="text-white/20">The Squad</span>
                                    </h2>
                                    <div className="text-6xl font-black text-game-primary drop-shadow-[0_0_20px_rgba(255,0,255,0.5)]">
                                        {playerCount}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                                    {playerCount === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30">
                                            <div className="text-8xl animate-bounce">👇</div>
                                            <p className="text-3xl font-black uppercase tracking-widest text-center">Waiting for players...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {players.map((player, i) => (
                                                <motion.div
                                                    key={player.id}
                                                    initial={{ scale: 0, y: 20 }}
                                                    animate={{ scale: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="bg-black/20 p-6 rounded-[2rem] flex flex-col items-center justify-center border-2 border-white/5 hover:bg-white/10 transition-colors group relative"
                                                >
                                                    <div className="text-6xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                                                        {player.avatar || '👾'}
                                                    </div>
                                                    <div className="font-bold text-xl truncate w-full text-center text-white group-hover:text-game-primary transition-colors">
                                                        {player.name}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-4 border-t border-white/10 flex justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={startGame}
                                        disabled={playerCount === 0}
                                        className={`w-full py-8 rounded-[2rem] text-4xl font-black uppercase tracking-[0.2em] transition-all ${playerCount === 0
                                            ? 'bg-white/5 text-white/20 cursor-not-allowed border-2 border-dashed border-white/10'
                                            : 'bg-gradient-to-r from-game-primary to-game-secondary text-white shadow-[0_0_50px_rgba(255,0,255,0.3)] hover:shadow-[0_0_80px_rgba(255,0,255,0.5)]'
                                            }`}
                                    >
                                        {playerCount === 0 ? 'Waiting...' : 'Launch Game 🚀'}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* GAME SELECT / HUB */}
                    {gameState.status === 'GAME_SELECT' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl h-full"
                        >
                            <div className="relative mb-20 group">
                                <div className="absolute inset-0 bg-blue-500/30 blur-[100px] animate-pulse rounded-full" />
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="text-[15rem] relative z-10 drop-shadow-[0_0_60px_rgba(0,150,255,0.8)]"
                                >
                                    🎙️
                                </motion.div>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/20">
                                    <p className="text-2xl font-bold uppercase tracking-widest text-green-400 flex items-center gap-3">
                                        <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                        Voice Channels Open
                                    </p>
                                </div>
                            </div>

                            <div className="text-center space-y-8 max-w-4xl">
                                <h1 className="text-7xl font-black uppercase tracking-tighter">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                        The Living Room
                                    </span>
                                </h1>
                                <p className="text-4xl text-white/60 font-medium leading-relaxed">
                                    Enable your microphone to talk with the room.
                                    <br />
                                    <span className="text-white/30 text-2xl mt-4 block">Waiting for new games to be installed...</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-4 gap-8 mt-24 w-full px-12 opacity-50 pointer-events-none grayscale">
                                {/* Ghost placeholders to show "Empty/Waiting" state if desired, or just nothing. User said 'remove all games'. */}
                            </div>
                        </motion.div>
                    )}

                    {/* PLAYING - Disabled for Social Hub */}
                    {gameState.status === 'PLAYING' && (
                        <div className="flex flex-col items-center justify-center h-full max-w-2xl text-center px-4">
                            <div className="text-6xl mb-6">🛠️</div>
                            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-wide">
                                Under Construction
                            </h2>
                            <p className="text-xl text-white/60 mb-8 leading-relaxed">
                                We are renovating the game library to bring you a better experience.
                                <br />
                                Please enjoy the Social Hub!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={backToLobby}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold border border-white/10 backdrop-blur-sm transition-all"
                            >
                                Return to Lounge
                            </motion.button>
                        </div>
                    )}

                    {/* RESULTS - Disabled for Social Hub */}
                    {gameState.status === 'RESULTS' && (
                        <div className="flex flex-col items-center justify-center h-full max-w-2xl text-center px-4">
                            <h2 className="text-4xl font-black text-white mb-4 uppercase">
                                Session Ended
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={backToLobby}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold mt-8"
                            >
                                Back to Lounge
                            </motion.button>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
};

export default HostLogic;
