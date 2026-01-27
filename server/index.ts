import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
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

// Gemini API for Mind Meld similarity checking
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function checkSimilarity(answer1: string, answer2: string): Promise<number> {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Rate the semantic similarity between these two answers on a scale of 0 to 1, where 1 means identical meaning and 0 means completely unrelated. Only respond with a number between 0 and 1.\n\nAnswer 1: "${answer1}"\nAnswer 2: "${answer2}"\n\nSimilarity score:`
                    }]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 10 }
            })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '0';
        const score = parseFloat(text.match(/["d.]+/)?.[0] || '0');
        return Math.min(1, Math.max(0, score));
    } catch (error) {
        console.error('Gemini API error:', error);
        return answer1.toLowerCase().trim() === answer2.toLowerCase().trim() ? 1 : 0;
    }
}

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
    avatar?: string;
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
    currentGame?: string;
    gameData?: any;
    gameVotes: Record<string, number>;
    timer?: number;
    leaderboard: { name: string; score: number }[];
    currentTimer?: NodeJS.Timeout | null;
}

// MULTI-ROOM STORAGE
const rooms: Record<string, GameState> = {};
const socketToRoom: Record<string, string> = {};

function getGameState(socket: Socket): GameState | null {
    const roomCode = socketToRoom[socket.id];
    return rooms[roomCode] || null;
}

function emitState(roomCode: string) {
    const state = rooms[roomCode];
    if (state) {
        // Don't emit the Timeout object
        const { currentTimer, ...publicState } = state;
        io.to(roomCode).emit('gameState', publicState);
    }
}

function startRoomTimer(roomCode: string, seconds: number, onComplete: () => void) {
    const state = rooms[roomCode];
    if (!state) return;

    if (state.currentTimer) clearTimeout(state.currentTimer);
    state.timer = seconds;
    emitState(roomCode);

    const tick = () => {
        const currentState = rooms[roomCode];
        if (currentState && currentState.timer && currentState.timer > 0) {
            currentState.timer--;
            io.to(roomCode).emit('timer', currentState.timer);
            if (currentState.timer > 0) {
                currentState.currentTimer = setTimeout(tick, 1000);
            } else {
                onComplete();
            }
        }
    };
    state.currentTimer = setTimeout(tick, 1000);
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
    { q: "What is the collective noun for crows?", a: ["A murder", "A flock", "A pack", "A swarm"], correct: 0 },
    { q: "Which bone is the longest in the human body?", a: ["Femur", "Humerus", "Tibia", "Fibula"], correct: 0 },
    { q: "What is the smallest prime number?", a: ["0", "1", "2", "3"], correct: 2 },
    { q: "Who wrote 'Romeo and Juliet'?", a: ["Shakespeare", "Dickens", "Austen", "Twain"], correct: 0 },
    { q: "What is the currency of Japan?", a: ["Yen", "Won", "Yuan", "Ringgit"], correct: 0 },
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
    "Who is secretly a superhero?",
    "Who is most likely to win a reality show?",
    "Who has the best dance moves?",
    "Who is most likely to get a tattoo on a whim?",
    "Who is the best at keeping secrets?",
];

const WORD_RACE_CATEGORIES = [
    "Animals", "Fruits", "Countries", "Brands", "Movies", "Colors", "Sports",
    "Vegetables", "Cities", "Cars", "Body Parts", "Jobs", "Clothes",
    "Furniture", "Tools", "Instruments", "Toys", "Drinks", "Flowers"
];

io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // CREATE ROOM (Host)
    socket.on('createRoom', ({ name }: { name: string }) => {
        const roomCode = generateRoomCode();
        socket.join(roomCode);
        socketToRoom[socket.id] = roomCode;

        rooms[roomCode] = {
            roomCode,
            hostId: socket.id,
            players: {
                [socket.id]: {
                    id: socket.id,
                    name: name || 'Host',
                    avatar: '📺',
                    score: 0,
                    isHost: true
                }
            },
            status: 'LOBBY',
            gameVotes: {},
            leaderboard: [],
        };

        emitState(roomCode);
    });

    socket.on('joinRoom', ({ name, code, avatar }: { name: string, code: string, avatar?: string }) => {
        const roomCode = code.toUpperCase();
        if (!rooms[roomCode]) {
            socket.emit('error', { message: 'Invalid room code' });
            return;
        }

        socket.join(roomCode);
        socketToRoom[socket.id] = roomCode;

        rooms[roomCode].players[socket.id] = {
            id: socket.id,
            name: name || `Player ${Object.keys(rooms[roomCode].players).length + 1}`,
            avatar: avatar || '🙂',
            score: 0,
            isHost: false
        };

        emitState(roomCode);
    });

    socket.on('kickPlayer', (playerId: string) => {
        const state = getGameState(socket);
        if (state && socket.id === state.hostId && state.players[playerId]) {
            delete state.players[playerId];
            delete socketToRoom[playerId];
            io.to(playerId).emit('kicked');
            emitState(state.roomCode);
        }
    });

    socket.on('leaveRoom', () => {
        const state = getGameState(socket);
        if (state) {
            delete state.players[socket.id];
            delete socketToRoom[socket.id];

            if (socket.id === state.hostId) {
                if (state.currentTimer) clearTimeout(state.currentTimer);
                delete rooms[state.roomCode];
                io.to(state.roomCode).emit('roomClosed');
            } else {
                emitState(state.roomCode);
            }
        }
    });

    socket.on('voteGame', (gameId: string) => {
        const state = getGameState(socket);
        if (state && state.players[socket.id]) {
            state.players[socket.id].gameVote = gameId;
            const votes: Record<string, number> = {};
            Object.values(state.players).forEach(p => {
                if (p.gameVote) {
                    votes[p.gameVote] = (votes[p.gameVote] || 0) + 1;
                }
            });
            state.gameVotes = votes;
            emitState(state.roomCode);
        }
    });

    socket.on('startGame', () => {
        const state = getGameState(socket);
        if (state) {
            state.status = 'GAME_SELECT';
            Object.values(state.players).forEach(p => { p.gameVote = undefined; });
            state.gameVotes = {};
            emitState(state.roomCode);
        }
    });

    socket.on('selectGame', (gameId: any) => {
        const state = getGameState(socket);
        if (!state) return;

        state.status = 'PLAYING';
        state.currentGame = gameId;

        Object.keys(state.players).forEach(pid => {
            state.players[pid].bannedUntil = 0;
        });

        const roomCode = state.roomCode;

        if (gameId === 'TRIVIA') {
            state.gameData = {
                questionIndex: 0,
                question: TRIVIA_QUESTIONS[0],
                timer: 30,
                showResult: false,
                answers: {}
            };
        } else if (gameId === '2TRUTHS') {
            state.gameData = { phase: 'INPUT', inputs: {}, currentSubjectId: null, votes: {}, timer: 60 };
        } else if (gameId === 'HOT_TAKES') {
            state.gameData = { phase: 'INPUT', prompt: "What is the worst pizza topping?", inputs: {}, votes: {}, timer: 45 };
        } else if (gameId === 'POLL') {
            state.gameData = { phase: 'VOTING', prompt: POLL_PROMPTS[Math.floor(Math.random() * POLL_PROMPTS.length)], votes: {} };
        } else if (gameId === 'BUZZ_IN') {
            state.gameData = { phase: 'WAITING', winnerId: null };
            startBuzzRound(roomCode);
        } else if (gameId === 'WORD_RACE') {
            state.gameData = { category: WORD_RACE_CATEGORIES[Math.floor(Math.random() * WORD_RACE_CATEGORIES.length)], words: [], scores: {}, endTime: Date.now() + 45000, active: true };
        } else if (gameId === 'REACTION') {
            state.gameData = { phase: 'WAITING', goTime: 0, results: {}, fakeOut: false };
            startReactionRound(roomCode);
        } else if (gameId === 'EMOJI_STORY') {
            const emojiPrompts = ['Your morning routine', 'A movie plot', 'Your biggest fear', 'Your dream vacation', 'A love story', 'A horror story', 'Your last meal'];
            state.gameData = { phase: 'INPUT', prompt: emojiPrompts[Math.floor(Math.random() * emojiPrompts.length)], inputs: {}, currentStoryIndex: 0, currentStory: null, guesses: {} };
        } else if (gameId === 'BLUFF') {
            const playerIds = Object.keys(state.players);
            state.gameData = { phase: 'CLAIM', currentClaimerId: playerIds[Math.floor(Math.random() * playerIds.length)], claim: null, isLying: null, votes: {} };
        } else if (gameId === 'THIS_OR_THAT') {
            const choices = [['🍕 Pizza', '🍔 Burger'], ['🏖️ Beach', '⛰️ Mountains'], ['☕ Coffee', '🍵 Tea'], ['🦸 Fly', '🧠 Read Minds']];
            const choice = choices[Math.floor(Math.random() * choices.length)];
            state.gameData = { phase: 'CHOOSING', optionA: choice[0], optionB: choice[1], votes: {} };
        } else if (gameId === 'SPEED_DRAW') {
            state.gameData = { phase: 'DRAWING', prompt: 'Robot', drawings: {}, votes: {}, timer: 30 };
            startRoomTimer(roomCode, 30, () => {
                const s = rooms[roomCode];
                if (s && s.currentGame === 'SPEED_DRAW') {
                    s.gameData.phase = 'VOTING';
                    emitState(roomCode);
                }
            });
        } else if (gameId === 'CHAIN_REACTION') {
            const playerIds = Object.keys(state.players);
            state.gameData = { phase: 'ACTIVE', chain: [{ word: 'Start', playerId: 'system' }], currentPlayerIndex: 0, currentPlayerId: playerIds[0] || null, timer: 5, playerOrder: playerIds };
            startChainTimer(roomCode);
        } else if (gameId === 'MIND_MELD') {
            state.gameData = { phase: 'ANSWERING', prompt: 'Name a fruit', answers: {}, matches: [], timer: 15 };
            startRoomTimer(roomCode, 15, async () => {
                const s = rooms[roomCode];
                if (s && s.currentGame === 'MIND_MELD') {
                    s.gameData.phase = 'MATCHING';
                    emitState(roomCode);
                    await processMindMeldMatches(roomCode);
                }
            });
        } else if (gameId === 'COMPETE') {
            const playerIds = Object.keys(state.players);
            const challengers = playerIds.sort(() => Math.random() - 0.5).slice(0, 2);
            state.gameData = { phase: 'COUNTDOWN', challenger1Id: challengers[0] || '', challenger2Id: challengers[1] || '', challenge: { type: 'TAP', target: 30 }, progress: {}, timer: 3 };
            setTimeout(() => {
                const s = rooms[roomCode];
                if (s && s.currentGame === 'COMPETE') {
                    s.gameData.phase = 'ACTIVE';
                    emitState(roomCode);
                }
            }, 3000);
        }
        emitState(roomCode);
    });

    const startBuzzRound = (roomCode: string) => {
        setTimeout(() => {
            const state = rooms[roomCode];
            if (state && state.currentGame === 'BUZZ_IN' && state.gameData.phase === 'WAITING') {
                state.gameData.phase = 'ACTIVE';
                emitState(roomCode);
            }
        }, Math.random() * 2000 + 2000);
    };

    const startReactionRound = (roomCode: string) => {
        const state = rooms[roomCode];
        if (!state) return;
        const isFakeOut = Math.random() < 0.3;
        state.gameData.fakeOut = false;

        if (isFakeOut) {
            setTimeout(() => {
                const s = rooms[roomCode];
                if (s && s.currentGame === 'REACTION' && s.gameData.phase === 'WAITING') {
                    s.gameData.fakeOut = true;
                    emitState(roomCode);
                    setTimeout(() => {
                        s.gameData.fakeOut = false;
                        emitState(roomCode);
                        setTimeout(() => {
                            if (s.currentGame === 'REACTION' && s.gameData.phase === 'WAITING') {
                                s.gameData.phase = 'GO';
                                s.gameData.goTime = Date.now();
                                emitState(roomCode);
                            }
                        }, Math.random() * 1000 + 500);
                    }, 800);
                }
            }, Math.random() * 2000 + 1000);
        } else {
            setTimeout(() => {
                const s = rooms[roomCode];
                if (s && s.currentGame === 'REACTION' && s.gameData.phase === 'WAITING') {
                    s.gameData.phase = 'GO';
                    s.gameData.goTime = Date.now();
                    emitState(roomCode);
                }
            }, Math.random() * 3000 + 2000);
        }
    };

    const startChainTimer = (roomCode: string) => {
        const state = rooms[roomCode];
        if (!state) return;
        if (state.currentTimer) clearInterval(state.currentTimer);
        let time = 5;
        state.gameData.timer = time;
        emitState(roomCode);

        state.currentTimer = setInterval(() => {
            const s = rooms[roomCode];
            if (!s) return;
            time--;
            s.gameData.timer = time;
            if (time <= 0) {
                if (s.currentTimer) clearInterval(s.currentTimer);
                s.gameData.phase = 'RESULTS';
                s.gameData.failedPlayerId = s.gameData.currentPlayerId;
                emitState(roomCode);
            } else {
                io.to(roomCode).emit('timerUpdate', time);
            }
        }, 1000);
    };

    const processMindMeldMatches = async (roomCode: string) => {
        const state = rooms[roomCode];
        if (!state) return;
        const answers = state.gameData.answers;
        const playerIds = Object.keys(answers);
        const matches: any[] = [];

        for (let i = 0; i < playerIds.length; i++) {
            for (let j = i + 1; j < playerIds.length; j++) {
                const p1 = playerIds[i];
                const p2 = playerIds[j];
                const sim = await checkSimilarity(answers[p1], answers[p2]);
                if (sim > 0.6) {
                    matches.push({ player1Id: p1, player2Id: p2, similarity: sim });
                    const points = Math.round(sim * 100);
                    if (state.players[p1]) state.players[p1].score += points;
                    if (state.players[p2]) state.players[p2].score += points;
                }
            }
        }

        setTimeout(() => {
            const s = rooms[roomCode];
            if (s) {
                s.gameData.phase = 'RESULTS';
                s.gameData.matches = matches;
                emitState(roomCode);
            }
        }, 3000);
    };

    socket.on('nextRound', () => {
        const state = getGameState(socket);
        if (!state) return;

        if (state.currentGame === 'TRIVIA') {
            const nextIdx = state.gameData.questionIndex + 1;
            if (nextIdx < TRIVIA_QUESTIONS.length) {
                state.gameData.questionIndex = nextIdx;
                state.gameData.question = TRIVIA_QUESTIONS[nextIdx];
                state.gameData.showResult = false;
                state.gameData.answers = {};
            } else {
                state.status = 'RESULTS';
            }
        } else if (state.currentGame === 'BUZZ_IN') {
            state.gameData = { phase: 'WAITING', winnerId: null };
            startBuzzRound(state.roomCode);
        } else if (state.currentGame === 'REACTION') {
            state.gameData = { phase: 'WAITING', goTime: 0, results: {}, fakeOut: false };
            startReactionRound(state.roomCode);
        } else if (state.currentGame === '2TRUTHS') {
            if (state.gameData.phase === 'REVEAL') {
                const playerIds = Object.keys(state.players);
                let nextIdx = 0;
                if (state.gameData.currentSubjectId) {
                    nextIdx = playerIds.indexOf(state.gameData.currentSubjectId) + 1;
                }
                if (nextIdx < playerIds.length) {
                    state.gameData.phase = 'VOTING';
                    state.gameData.currentSubjectId = playerIds[nextIdx];
                    state.gameData.votes = {};
                    state.gameData.showLie = false;
                } else {
                    state.status = 'RESULTS';
                }
            }
        } else {
            state.status = 'RESULTS';
        }
        emitState(state.roomCode);
    });

    socket.on('backToLobby', () => {
        const state = getGameState(socket);
        if (state) {
            state.status = 'GAME_SELECT';
            state.currentGame = undefined;
            state.gameData = undefined;
            emitState(state.roomCode);
        }
    });

    socket.on('submitAnswer', (answerIndex: number) => {
        const state = getGameState(socket);
        if (state && state.currentGame === 'TRIVIA') {
            state.gameData.answers[socket.id] = answerIndex;
            const playerCount = Object.keys(state.players).length;
            if (Object.keys(state.gameData.answers).length >= playerCount) {
                state.gameData.showResult = true;
                Object.entries(state.gameData.answers).forEach(([pid, ans]: [string, any]) => {
                    if (ans === state.gameData.question.correct) {
                        if (state.players[pid]) state.players[pid].score += 100;
                    }
                });
            }
            emitState(state.roomCode);
        }
    });

    socket.on('buzz', () => {
        const state = getGameState(socket);
        if (!state || state.currentGame !== 'BUZZ_IN') return;
        if (state.players[socket.id]?.bannedUntil && state.players[socket.id].bannedUntil! > Date.now()) return;

        if (state.gameData.phase === 'WAITING') {
            state.players[socket.id].bannedUntil = Date.now() + 2000;
            socket.emit('falseStart');
            return;
        }

        if (state.gameData.phase === 'ACTIVE') {
            state.gameData.phase = 'BUZZED';
            state.gameData.winnerId = socket.id;
            if (state.players[socket.id]) state.players[socket.id].score += 50;
            emitState(state.roomCode);
        }
    });

    socket.on('submitWord', (word: string) => {
        const state = getGameState(socket);
        if (state && state.currentGame === 'WORD_RACE' && state.gameData.active) {
            if (word.length < 3) return;
            if (!state.gameData.scores[socket.id]) state.gameData.scores[socket.id] = 0;
            state.gameData.scores[socket.id] += 10;
            if (state.players[socket.id]) state.players[socket.id].score += 10;
            state.gameData.words.push({ playerId: socket.id, word, timestamp: Date.now() });
            emitState(state.roomCode);
        }
    });

    socket.on('reactionClick', () => {
        const state = getGameState(socket);
        if (state && state.currentGame === 'REACTION' && state.gameData.phase === 'GO' && !state.gameData.results[socket.id]) {
            const diff = Date.now() - state.gameData.goTime;
            state.gameData.results[socket.id] = diff;
            if (state.players[socket.id]) state.players[socket.id].score += diff < 300 ? 100 : 50;
            emitState(state.roomCode);
        }
    });

    // --- VOICE CHAT SIGNALING ---
    socket.on('joinVoice', () => {
        const roomCode = socketToRoom[socket.id];
        if (roomCode) {
            // Tell others in room that this player joined voice
            socket.to(roomCode).emit('userJoinedVoice', socket.id);
        }
    });

    socket.on('signal', ({ to, signal }: { to: string, signal: any }) => {
        io.to(to).emit('signal', { from: socket.id, signal });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        const roomCode = socketToRoom[socket.id];
        if (roomCode && rooms[roomCode]) {
            const state = rooms[roomCode];
            delete state.players[socket.id];
            delete socketToRoom[socket.id];
            if (socket.id === state.hostId) {
                if (state.currentTimer) clearTimeout(state.currentTimer);
                delete rooms[roomCode];
                io.to(roomCode).emit('roomClosed');
            } else {
                emitState(roomCode);
            }
        }
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on internal port ${PORT}`);
});