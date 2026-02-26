import { GameState, IGameLogic } from '../types';

export const TRIVIA_QUESTIONS = [
    { q: "Who is most likely to trip over nothing?", a: ["Dad", "Mom", "The Dog", "Grandma"], correct: 0, category: "Family Roast", difficulty: "Easy" },
    { q: "Which tech billionaire challenged a rival to a cage match?", a: ["Jeff Bezos", "Elon Musk", "Mark Zuckerberg", "Bill Gates"], correct: 1, category: "Tech Drama", difficulty: "Medium" },
    { q: "What implies that you are 'drowning' in Gen Z slang?", a: ["Simp", "Drip", "Cheugy", "Rizz"], correct: 3, category: "Gen Z", difficulty: "Easy" },
    { q: "Which movie features a DeLorean time machine?", a: ["Star Wars", "Back to the Future", "Blade Runner", "E.T."], correct: 1, category: "Pop Culture", difficulty: "Medium" },
    { q: "What is the powerhouse of the cell?", a: ["Nucleus", "Mitochondria", "Ribosome", "Membrane"], correct: 1, category: "Science", difficulty: "Easy" },
    { q: "Who released the hit song 'Espresso' in 2024?", a: ["Taylor Swift", "Sabrina Carpenter", "Olivia Rodrigo", "Dua Lipa"], correct: 1, category: "Music", difficulty: "Easy" },
    { q: "Which fast food chain has the slogan 'I'm Lovin' It'?", a: ["KFC", "Burger King", "McDonald's", "Wendy's"], correct: 2, category: "Brands", difficulty: "Easy" },
    { q: "In gaming, what does 'FPS' stand for?", a: ["Frames Per Second", "First Person Shooter", "Both A & B", "Fast Player Speed"], correct: 2, category: "Gaming", difficulty: "Medium" },
    { q: "What is the only fruit that has seeds on the outside?", a: ["Strawberry", "Raspberry", "Blueberry", "Fig"], correct: 0, category: "Food Facts", difficulty: "Hard" },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2, category: "Space", difficulty: "Easy" },
    { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correct: 2, category: "Art", difficulty: "Medium" },
    { q: "What does the 'www' stand for in a website browser?", a: ["World Wide Web", "World Web Wide", "Web World Wide", "Wild Wild West"], correct: 0, category: "Tech", difficulty: "Easy" },
    { q: "Which animal is known to have the longest memory?", a: ["Elephant", "Dolphin", "Crow", "Dog"], correct: 1, category: "Nature", difficulty: "Hard" },
    { q: "What is the most visited country in the world?", a: ["USA", "China", "Spain", "France"], correct: 3, category: "Travel", difficulty: "Hard" },
    { q: "Who is the 'King of Pop'?", a: ["Elvis", "Prince", "Michael Jackson", "Bruno Mars"], correct: 2, category: "Music", difficulty: "Easy" },
    // A few extra Hard questions
    { q: "What is the capital of Iceland?", a: ["Reykjavik", "Oslo", "Helsinki", "Copenhagen"], correct: 0, category: "Travel", difficulty: "Hard" },
    { q: "What is the rarest blood type?", a: ["O-Negative", "B-Negative", "AB-Negative", "A-Negative"], correct: 2, category: "Science", difficulty: "Hard" },
    { q: "How many bones are in the adult human body?", a: ["206", "208", "210", "212"], correct: 0, category: "Science", difficulty: "Medium" }
];

interface PlayerStats {
    streak: number;
    totalScore: number;
    lastAnswerCorrect: boolean;
}

export class TriviaGame implements IGameLogic {
    id = 'TRIVIA' as const;
    name = 'Trivia';
    description = 'Answer fast to keep your streak alive!';

    private playerStats: Record<string, PlayerStats> = {};

    onStart(gameState: GameState, broadcast: () => void) {
        // Collect available categories and difficulties
        const categories = Array.from(new Set(TRIVIA_QUESTIONS.map(q => q.category)));
        const difficulties = ['Any', 'Easy', 'Medium', 'Hard'];

        // Initialize Stats
        Object.keys(gameState.players).forEach(pid => {
            this.playerStats[pid] = { streak: 0, totalScore: 0, lastAnswerCorrect: false };
        });

        gameState.gameData = {
            phase: 'SETTINGS', // Start in settings phase
            availableCategories: ['Any', ...categories],
            availableDifficulties: difficulties,
            timer: 0,
        };

        broadcast();
    }

    private startGame(gameState: GameState, category: string, difficulty: string, broadcast: () => void) {
        let pool = [...TRIVIA_QUESTIONS];

        if (category && category !== 'Any') {
            pool = pool.filter(q => q.category === category);
        }
        if (difficulty && difficulty !== 'Any') {
            pool = pool.filter(q => q.difficulty === difficulty);
        }

        // Fallback if combination has no questions
        if (pool.length === 0) {
            pool = [...TRIVIA_QUESTIONS];
        }

        const shuffled = pool.sort(() => Math.random() - 0.5);
        const questions = shuffled.slice(0, 10);

        gameState.gameData = {
            phase: 'ROUND',
            round: 0,
            questions,
            question: questions[0],
            timer: 20,
            showResult: false,
            answers: {},
            scores: {}
        };

        broadcast();
    }

    private startTimer(gameState: GameState, broadcast: () => void) {
        // Simple tick mechanism handled by room manager usually, but for "Logic Completeness" we simulate here or assume external ticker calls update?
        // Wait, typical FamGame logic has implicit timer via RoomManager ticking `update`? 
        // No, RoomManager usually delegates `update` to `gameLogic.update`.
        // Let's implement `update` method.
    }

    // Standard Update Loop
    update(dt: number, gameState: GameState, broadcast: () => void) {
        if (gameState.gameData.phase === 'SETTINGS' || gameState.gameData.phase === 'GAME_OVER') return;

        if (gameState.gameData.showResult) {
            // In result phase, wait then next round
            gameState.gameData.timer -= dt;
            if (gameState.gameData.timer <= 0) {
                this.nextRound(gameState);
                broadcast();
            }
        } else {
            // In question phase
            if (gameState.gameData.timer > 0) {
                gameState.gameData.timer -= dt;
                if (gameState.gameData.timer <= 0) {
                    this.resolveRound(gameState);
                    broadcast();
                }
            }
        }
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        const player = gameState.players[playerId];

        if (gameState.gameData.phase === 'SETTINGS') {
            if (player?.isHost && data.action === 'START_TRIVIA') {
                this.startGame(gameState, data.category, data.difficulty, () => { });
                // Room update loop handles broadcast or host does
            }
            return;
        }

        if (gameState.gameData.showResult) return;

        // data expected to be { answerIndex: number }
        const answerIndex = data.answerIndex;
        if (typeof answerIndex !== 'number') return;

        if (!gameState.gameData.answers) gameState.gameData.answers = {};

        // Prevent changing answer? For now let them lock in once.
        if (gameState.gameData.answers[playerId] !== undefined) return;

        // Record Answer + Time Bonus potential (store timestamp if needed, but we use timer at end)
        // Actually, we need to know WHEN they answered for speed bonus.
        // Let's store { index: number, timeRemaining: number }
        gameState.gameData.answers[playerId] = {
            index: answerIndex,
            timeRemaining: gameState.gameData.timer
        };

        const playerCount = Object.keys(gameState.players).filter(id => !gameState.players[id].isHost).length;
        const answerCount = Object.keys(gameState.gameData.answers).length;

        if (answerCount >= playerCount) {
            // Small delay to let the last person see their click
            setTimeout(() => {
                this.resolveRound(gameState);
                // We need to trigger broadcast from outside usually, but assuming resolveRound modifies state that UI reacts to
            }, 500);
        }
    }

    private resolveRound(gameState: GameState) {
        if (gameState.gameData.showResult) return; // Already resolved

        gameState.gameData.showResult = true;
        gameState.gameData.timer = 8; // Show results for 8 seconds

        const currentQ = gameState.gameData.question;
        const roundScores: Record<string, any> = {};

        Object.keys(gameState.players).forEach(pid => {
            const player = gameState.players[pid];
            if (player.isHost) return;

            const answerData = gameState.gameData.answers[pid];
            const stats = this.playerStats[pid] || { streak: 0, totalScore: 0, lastAnswerCorrect: false };

            if (answerData && answerData.index === currentQ.correct) {
                // CORRECT
                const speedBonus = Math.floor(answerData.timeRemaining * 10);
                let multiplier = 1;
                if (stats.streak >= 2) multiplier = 1.5;
                if (stats.streak >= 4) multiplier = 2; // "ON FIRE"

                const basePoints = 100;
                const points = Math.floor((basePoints + speedBonus) * multiplier);

                player.score += points;
                stats.streak++;
                stats.totalScore += points;
                stats.lastAnswerCorrect = true;

                roundScores[pid] = {
                    points,
                    streak: stats.streak,
                    isCorrect: true,
                    speedBonus,
                    multiplier
                };
            } else {
                // INCORRECT
                stats.streak = 0;
                stats.lastAnswerCorrect = false;
                roundScores[pid] = {
                    points: 0,
                    streak: 0,
                    isCorrect: false
                };
            }
            this.playerStats[pid] = stats;
        });

        gameState.gameData.roundScores = roundScores;
    }

    private nextRound(gameState: GameState) {
        const nextIdx = gameState.gameData.round + 1;
        if (nextIdx >= gameState.gameData.questions.length) {
            // Game Over
            // Reset phase or whatever game over logic
            // Ideally RoomManager handles game end, but we can set a flag
            gameState.gameData.phase = 'GAME_OVER'; // Client can handle this
            return;
        }

        gameState.gameData.round = nextIdx;
        gameState.gameData.question = gameState.gameData.questions[nextIdx];
        gameState.gameData.timer = 20;
        gameState.gameData.showResult = false;
        gameState.gameData.answers = {};
        gameState.gameData.roundScores = {};
    }

    onPlayerLeave(gameState: GameState, playerId: string, broadcast: () => void) {
        if (gameState.gameData.showResult) return;

        // The player is about to be deleted from gameState.players by RoomManager.
        // We simulate the effect to check if we should resolve.
        const playerCount = Object.keys(gameState.players).filter(id => id !== playerId && !gameState.players[id].isHost).length;

        // Only count answers from players who are NOT the one leaving
        const activeAnswers = Object.keys(gameState.gameData.answers || {}).filter(id => id !== playerId).length;

        if (playerCount > 0 && activeAnswers >= playerCount) {
            this.resolveRound(gameState);
            broadcast();
        } else if (playerCount === 0) {
            // No players left
            gameState.gameData.phase = 'GAME_OVER';
            broadcast();
        }
    }

    onEnd(gameState: GameState) {
        // Cleanup
    }
}
