import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/useGame';
import type { Player } from '../store/useGameStore';
import TriviaHost from '../games/trivia/Host';
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
import BrainBurstHost from '../games/brain-burst/Host';
import GlobalAveragesHost from '../games/global-averages/Host';
import SkillShowdownHost from '../games/skill-showdown/Host';
import FinalBossHost from '../games/final-boss/Host';
import { useNarratorStore } from '../store/useNarratorStore';

const DramaticReveal = ({ players, onPlayAgain, onNewPlayers }: { players: Player[], onPlayAgain: () => void, onNewPlayers: () => void }) => {
    const [revealedCount, setRevealedCount] = useState(0);
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const { speak } = useNarratorStore();

    useEffect(() => {
        if (revealedCount < sortedPlayers.length) {
            const timer = setTimeout(() => {
                const p = sortedPlayers[sortedPlayers.length - 1 - revealedCount];
                if (revealedCount === sortedPlayers.length - 1) {
                    speak(`Finally, in first place, the undisputed champion of the night... ${p.name}!`);
                } else if (revealedCount === 0) {
                    speak(`Let's reveal the results. In last place, with a truly... unique performance... ${p.name}.`);
                } else {
                    speak(`${p.name} takes position ${sortedPlayers.length - revealedCount}.`);
                }
                setRevealedCount(prev => prev + 1);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [revealedCount, sortedPlayers, speak]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center w-full max-w-6xl p-8 overflow-hidden relative"
        >
            <h2 className="text-8xl md:text-9xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-[0_10px_30px_rgba(234,179,8,0.5)] text-center uppercase tracking-tighter">
                Final Standings
            </h2>

            <div className="w-full flex-1 flex flex-col-reverse justify-end gap-6 overflow-hidden">
                {sortedPlayers.map((player: Player, i: number) => {
                    const isRevealed = (sortedPlayers.length - 1 - i) < revealedCount;
                    if (!isRevealed) return null;

                    return (
                        <motion.div
                            key={player.id}
                            initial={{ y: 100, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            className={`p-10 rounded-[3rem] flex items-center justify-between shadow-2xl transition-all ${i === 0
                                ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 border-8 border-yellow-300 shadow-[0_0_100px_rgba(234,179,8,0.4)] h-40'
                                : i === 1
                                    ? 'bg-zinc-800 border-4 border-slate-400 opacity-90'
                                    : i === 2
                                        ? 'bg-zinc-900 border-4 border-amber-700 opacity-80'
                                        : 'bg-black/40 border-2 border-white/5 opacity-60'
                                }`}
                        >
                            <div className="flex items-center gap-12">
                                <span className={`text-7xl font-black italic ${i === 0 ? 'text-white text-glow' : 'text-white/20'}`}>
                                    #{i + 1}
                                </span>
                                <div className="flex items-center gap-8">
                                    <span className="text-8xl drop-shadow-2xl">{player.avatar || '👾'}</span>
                                    <span className={`text-5xl font-black uppercase tracking-tight ${i === 0 ? 'text-white' : 'text-white/80'}`}>{player.name}</span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-sm text-white/40 uppercase tracking-[0.5em] font-black">Score</span>
                                <span className="text-7xl font-black font-mono text-white drop-shadow-lg">
                                    {player.score.toLocaleString()}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {revealedCount >= sortedPlayers.length && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex gap-10 justify-center mt-20 shrink-0 pb-6 w-full"
                >
                    <button onClick={onPlayAgain} className="px-16 py-8 bg-white text-black font-black text-3xl rounded-[3rem] hover:scale-105 transition-all uppercase tracking-widest border-4 border-white">
                        PLAY AGAIN
                    </button>
                    <button onClick={onNewPlayers} className="px-16 py-8 border-4 border-white/20 text-white font-black text-3xl rounded-[3rem] hover:border-white/50 transition-all uppercase tracking-widest">
                        LOBBY
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

// QR Code component using Google Charts API
const QRCode = ({ url, size = 200 }: { url: string; size?: number }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=10`;
    return (
        <img
            src={qrUrl}
            alt="QR Code"
            className="rounded-2xl"
            style={{ width: size, height: size }}
        />
    );
};

const GAMES = [
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
    { id: 'BRAIN_BURST', name: 'Brain Burst', icon: '💰', color: '#f9ca24' },
    { id: 'GLOBAL_AVERAGES', name: 'Global Averages', icon: '🌍', color: '#00d4ff' },
];

// Narrator — speaks text via Web Speech API with emotional intensity
type NarratorMood = 'calm' | 'dramatic' | 'excited' | 'epic' | 'tense';

const narrate = (text: string, mood: NarratorMood = 'calm') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);

    // Dynamic vocal styling based on mood
    switch (mood) {
        case 'epic':
            utter.rate = 0.82;
            utter.pitch = 0.85;
            utter.volume = 1.0;
            break;
        case 'dramatic':
            utter.rate = 0.88;
            utter.pitch = 0.95;
            utter.volume = 0.95;
            break;
        case 'excited':
            utter.rate = 1.05;
            utter.pitch = 1.15;
            utter.volume = 1.0;
            break;
        case 'tense':
            utter.rate = 0.9;
            utter.pitch = 0.8;
            utter.volume = 0.85;
            break;
        default: // calm
            utter.rate = 0.92;
            utter.pitch = 1.0;
            utter.volume = 0.9;
    }

    // Pick the best available voice — prioritize premium, deeper, more expressive voices
    const voices = window.speechSynthesis.getVoices();
    const voicePreference = [
        'Online', 'Natural', 'Microsoft Aria', 'Google UK English Female',
        'Daniel', 'Google UK English Male', 'Samantha', 'Microsoft Guy',
        'Aaron', 'Karen', 'Moira', 'Google US English', 'Rishi', 'Tessa', 'Alex'
    ];
    let chosen = null;
    for (const pref of voicePreference) {
        chosen = voices.find(v => v.name.includes(pref));
        if (chosen) break;
    }
    if (chosen) utter.voice = chosen;
    window.speechSynthesis.speak(utter);
};

const HostLogic = () => {
    const { gameState, startGame, socket, isConnected } = useGame();
    const lastNarratedRef = useRef<string>('');

    // Create room when host mounts and is connected
    useEffect(() => {
        if (gameState?.status === 'LOBBY' && isConnected) {
            socket?.emit('createRoom', { name: 'Host' });
        }
    }, [gameState?.status, socket, isConnected]);

    // Narrator — auto-narrate game events with emotional flair
    useEffect(() => {
        if (!gameState?.gameData || gameState.currentGame !== 'BRAIN_BURST') return;
        const { phase, currentQuestion, tier, questionIndex } = gameState.gameData;
        let text = '';
        let mood: NarratorMood = 'calm';
        const qNum = (questionIndex || 0) + 1;

        if (phase === 'FINAL_SUBMISSION') {
            text = 'Time is up! Let\'s see what you came up with!';
            mood = 'dramatic';
        } else if (phase === 'INTRO') {
            text = 'Ladies and gentlemen... Welcome, to Brain Burst! 35 questions stand between you, and ten billion dollars. Let the game, begin!';
            mood = 'epic';
        } else if (phase === 'QUESTION' && currentQuestion) {
            if (qNum <= 5) {
                text = `Question ${qNum}, for ${tier?.prize || 'points'}. ${currentQuestion.q}`;
                mood = 'calm';
            } else if (qNum <= 15) {
                text = `Question ${qNum}. Playing for ${tier?.prize || 'points'}... ${currentQuestion.q}`;
                mood = 'dramatic';
            } else if (qNum <= 25) {
                text = `Question ${qNum}! ${tier?.prize || 'big money'} is on the line! ... ${currentQuestion.q}`;
                mood = 'tense';
            } else {
                text = `Question ${qNum}! We are deep into the billions! For ${tier?.prize || 'an incredible prize'}! ... ${currentQuestion.q}`;
                mood = 'epic';
            }
        } else if (phase === 'REVEAL' && currentQuestion) {
            const correctAnswer = currentQuestion.a[currentQuestion.correct];
            const reveals = [
                `The answer is... ${correctAnswer}!`,
                `And the correct answer... ${correctAnswer}!`,
                `It was... ${correctAnswer}!`,
                `${correctAnswer}! That's the one!`,
            ];
            text = reveals[Math.floor(Math.random() * reveals.length)];
            mood = 'excited';
        } else if (phase === 'GAME_OVER') {
            text = 'And that is the game! What a ride! Let us see who came out on top!';
            mood = 'epic';
        }
        if (text && text !== lastNarratedRef.current) {
            lastNarratedRef.current = text as string;
            narrate(text as string, mood);
        }
    }, [gameState?.gameData?.phase, gameState?.gameData?.questionIndex]);

    if (!gameState || !gameState.roomCode) return (
        <div className="flex h-screen items-center justify-center bg-[#0a0518]">
            <div className="w-20 h-20 border-4 border-game-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const selectGame = (gameId: string) => {
        socket?.emit('selectGame', gameId);
    };

    const nextRound = () => {
        socket?.emit('nextRound');
    };

    const backToLobby = () => {
        socket?.emit('backToLobby');
    };

    const startBrainBurst = () => {
        socket?.emit('startGame');
        // Immediately select Brain Burst
        setTimeout(() => socket?.emit('selectGame', 'BRAIN_BURST'), 200);
    };

    const joinUrl = `https://gamewithfam.vercel.app?code=${gameState.roomCode}`;
    const playerCount = (Object.values(gameState.players) as Player[]).filter(p => !p.isHost).length;

    return (
        <div className="h-screen flex flex-col bg-[#0a0518] text-white overflow-hidden">
            {/* Header - Always visible */}
            <header className="flex justify-between items-center p-4 md:p-6 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs md:text-sm text-white/50 font-mono uppercase tracking-wider">Connected</span>
                </div>

                <h1 className="text-2xl md:text-4xl font-black">
                    FAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff]">GAME</span>
                </h1>

                <button
                    onClick={backToLobby}
                    className="text-xs md:text-sm text-white/30 hover:text-white/70 uppercase tracking-wider transition-colors"
                >
                    {gameState.status === 'RESULTS' ? 'New Game' : ''}
                </button>
            </header>

            {/* Permanent Mini-Leaderboard Overlay (Only during active games) */}
            {gameState.status === 'IN_GAME' && (
                <div className="fixed top-24 right-6 z-50 glass-card p-4 rounded-2xl border border-white/10 shadow-2xl w-64 backdrop-blur-md bg-black/40">
                    <h3 className="text-white/50 text-xs font-black uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Global Leaderboard</h3>
                    <div className="space-y-2">
                        {(() => {
                            const topPlayers = (Object.values(gameState.players) as Player[])
                                .filter(p => !p.isHost)
                                .sort((a, b) => b.score - a.score)
                                .slice(0, 5);
                            return topPlayers.map((p, i) => (
                                <motion.div
                                    key={p.id}
                                    layout
                                    className="flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`font-mono text-xs ${i === 0 ? 'text-yellow-400 font-black' : 'text-white/40'}`}>#{i + 1}</span>
                                        <span className="text-xl">{p.avatar}</span>
                                        <span className="font-bold text-sm truncate max-w-[80px]">{p.name}</span>
                                    </div>
                                    <span className="font-mono font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00ffff] to-[#00d4ff] text-sm">
                                        {p.score.toLocaleString()}
                                    </span>
                                </motion.div>
                            ));
                        })()}
                    </div>
                </div>
            )}

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pb-8 overflow-hidden">
                <AnimatePresence mode='wait'>
                    {/* LOBBY STATE */}
                    {gameState.status === 'LOBBY' && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-6xl flex flex-col items-center"
                        >
                            {/* Hero Section: Room Code & Join QR Stacked */}
                            <div className="flex flex-col items-center justify-center w-full mb-12 space-y-8">
                                <div className="text-center">
                                    <p className="text-3xl text-white/40 mb-2 uppercase tracking-[0.5em] font-black">Room Code</p>
                                    <div className="text-[10rem] md:text-[14rem] leading-none font-black tracking-[0.1em] text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.4)] animate-pulse-glow">
                                        {gameState.roomCode}
                                    </div>
                                </div>

                                <div className="flex items-center gap-10 glass-card p-8 rounded-[3rem] border-2 border-white/10 shadow-2xl scale-125">
                                    <div className="bg-white p-3 rounded-2xl">
                                        <QRCode url={joinUrl} size={180} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-2xl text-white/50 mb-1 uppercase tracking-widest font-black">Scan to Join</p>
                                        <p className="text-lg text-game-secondary mb-2 uppercase tracking-widest font-bold">gamewithfam.vercel.app</p>
                                    </div>
                                </div>
                            </div>

                            {/* Players Section: Flex-1 to take up remaining space with scroll */}
                            <div className="w-full flex-1 flex flex-col min-h-0 bg-black/20 rounded-[4rem] p-10 border-2 border-white/5 overflow-hidden">
                                <h2 className="text-5xl font-black text-center mb-10 uppercase tracking-[0.2em]">
                                    <span className="text-white/40">Players </span>
                                    <span className="text-[#f9ca24]">({playerCount})</span>
                                </h2>

                                {playerCount === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 opacity-20 border-4 border-dashed border-white/10 rounded-[5rem] m-2">
                                        <div className="text-[10rem] animate-bounce">📱</div>
                                        <p className="text-5xl font-black uppercase tracking-widest text-center">Waiting for players...</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-6 md:gap-8">
                                            {Object.keys(gameState.players).map((p: string) => (
                                                <motion.div
                                                    key={p}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl md:text-5xl shadow-2xl overflow-hidden relative group"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                                    {gameState.players[p]?.avatar ? (
                                                        <span className="drop-shadow-lg transform group-hover:scale-110 transition-transform">{gameState.players[p].avatar}</span>
                                                    ) : (
                                                        <span className="text-white/20 font-black italic">
                                                            {(gameState.players[p]?.name as string || 'Waiting...').charAt(0)}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => socket?.emit('kickPlayer', p)}
                                                        className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 z-10"
                                                    >
                                                        <span className="text-2xl font-black">✕</span>
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Start Button: Always visible at bottom */}
                            <div className="w-full flex justify-center mt-10 shrink-0 pb-4">
                                <motion.button
                                    whileHover={playerCount > 0 ? { scale: 1.05, y: -5 } : {}}
                                    whileTap={playerCount > 0 ? { scale: 0.95 } : {}}
                                    animate={playerCount > 0 ? {
                                        boxShadow: [
                                            '0 0 50px rgba(249,202,36,0.5), inset 0 0 20px rgba(255,255,255,0.2)',
                                            '0 0 150px rgba(249,202,36,1), inset 0 0 50px rgba(255,255,255,0.6)',
                                            '0 0 50px rgba(249,202,36,0.5), inset 0 0 20px rgba(255,255,255,0.2)'
                                        ]
                                    } : {}}
                                    transition={playerCount > 0 ? { repeat: Infinity, duration: 2 } : {}}
                                    onClick={startBrainBurst}
                                    disabled={playerCount === 0}
                                    className={`relative overflow-hidden text-white font-black rounded-[5rem] uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-10 ${playerCount === 0
                                        ? 'bg-white/10 border-2 border-white/20 px-16 py-8 text-4xl opacity-50 cursor-not-allowed text-white/50'
                                        : 'bg-gradient-to-r from-[#f9ca24] via-[#f0932b] to-[#f9ca24] border-4 border-white px-20 py-10 text-5xl md:text-7xl'
                                        }`}
                                    style={{
                                        textShadow: playerCount > 0 ? '0 10px 20px rgba(0,0,0,0.5)' : 'none'
                                    }}
                                >
                                    {playerCount === 0 ? 'WAITING FOR PLAYERS...' : (
                                        <>
                                            <motion.span
                                                animate={{ rotate: [0, -20, 20, 0], scale: [1, 1.2, 1] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="text-8xl md:text-[8rem] drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]"
                                                style={{ display: 'inline-block' }}
                                            >🚀</motion.span>
                                            <span className="drop-shadow-[0_15px_15px_rgba(0,0,0,0.5)]">START GAME</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* GAME SELECTION STATE */}
                    {gameState.status === 'GAME_SELECT' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center p-12 w-full max-w-[95vw] overflow-y-auto custom-scrollbar"
                        >
                            <h1 className="text-8xl md:text-[10rem] font-black mb-16 text-glow gradient-text-primary uppercase tracking-tighter text-center">
                                Pick Your Battle
                            </h1>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 w-full pb-12">
                                {GAMES.map((game) => (
                                    <motion.button
                                        key={game.id}
                                        whileHover={{ scale: 1.05, y: -15, boxShadow: `0 30px 60px ${game.color}40` }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectGame(game.id)}
                                        className="glass-card p-12 rounded-[3.5rem] flex flex-col items-center justify-center space-y-8 transition-all hover:border-white border-4 border-white/5 group relative overflow-hidden h-[450px]"
                                        style={{ borderColor: `${game.color}20` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                                        <div className="text-[10rem] md:text-[12rem] mb-6 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform group-hover:rotate-12 transition-transform duration-500">
                                            {game.icon}
                                        </div>
                                        <div className="text-5xl font-black uppercase tracking-widest text-white/90 group-hover:text-white group-hover:text-glow text-center">
                                            {game.name}
                                        </div>
                                        <div className="bg-white/10 px-10 py-4 rounded-full text-2xl font-black text-white/40 uppercase tracking-[0.2em] group-hover:bg-white group-hover:text-black transition-all">
                                            CHOOSE
                                        </div>

                                        {/* Animated background glow */}
                                        <div
                                            className="absolute -bottom-20 -right-20 w-80 h-80 blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                                            style={{ backgroundColor: game.color }}
                                        />
                                    </motion.button>
                                ))}
                            </div>

                            {/* CUSTOM AI GAMES */}
                            {gameState?.customGames && gameState.customGames.length > 0 && (
                                <div className="w-full pb-12 mt-8">
                                    <h2 className="text-6xl md:text-7xl font-black mb-10 text-glow text-[#ff00ff] uppercase tracking-tighter text-center">
                                        Swarm Generated
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 w-full">
                                        {gameState.customGames.map((game: any) => (
                                            <motion.button
                                                key={game.id}
                                                whileHover={{ scale: 1.05, y: -15, boxShadow: `0 30px 60px #ff00ff40` }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => socket?.emit('gameInput', { action: 'START_CUSTOM_AI_GAME', gameId: game.id })}
                                                className="glass-card p-12 rounded-[3.5rem] flex flex-col items-center justify-center space-y-6 transition-all hover:border-[#ff00ff] border-4 border-white/10 group relative overflow-hidden h-[450px]"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#ff00ff]/10 to-transparent opacity-50" />
                                                <div className="text-[6rem] md:text-[8rem] mb-2 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform group-hover:rotate-12 transition-transform duration-500">
                                                    🤖
                                                </div>
                                                <div className="text-3xl font-black uppercase tracking-widest text-[#ff00ff]/90 group-hover:text-[#ff00ff] group-hover:text-glow text-center leading-tight line-clamp-2">
                                                    {game.title}
                                                </div>
                                                <div className="text-sm font-bold text-white/50 bg-black/50 px-4 py-2 rounded-full uppercase truncate">
                                                    BY {game.creator}
                                                </div>
                                                <div className="bg-[#ff00ff]/20 px-10 py-4 rounded-full text-2xl font-black text-white/60 uppercase tracking-[0.2em] group-hover:bg-[#ff00ff] group-hover:text-white transition-all mt-auto z-10 w-full">
                                                    PLAY
                                                </div>
                                                <div className="absolute -bottom-20 -right-20 w-80 h-80 blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none bg-[#ff00ff]" />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* PLAYING STATE */}
                    {gameState.status === 'PLAYING' && gameState.gameData && (
                        <>
                            {gameState.currentGame === 'TRIVIA' && (
                                <TriviaHost
                                    question={gameState.gameData.question}
                                    timer={gameState.gameData.timer ?? 0}
                                    showResult={gameState.gameData.showResult ?? false}
                                />
                            )}

                            {gameState.currentGame === '2TRUTHS' && (
                                <TwoTruthsHost
                                    phase={(gameState.gameData.phase || 'INPUT') as 'VOTING' | 'REVEAL' | 'INPUT'}
                                    inputs={gameState.gameData.inputs || {}}
                                    currentSubjectId={gameState.gameData.currentSubjectId}
                                    players={gameState.players}
                                    votes={gameState.gameData.votes}
                                    showLie={gameState.gameData.showLie}
                                />
                            )}

                            {gameState.currentGame === 'HOT_TAKES' && (
                                <HotTakesHost
                                    phase={(gameState.gameData.phase || 'INPUT') as 'VOTING' | 'RESULTS' | 'INPUT'}
                                    prompt={gameState.gameData.prompt || ''}
                                    inputs={gameState.gameData.inputs || {}}
                                    players={gameState.players}
                                    votes={gameState.gameData.votes || {}}
                                />
                            )}

                            {gameState.currentGame === 'POLL' && (
                                <PollHost
                                    phase={(gameState.gameData.phase || 'VOTING') as 'VOTING' | 'RESULTS'}
                                    prompt={gameState.gameData.prompt || ''}
                                    players={gameState.players}
                                    votes={gameState.gameData.votes}
                                />
                            )}

                            {gameState.currentGame === 'BUZZ_IN' && (
                                <BuzzHost
                                    phase={(gameState.gameData.phase || 'WAITING') as 'WAITING' | 'ACTIVE' | 'BUZZED'}
                                    winnerId={gameState.gameData.winnerId || null}
                                    players={gameState.players}
                                />
                            )}

                            {gameState.currentGame === 'WORD_RACE' && (
                                <WordRaceHost
                                    category={gameState.gameData.category}
                                    words={gameState.gameData.words}
                                    scores={gameState.gameData.scores}
                                    players={gameState.players}
                                />
                            )}

                            {gameState.currentGame === 'REACTION' && (
                                <ReactionHost />
                            )}

                            {gameState.currentGame === 'EMOJI_STORY' && (
                                <EmojiStoryHost
                                    phase={(gameState.gameData.phase || 'INPUT') as 'INPUT' | 'GUESSING' | 'REVEAL'}
                                    currentStory={gameState.gameData.currentStory}
                                    inputs={gameState.gameData.inputs}
                                    guesses={gameState.gameData.guesses}
                                    players={gameState.players}
                                    correctAnswer={gameState.gameData.correctAnswer}
                                />
                            )}

                            {gameState.currentGame === 'BLUFF' && (
                                <BluffHost
                                    phase={(gameState.gameData.phase || 'CLAIM') as 'CLAIM' | 'VOTING' | 'REVEAL'}
                                    currentClaimerId={gameState.gameData.currentClaimerId}
                                    claim={gameState.gameData.claim}
                                    isLying={gameState.gameData.isLying}
                                    votes={gameState.gameData.votes}
                                    players={gameState.players}
                                />
                            )}

                            {gameState.currentGame === 'THIS_OR_THAT' && (
                                <ThisOrThatHost
                                    phase={(gameState.gameData.phase || 'CHOOSING') as 'CHOOSING' | 'REVEAL'}
                                    optionA={gameState.gameData.optionA || ''}
                                    optionB={gameState.gameData.optionB}
                                    votes={gameState.gameData.votes}
                                    players={gameState.players}
                                />
                            )}

                            {gameState.currentGame === 'SPEED_DRAW' && (
                                <SpeedDrawHost
                                    phase={(gameState.gameData.phase || 'DRAWING') as 'DRAWING' | 'VOTING' | 'RESULTS'}
                                    prompt={gameState.gameData.prompt || ''}
                                    drawings={gameState.gameData.drawings}
                                    votes={gameState.gameData.votes}
                                    players={gameState.players}
                                    timer={gameState.gameData.timer ?? 0}
                                />
                            )}

                            {gameState.currentGame === 'CHAIN_REACTION' && (
                                <ChainReactionHost
                                    phase={(gameState.gameData.phase || 'WAITING') as 'WAITING' | 'ACTIVE' | 'RESULTS'}
                                    chain={gameState.gameData.chain || []}
                                    currentPlayerId={gameState.gameData.currentPlayerId}
                                    players={gameState.players}
                                    timer={gameState.gameData.timer ?? 0}
                                    failedPlayerId={gameState.gameData.failedPlayerId}
                                />
                            )}

                            {gameState.currentGame === 'MIND_MELD' && (
                                <MindMeldHost
                                    phase={(gameState.gameData.phase || 'PROMPT') as 'PROMPT' | 'ANSWERING' | 'MATCHING' | 'RESULTS'}
                                    prompt={gameState.gameData.prompt || ''}
                                    answers={gameState.gameData.answers || {}}
                                    matches={gameState.gameData.matches || []}
                                    players={gameState.players}
                                    timer={gameState.gameData.timer ?? 0}
                                />
                            )}

                            {gameState.currentGame === 'FINAL_BOSS_GAME' && (
                                <FinalBossHost
                                    phase={(gameState.gameData.phase || 'GENERATING') as 'GENERATING' | 'ROUND'}
                                    subMode={gameState.gameData.subMode as 'TRIVIA' | 'PROMPT_BATTLE' | 'GROUP_POLL'}
                                    title={gameState.gameData.title}
                                    tagline={gameState.gameData.tagline}
                                    currentRound={gameState.gameData.currentRound}
                                    answers={gameState.gameData.answers}
                                    showResult={!!gameState.gameData.showResult}
                                    timer={gameState.gameData.timer ?? 20}
                                    players={gameState.players}
                                    creator={gameState.gameData.creator}
                                />
                            )}

                            {gameState.currentGame === 'COMPETE' && (
                                <CompeteHost
                                    phase={(gameState.gameData.phase || 'COUNTDOWN') as 'COUNTDOWN' | 'SELECTING' | 'ACTIVE' | 'RESULTS'}
                                    challenger1Id={gameState.gameData.challenger1Id || ''}
                                    challenger2Id={gameState.gameData.challenger2Id || ''}
                                    challenge={gameState.gameData.challenge || { type: 'TAP', target: null }}
                                    progress={gameState.gameData.progress || {}}
                                    players={gameState.players}
                                    winnerId={gameState.gameData.winnerId}
                                    timer={gameState.gameData.timer ?? 0}
                                />
                            )}

                            {gameState.currentGame === 'BRAIN_BURST' && (
                                <BrainBurstHost
                                    phase={(gameState.gameData.phase || 'INTRO') as 'INTRO' | 'QUESTION' | 'REVEAL' | 'GAME_OVER' | 'CELEBRATION'}
                                    currentQuestion={gameState.gameData.currentQuestion || { q: '', a: [], correct: 0 }}
                                    tier={gameState.gameData.tier || { level: 0, prize: '', points: 0 }}
                                    tiers={gameState.gameData.tiers || []}
                                    timer={gameState.gameData.timer ?? 0}
                                    showResult={gameState.gameData.showResult ?? false}
                                    answers={gameState.gameData.answers || {}}
                                    fiftyFiftyDisabled={gameState.gameData.fiftyFiftyDisabled || []}
                                    questionIndex={gameState.gameData.questionIndex ?? 0}
                                    players={gameState.players}
                                    streaks={gameState.gameData.streaks || {}}
                                />
                            )}

                            {gameState.currentGame === 'GLOBAL_AVERAGES' && (
                                <GlobalAveragesHost
                                    phase={(gameState.gameData.phase || 'WAITING') as 'WAITING' | 'REVEAL'}
                                    question={gameState.gameData.question || ''}
                                    correct={gameState.gameData.correct ?? 0}
                                    guesses={gameState.gameData.guesses || {}}
                                    players={gameState.players}
                                    closestPid={gameState.gameData.closestPid}
                                    pointsAwarded={gameState.gameData.pointsAwarded}
                                />
                            )}

                            {gameState.currentGame === 'SKILL_SHOWDOWN' && (
                                <SkillShowdownHost
                                    phase={(gameState.gameData.phase || 'PREVIEW') as 'PREVIEW' | 'PLAYING' | 'REVEAL'}
                                    challengeIndex={gameState.gameData.challengeIndex ?? 0}
                                    challenge={gameState.gameData.challenge || { title: '', description: '', criteria: '' }}
                                    submissions={gameState.gameData.submissions || {}}
                                    scores={gameState.gameData.scores || {}}
                                    players={gameState.players}
                                />
                            )}

                            {/* Next Button */}
                            <motion.button
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                onClick={nextRound}
                                className="fixed bottom-8 left-1/2 -translate-x-1/2 px-10 py-4 bg-gradient-to-r from-[#ff00ff] to-[#00ffff] text-white font-bold text-xl md:text-2xl rounded-full shadow-[0_10px_30px_rgba(255,0,255,0.4)] hover:scale-105 transition-transform z-50"
                            >
                                NEXT →
                            </motion.button>
                        </>
                    )}

                    {gameState.status === 'FINAL_SUBMISSION' && (
                        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-20 text-center overflow-hidden">
                            <div className="absolute inset-0 z-0">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-[radial-gradient(circle_at_center,_#ff00ff15_0%,transparent_70%)]" />
                            </div>

                            <motion.div
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="z-10 mb-20"
                            >
                                <h2 className="text-8xl font-black text-white uppercase tracking-tighter mb-4 text-glow">
                                    THE FINALE
                                </h2>
                                <p className="text-3xl font-bold text-[#ff00ff] uppercase tracking-[0.4em] animate-pulse">
                                    Submit your Final Boss Idea
                                </p>
                            </motion.div>

                            <div className="z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 w-full max-w-7xl">
                                {(gameState.gameData?.ideas || []).map((idea: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0, rotate: -10 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="glass-card p-10 rounded-[2.5rem] border-2 border-[#ff00ff]/30 flex flex-col items-center justify-center space-y-4"
                                    >
                                        <div className="text-2xl font-black text-white line-clamp-2">"{idea.idea}"</div>
                                        <div className="text-xs font-bold text-white/30 uppercase tracking-widest">PROPOSED BY {idea.playerName}</div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
                                <div className="text-8xl font-black font-mono text-white/10">{gameState.gameData?.timer}S</div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => socket?.emit('gameInput', { action: 'START_FINAL_BOSS_GAME' })}
                                    className="px-20 py-8 bg-[#ff00ff] text-white font-black text-4xl rounded-full shadow-[0_0_50px_rgba(255,0,255,0.5)] uppercase tracking-widest cursor-pointer"
                                >
                                    UNLEASH THE BOSS
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* RESULTS STATE */}
                    {gameState.status === 'RESULTS' && (
                        <DramaticReveal
                            players={Object.values(gameState.players)}
                            onPlayAgain={startGame}
                            onNewPlayers={backToLobby}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default HostLogic;
