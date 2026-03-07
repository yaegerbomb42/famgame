import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../context/SoundContext';
import { Persona } from './Persona';
import { useVoiceStore } from '../store/useVoiceStore';
import { useNarratorStore } from '../store/useNarratorStore';
import type { Player, GameState } from '../store/useGameStore';
import { Narrator } from './Narrator';
import TriviaHost from '../games/trivia/Host';
import ReactionHost from '../games/reaction/Host';
import BrainBurstHost from '../games/brain-burst/Host';
import GlobalAveragesHost from '../games/global-averages/Host';
import SkillShowdownHost from '../games/skill-showdown/Host';
import AIMashupHost from '../games/ai-mashup/Host';
import type {
    BrainBurstGameData,
    GlobalAveragesGameData,
    SkillShowdownGameData,
    TriviaGameData
} from '../types/game';

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

// --- SUB-COMPONENTS ---
const PersistentLeaderboard = ({ gameState, players }: { gameState: GameState, players: Player[] }) => {
    if (gameState?.status === 'LOBBY' || gameState?.status === 'GAME_SELECT') return null;

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed right-4 top-24 bottom-24 w-56 bg-black/20 hover:bg-black/60 backdrop-blur-md hover:backdrop-blur-xl border border-white/5 hover:border-white/20 rounded-[2rem] p-5 z-[60] flex flex-col gap-4 shadow-2xl transition-all duration-500 group/board"
        >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Standings</h2>
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse delay-75" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {sortedPlayers.map((p, i) => (
                    <motion.div
                        key={p.id}
                        layout
                        className="flex items-center justify-between group/player"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className="text-xl group-hover/player:scale-125 transition-transform block">{p.avatar}</span>
                                {i === 0 && <span className="absolute -top-1 -right-1 text-[10px]">👑</span>}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-[10px] uppercase tracking-wider truncate w-24 group-hover/player:text-cyan-400 transition-colors">
                                    {p.name}
                                </span>
                                <span className="text-[9px] font-mono text-white/30 tracking-tighter">RANK #{i + 1}</span>
                            </div>
                        </div>
                        <span className="font-black text-white group-hover/player:text-cyan-400 transition-colors tabular-nums">{p.score}</span>
                    </motion.div>
                ))}
            </div>

            {/* Hint */}
            <div className="text-[8px] font-bold text-white/10 uppercase text-center tracking-widest mt-auto">
                Live Data Feed
            </div>
        </motion.div>
    );
};

const HostLogic = () => {
    const { gameState, createRoom, backToLobby, startGame } = useGameStore();
    const { setBGM } = useSound();
    const { activeSpeakers } = useVoiceStore();
    const { speak } = useNarratorStore();

    // --- HOST STATE ---

    // Narrator: Lobby Join Remarks
    const players = Object.values(gameState?.players || {}).filter(p => !p.isHost);
    const playerCount = players.length;

    useEffect(() => {
        if (gameState?.status === 'LOBBY' || gameState?.status === 'GAME_SELECT') {
            setBGM('LOBBY');
        } else if (gameState?.status === 'PLAYING') {
            setBGM('GAME');
        } else if (gameState?.status === 'RESULTS') {
            setBGM('NONE');
        }
    }, [gameState?.status, setBGM]);

    const prevPlayerCountRef = useRef(0);

    // Track Player Joins for Narrator
    useEffect(() => {
        if (!gameState) {
            createRoom('Host');
        }
    }, [gameState, createRoom]);

    useEffect(() => {
        if (gameState?.status === 'LOBBY' && playerCount > prevPlayerCountRef.current) {
            const newPlayer = players[playerCount - 1];
            if (newPlayer) {
                const remarks = [
                    `Oh look, it's ${newPlayer.name}. Lower your expectations, everyone.`,
                    `A round of polite applause for ${newPlayer.name}. Welcome to the meat grinder.`,
                    `${newPlayer.name} has arrived. Did you bring snacks? Because you're about to get cooked.`,
                    `Ah, ${newPlayer.name}. I was hoping for someone smarter, but you'll do.`,
                    `Please remain calm, ${newPlayer.name} has breached containment and entered the lobby.`,
                    `Who let ${newPlayer.name} in? Security is a joke around here.`
                ];
                speak(remarks[Math.floor(Math.random() * remarks.length)]);
            }
        }
        prevPlayerCountRef.current = playerCount;
    }, [gameState?.status, playerCount, players, speak]);

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

    return (
        <div className="min-h-screen flex flex-col bg-game-bg text-white overflow-hidden">
            <Narrator />
            <Persona />
            <PersistentLeaderboard gameState={gameState} players={players} />
            {/* Header */}
            <header className="flex justify-between items-center p-6 z-20">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                    <span className="text-xs text-white/50 font-black uppercase tracking-widest">Live Room: {gameState.roomCode}</span>
                </div>

                <h1 className="text-3xl font-black tracking-tighter">
                    GAME<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">NIGHT</span>
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
                    {/* LOBBY - HIGH TECH DOPAMINE OVERHAUL */}
                    {gameState.status === 'LOBBY' && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            className="w-full h-full relative"
                        >
                            {/* Cinematic Background Elements */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-500/20 blur-[150px] animate-pulse" />
                                <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/20 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150" />
                            </div>

                            <div className="relative z-10 w-full h-full p-12 grid grid-cols-12 gap-8">

                                {/* MAIN CONTENT AREA (Left/Center) */}
                                <div className="col-span-8 flex flex-col justify-center relative">

                                    {/* MASSIVE TITLES */}
                                    <motion.div
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="mb-16"
                                    >
                                        <h1 className="text-[8rem] leading-[0.8] font-black tracking-tighter uppercase italic transform -rotate-2">
                                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]">
                                                GAME
                                            </span>
                                            <span className="block text-white drop-shadow-[5px_5px_0_rgba(255,0,255,1)] ml-24">
                                                NIGHT
                                            </span>
                                        </h1>
                                        <div className="flex items-center gap-6 mt-8 ml-4">
                                            <div className="px-6 py-2 bg-yellow-400 text-black font-black uppercase tracking-widest text-lg transform skew-x-[-10deg]">
                                                Beta v2.0
                                            </div>
                                            <div className="h-[2px] w-32 bg-gradient-to-r from-yellow-400 to-transparent" />
                                        </div>
                                    </motion.div>

                                    {/* QR CODE CARD */}
                                    <div className="flex items-center gap-12">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", bounce: 0.5 }}
                                            className="p-6 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.5)] relative group"
                                        >
                                            <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-[2.8rem] opacity-50 blur-lg group-hover:opacity-100 transition-opacity" />
                                            <div className="relative bg-white p-6 rounded-[2rem]">
                                                <QRCode url={joinUrl} size={220} />
                                            </div>
                                        </motion.div>

                                        <div className="space-y-2">
                                            <p className="text-cyan-400 font-bold tracking-[0.3em] uppercase text-sm">Join the Network</p>
                                            <div className="text-8xl font-mono font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                                                {gameState.roomCode}
                                            </div>
                                            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
                                                {window.location.hostname}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* SQUAD GRID (Top Right) */}
                                <div className="col-span-4 flex flex-col h-full pointer-events-none">
                                    <div className="flex items-end justify-between mb-6 border-b-2 border-white/10 pb-4">
                                        <h2 className="text-3xl font-black uppercase tracking-widest italic text-fuchsia-400 drop-shadow-glow">
                                            The Squad
                                        </h2>
                                        <span className="text-4xl font-mono font-bold text-white/50">
                                            {String(playerCount).padStart(2, '0')}
                                        </span>
                                    </div>

                                    {/* Compact Auto-Grid - No Scroll */}
                                    <div className="flex-1">
                                        <div className="grid grid-cols-2 gap-3 auto-rows-min content-start">
                                            <AnimatePresence>
                                                {players.map((player) => {
                                                    const isSpeaking = activeSpeakers[player.id];
                                                    return (
                                                        <motion.div
                                                            key={player.id}
                                                            initial={{ scale: 0, rotate: 10 }}
                                                            animate={{
                                                                scale: isSpeaking ? 1.05 : 1,
                                                                rotate: 0,
                                                                borderColor: isSpeaking ? 'rgba(0, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                                                                boxShadow: isSpeaking ? '0 0 20px rgba(0, 255, 255, 0.5)' : 'none'
                                                            }}
                                                            exit={{ scale: 0 }}
                                                            className={`h-24 bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4 overflow-hidden group shadow-lg ${isSpeaking ? 'bg-cyan-900/40' : ''}`}
                                                        >
                                                            <div className={`text-4xl bg-white/5 p-2 rounded-lg transition-colors shrink-0 ${isSpeaking ? 'animate-pulse' : 'group-hover:bg-white/10'}`}>
                                                                {player.avatar}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className={`font-bold text-white text-base truncate uppercase tracking-widest transition-colors ${isSpeaking ? 'text-cyan-300' : 'group-hover:text-cyan-400'}`}>
                                                                    {player.name}
                                                                </div>
                                                                <div className="text-[10px] text-white/30 font-mono flex items-center gap-2">
                                                                    {isSpeaking ? (
                                                                        <span className="text-green-400 font-bold animate-pulse">SPEAKING...</span>
                                                                    ) : (
                                                                        <span>READY</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </AnimatePresence>

                                            {/* Empty Slots visuals */}
                                            {Array.from({ length: Math.max(0, 8 - playerCount) }).map((_, i) => (
                                                <div key={`empty-${i}`} className="border-2 border-dashed border-white/5 rounded-xl h-24 opacity-30" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* START BUTTON REPOSITIONED - CENTER FLOATING */}
                                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto w-full max-w-md">
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(0, 255, 255, 0.6)" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={startGame}
                                            disabled={playerCount === 0}
                                            className={`w-full py-8 rounded-[2.5rem] text-3xl font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border-t-2 border-white/20 ${playerCount === 0
                                                ? 'bg-white/5 text-white/20 cursor-not-allowed border-none'
                                                : 'bg-gradient-to-r from-game-primary to-game-secondary text-white'
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                                            <span className="relative z-10 flex items-center justify-center gap-4">
                                                {playerCount === 0 ? (
                                                    'WAITING FOR SQUAD'
                                                ) : (
                                                    <>
                                                        <span className="animate-pulse">🚀</span>
                                                        INITIATE_GAME
                                                        <span className="animate-pulse">🚀</span>
                                                    </>
                                                )}
                                            </span>
                                        </motion.button>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    )}



                    {/* PLAYING - Active Game Area */}
                    {gameState.status === 'PLAYING' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex items-center justify-center relative z-20"
                        >
                            {gameState.currentGame === 'TRIVIA' && (
                                <TriviaHost
                                    question={(gameState.gameData as TriviaGameData)?.currentQuestion}
                                    timer={(gameState.gameData as TriviaGameData)?.timer}
                                    showResult={(gameState.gameData as TriviaGameData)?.showResult}
                                />
                            )}
                            {gameState.currentGame === 'REACTION' && (
                                <ReactionHost />
                            )}
                            {gameState.currentGame === 'BRAIN_BURST' && (
                                <BrainBurstHost
                                    {...(gameState.gameData as BrainBurstGameData)}
                                    players={gameState.players}
                                />
                            )}
                            {gameState.currentGame === 'GLOBAL_AVERAGES' && (
                                <GlobalAveragesHost
                                    {...(gameState.gameData as GlobalAveragesGameData)}
                                    players={gameState.players}
                                />
                            )}
                            {gameState.currentGame === 'SKILL_SHOWDOWN' && gameState.gameData && (
                                <SkillShowdownHost
                                    {...(gameState.gameData as SkillShowdownGameData)}
                                    players={gameState.players}
                                />
                            )}
                            {gameState.currentGame === 'AI_MASHUP' && gameState.gameData && (
                                <AIMashupHost />
                            )}

                            {/* Fallback for un-implemented games */}
                            {gameState.currentGame !== 'TRIVIA' && gameState.currentGame !== 'REACTION' && gameState.currentGame !== 'BRAIN_BURST' && gameState.currentGame !== 'GLOBAL_AVERAGES' && gameState.currentGame !== 'SKILL_SHOWDOWN' && gameState.currentGame !== 'AI_MASHUP' && (
                                <div className="flex flex-col items-center justify-center text-center">
                                    <h2 className="text-4xl font-black text-white mb-4 uppercase">
                                        Loading {gameState.currentGame}...
                                    </h2>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={backToLobby}
                                        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold mt-8 border border-white/10 backdrop-blur-sm"
                                    >
                                        Next Game
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
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
                                Play Again
                            </motion.button>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
};

export default HostLogic;
