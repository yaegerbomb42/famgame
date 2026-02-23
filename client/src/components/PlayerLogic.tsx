import { useState, useEffect, useRef } from 'react';
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
import BrainBurstPlayer from '../games/brain-burst/Player';

const AVATARS = ['🙂', '😂', '😎', '🤔', '😍', '🤩', '🤯', '🥳', '👻', '👽', '🤖', '💩', '🐱', '🐶', '🦄', '🐲'];

const PlayerLogic = () => {
    const { joinRoom, gameState, isConnected, socket } = useGame();
    const [joinStep, setJoinStep] = useState<'CODE' | 'DETAILS'>('CODE');
    const [roomCode, setRoomCode] = useState('');
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('🙂');
    const [hasJoined, setHasJoined] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);

    const autoFillAttempted = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code && code.length === 4 && !autoFillAttempted.current) {
            autoFillAttempted.current = true;
            // Use setTimeout to avoid cascading render warning in dev
            setTimeout(() => {
                setRoomCode(code.toUpperCase());
                setJoinStep('DETAILS');
            }, 0);
        }
    }, [setRoomCode]);

    // Listen for server errors
    useEffect(() => {
        if (!socket) return;
        const handleError = (err: { message: string }) => {
            console.error('Server error:', err.message);
            alert(`Error: ${err.message}`);
        };
        socket.on('error', handleError);
        return () => {
            socket.off('error', handleError);
        };
    }, [socket]);

    const handleCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomCode.length === 4) {
            setJoinStep('DETAILS');
        }
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        joinRoom(name, roomCode.toUpperCase(), avatar);
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
    const handleBluffClaim = (data: { claim: string, isLying: boolean }) => socket?.emit('submitClaim', data);
    const handleBluffVote = (thinkingLying: boolean) => socket?.emit('voteBluff', thinkingLying);

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

    // Brain Burst
    const handleBrainBurstAnswer = (index: number) => socket?.emit('submitBrainBurstAnswer', index);
    const handleBrainBurstLifeline = () => socket?.emit('useBrainBurstLifeline');

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
        const myAvatar = gameState.players[socket?.id || '']?.avatar || avatar; // Fallback to local avatar if not in state yet

        return (
            <div className="w-full h-full flex flex-col bg-game-bg">
                {/* Mobile Header */}
                <div className="glass-card rounded-none border-x-0 border-t-0 p-4 flex justify-between items-center z-50">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{myAvatar}</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-white/40 tracking-wider">Player</span>
                            <span className="font-bold text-lg leading-none max-w-[120px] truncate">{myName}</span>
                        </div>
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
                                <div className="text-6xl animate-bounce">{myAvatar}</div>
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
                                        onSubmitClaim={(claim, isLying) => handleBluffClaim({ claim, isLying })}
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

                                {gameState.currentGame === 'BRAIN_BURST' && gameState.gameData && (
                                    <BrainBurstPlayer
                                        phase={gameState.gameData.phase}
                                        currentQuestion={gameState.gameData.currentQuestion}
                                        tier={gameState.gameData.tier}
                                        questionIndex={gameState.gameData.questionIndex}
                                        fiftyFiftyDisabled={gameState.gameData.fiftyFiftyDisabled || []}
                                        lifelineUsed={!!gameState.gameData.lifelinesUsed?.[socket?.id || '']}
                                        showResult={gameState.gameData.showResult}
                                        onAnswer={handleBrainBurstAnswer}
                                        onUseLifeline={handleBrainBurstLifeline}
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
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={joinStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-white/40 tracking-widest text-sm uppercase"
                        >
                            {joinStep === 'CODE' ? 'Enter Room Code' : 'Create Profile'}
                        </motion.p>
                    </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                    {joinStep === 'CODE' ? (
                        <motion.form
                            key="code-form"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            onSubmit={handleCodeSubmit}
                            className="space-y-6"
                        >
                            <input
                                type="text"
                                placeholder="4-LETTER CODE"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                className="w-full bg-white/5 border-4 border-white/10 rounded-[2.5rem] px-10 py-12 text-center text-7xl font-black uppercase tracking-[0.5em] focus:outline-none focus:border-game-primary shadow-2xl transition-all placeholder:text-white/5"
                                maxLength={4}
                                autoFocus
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={roomCode.length !== 4}
                                className="w-full bg-game-primary text-white font-black text-4xl py-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(255,0,255,0.4)] disabled:opacity-20 disabled:grayscale transition-all uppercase tracking-widest"
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
                            className="space-y-6"
                        >
                            {/* Avatar Grid - OBVIOUS SELECTION */}
                            <div className="grid grid-cols-4 gap-4 mb-10">
                                {AVATARS.map((a) => (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => setAvatar(a)}
                                        className={`text-5xl p-4 rounded-2xl transition-all duration-200 transform ${avatar === a
                                            ? 'bg-yellow-400 scale-110 shadow-[0_0_40px_rgba(250,204,21,1)] border-4 border-white'
                                            : 'bg-white/5 hover:bg-white/20 opacity-40 hover:opacity-100 border-2 border-transparent'
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
                                className="w-full bg-white/5 border-4 border-white/10 rounded-[2.5rem] px-10 py-10 text-center text-6xl font-black uppercase focus:outline-none focus:border-game-secondary shadow-2xl transition-all text-white placeholder:text-white/5 mb-8 tracking-tighter"
                                maxLength={10}
                                autoFocus
                            />

                            <div className="flex flex-col gap-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!name.trim()}
                                    className="w-full bg-game-secondary text-[#0a0518] font-black text-4xl py-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,255,255,0.4)] disabled:opacity-20 transition-all uppercase tracking-widest"
                                >
                                    Jump In! 🎮
                                </motion.button>
                                <button
                                    type="button"
                                    onClick={() => setJoinStep('CODE')}
                                    className="w-full py-6 text-2xl font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
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
