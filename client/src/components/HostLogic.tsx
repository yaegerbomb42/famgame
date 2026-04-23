import { useEffect, useRef, useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../context/SoundContext';
import { Persona } from './Persona';
import { useNarratorStore, getJoinQuip, getGameStartQuip } from '../store/useNarratorStore';
import type { Player, GameState } from '../store/useGameStore';
import { Narrator } from './Narrator';
import { HostRecoveryBar } from './HostRecoveryBar';


// Game Host Components
import { HOST_COMPONENTS } from '../games/gameRegistry';
import CategorySelector from './ui/CategorySelector';

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

const PersistentLeaderboard = ({ gameState, players }: { gameState: GameState, players: Player[] }) => {
    if (gameState?.status === 'LOBBY' || gameState?.status === 'GAME_SELECT') return null;

    const sortedPlayers = players.filter(p => !p.isHost).sort((a, b) => b.score - a.score);

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed right-4 top-32 bottom-8 w-64 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 z-[60] flex flex-col gap-4 shadow-2xl transition-all duration-500 overflow-hidden"
        >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 glow-text-cyan">Standings</h2>
                <div className="flex gap-1">
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse delay-75" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[calc(100vh-300px)]">
                {sortedPlayers.map((p, i) => (
                    <motion.div
                        key={p.id}
                        layout
                        className="flex items-center justify-between group/player bg-white/5 p-2 rounded-xl border border-transparent hover:border-cyan-500/30 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className="text-xl group-hover/player:scale-110 transition-transform block">{p.avatar || '👤'}</span>
                                {i === 0 && <span className="absolute -top-1.5 -right-1.5 text-[10px]">👑</span>}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-[10px] uppercase tracking-wider truncate w-24 group-hover/player:text-cyan-400 transition-colors">
                                    {p.name}
                                </span>
                                <span className="text-[8px] font-mono text-white/30 tracking-tighter">#{i + 1}</span>
                            </div>
                        </div>
                        <span className="font-black text-white group-hover/player:text-cyan-400 transition-colors tabular-nums text-sm">{p.score}</span>
                    </motion.div>
                ))}
            </div>

            <div className="text-[8px] font-bold text-white/10 uppercase text-center tracking-widest mt-auto">
                Live Scoreboard
            </div>
        </motion.div>
    );
};

const HostLogic = () => {
    const gameState = useGameStore(s => s.gameState);
    const createRoom = useGameStore(s => s.createRoom);
    const backToLobby = useGameStore(s => s.backToLobby);
    const startGame = useGameStore(s => s.startGame);
    const selectGame = useGameStore(s => s.selectGame);
    const publicRoomPreference = useGameStore(s => s.publicRoomPreference);
    const setRole = useGameStore(s => s.setRole);
    const continuousMode = useGameStore(s => s.continuousMode);
    const setContinuousMode = useGameStore(s => s.setContinuousMode);
    const { setBGM } = useSound();
    const { speak } = useNarratorStore();
    useEffect(() => {
        (window as any).narratorStore = { speak };
    }, [speak]);

    const players = useMemo(
        () => Object.values(gameState?.players || {}).filter(p => !p.isHost),
        [gameState?.players]
    );
    const playerCount = players.length;

    const lastBGMStatus = useRef<string | null>(null);
    useEffect(() => {
        const status = gameState?.status;
        if (status === lastBGMStatus.current) return;
        lastBGMStatus.current = status || null;

        if (status === 'LOBBY' || status === 'GAME_SELECT') {
            setBGM('LOBBY');
        } else if (status === 'PLAYING') {
            setBGM('GAME');
        } else if (status === 'RESULTS') {
            setBGM('RESULTS');
        }
    }, [gameState?.status, setBGM]);

    const prevPlayerCountRef = useRef(0);
    const hasCreatedRoom = useRef(false);

    useEffect(() => {
        if (!hasCreatedRoom.current) {
            hasCreatedRoom.current = true;
            createRoom('Host', publicRoomPreference);
        }
    }, [createRoom, publicRoomPreference]);

    // Savage narrator for player joins
    useEffect(() => {
        if (gameState?.status === 'LOBBY' && playerCount > prevPlayerCountRef.current) {
            const newPlayer = players[playerCount - 1];
            if (newPlayer) {
                const quip = getJoinQuip(newPlayer.name);
                speak(quip.text, quip.mood);
            }
        }
        prevPlayerCountRef.current = playerCount;
    }, [gameState?.status, playerCount, players, speak]);

    // Savage narrator for game start
    const prevStatusRef = useRef<string | null>(null);
    useEffect(() => {
        if (gameState?.status === 'PLAYING' && prevStatusRef.current !== 'PLAYING') {
            const quip = getGameStartQuip();
            speak(quip.text, quip.mood);
        }
        prevStatusRef.current = gameState?.status || null;
    }, [gameState?.status, speak]);

    if (!gameState) return (
        <div className="flex h-screen items-center justify-center bg-[#0d0f1a]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
            />
        </div>
    );

    const joinUrl = `${window.location.origin}?code=${gameState.roomCode}`;

    return (
        <div className="min-h-screen flex flex-col bg-[#0d0f1a] text-white overflow-hidden font-['Outfit']">
            <Narrator />
            <Persona />
            <HostRecoveryBar />
            
            {/* DEV SIMULATION TOOLS */}
            {import.meta.env.DEV && (
                <div className="fixed bottom-4 left-4 z-[100] flex gap-2">
                    <button 
                        onClick={() => {
                            const code = gameState.roomCode;
                            for (let i = 1; i <= 3; i++) {
                                window.open(`${window.location.origin}/?code=${code}&bot=true&botId=${i}`, '_blank');
                            }
                        }}
                        className="px-4 py-2 bg-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-2xl hover:bg-purple-500 transition-colors pointer-events-auto"
                    >
                        Spawn 3 Bots
                    </button>
                    <button 
                        onClick={() => setContinuousMode(!continuousMode)}
                        className={`px-4 py-2 ${continuousMode ? 'bg-cyan-600' : 'bg-white/10'} rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-2xl transition-colors pointer-events-auto`}
                    >
                        Auto: {continuousMode ? 'ON' : 'OFF'}
                    </button>
                </div>
            )}

            <PersistentLeaderboard gameState={gameState} players={players} />
            <main className="flex-1 relative flex flex-col z-10">
                <AnimatePresence mode="wait">
                    {gameState.status === 'LOBBY' && (
                        <motion.div 
                            key="lobby" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex"
                        >
                            <motion.aside
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="w-[320px] bg-black/30 border-r border-cyan-500/20 p-8 flex flex-col gap-10 items-center z-20"
                            >
                                <div className="text-center">
                                    <h1 className="text-4xl font-black mb-1">
                                        <span className="text-cyan-400">FAM</span>
                                        <span className="text-pink-500">GAME</span>
                                    </h1>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Party Time</p>
                                </div>

                                <div className="rounded-3xl bg-gradient-to-br from-cyan-500/10 to-pink-500/10 backdrop-blur-sm border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.3)] p-6 w-full flex flex-col items-center gap-4">
                                    <div className="bg-white p-2 rounded-2xl">
                                        <QRCode url={joinUrl} size={140} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Scan to Join</p>
                                        <p className="text-4xl font-black tabular-nums tracking-tighter text-cyan-400">{gameState.roomCode}</p>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Game Mode</span>
                                        <span className="text-xs font-bold text-cyan-400">{continuousMode ? 'Continuous' : 'Category'}</span>
                                    </div>
                                    <button
                                        onClick={() => setContinuousMode(!continuousMode)}
                                        className={`w-full py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all ${continuousMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-pink-500 to-purple-500'} text-white shadow-lg hover:scale-[1.02]`}
                                    >
                                        {continuousMode ? 'Continuous Play' : 'Category Select'}
                                    </button>
                                </div>

                                <div className="mt-auto w-full flex flex-col gap-4">
                                    <button
                                        onClick={() => {
                                            if (continuousMode) {
                                                startGame();
                                            } else {
                                                useGameStore.getState().openGameSelect();
                                            }
                                        }}
                                        disabled={continuousMode && playerCount === 0}
                                        className={`w-full py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all ${continuousMode && playerCount === 0
                                            ? 'bg-white/5 text-white/10 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 to-green-500 text-white shadow-lg shadow-cyan-500/30 active:scale-95'
                                            }`}
                                    >
                                        {continuousMode ? 'Start Game' : 'Select Game'}
                                    </button>
                                    <button
                                        onClick={() => setRole('NONE')}
                                        className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-xs font-bold uppercase tracking-widest border border-white/5"
                                    >
                                        Menu
                                    </button>
                                </div>
                            </motion.aside>

                            <div className="flex-1 p-10 flex flex-col gap-8 relative z-10 overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-5xl font-black mb-2 text-cyan-400">Party Lobby</h2>
                                        <p className="text-white/40 font-medium">Waiting for players to join the party...</p>
                                    </div>
                                </div>

                                <div className={`grid gap-4 content-start flex-1 overflow-y-auto pr-2 custom-scrollbar ${
                                    playerCount <= 4 ? 'grid-cols-2 lg:grid-cols-4' :
                                    playerCount <= 8 ? 'grid-cols-3 lg:grid-cols-4' :
                                    playerCount <= 12 ? 'grid-cols-4 lg:grid-cols-5' :
                                    'grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                                }`}>
                                    {players.map((player) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={`rounded-2xl bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.15)] flex flex-col items-center gap-2 group ${
                                                playerCount > 8 ? 'p-3' : 'p-5'
                                            }`}
                                        >
                                            <div
                                                className={`rounded-xl flex items-center justify-center shadow-lg border-2 ${
                                                    playerCount > 8 ? 'w-12 h-12 text-3xl' : 'w-16 h-16 text-4xl'
                                                }`}
                                                style={{ backgroundColor: `${player.color}20`, borderColor: player.color }}
                                            >
                                                {player.avatar}
                                            </div>
                                            <p className={`font-black truncate w-full text-center ${
                                                playerCount > 8 ? 'text-sm' : 'text-base'
                                            }`}>{player.name}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {gameState.status === 'PLAYING' && (
                        <motion.div 
                            key="playing" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex items-center justify-center relative z-20"
                        >
                            {(() => {
                                const HostComponent = HOST_COMPONENTS[gameState.currentGame || ''];
                                if (HostComponent) {
                                    return <HostComponent gameState={gameState} />;
                                }
                                return (
                                    <div className="text-center">
                                        <h2 className="text-4xl font-black text-white mb-4 uppercase">Loading Round...</h2>
                                        <button onClick={backToLobby} className="px-8 py-4 bg-white/10 text-white rounded-full font-bold">Back to Lobby</button>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    )}

                    {gameState.status === 'GAME_SELECT' && (
                        <CategorySelector 
                            playerCount={playerCount}
                            onSelect={selectGame}
                            pickWarning={gameState.gameData?.pickWarning}
                        />
                    )}

                    {gameState.status === 'RESULTS' && (
                        <motion.div 
                            key="results" 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full h-full flex flex-col items-center justify-center p-12 relative overflow-hidden"
                        >
                            {/* Auto-advance banner */}
                            {gameState.gameData?.nextGameCountdown !== undefined && (
                                <motion.div 
                                    initial={{ y: -100 }}
                                    animate={{ y: 0 }}
                                    className="absolute top-0 left-0 right-0 py-4 bg-cyan-500 text-black text-center font-black uppercase tracking-[0.4em] text-sm z-[70] shadow-2xl"
                                >
                                    Next Game Starting in {gameState.gameData.nextGameCountdown}s...
                                    <motion.div 
                                        className="absolute bottom-0 left-0 h-1 bg-black/20"
                                        initial={{ width: '100%' }}
                                        animate={{ width: '0%' }}
                                        transition={{ duration: 10, ease: 'linear' }}
                                    />
                                </motion.div>
                            )}

                            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white/20 mb-12 uppercase">Final Standings</h2>
                            
                            <div className="flex items-end justify-center gap-6 md:gap-12 mb-16 h-[500px]">
                                {/* 2nd Place */}
                                {players[1] && (
                                    <motion.div 
                                        initial={{ y: 200, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="text-6xl md:text-8xl mb-2">{players[1].avatar}</div>
                                        <div className="w-32 md:w-48 bg-slate-400/20 backdrop-blur-xl border-t-2 border-slate-300/30 h-48 rounded-t-3xl flex flex-col items-center p-6 shadow-2xl">
                                            <span className="text-slate-300 font-black text-4xl mb-auto">2nd</span>
                                            <span className="text-white font-bold text-sm truncate w-full text-center">{players[1].name}</span>
                                            <span className="text-slate-400 font-mono text-xs">{players[1].score}</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 1st Place */}
                                {players[0] && (
                                    <motion.div 
                                        initial={{ y: 250, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ type: 'spring', damping: 15 }}
                                        className="flex flex-col items-center gap-6 z-10"
                                    >
                                        <motion.div 
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="text-8xl md:text-[12rem] relative"
                                        >
                                            <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-6xl">👑</span>
                                            {players[0].avatar}
                                        </motion.div>
                                        <div className="w-40 md:w-64 bg-yellow-500/20 backdrop-blur-3xl border-t-4 border-yellow-400/50 h-72 rounded-t-[3rem] flex flex-col items-center p-8 shadow-[0_0_100px_rgba(234,179,8,0.2)]">
                                            <span className="text-yellow-400 font-black text-6xl mb-auto">1st</span>
                                            <span className="text-white font-black text-2xl truncate w-full text-center">{players[0].name}</span>
                                            <span className="text-yellow-300 font-black text-2xl mt-2 glow-text-yellow">{players[0].score}</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* 3rd Place */}
                                {players[2] && (
                                    <motion.div 
                                        initial={{ y: 150, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex flex-col items-center gap-4"
                                    >
                                        <div className="text-5xl md:text-7xl mb-2">{players[2].avatar}</div>
                                        <div className="w-28 md:w-40 bg-orange-900/20 backdrop-blur-xl border-t-2 border-orange-700/30 h-32 rounded-t-3xl flex flex-col items-center p-6 shadow-2xl">
                                            <span className="text-orange-600 font-black text-3xl mb-auto">3rd</span>
                                            <span className="text-white font-bold text-xs truncate w-full text-center">{players[2].name}</span>
                                            <span className="text-orange-500/50 font-mono text-[10px]">{players[2].score}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex gap-6 mt-8">
                                <button onClick={backToLobby} className="px-12 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-black uppercase tracking-widest border border-white/10 transition-all">Lobby</button>
                                <button onClick={startGame} className="px-16 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all">Next Game</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
};

export default HostLogic;