import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

interface Player {
    id: string;
    name: string;
    score: number;
}

interface GameState {
    roomCode: string;
    players: Record<string, Player>;
    status: 'LOBBY' | 'GAME_SELECT' | 'PLAYING' | 'RESULTS';
    currentGame?: 'TRIVIA' | '2TRUTHS' | 'HOT_TAKES' | 'POLL' | 'BUZZ_IN' | 'WORD_RACE' | 'REACTION';
    gameData?: any;
}

let gameState: GameState = {
    roomCode: 'ABCD',
    players: {},
    status: 'LOBBY',
};

const TRIVIA_QUESTIONS = [
    { q: "Who is most likely to trip over nothing?", a: ["Dad", "Mom", "The Dog", "Grandma"], correct: 0 },
    { q: "What is the capital of Australia?", a: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2 },
    { q: "What does HTML stand for?", a: ["Hyper Text Markup Language", "High Tech Modern Life", "Hyperlinks and Text Markup Language", "Home Tool Markup Language"], correct: 0 }
];

const POLL_PROMPTS = [
    "Who would survive the longest in a zombie apocalypse?",
    "Who is mostly likely to become a billionaire?",
    "Who spends the most time on their phone?",
    "Who is the worst driver?",
    "Who would accidentally join a cult?",
    "Who has the best fashion sense?",
    "Who is the clumsiest?",
    "Who talks the loudest?"
];

const WORD_RACE_CATEGORIES = [
    "Animals", "Fruits", "Countries", "Brands", "Movies", "Colors", "Sports"
];

io.on('connection', (socket: any) => {
    console.log('Client connected:', socket.id);

    socket.emit('gameState', gameState);

    socket.on('joinRoom', ({ name, code }: { name: string, code: string }) => {
        gameState.players[socket.id] = {
            id: socket.id,
            name: name || `Player ${Object.keys(gameState.players).length + 1}`,
            score: 0
        };
        io.emit('gameState', gameState);
    });

    socket.on('startGame', () => {
        gameState.status = 'GAME_SELECT';
        io.emit('gameState', gameState);
    });

    // GAME SELECT
    socket.on('selectGame', (gameId: any) => {
        gameState.status = 'PLAYING';
        gameState.currentGame = gameId;

        if (gameId === 'TRIVIA') {
            gameState.gameData = {
                questionIndex: 0,
                question: TRIVIA_QUESTIONS[0],
                timer: 30,
                showResult: false,
                answers: {}
            };
        } else if (gameId === '2TRUTHS') {
            gameState.gameData = {
                phase: 'INPUT', // INPUT -> VOTING -> REVEAL
                inputs: {},
                currentSubjectId: null,
                votes: {},
                timer: 60
            };
        } else if (gameId === 'HOT_TAKES') {
            gameState.gameData = {
                phase: 'INPUT', // INPUT -> VOTING -> RESULTS
                prompt: "What is the worst pizza topping?",
                inputs: {},
                votes: {},
                timer: 45
            };
        } else if (gameId === 'POLL') {
            gameState.gameData = {
                phase: 'VOTING', // VOTING -> RESULTS
                prompt: POLL_PROMPTS[Math.floor(Math.random() * POLL_PROMPTS.length)],
                votes: {},
            };
        } else if (gameId === 'BUZZ_IN') {
            gameState.gameData = {
                phase: 'WAITING', // WAITING -> ACTIVE -> BUZZED
                winnerId: null,
            };
            // Auto start after delay
            setTimeout(() => {
                if (gameState.currentGame === 'BUZZ_IN' && gameState.gameData.phase === 'WAITING') {
                    gameState.gameData.phase = 'ACTIVE';
                    io.emit('gameState', gameState);
                }
            }, 3000);

        } else if (gameId === 'WORD_RACE') {
            gameState.gameData = {
                category: WORD_RACE_CATEGORIES[Math.floor(Math.random() * WORD_RACE_CATEGORIES.length)],
                words: [], // { playerId, word, timestamp }
                scores: {}, // Round scores
                endTime: Date.now() + 30000, // 30s
                active: true
            };
        } else if (gameId === 'REACTION') {
            gameState.gameData = {
                phase: 'WAITING', // WAITING -> GO -> END
                goTime: 0,
                results: {} // { playerId: ms }
            };
            // Random delay 2-5s
            setTimeout(() => {
                if (gameState.currentGame === 'REACTION' && gameState.gameData.phase === 'WAITING') {
                    gameState.gameData.phase = 'GO';
                    gameState.gameData.goTime = Date.now();
                    io.emit('gameState', gameState);
                }
            }, Math.random() * 3000 + 2000);
        }
        io.emit('gameState', gameState);
    });

    // GAME FLOW CONTROLS
    socket.on('nextRound', () => {
        // (Simplified: for most games just reset or go to scoreboard)
        if (gameState.currentGame === 'BUZZ_IN') {
            gameState.gameData = {
                phase: 'WAITING',
                winnerId: null,
            };
            io.emit('gameState', gameState);
            setTimeout(() => {
                if (gameState.currentGame === 'BUZZ_IN' && gameState.gameData.phase === 'WAITING') {
                    gameState.gameData.phase = 'ACTIVE';
                    io.emit('gameState', gameState);
                }
            }, 3000);
        } else if (gameState.currentGame === 'REACTION') {
            gameState.gameData = {
                phase: 'WAITING',
                goTime: 0,
                results: {}
            };
            io.emit('gameState', gameState);
            setTimeout(() => {
                if (gameState.currentGame === 'REACTION' && gameState.gameData.phase === 'WAITING') {
                    gameState.gameData.phase = 'GO';
                    gameState.gameData.goTime = Date.now();
                    io.emit('gameState', gameState);
                }
            }, Math.random() * 3000 + 2000);
        } else if (gameState.currentGame === '2TRUTHS') {
            // ... (Previous logic for 2 Truths iteration)
            if (gameState.gameData.phase === 'REVEAL') {
                const playerIds = Object.keys(gameState.players);
                let nextIdx = 0;
                if (gameState.gameData.currentSubjectId) {
                    nextIdx = playerIds.indexOf(gameState.gameData.currentSubjectId) + 1;
                }
                if (nextIdx < playerIds.length) {
                    gameState.gameData.phase = 'VOTING';
                    gameState.gameData.currentSubjectId = playerIds[nextIdx];
                    gameState.gameData.votes = {};
                    gameState.gameData.showLie = false;
                    if (playerIds.length === 1) {
                        gameState.gameData.phase = 'REVEAL';
                        gameState.gameData.showLie = true;
                    }
                } else {
                    gameState.status = 'RESULTS';
                }
                io.emit('gameState', gameState);
            }
        } else if (gameState.currentGame === 'POLL') {
            if (gameState.gameData.phase === 'VOTING') {
                gameState.gameData.phase = 'RESULTS';
            } else {
                gameState.gameData.phase = 'VOTING';
                gameState.gameData.votes = {};
                gameState.gameData.prompt = POLL_PROMPTS[Math.floor(Math.random() * POLL_PROMPTS.length)];
            }
            io.emit('gameState', gameState);
        } else {
            // Default fallthrough to results or lobby
            // For Trivia/WordRace, just end game for now
            gameState.status = 'RESULTS';
            io.emit('gameState', gameState);
        }
    });

    socket.on('backToLobby', () => {
        gameState.status = 'GAME_SELECT';
        gameState.currentGame = undefined;
        gameState.gameData = undefined;
        io.emit('gameState', gameState);
    });

    // --- TRIVIA LOGIC ---
    socket.on('submitAnswer', (answerIndex: number) => {
        if (gameState.status === 'PLAYING' && gameState.currentGame === 'TRIVIA') {
            if (!gameState.gameData.answers) gameState.gameData.answers = {};
            gameState.gameData.answers[socket.id] = answerIndex;

            const playerCount = Object.keys(gameState.players).length;
            const answerCount = Object.keys(gameState.gameData.answers).length;

            if (answerCount >= playerCount) {
                gameState.gameData.showResult = true;
                Object.entries(gameState.gameData.answers).forEach(([pid, ans]: [string, any]) => {
                    if (ans === gameState.gameData.question.correct) {
                        if (gameState.players[pid]) gameState.players[pid].score += 100;
                    }
                });
            }
            io.emit('gameState', gameState);
        }
    });

    // --- 2 TRUTHS LOGIC ---
    socket.on('submitStatements', (data: { statements: string[], lieIndex: number }) => {
        if (gameState.currentGame !== '2TRUTHS') return;
        gameState.gameData.inputs[socket.id] = data;
        const playerCount = Object.keys(gameState.players).length;
        const inputCount = Object.keys(gameState.gameData.inputs).length;
        if (inputCount >= playerCount) {
            gameState.gameData.phase = 'VOTING';
            gameState.gameData.currentSubjectId = Object.keys(gameState.players)[0];
            gameState.gameData.votes = {};
            gameState.gameData.showLie = false;
            if (playerCount === 1) {
                gameState.gameData.phase = 'REVEAL';
                gameState.gameData.showLie = true;
            }
        }
        io.emit('gameState', gameState);
    });

    socket.on('voteLie', (statementIndex: number) => {
        if (gameState.currentGame !== '2TRUTHS' || gameState.gameData.phase !== 'VOTING') return;
        gameState.gameData.votes[socket.id] = statementIndex;
        const currentSubjectId = gameState.gameData.currentSubjectId;
        const voters = Object.keys(gameState.players).filter(id => id !== currentSubjectId);
        const currentVotes = Object.keys(gameState.gameData.votes).length;
        if (currentVotes >= voters.length) {
            gameState.gameData.showLie = true;
            gameState.gameData.phase = 'REVEAL';
            const actualLieIndex = gameState.gameData.inputs[currentSubjectId].lieIndex;
            Object.entries(gameState.gameData.votes).forEach(([voterId, voteIdx]: [string, any]) => {
                if (voteIdx === actualLieIndex) {
                    if (gameState.players[voterId]) gameState.players[voterId].score += 50;
                } else {
                    if (gameState.players[currentSubjectId]) gameState.players[currentSubjectId].score += 25;
                }
            });
        }
        io.emit('gameState', gameState);
    });

    // --- HOT TAKES LOGIC ---
    socket.on('submitTake', (text: string) => {
        if (gameState.currentGame !== 'HOT_TAKES') return;
        if (!gameState.gameData.inputs) gameState.gameData.inputs = {};
        gameState.gameData.inputs[socket.id] = text;
        const playerCount = Object.keys(gameState.players).length;
        const inputCount = Object.keys(gameState.gameData.inputs).length;
        if (inputCount >= playerCount) {
            gameState.gameData.phase = 'VOTING';
            if (playerCount === 1) {
                gameState.gameData.phase = 'RESULTS';
            }
        }
        io.emit('gameState', gameState);
    });

    socket.on('voteTake', (targetPlayerId: string) => {
        if (gameState.currentGame !== 'HOT_TAKES' || gameState.gameData.phase !== 'VOTING') return;
        if (!gameState.gameData.votes) gameState.gameData.votes = {};
        gameState.gameData.votes[socket.id] = targetPlayerId;
        const playerCount = Object.keys(gameState.players).length;
        const voteCount = Object.keys(gameState.gameData.votes).length;
        if (voteCount >= playerCount) {
            gameState.gameData.phase = 'RESULTS';
            Object.values(gameState.gameData.votes).forEach((targetId: any) => {
                if (gameState.players[targetId]) gameState.players[targetId].score += 100;
            });
        }
        io.emit('gameState', gameState);
    });

    // --- POLL LOGIC ---
    socket.on('submitPollVote', (targetId: string) => {
        if (gameState.currentGame !== 'POLL') return;
        if (!gameState.gameData.votes) gameState.gameData.votes = {};
        gameState.gameData.votes[socket.id] = targetId;
        const playerCount = Object.keys(gameState.players).length;
        const voteCount = Object.keys(gameState.gameData.votes).length;
        if (voteCount >= playerCount) {
            gameState.gameData.phase = 'RESULTS';
        }
        io.emit('gameState', gameState);
    });

    // --- BUZZ IN LOGIC ---
    socket.on('buzz', () => {
        if (gameState.currentGame !== 'BUZZ_IN' || gameState.gameData.phase !== 'ACTIVE') return;

        gameState.gameData.phase = 'BUZZED';
        gameState.gameData.winnerId = socket.id;
        if (gameState.players[socket.id]) gameState.players[socket.id].score += 50;
        io.emit('gameState', gameState);
    });

    // --- WORD RACE LOGIC ---
    socket.on('submitWord', (word: string) => {
        if (gameState.currentGame !== 'WORD_RACE' || !gameState.gameData.active) return;

        // Simple validation: starts with category letter? 
        // For now, assume category is just a topic, accepts any length > 2
        if (word.length < 3) return;

        if (!gameState.gameData.scores[socket.id]) gameState.gameData.scores[socket.id] = 0;
        gameState.gameData.scores[socket.id] += 10;
        if (gameState.players[socket.id]) gameState.players[socket.id].score += 10;

        gameState.gameData.words.push({
            playerId: socket.id,
            word: word,
            timestamp: Date.now()
        });
        io.emit('gameState', gameState);
    });

    // --- REACTION LOGIC ---
    socket.on('reactionClick', () => {
        if (gameState.currentGame !== 'REACTION') return;

        if (gameState.gameData.phase === 'WAITING') {
            // False start! Penalty?
            return;
        }

        if (gameState.gameData.phase === 'GO' && !gameState.gameData.results[socket.id]) {
            const diff = Date.now() - gameState.gameData.goTime;
            gameState.gameData.results[socket.id] = diff;

            // Score based on speed (lower is better)
            // < 300ms = 100pts
            if (diff < 300) {
                if (gameState.players[socket.id]) gameState.players[socket.id].score += 100;
            } else if (diff < 500) {
                if (gameState.players[socket.id]) gameState.players[socket.id].score += 50;
            }
            io.emit('gameState', gameState);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (gameState.players[socket.id]) {
            delete gameState.players[socket.id];
            io.emit('gameState', gameState);
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
