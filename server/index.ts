import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('FamGame Server is Running! 🚀');
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Helper: Generate random room code
function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

interface Player {
    id: string;
    name: string;
    score: number;
    bannedUntil?: number;
    isHost?: boolean;
    gameVote?: string;
}

interface GameState {
    roomCode: string;
    hostId: string | null;
    players: Record<string, Player>;
    status: 'LOBBY' | 'GAME_SELECT' | 'PLAYING' | 'RESULTS';
    currentGame?: 'TRIVIA' | '2TRUTHS' | 'HOT_TAKES' | 'POLL' | 'BUZZ_IN' | 'WORD_RACE' | 'REACTION' | 'EMOJI_STORY' | 'BLUFF' | 'THIS_OR_THAT' | 'SPEED_DRAW';
    gameData?: any;
    gameVotes: Record<string, number>;
    timer?: number;
    leaderboard: { name: string; score: number }[];
}

let gameState: GameState = {
    roomCode: generateRoomCode(),
    hostId: null,
    players: {},
    status: 'LOBBY',
    gameVotes: {},
    leaderboard: [],
};

// Timer management
let currentTimer: NodeJS.Timeout | null = null;

function startTimer(seconds: number, onComplete: () => void) {
    if (currentTimer) clearTimeout(currentTimer);
    gameState.timer = seconds;
    io.emit('gameState', gameState);

    const tick = () => {
        if (gameState.timer && gameState.timer > 0) {
            gameState.timer--;
            io.emit('timer', gameState.timer);
            if (gameState.timer > 0) {
                currentTimer = setTimeout(tick, 1000);
            } else {
                onComplete();
            }
        }
    };
    currentTimer = setTimeout(tick, 1000);
}

function updateLeaderboard() {
    gameState.leaderboard = Object.values(gameState.players)
        .map(p => ({ name: p.name, score: p.score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
}

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

    // CREATE ROOM (Host)
    socket.on('createRoom', ({ name }: { name: string }) => {
        gameState.roomCode = generateRoomCode();
        gameState.hostId = socket.id;
        gameState.players = {};
        gameState.players[socket.id] = {
            id: socket.id,
            name: name || 'Host',
            score: 0,
            isHost: true
        };
        gameState.status = 'LOBBY';
        gameState.gameVotes = {};
        io.emit('gameState', gameState);
    });

    socket.on('joinRoom', ({ name, code }: { name: string, code: string }) => {
        if (code.toUpperCase() !== gameState.roomCode) {
            socket.emit('error', { message: 'Invalid room code' });
            return;
        }
        gameState.players[socket.id] = {
            id: socket.id,
            name: name || `Player ${Object.keys(gameState.players).length + 1}`,
            score: 0,
            isHost: false
        };
        io.emit('gameState', gameState);
    });

    // KICK PLAYER (Host only)
    socket.on('kickPlayer', (playerId: string) => {
        if (socket.id === gameState.hostId && gameState.players[playerId]) {
            delete gameState.players[playerId];
            io.to(playerId).emit('kicked');
            io.emit('gameState', gameState);
        }
    });

    // LEAVE ROOM
    socket.on('leaveRoom', () => {
        delete gameState.players[socket.id];
        if (socket.id === gameState.hostId) {
            // Reset room if host leaves
            gameState = {
                roomCode: generateRoomCode(),
                hostId: null,
                players: {},
                status: 'LOBBY',
                gameVotes: {},
                leaderboard: [],
            };
        }
        io.emit('gameState', gameState);
    });

    // VOTE FOR GAME (Players)
    socket.on('voteGame', (gameId: string) => {
        if (gameState.players[socket.id]) {
            gameState.players[socket.id].gameVote = gameId;
            // Count votes
            const votes: Record<string, number> = {};
            Object.values(gameState.players).forEach(p => {
                if (p.gameVote) {
                    votes[p.gameVote] = (votes[p.gameVote] || 0) + 1;
                }
            });
            gameState.gameVotes = votes;
            io.emit('gameState', gameState);
        }
    });

    socket.on('startGame', () => {
        gameState.status = 'GAME_SELECT';
        // Clear previous votes
        Object.values(gameState.players).forEach(p => { p.gameVote = undefined; });
        gameState.gameVotes = {};
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
        } else if (gameId === 'EMOJI_STORY') {
            const emojiPrompts = ['Your morning routine', 'A movie plot', 'Your biggest fear', 'Your dream vacation', 'A love story', 'A horror story', 'Your last meal'];
            gameState.gameData = {
                phase: 'INPUT',
                prompt: emojiPrompts[Math.floor(Math.random() * emojiPrompts.length)],
                inputs: {},
                currentStoryIndex: 0,
                currentStory: null,
                guesses: {},
            };
        } else if (gameId === 'BLUFF') {
            const playerIds = Object.keys(gameState.players);
            gameState.gameData = {
                phase: 'CLAIM',
                currentClaimerId: playerIds[Math.floor(Math.random() * playerIds.length)],
                claim: null,
                isLying: null,
                votes: {},
            };
        } else if (gameId === 'THIS_OR_THAT') {
            const choices = [
                ['🍕 Pizza', '🍔 Burger'],
                ['🏖️ Beach', '⛰️ Mountains'],
                ['🎬 Movies', '📺 TV Shows'],
                ['☕ Coffee', '🍵 Tea'],
                ['🌅 Morning', '🌃 Night'],
                ['💰 Rich & Lonely', '💕 Poor & Loved'],
                ['🦸 Fly', '🧠 Read Minds'],
                ['🔮 Past', '🚀 Future'],
            ];
            const choice = choices[Math.floor(Math.random() * choices.length)];
            gameState.gameData = {
                phase: 'CHOOSING',
                optionA: choice[0],
                optionB: choice[1],
                votes: {},
            };
        } else if (gameId === 'SPEED_DRAW') {
            const prompts = ['Cat', 'House', 'Car', 'Sun', 'Tree', 'Pizza', 'Robot', 'Ghost', 'Dragon', 'Rocket'];
            gameState.gameData = {
                phase: 'DRAWING',
                prompt: prompts[Math.floor(Math.random() * prompts.length)],
                drawings: {},
                votes: {},
                timer: 30,
            };
            // Start timer
            startTimer(30, () => {
                if (gameState.currentGame === 'SPEED_DRAW') {
                    gameState.gameData.phase = 'VOTING';
                    io.emit('gameState', gameState);
                }
            });
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
    console.log(`Server listening on internal port ${PORT}`);
});
