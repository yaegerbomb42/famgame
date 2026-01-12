import { useGame } from '../context/useGame';
import { motion, AnimatePresence } from 'framer-motion';
import TriviaHost from '../games/trivia/Host';
import TwoTruthsHost from '../games/two-truths/Host';
import HotTakesHost from '../games/hot-takes/Host';
import PollHost from '../games/poll/Host';
import BuzzHost from '../games/buzz/Host';
import WordRaceHost from '../games/word-race/Host';
import ReactionHost from '../games/reaction/Host';

const HostLogic = () => {
    const { gameState, startGame, socket } = useGame();

    if (!gameState) return (
        <div className="flex h-full items-center justify-center">
            <div className="w-16 h-16 border-4 border-game-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const selectGame = (gameId: string) => {
        socket?.emit('selectGame', gameId);
    };

    const nextRound = () => {
        socket?.emit('nextRound');
    }

    const backToLobby = () => {
        socket?.emit('backToLobby');
    }

    return (
        <div className="h-full flex flex-col relative z-20">
            {/* Header Bar */}
            <header className="flex justify-between items-center p-8 w-full">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                    <span className="font-mono text-sm uppercase tracking-widest text-white/50">Server Online</span>
                </div>

                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass px-8 py-3 rounded-full flex items-center gap-6"
                >
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-game-secondary">Join Code</span>
                        <span className="font-display text-4xl leading-none text-white tracking-widest">{gameState.roomCode}</span>
                    </div>
                </motion.div>

                <div className="w-32 flex justify-end">
                    {gameState.status === 'RESULTS' && (
                        <button onClick={backToLobby} className="text-sm font-bold opacity-50 hover:opacity-100 uppercase tracking-wider">Return to Lobby</button>
                    )}
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 flex flex-col relative">
                <AnimatePresence mode='wait'>
                    {gameState.status === 'LOBBY' && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                            className="flex-1 flex flex-col items-center justify-center"
                        >
                            <h2 className="text-6xl font-bold mb-8 text-center">
                                <span className="text-white/40">Waiting for </span>
                                <span className="gradient-text-primary">Players</span>
                            </h2>

                            <p className="text-2xl text-white/50 mb-16 font-mono">
                                Join with code: <span className="text-white font-bold text-4xl">{gameState.roomCode}</span>
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full px-8 mb-16">
                                <AnimatePresence>
                                    {Object.values(gameState.players).map((player) => (
                                        <motion.div
                                            key={player.id}
                                            layout
                                            initial={{ scale: 0, rotate: -10 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 10 }}
                                            className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center aspect-square shadow-[0_0_30px_rgba(217,70,239,0.15)] group relative"
                                        >
                                            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">👾</div>
                                            <div className="font-bold text-2xl truncate w-full text-center">{player.name}</div>
                                            <div className="text-sm text-white/30 uppercase mt-2 font-bold tracking-wider">
                                                {player.isHost ? '👑 Host' : 'Ready'}
                                            </div>
                                            {/* Kick button (not for self/host) */}
                                            {!player.isHost && (
                                                <button
                                                    onClick={() => socket?.emit('kickPlayer', player.id)}
                                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/20 hover:bg-red-500 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Kick player"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}

                                    {/* Ghost Cards for visual balance */}
                                    {Object.keys(gameState.players).length < 4 &&
                                        Array.from({ length: 4 - Object.keys(gameState.players).length }).map((_, i) => (
                                            <div key={`ghost-${i}`} className="border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center aspect-square opacity-50">
                                                <span className="font-mono text-sm text-white/20">WAITING...</span>
                                            </div>
                                        ))
                                    }
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-6">
                                {Object.keys(gameState.players).length > 0 ? (
                                    <motion.button
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={startGame}
                                        className="px-16 py-6 bg-white text-black font-black text-3xl rounded-full tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
                                    >
                                        START
                                    </motion.button>
                                ) : (
                                    <div className="text-white/20 font-mono text-xl animate-pulse">Scan QR or visit gamewithfam.vercel.app</div>
                                )}
                            </div>

                            <button
                                onClick={() => socket?.emit('leaveRoom')}
                                className="mt-8 text-white/30 hover:text-white/70 text-sm uppercase tracking-wider transition-colors"
                            >
                                Leave Room
                            </button>
                        </motion.div>
                    )}

                    {gameState.status === 'GAME_SELECT' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="flex-1 flex flex-col items-center justify-center"
                        >
                            <h2 className="text-5xl font-display mb-12 gradient-text-secondary">SELECT MODE</h2>
                            <div className="grid grid-cols-4 gap-6 w-full max-w-7xl">
                                <motion.button
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => selectGame('TRIVIA')}
                                    className="glass-card p-8 rounded-3xl text-left relative overflow-hidden group"
                                >
                                    <h3 className="text-xl font-bold mb-2">Trivia</h3>
                                    <p className="text-white/60 text-xs">Test your brain calls.</p>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => selectGame('2TRUTHS')}
                                    className="glass-card p-8 rounded-3xl text-left relative overflow-hidden group border-game-secondary/30"
                                >
                                    <h3 className="text-xl font-bold mb-2">2 Truths</h3>
                                    <p className="text-white/60 text-xs">Expose friends.</p>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => selectGame('HOT_TAKES')}
                                    className="glass-card p-8 rounded-3xl text-left relative overflow-hidden group border-game-accent/30"
                                >
                                    <h3 className="text-xl font-bold mb-2">Hot Takes</h3>
                                    <p className="text-white/60 text-xs">Spicy opinions.</p>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => selectGame('POLL')}
                                    className="glass-card p-8 rounded-3xl text-left relative overflow-hidden group border-green-500/30"
                                >
                                    <h3 className="text-xl font-bold mb-2">Poll Party</h3>
                                    <p className="text-white/60 text-xs">Judge everyone.</p>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => selectGame('BUZZ_IN')}
                                    className="glass-card p-8 rounded-3xl text-left relative overflow-hidden group border-red-500/30"
                                >
                                    <h3 className="text-xl font-bold mb-2">Buzz In</h3>
                                    <p className="text-white/60 text-xs">Reflex test.</p>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => selectGame('WORD_RACE')}
                                    className="glass-card p-8 rounded-3xl text-left relative overflow-hidden group border-yellow-500/30"
                                >
                                    <h3 className="text-xl font-bold mb-2">Word Race</h3>
                                    <p className="text-white/60 text-xs">Frenzied typing.</p>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => selectGame('REACTION')}
                                    className="glass-card p-8 rounded-3xl text-left relative overflow-hidden group border-blue-500/30"
                                >
                                    <h3 className="text-xl font-bold mb-2">Reaction</h3>
                                    <p className="text-white/60 text-xs">Pure speed.</p>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {gameState.status === 'PLAYING' && (
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
                        </>
                    )}

                    {gameState.gameData && (
                        <div className="absolute inset-x-0 bottom-12 flex justify-center z-50 pointer-events-auto">
                            <motion.button
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                onClick={nextRound}
                                className="bg-game-accent text-white px-10 py-4 rounded-full font-bold text-xl shadow-[0_10px_30px_rgba(255,0,85,0.4)] hover:scale-105 transition-transform"
                            >
                                NEXT
                            </motion.button>
                        </div>
                    )}

                    {gameState.status === 'RESULTS' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full"
                        >
                            <h2 className="text-6xl font-display mb-12 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm">LEADERBOARD</h2>
                            <div className="w-full space-y-4">
                                {Object.values(gameState.players).sort((a, b) => b.score - a.score).map((player, i) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`p-6 rounded-xl flex items-center justify-between ${i === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50' : 'glass-card'}`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className={`text-2xl font-black w-12 ${i === 0 ? 'text-yellow-400' : 'text-white/50'}`}>#{i + 1}</span>
                                            <span className="text-2xl font-bold">{player.name}</span>
                                        </div>
                                        <span className="text-3xl font-mono text-game-secondary">{player.score}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default HostLogic;
