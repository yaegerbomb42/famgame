import { useGame } from '../context/useGame';
import { useEffect, useRef } from 'react';
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
import BrainBurstHost from '../games/brain-burst/Host';

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
];

// Narrator — speaks text via Web Speech API
const narrate = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.1;
    // Pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google UK English Male') || v.name.includes('Daniel'));
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
};

const HostLogic = () => {
    const { gameState, startGame, socket, isConnected } = useGame();
    const lastNarratedRef = useRef<string>('');

    // Create room when host mounts and is connected
    useEffect(() => {
        if (isConnected && socket && (!gameState || !gameState.roomCode)) {
            socket.emit('createRoom', { name: 'Host' });
        }
    }, [isConnected, socket]);

    // Narrator — auto-narrate game events
    useEffect(() => {
        if (!gameState?.gameData || gameState.currentGame !== 'BRAIN_BURST') return;
        const { phase, currentQuestion, tier, questionIndex } = gameState.gameData;
        let text = '';
        if (phase === 'INTRO') {
            text = 'Welcome to Brain Burst! Get ready for 10 questions worth up to one million dollars!';
        } else if (phase === 'QUESTION' && currentQuestion) {
            text = `Question ${(questionIndex || 0) + 1}, for ${tier?.prize || 'points'}. ${currentQuestion.q}`;
        } else if (phase === 'REVEAL' && currentQuestion) {
            const correctAnswer = currentQuestion.a[currentQuestion.correct];
            text = `The answer is: ${correctAnswer}`;
        } else if (phase === 'GAME_OVER') {
            text = 'Game over! Let\'s see the final scores!';
        }
        if (text && text !== lastNarratedRef.current) {
            lastNarratedRef.current = text;
            narrate(text);
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
    const playerCount = Object.values(gameState.players).filter(p => !p.isHost).length;

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0518] text-white overflow-auto">
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

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
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
                            <div className="flex flex-row items-center justify-between w-full mb-8">
                                {/* Join Section Left */}
                                <div className="flex flex-row items-center gap-8 glass-card p-6 rounded-[2rem] border-2 border-white/10 shadow-2xl">
                                    <div className="bg-white p-2 rounded-2xl">
                                        <QRCode url={joinUrl} size={150} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xl text-white/50 mb-1 uppercase tracking-widest font-black">Scan to Join</p>
                                        <p className="text-sm text-game-secondary mb-2 uppercase tracking-widest">gamewithfam.vercel.app</p>
                                    </div>
                                </div>

                                {/* Room Code Center-Right */}
                                <div className="text-center flex flex-col items-center">
                                    <p className="text-2xl text-white/40 mb-2 uppercase tracking-[0.5em] font-black">Room Code</p>
                                    <div className="text-8xl md:text-9xl leading-none font-black tracking-[0.1em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-pulse-glow">
                                        {gameState.roomCode}
                                    </div>
                                </div>
                            </div>

                            {/* Players Section */}
                            <div className="w-full flex-1 flex flex-col min-h-0 bg-black/20 rounded-[3rem] p-8 border-2 border-white/5">
                                <h2 className="text-4xl md:text-5xl font-black text-center mb-8 uppercase tracking-[0.2em]">
                                    <span className="text-white/40">Players </span>
                                    <span className="text-[#f9ca24]">({playerCount})</span>
                                </h2>

                                {playerCount === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 opacity-20 border-4 border-dashed border-white/10 rounded-[4rem] m-4">
                                        <div className="text-9xl animate-bounce">📱</div>
                                        <p className="text-4xl font-black uppercase tracking-widest">Waiting for players...</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
                                            {Object.values(gameState.players).filter(p => !p.isHost).map((player) => (
                                                <motion.div
                                                    key={player.id}
                                                    layout
                                                    initial={{ scale: 0, y: 20 }}
                                                    animate={{ scale: 1, y: 0 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                    className="glass-card p-4 md:p-6 rounded-[1.5rem] flex flex-col items-center justify-center relative group border-2 border-white/20 shadow-xl hover:border-[#00d4ff]/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all bg-white/5"
                                                >
                                                    <div className="text-5xl md:text-6xl mb-3 transform group-hover:scale-125 group-hover:-rotate-12 transition-transform drop-shadow-lg">
                                                        {player.avatar || '👾'}
                                                    </div>
                                                    <div className="font-black text-lg md:text-xl truncate w-full text-center uppercase tracking-tight text-white">
                                                        {player.name}
                                                    </div>
                                                    <button
                                                        onClick={() => socket?.emit('kickPlayer', player.id)}
                                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110"
                                                    >
                                                        <span className="text-xl font-black">✕</span>
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Start Button - ALWAYS VISIBLE */}
                            <div className="py-6 shrink-0 w-full flex justify-center mt-4">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startBrainBurst}
                                    disabled={playerCount === 0}
                                    className={`text-white text-3xl md:text-5xl font-black px-12 md:px-20 py-6 md:py-8 rounded-[2.5rem] uppercase tracking-widest border-t-4 border-white/20 transition-all ${playerCount === 0
                                        ? 'bg-white/10 opacity-30 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-[#f9ca24] to-[#f0932b] shadow-[0_0_60px_rgba(249,202,36,0.6)] hover:shadow-[0_0_100px_rgba(249,202,36,0.9)] animate-pulse-glow hover:scale-105'
                                        }`}
                                >
                                    {playerCount === 0 ? 'Waiting...' : '🚀 Start Brain Burst'}
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
                            className="flex-1 flex flex-col items-center p-8 w-full max-w-7xl"
                        >
                            <h1 className="text-6xl md:text-9xl font-black mb-12 text-glow gradient-text-primary uppercase tracking-tighter">
                                Pick Your Battle
                            </h1>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                                {GAMES.map((game) => (
                                    <motion.button
                                        key={game.id}
                                        whileHover={{ scale: 1.05, y: -10 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectGame(game.id)}
                                        className="glass-card p-10 rounded-[2.5rem] flex flex-col items-center justify-center space-y-6 transition-all hover:border-game-primary border-4 border-white/5 group relative overflow-hidden"
                                        style={{ borderColor: `${game.color}40` }}
                                    >
                                        <div className="text-8xl md:text-[9rem] mb-4 drop-shadow-2xl transform group-hover:rotate-12 transition-transform">
                                            {game.icon}
                                        </div>
                                        <div className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white/90 group-hover:text-white group-hover:text-glow">
                                            {game.name}
                                        </div>
                                        <div className="bg-white/10 px-8 py-3 rounded-full text-xl font-black text-white/40 uppercase tracking-[0.2em] group-hover:bg-game-primary group-hover:text-white transition-colors">
                                            SELECT
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* PLAYING STATE */}
                    {gameState.status === 'PLAYING' && gameState.gameData && (
                        <>
                            {gameState.currentGame === 'TRIVIA' && (
                                <TriviaHost
                                    question={gameState.gameData.question.q}
                                    answers={gameState.gameData.question.a}
                                    timer={gameState.gameData.timer}
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
                                    scores={gameState.gameData.scores}
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
                                    timer={gameState.gameData.timer}
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
                                    timer={gameState.gameData.timer}
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
                                    timer={gameState.gameData.timer}
                                />
                            )}

                            {gameState.currentGame === 'BRAIN_BURST' && (
                                <BrainBurstHost
                                    phase={gameState.gameData.phase}
                                    currentQuestion={gameState.gameData.currentQuestion}
                                    tier={gameState.gameData.tier}
                                    tiers={gameState.gameData.tiers}
                                    timer={gameState.gameData.timer}
                                    showResult={gameState.gameData.showResult}
                                    answers={gameState.gameData.answers}
                                    fiftyFiftyDisabled={gameState.gameData.fiftyFiftyDisabled}
                                    questionIndex={gameState.gameData.questionIndex}
                                    players={gameState.players}
                                    streaks={gameState.gameData.streaks}
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

                    {/* RESULTS STATE */}
                    {gameState.status === 'RESULTS' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-2xl text-center"
                        >
                            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">
                                🏆 LEADERBOARD 🏆
                            </h2>

                            <div className="space-y-4">
                                {Object.values(gameState.players)
                                    .sort((a, b) => b.score - a.score)
                                    .map((player, i) => (
                                        <motion.div
                                            key={player.id}
                                            initial={{ x: -50, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`p-6 rounded-2xl flex items-center justify-between ${i === 0
                                                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50'
                                                : 'glass-card'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 md:gap-6">
                                                <span className={`text-3xl md:text-4xl font-black ${i === 0 ? 'text-yellow-400' : 'text-white/50'}`}>
                                                    #{i + 1}
                                                </span>
                                                <span className="text-2xl md:text-3xl font-bold">{player.name}</span>
                                            </div>
                                            <span className="text-3xl md:text-4xl font-mono text-[#00ffff]">{player.score}</span>
                                        </motion.div>
                                    ))}
                            </div>

                            <div className="flex gap-6 justify-center mt-12">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startGame}
                                    className="px-10 py-5 bg-white text-black font-bold text-xl md:text-2xl rounded-full"
                                >
                                    Play Again
                                </motion.button>
                                <button
                                    onClick={backToLobby}
                                    className="px-10 py-5 border-2 border-white/30 text-white font-bold text-xl md:text-2xl rounded-full hover:border-white/50 transition-colors"
                                >
                                    New Players
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default HostLogic;
