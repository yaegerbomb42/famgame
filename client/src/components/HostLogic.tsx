import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useSound } from '../context/SoundContext';
import confetti from 'canvas-confetti';
import { usePersona } from '../context/PersonaContext';
import { ChatPanel } from './ChatPanel';

const GAME_PERSONA_KEYS: Record<string, string> = {
    TRIVIA: 'TRIVIA_SELECT',
    '2TRUTHS': 'TWO_TRUTHS_SELECT',
    HOT_TAKES: 'HOT_TAKES_SELECT',
    POLL: 'POLL_PARTY_SELECT',
    BUZZ_IN: 'BUZZ_IN_SELECT',
    WORD_RACE: 'WORD_RACE_SELECT',
    REACTION: 'REACTION_SELECT',
    EMOJI_STORY: 'EMOJI_STORY_SELECT',
    BLUFF: 'BLUFF_SELECT',
    THIS_OR_THAT: 'THIS_OR_THAT_SELECT',
    SPEED_DRAW: 'SPEED_DRAW_SELECT',
    CHAIN_REACTION: 'CHAIN_REACTION_SELECT',
    MIND_MELD: 'MIND_MELD_SELECT',
    COMPETE: 'COMPETE_SELECT',
};

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
];

const HostLogic = () => {
    const { gameState, createRoom, selectGame, nextRound, backToLobby, startGame } = useGameStore();
    const { playSuccess, setBGM } = useSound();
    const { speak } = usePersona();
    const lastStatus = useRef<string | null>(null);
    const lastGame = useRef<string | null>(null);
    const lastPlayerCount = useRef(0);

    useEffect(() => {
        if (gameState?.status === 'RESULTS') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff00ff', '#00ffff', '#fed330']
            });
            playSuccess();
        }
    }, [gameState?.status, playSuccess]);

    useEffect(() => {
        if (!gameState) return;
        const playerCount = Object.values(gameState.players).filter(p => !p.isHost).length;

        if (gameState.status !== lastStatus.current) {
            if (gameState.status === 'GAME_SELECT') {
                speak('GAME_START');
            }
            if (gameState.status === 'LOBBY') {
                speak('LOBBY_WAITING');
            }
            lastStatus.current = gameState.status;
        }

        if (gameState.status === 'LOBBY' && playerCount > lastPlayerCount.current) {
            speak('LOBBY_JOIN');
        }

        if (gameState.currentGame && gameState.currentGame !== lastGame.current) {
            const key = GAME_PERSONA_KEYS[gameState.currentGame] ?? 'GAME_START';
            speak(key as any);
            lastGame.current = gameState.currentGame;
        }

        lastPlayerCount.current = playerCount;
    }, [gameState, speak]);

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
    const players = Object.values(gameState.players).filter(p => !p.isHost);
    const playerCount = players.length;

    return (
        <div className="min-h-screen flex flex-col bg-game-bg text-white overflow-hidden">
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="w-full max-w-7xl flex flex-col items-center"
                        >
                            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 mb-16 w-full">
                                <motion.div 
                                    whileHover={{ scale: 1.05, rotate: -2 }}
                                    className="p-10 bg-white rounded-[3rem] border-[12px] border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.1)]"
                                >
                                    <QRCode url={joinUrl} size={280} />
                                    <p className="mt-8 text-3xl font-black text-black text-center uppercase tracking-[0.2em]">Scan to join</p>
                                </motion.div>

                                <div className="text-center">
                                    <p className="text-4xl text-white/20 mb-4 uppercase tracking-[0.5em] font-black">Room Code</p>
                                    <div className="text-[14rem] md:text-[20rem] leading-none font-black tracking-tighter text-white drop-shadow-[0_0_80px_rgba(0,255,255,0.3)] animate-pulse-glow">
                                        {gameState.roomCode}
                                    </div>
                                    <p className="text-3xl font-black text-game-secondary mt-6 uppercase tracking-widest bg-white/5 py-3 px-8 rounded-full border border-white/10">
                                        gamewithfam.vercel.app
                                    </p>
                                </div>
                            </div>

                            <div className="w-full max-w-5xl">
                                <h2 className="text-5xl font-black text-center mb-10 uppercase tracking-widest">
                                    <span className="text-white/20">Party Members </span>
                                    <span className="text-game-primary drop-shadow-[0_0_20px_rgba(255,0,255,0.5)]">({playerCount})</span>
                                </h2>

                                {playerCount === 0 ? (
                                    <div className="h-64 flex flex-col items-center justify-center space-y-6 bg-white/5 border-4 border-dashed border-white/10 rounded-[4rem] animate-pulse">
                                        <div className="text-8xl">📱</div>
                                        <p className="text-3xl font-black uppercase tracking-widest text-white/20">Waiting for first player...</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                        {players.map((player, i) => (
                                            <motion.div
                                                key={player.id}
                                                initial={{ scale: 0, y: 20 }}
                                                animate={{ scale: 1, y: 0 }}
                                                transition={{ type: "spring", delay: i * 0.1 }}
                                                className="bg-white/5 p-8 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-white/10 shadow-xl group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-game-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="text-7xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform z-10">
                                                    {player.avatar || '👾'}
                                                </div>
                                                <div className="font-black text-xl truncate w-full text-center uppercase tracking-tight z-10">
                                                    {player.name}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-16">
                                <motion.button
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={startGame}
                                    disabled={playerCount === 0}
                                    className={`text-4xl md:text-6xl font-black px-20 py-8 rounded-[3rem] uppercase tracking-[0.2em] border-t-8 border-white/20 transition-all ${
                                        playerCount === 0
                                            ? 'bg-white/10 opacity-30 cursor-not-allowed'
                                            : 'bg-game-primary shadow-[0_0_100px_rgba(255,0,255,0.4)] hover:shadow-[0_0_150px_rgba(255,0,255,0.7)]'
                                    }`}
                                >
                                    {playerCount === 0 ? 'Need Players' : 'LFG! 🚀'}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* GAME SELECT */}
                    {gameState.status === 'GAME_SELECT' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="flex-1 flex flex-col items-center w-full max-w-7xl"
                        >
                            <h1 className="text-7xl md:text-9xl font-black mb-16 uppercase tracking-tighter text-center">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary drop-shadow-[0_0_50px_rgba(255,0,255,0.3)]">CHOOSE GAME</span>
                            </h1>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full overflow-y-auto px-4 pb-12 custom-scrollbar">
                                {GAMES.map((game, i) => (
                                    <motion.button
                                        key={game.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.05, y: -8, borderColor: game.color }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectGame(game.id)}
                                        className="bg-white/5 p-10 rounded-[3rem] flex flex-col items-center justify-center gap-6 border-4 border-white/5 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="text-8xl drop-shadow-2xl transform group-hover:rotate-12 transition-transform">
                                            {game.icon}
                                        </div>
                                        <div className="text-3xl font-black uppercase tracking-widest">
                                            {game.name}
                                        </div>
                                        <div 
                                            className="px-8 py-3 rounded-full text-lg font-black uppercase tracking-widest transition-colors bg-white/10 group-hover:bg-white group-hover:text-black"
                                        >
                                            Play
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* PLAYING */}
                    {gameState.status === 'PLAYING' && gameState.gameData && (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                            {gameState.currentGame === 'TRIVIA' && (
                                <TriviaHost
                                    question={gameState.gameData.question.q}
                                    answers={gameState.gameData.question.a}
                                    timer={gameState.timer || 0}
                                    showResult={gameState.gameData.showResult}
                                    correctIndex={gameState.gameData.question.correct}
                                />
                            )}
                            {gameState.currentGame === '2TRUTHS' && (
                                <TwoTruthsHost
                                    phase={gameState.gameData.phase}
                                    inputs={gameState.gameData.inputs}
                                    currentSubjectId={gameState.gameData.currentSubjectId}
                                    players={gameState.players}
                                    votes={gameState.gameData.votes}
                                    showLie={gameState.gameData.showLie}
                                />
                            )}
                            {gameState.currentGame === 'HOT_TAKES' && (
                                <HotTakesHost
                                    phase={gameState.gameData.phase}
                                    prompt={gameState.gameData.prompt}
                                    inputs={gameState.gameData.inputs}
                                    players={gameState.players}
                                    votes={gameState.gameData.votes}
                                />
                            )}
                            {gameState.currentGame === 'POLL' && (
                                <PollHost
                                    phase={gameState.gameData.phase}
                                    prompt={gameState.gameData.prompt}
                                    players={gameState.players}
                                    votes={gameState.gameData.votes}
                                />
                            )}
                            {gameState.currentGame === 'BUZZ_IN' && (
                                <BuzzHost
                                    phase={gameState.gameData.phase}
                                    winnerId={gameState.gameData.winnerId}
                                    players={gameState.players}
                                />
                            )}
                            {gameState.currentGame === 'WORD_RACE' && (
                                <WordRaceHost
                                    category={gameState.gameData.category}
                                    words={gameState.gameData.words}
                                    players={gameState.players}
                                />
                            )}
                            {gameState.currentGame === 'REACTION' && (
                                <ReactionHost
                                    phase={gameState.gameData.phase}
                                    results={gameState.gameData.results}
                                    players={gameState.players}
                                />
                            )}
                            {gameState.currentGame === 'EMOJI_STORY' && (
                                <EmojiStoryHost
                                    phase={gameState.gameData.phase}
                                    currentStory={gameState.gameData.currentStory}
                                    inputs={gameState.gameData.inputs}
                                    guesses={gameState.gameData.guesses}
                                    players={gameState.players}
                                    correctAnswer={gameState.gameData.correctAnswer}
                                />
                            )}
                            {gameState.currentGame === 'BLUFF' && (
                                <BluffHost
                                    phase={gameState.gameData.phase}
                                    currentClaimerId={gameState.gameData.currentClaimerId}
                                    claim={gameState.gameData.claim}
                                    isLying={gameState.gameData.isLying}
                                    votes={gameState.gameData.votes}
                                    players={gameState.players}
                                />
                            )}
                            {gameState.currentGame === 'THIS_OR_THAT' && (
                                <ThisOrThatHost
                                    phase={gameState.gameData.phase}
                                    optionA={gameState.gameData.optionA}
                                    optionB={gameState.gameData.optionB}
                                    votes={gameState.gameData.votes}
                                    players={gameState.players}
                                />
                            )}
                            {gameState.currentGame === 'SPEED_DRAW' && (
                                <SpeedDrawHost
                                    phase={gameState.gameData.phase}
                                    prompt={gameState.gameData.prompt}
                                    drawings={gameState.gameData.drawings}
                                    votes={gameState.gameData.votes}
                                    players={gameState.players}
                                    timer={gameState.timer || 0}
                                />
                            )}
                            {gameState.currentGame === 'CHAIN_REACTION' && (
                                <ChainReactionHost
                                    phase={gameState.gameData.phase}
                                    chain={gameState.gameData.chain}
                                    currentPlayerId={gameState.gameData.currentPlayerId}
                                    players={gameState.players}
                                    timer={gameState.gameData.timer}
                                    failedPlayerId={gameState.gameData.failedPlayerId}
                                />
                            )}
                            {gameState.currentGame === 'MIND_MELD' && (
                                <MindMeldHost
                                    phase={gameState.gameData.phase}
                                    prompt={gameState.gameData.prompt}
                                    answers={gameState.gameData.answers}
                                    matches={gameState.gameData.matches}
                                    players={gameState.players}
                                    timer={gameState.timer || 0}
                                />
                            )}
                            {gameState.currentGame === 'COMPETE' && (
                                <CompeteHost
                                    phase={gameState.gameData.phase}
                                    challenger1Id={gameState.gameData.challenger1Id}
                                    challenger2Id={gameState.gameData.challenger2Id}
                                    challenge={gameState.gameData.challenge}
                                    progress={gameState.gameData.progress}
                                    players={gameState.players}
                                    winnerId={gameState.gameData.winnerId}
                                    timer={gameState.timer || 0}
                                />
                            )}

                            {/* Global Game Controls */}
                            <motion.button
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                onClick={nextRound}
                                className="fixed bottom-12 px-12 py-6 bg-white text-black font-black text-2xl rounded-full shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-95 transition-all uppercase tracking-widest z-50"
                            >
                                Next Step ➔
                            </motion.button>
                        </div>
                    )}

                    {/* RESULTS */}
                    {gameState.status === 'RESULTS' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-4xl text-center"
                        >
                            <h2 className="text-7xl md:text-9xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_30px_rgba(250,204,21,0.4)] uppercase tracking-tighter">
                                Hall of Fame
                            </h2>

                            <div className="space-y-6">
                                {Object.values(gameState.players)
                                    .filter(p => !p.isHost)
                                    .sort((a, b) => b.score - a.score)
                                    .map((player, i) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ x: -100, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1, type: "spring" }}
                                            className={`p-8 rounded-[2.5rem] flex items-center justify-between border-4 ${
                                                i === 0
                                                    ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)]'
                                                    : 'bg-white/5 border-white/5'
                                            }`}
                                        >
                                            <div className="flex items-center gap-8">
                                                <span className={`text-5xl font-black ${i === 0 ? 'text-yellow-500' : 'text-white/20'}`}>
                                                    {i + 1}
                                                </span>
                                                <div className="text-6xl">{player.avatar}</div>
                                                <span className="text-4xl font-black uppercase tracking-tight">{player.name}</span>
                                            </div>
                                            <span className="text-5xl font-black font-mono text-game-secondary">
                                                {player.score.toLocaleString()}
                                            </span>
                                        </motion.div>
                                    ))}
                            </div>

                            <div className="flex gap-8 justify-center mt-20">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={startGame}
                                    className="px-16 py-8 bg-game-primary text-white font-black text-3xl rounded-[2rem] uppercase tracking-widest shadow-[0_0_60px_rgba(255,0,255,0.4)]"
                                >
                                    Play Again
                                </motion.button>
                                <button
                                    onClick={backToLobby}
                                    className="px-16 py-8 bg-white/5 border-4 border-white/10 text-white font-black text-3xl rounded-[2rem] uppercase tracking-widest hover:bg-white/10 transition-colors"
                                >
                                    New Crew
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            <ChatPanel variant="host" />
        </div>
    );
};

export default HostLogic;
