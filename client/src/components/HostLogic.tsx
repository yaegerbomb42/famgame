import { useGame } from '../context/useGame';
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
];

const HostLogic = () => {
    const { gameState, startGame, socket } = useGame();

    if (!gameState) return (
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

    const leaveRoom = () => {
        socket?.emit('leaveRoom');
        window.location.reload();
    };

    const joinUrl = `https://gamewithfam.vercel.app?code=${gameState.roomCode}`;
    const playerCount = Object.keys(gameState.players).length;

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
                            {/* Join Section - Large for TV */}
                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-12">
                                {/* QR Code */}
                                <div className="flex flex-col items-center">
                                    <QRCode url={joinUrl} size={180} />
                                    <p className="mt-4 text-lg text-white/50">Scan to join</p>
                                </div>

                                {/* OR */}
                                <div className="text-3xl font-bold text-white/20">OR</div>

                                {/* Room Code */}
                                <div className="text-center">
                                    <p className="text-xl md:text-2xl text-white/50 mb-2">Go to</p>
                                    <p className="text-2xl md:text-3xl font-mono text-[#00ffff] mb-4">gamewithfam.vercel.app</p>
                                    <p className="text-xl md:text-2xl text-white/50 mb-2">Enter code</p>
                                    <div className="text-6xl md:text-8xl font-black tracking-[0.2em] text-white">
                                        {gameState.roomCode}
                                    </div>
                                </div>
                            </div>

                            {/* Players Grid */}
                            <div className="w-full mb-8">
                                <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
                                    <span className="text-white/40">Players </span>
                                    <span className="text-[#ff00ff]">({playerCount})</span>
                                </h2>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                                    {Object.values(gameState.players).map((player) => (
                                        <motion.div
                                            key={player.id}
                                            layout
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="glass-card p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center aspect-square relative group"
                                        >
                                            <div className="text-4xl md:text-6xl mb-2">👾</div>
                                            <div className="font-bold text-lg md:text-2xl truncate w-full text-center">{player.name}</div>
                                            {player.isHost && <div className="text-xs text-yellow-400">👑 Host</div>}
                                            {!player.isHost && (
                                                <button
                                                    onClick={() => socket?.emit('kickPlayer', player.id)}
                                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/20 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}

                                    {playerCount === 0 && (
                                        <div className="col-span-full text-center py-12 text-2xl text-white/30">
                                            Waiting for players to join...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col items-center gap-6">
                                {playerCount > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={startGame}
                                        className="px-12 md:px-20 py-5 md:py-7 bg-white text-black font-black text-2xl md:text-4xl rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all"
                                    >
                                        START GAME
                                    </motion.button>
                                )}

                                <button
                                    onClick={leaveRoom}
                                    className="text-lg md:text-xl text-white/40 hover:text-red-400 transition-colors"
                                >
                                    Leave Room
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* GAME SELECT STATE */}
                    {gameState.status === 'GAME_SELECT' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full max-w-6xl"
                        >
                            <h2 className="text-4xl md:text-6xl font-bold text-center mb-8 md:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00ffff]">
                                SELECT A GAME
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                                {GAMES.map((game) => (
                                    <motion.button
                                        key={game.id}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectGame(game.id)}
                                        className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl text-center hover:border-white/30 transition-all"
                                        style={{ borderColor: `${game.color}30` }}
                                    >
                                        <div className="text-4xl md:text-6xl mb-3">{game.icon}</div>
                                        <h3 className="text-xl md:text-2xl font-bold">{game.name}</h3>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={backToLobby}
                                    className="text-lg text-white/40 hover:text-white/70 transition-colors"
                                >
                                    ← Back to Lobby
                                </button>
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
