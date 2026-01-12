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

const PORT = process.env.PORT || 3000;

interface Player {
    id: string;
    name: string;
    score: number;
    bannedUntil?: number; // For Buzz In Penalty
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

// --- CONTENT LIBRARIES ---
const TRIVIA_QUESTIONS = [
    { q: "Who is most likely to trip over nothing?", a: ["Dad", "Mom", "The Dog", "Grandma"], correct: 0 },
    { q: "What is the capital of Australia?", a: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2 },
    { q: "What does HTML stand for?", a: ["Hyper Text Markup Language", "High Tech Modern Life", "Hyperlinks and Text Markup Language", "Home Tool Markup Language"], correct: 0 },
    { q: "Where is the Eiffel Tower located?", a: ["London", "Berlin", "Paris", "Rome"], correct: 2 },
    { q: "Which is the largest ocean?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
    { q: "What comes after Trillion?", a: ["Quadrillion", "Billion", "Quintillion", "Zillion"], correct: 0 },
    { q: "How many legs does a spider have?", a: ["6", "8", "10", "12"], correct: 1 },
    { q: "Which element has the chemical symbol 'O'?", a: ["Gold", "Silver", "Oxygen", "Iron"], correct: 2 },
    { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correct: 2 },
    { q: "What is the fastest land animal?", a: ["Cheetah", "Lion", "Horse", "Eagle"], correct: 0 },
    { q: "What year did the Titanic sink?", a: ["1912", "1905", "1920", "1899"], correct: 0 },
    { q: "Which fruit has its seeds on the outside?", a: ["Apple", "Banana", "Strawberry", "Kiwi"], correct: 2 },
    { q: "Which gas do plants absorb?", a: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], correct: 2 },
    { q: "What is the hardest natural substance?", a: ["Gold", "Iron", "Diamond", "Platinum"], correct: 2 },
];

const POLL_PROMPTS = [
    "Who would survive the longest in a zombie apocalypse?",
    "Who is mostly likely to become a billionaire?",
    "Who spends the most time on their phone?",
    "Who is the worst driver?",
    "Who would accidentally join a cult?",
    "Who has the best fashion sense?",
    "Who is the clumsiest?",
    "Who talks the loudest?",
    "Who is most likely to become famous?",
    "Who gives the best advice?",
    "Who is the pickiest eater?",
    "Who would die first in a horror movie?",
    "Who is most likely to forget their own birthday?",
    "Who is the best cook?",
    "Who laughs at the worst times?",
    "Who is secretly a superhero?"
];

const WORD_RACE_CATEGORIES = [
    "Animals", "Fruits", "Countries", "Brands", "Movies", "Colors", "Sports",
    "Vegetables", "Cities", "Cars", "Body Parts", "Jobs", "Clothes",
    "Furniture", "Tools", "Instruments", "Toys", "Drinks", "Flowers"
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

        // Reset logic
        Object.keys(gameState.players).forEach(pid => {
            gameState.players[pid].bannedUntil = 0;
        });

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
                phase: 'INPUT',
                inputs: {},
                currentSubjectId: null,
                votes: {},
                timer: 60
            };
        } else if (gameId === 'HOT_TAKES') {
            gameState.gameData = {
                phase: 'INPUT',
                prompt: "What is the worst pizza topping?",
                inputs: {},
                votes: {},
                timer: 45
            };
        } else if (gameId === 'POLL') {
            gameState.gameData = {
                phase: 'VOTING',
                prompt: POLL_PROMPTS[Math.floor(Math.random() * POLL_PROMPTS.length)],
                votes: {},
            };
        } else if (gameId === 'BUZZ_IN') {
            gameState.gameData = {
                phase: 'WAITING',
                winnerId: null,
            };
            startBuzzRound();

        } else if (gameId === 'WORD_RACE') {
            gameState.gameData = {
                category: WORD_RACE_CATEGORIES[Math.floor(Math.random() * WORD_RACE_CATEGORIES.length)],
                words: [],
                scores: {},
                endTime: Date.now() + 45000,
                active: true
            };
        } else if (gameId === 'REACTION') {
            gameState.gameData = {
                phase: 'WAITING',
                goTime: 0,
                results: {},
                fakeOut: false
            };
            startReactionRound();
        }
        io.emit('gameState', gameState);
    });

    // Helper for Buzz In Round Start
    const startBuzzRound = () => {
        setTimeout(() => {
            if (gameState.currentGame === 'BUZZ_IN' && gameState.gameData.phase === 'WAITING') {
                gameState.gameData.phase = 'ACTIVE';
                io.emit('gameState', gameState);
            }
        }, Math.random() * 2000 + 2000); // Random 2-4s delay
    }

    // Helper for Reaction Round Start
    const startReactionRound = () => {
        // 30% chance of fakeout
        const isFakeOut = Math.random() < 0.3;
        gameState.gameData.fakeOut = false;

        if (isFakeOut) {
            setTimeout(() => {
                if (gameState.currentGame === 'REACTION' && gameState.gameData.phase === 'WAITING') {
                    gameState.gameData.fakeOut = true; // Trigger yellow flash
                    io.emit('gameState', gameState);

                    // Reset fakeout after 500ms and actually go green shortly after
                    setTimeout(() => {
                        gameState.gameData.fakeOut = false;
                        io.emit('gameState', gameState);

                        setTimeout(() => {
                            if (gameState.currentGame === 'REACTION' && gameState.gameData.phase === 'WAITING') {
                                gameState.gameData.phase = 'GO';
                                gameState.gameData.goTime = Date.now();
                                io.emit('gameState', gameState);
                            }
                        }, Math.random() * 1000 + 500);

                    }, 800);
                }
            }, Math.random() * 2000 + 1000);
        } else {
            setTimeout(() => {
                if (gameState.currentGame === 'REACTION' && gameState.gameData.phase === 'WAITING') {
                    gameState.gameData.phase = 'GO';
                    gameState.gameData.goTime = Date.now();
                    io.emit('gameState', gameState);
                }
            }, Math.random() * 3000 + 2000);
        }
    }

    // GAME FLOW CONTROLS
    socket.on('nextRound', () => {
        if (gameState.currentGame === 'TRIVIA') {
            const nextIdx = gameState.gameData.questionIndex + 1;
            if (nextIdx < TRIVIA_QUESTIONS.length) {
                gameState.gameData.questionIndex = nextIdx;
                gameState.gameData.question = TRIVIA_QUESTIONS[nextIdx];
                gameState.gameData.showResult = false;
                gameState.gameData.answers = {};
            } else {
                gameState.status = 'RESULTS';
            }
            io.emit('gameState', gameState);

        } else if (gameState.currentGame === 'BUZZ_IN') {
            gameState.gameData = {
                phase: 'WAITING',
                winnerId: null,
            };
            io.emit('gameState', gameState);
            startBuzzRound();

        } else if (gameState.currentGame === 'REACTION') {
            gameState.gameData = {
                phase: 'WAITING',
                goTime: 0,
                results: {},
                fakeOut: false
            };
            io.emit('gameState', gameState);
            startReactionRound();

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
        } else if (gameState.currentGame === 'WORD_RACE') {
            // New Category
            gameState.gameData.category = WORD_RACE_CATEGORIES[Math.floor(Math.random() * WORD_RACE_CATEGORIES.length)];
            gameState.gameData.words = [];
            gameState.gameData.scores = {};
            gameState.gameData.endTime = Date.now() + 45000;
            io.emit('gameState', gameState);
        } else {
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

    // --- BUZZ IN LOGIC (WITH PENALTY) ---
    socket.on('buzz', () => {
        if (gameState.currentGame !== 'BUZZ_IN') return;

        // Check for ban
        if (gameState.players[socket.id]?.bannedUntil && gameState.players[socket.id].bannedUntil! > Date.now()) {
            return; // Ignore spam
        }

        if (gameState.gameData.phase === 'WAITING') {
            // FALSE START!
            gameState.players[socket.id].bannedUntil = Date.now() + 2000; // 2s ban
            socket.emit('falseStart'); // Notify client
            return;
        }

        if (gameState.gameData.phase === 'ACTIVE') {
            gameState.gameData.phase = 'BUZZED';
            gameState.gameData.winnerId = socket.id;
            if (gameState.players[socket.id]) gameState.players[socket.id].score += 50;
            io.emit('gameState', gameState);
        }
    });

    // --- WORD RACE LOGIC (WITH VALIDATION) ---
    socket.on('submitWord', (word: string) => {
        if (gameState.currentGame !== 'WORD_RACE' || !gameState.gameData.active) return;

        // Validation
        if (word.length < 3) return;
        if (gameState.gameData.words.find((w: any) => w.word.toLowerCase() === word.toLowerCase() && w.playerId === socket.id)) return; // No duplicates for same player

        // Simple category check (optional, hard to automate perfectly without AI, but we can do length/anti-spam)
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

    // --- REACTION LOGIC (WITH FAKEOUT) ---
    socket.on('reactionClick', () => {
        if (gameState.currentGame !== 'REACTION') return;

        if (gameState.gameData.phase === 'WAITING') {
            // False start logic could go here too, but simple ignore is fine or penalty
            if (gameState.players[socket.id]) gameState.players[socket.id].score -= 10; // Small penalty
            return;
        }

        if (gameState.gameData.phase === 'GO' && !gameState.gameData.results[socket.id]) {
            const diff = Date.now() - gameState.gameData.goTime;
            gameState.gameData.results[socket.id] = diff;

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
