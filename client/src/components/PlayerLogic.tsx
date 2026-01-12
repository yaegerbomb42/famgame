import { useState } from 'react';
import { useGame } from '../context/useGame';
import { motion, AnimatePresence } from 'framer-motion';
import TriviaPlayer from '../games/trivia/Player';
import TwoTruthsPlayer from '../games/two-truths/Player';
import HotTakesPlayer from '../games/hot-takes/Player';
import PollPlayer from '../games/poll/Player';
import BuzzPlayer from '../games/buzz/Player';
import WordRacePlayer from '../games/word-race/Player';
import ReactionPlayer from '../games/reaction/Player';
import EmojiStoryPlayer from '../games/emoji-story/Player';
import BluffPlayer from '../games/bluff/Player';
import ThisOrThatPlayer from '../games/this-or-that/Player';
import SpeedDrawPlayer from '../games/speed-draw/Player';
import ChainReactionPlayer from '../games/chain-reaction/Player';
import MindMeldPlayer from '../games/mind-meld/Player';
import CompetePlayer from '../games/compete/Player';

const PlayerLogic = () => {
    const { joinRoom, gameState, isConnected, socket } = useGame();
    const [name, setName] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        joinRoom(name, 'ABCD');
        setHasJoined(true);
    };

    const handleAnswer = (index: number) => {
        if (hasAnswered) return;
        socket?.emit('submitAnswer', index);
        setHasAnswered(true);
    }

    // 2 Truths Handlers
    const handleSubmitStatements = (data: { statements: string[], lieIndex: number }) => {
        socket?.emit('submitStatements', data);
    }

    const handleVoteLie = (index: number) => {
        socket?.emit('voteLie', index);
    }

    // Hot Takes Handlers
    const handleSubmitTake = (text: string) => {
        socket?.emit('submitTake', text);
    }

    const handleVoteTake = (targetId: string) => {
        socket?.emit('voteTake', targetId);
    }

    // Poll Handlers
    const handlePollVote = (targetId: string) => {
        socket?.emit('submitPollVote', targetId);
    }

    // Buzz Handler
    const handleBuzz = () => {
        socket?.emit('buzz');
    }

    // Word Race Handler
    const handleWordSubmit = (word: string) => {
        socket?.emit('submitWord', word);
    }

    // Reaction Handler
    const handleReactionTap = () => {
        socket?.emit('reactionClick');
    }

    // Emoji Story
    const handleEmojiSubmit = (story: string) => socket?.emit('emojiInput', story);
    const handleEmojiGuess = (guess: string) => socket?.emit('submitGuess', guess);

    // Bluff
    const handleBluffClaim = (data: { claim: string, isTruth: boolean }) => socket?.emit('submitClaim', data);
    const handleBluffVote = (isTruth: boolean) => socket?.emit('voteBluff', isTruth);

    // This or That
    const handleThisOrThatVote = (option: 'A' | 'B') => socket?.emit('voteOption', option);

    // Speed Draw
    const handleDrawingSubmit = (drawing: string) => socket?.emit('submitDrawing', drawing);
    const handleDrawingVote = (id: string) => socket?.emit('voteDrawing', id);

    // Chain Reaction
    const handleChainSubmit = (word: string) => socket?.emit('submitChainWord', word);

    // Mind Meld
    const handleMindMeldSubmit = (answer: string) => socket?.emit('submitMindMeldAnswer', answer);

    // Compete
    const handleCompeteProgress = (progress: number) => socket?.emit('competeProgress', progress);

    if (!isConnected) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-12 h-12 border-2 border-white/20 border-t-game-primary rounded-full animate-spin" />
                <p className="text-sm font-mono tracking-widest text-white/50">ESTABLISHING UPLINK...</p>
            </div>
        )
    }

    if (hasJoined && gameState) {
        const myName = gameState.players[socket?.id || '']?.name || name;
        const myScore = gameState.players[socket?.id || '']?.score || 0;

        return (
            <div className="w-full h-full flex flex-col bg-game-bg">
                {/* Mobile Header */}
                <div className="glass-card rounded-none border-x-0 border-t-0 p-4 flex justify-between items-center z-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-white/40 tracking-wider">Player</span>
                        <span className="font-bold text-lg leading-none max-w-[120px] truncate">{myName}</span>
                    </div>
                    <div className="glass px-4 py-2 rounded-full">
                        <span className="text-game-secondary font-mono font-bold">{myScore}</span>
                    </div>
                </div>

                <main className="flex-1 overflow-hidden relative p-4 flex flex-col">
                    <AnimatePresence mode='wait'>
                        {gameState.status === 'LOBBY' && (
                            <motion.div
                                key="lobby"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center space-y-6 text-center"
                            >
                                <div className="text-6xl animate-bounce">📱</div>
                                <h2 className="text-2xl font-bold gradient-text-primary">You're Connected</h2>
                                <p className="text-white/50 max-w-[200px]">Eyes on the big screen. The game will start soon.</p>
                            </motion.div>
                        )}

                        {gameState.status === 'GAME_SELECT' && (
                            <motion.div
                                key="select"
                                className="flex-1 flex flex-col items-center justify-center text-center opacity-50"
                            >
                                <div className="text-4xl mb-4 animate-spin-slow">⏳</div>
                                <p>Host is choosing a game...</p>
                            </motion.div>
                        )}

                        {gameState.status === 'PLAYING' && (
                            <>
                                {gameState.currentGame === 'TRIVIA' && (
                                    <div className="flex-1 flex flex-col">
                                        <TriviaPlayer
                                            onAnswer={handleAnswer}
                                            hasAnswered={hasAnswered && !gameState.gameData.showResult}
                                        />
                                        {gameState.gameData.showResult && (
                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-50">
                                                <div className="text-center">
                                                    <h2 className="text-3xl font-bold mb-2">Round Over</h2>
                                                    <p>Check the results.</p>
                                                    <button onClick={() => setHasAnswered(false)} className="mt-8 px-6 py-3 bg-white/10 rounded-full text-sm">Ready for Next</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {gameState.currentGame === '2TRUTHS' && (
                                    <TwoTruthsPlayer
                                        phase={gameState.gameData.phase}
                                        onSubmitStatements={handleSubmitStatements}
                                        onVote={handleVoteLie}
                                        isSubject={socket?.id === gameState.gameData.currentSubjectId}
                                    />
                                )}

                                {gameState.currentGame === 'HOT_TAKES' && (
                                    <HotTakesPlayer
                                        phase={gameState.gameData.phase}
                                        prompt={gameState.gameData.prompt}
                                        inputs={gameState.gameData.inputs}
                                        onSubmit={handleSubmitTake}
                                        onVote={handleVoteTake}
                                        myId={socket?.id || ''}
                                    />
                                )}

                                {gameState.currentGame === 'POLL' && (
                                    <PollPlayer
                                        phase={gameState.gameData.phase}
                                        prompt={gameState.gameData.prompt}
                                        players={gameState.players}
                                        onVote={handlePollVote}
                                        myId={socket?.id || ''}
                                    />
                                )}

                                {gameState.currentGame === 'BUZZ_IN' && (
                                    <BuzzPlayer
                                        phase={gameState.gameData.phase}
                                        onBuzz={handleBuzz}
                                    />
                                )}

                                {gameState.currentGame === 'WORD_RACE' && (
                                    <WordRacePlayer
                                        category={gameState.gameData.category || ''}
                                        onSubmit={handleWordSubmit}
                                    />
                                )}

                                {gameState.currentGame === 'REACTION' && (
                                    <ReactionPlayer
                                        phase={gameState.gameData.phase}
                                        onTap={handleReactionTap}
                                    />
                                )}

                                {gameState.currentGame === 'EMOJI_STORY' && (
                                    <EmojiStoryPlayer
                                        phase={gameState.gameData.phase}
                                        prompt={gameState.gameData.prompt}
                                        currentEmojis={gameState.gameData.currentEmojis}
                                        isMyStory={socket?.id === gameState.gameData.currentStorytellerId}
                                        onSubmitStory={handleEmojiSubmit}
                                        onSubmitGuess={handleEmojiGuess}
                                    />
                                )}

                                {gameState.currentGame === 'BLUFF' && (
                                    <BluffPlayer
                                        phase={gameState.gameData.phase}
                                        isMyTurn={socket?.id === gameState.gameData.currentClaimerId}
                                        claim={gameState.gameData.claim}
                                        claimerName={gameState.players[gameState.gameData.currentClaimerId]?.name}
                                        onSubmitClaim={(claim, isTruth) => handleBluffClaim({ claim, isTruth })}
                                        onVote={handleBluffVote}
                                    />
                                )}

                                {gameState.currentGame === 'THIS_OR_THAT' && (
                                    <ThisOrThatPlayer
                                        phase={gameState.gameData.phase}
                                        optionA={gameState.gameData.optionA}
                                        optionB={gameState.gameData.optionB}
                                        onVote={handleThisOrThatVote}
                                    />
                                )}

                                {gameState.currentGame === 'SPEED_DRAW' && (
                                    <SpeedDrawPlayer
                                        phase={gameState.gameData.phase}
                                        prompt={gameState.gameData.prompt}
                                        drawings={gameState.gameData.drawings}
                                        players={gameState.players}
                                        timer={gameState.gameData.timer}
                                        onSubmitDrawing={handleDrawingSubmit}
                                        onVote={handleDrawingVote}
                                        myId={socket?.id || ''}
                                    />
                                )}

                                {gameState.currentGame === 'CHAIN_REACTION' && (
                                    <ChainReactionPlayer
                                        phase={gameState.gameData.phase}
                                        lastWord={gameState.gameData.chain && gameState.gameData.chain.length ? gameState.gameData.chain[gameState.gameData.chain.length - 1].word : ''}
                                        isMyTurn={socket?.id === gameState.gameData.currentPlayerId}
                                        onSubmitWord={handleChainSubmit}
                                        timer={gameState.gameData.timer}
                                    />
                                )}

                                {gameState.currentGame === 'MIND_MELD' && (
                                    <MindMeldPlayer
                                        phase={gameState.gameData.phase}
                                        prompt={gameState.gameData.prompt}
                                        onSubmitAnswer={handleMindMeldSubmit}
                                        timer={gameState.gameData.timer}
                                    />
                                )}

                                {gameState.currentGame === 'COMPETE' && (
                                    <CompetePlayer
                                        phase={gameState.gameData.phase}
                                        challenge={gameState.gameData.challenge}
                                        isCompeting={socket?.id === gameState.gameData.challenger1Id || socket?.id === gameState.gameData.challenger2Id}
                                        timer={gameState.gameData.timer}
                                        onProgress={handleCompeteProgress}
                                        amWinner={socket?.id === gameState.gameData.winnerId}
                                    />
                                )}
                            </>
                        )}

                        {gameState.status === 'RESULTS' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <h2 className="text-4xl font-display text-game-accent mb-4">FINISH!</h2>
                                <div className="glass p-8 rounded-full w-48 h-48 flex items-center justify-center flex-col border-4 border-game-secondary">
                                    <span className="text-sm uppercase text-white/40 mb-2">Final Score</span>
                                    <span className="text-5xl font-mono font-bold">{myScore}</span>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        )
    }

    // Join Screen
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 relative">
            <div className="w-full max-w-sm space-y-8 relative z-10">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-display gradient-text-secondary">JOIN</h1>
                    <p className="text-white/40 tracking-widest text-sm uppercase">Enter the arena</p>
                </div>

                <form onSubmit={handleJoin} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="NAME"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-game-surface border border-white/10 rounded-2xl px-6 py-6 text-center text-2xl font-bold focus:outline-none focus:border-game-primary/50 focus:bg-white/5 transition-all text-white placeholder-white/20"
                            maxLength={10}
                            autoFocus
                        />
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full bg-game-primary text-white font-bold text-xl py-6 rounded-2xl shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:shadow-[0_0_50px_rgba(217,70,239,0.5)] transition-all"
                    >
                        START
                    </motion.button>
                </form>
            </div>
        </div>
    );
};

export default PlayerLogic;
