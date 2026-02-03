import { GameState, IGameLogic } from '../types';

export const TRIVIA_QUESTIONS = [
    { q: "Who is most likely to trip over nothing?", a: ["Dad", "Mom", "The Dog", "Grandma"], correct: 0, category: "Family Roast" }, // Keep for legacy testing
    { q: "Which tech billionaire challenged a rival to a cage match?", a: ["Jeff Bezos", "Elon Musk", "Mark Zuckerberg", "Bill Gates"], correct: 1, category: "Tech Drama" },
    { q: "What implies that you are 'drowning' in Gen Z slang?", a: ["Simp", "Drip", "Cheugy", "Rizz"], correct: 3, category: "Gen Z" },
    { q: "Which movie features a DeLorean time machine?", a: ["Star Wars", "Back to the Future", "Blade Runner", "E.T."], correct: 1, category: "Pop Culture" },
    { q: "What is the powerhouse of the cell?", a: ["Nucleus", "Mitochondria", "Ribosome", "Membrane"], correct: 1, category: "Science 101" },
    { q: "Who released the hit song 'Espresso' in 2024?", a: ["Taylor Swift", "Sabrina Carpenter", "Olivia Rodrigo", "Dua Lipa"], correct: 1, category: "Music" },
    { q: "Which fast food chain has the slogan 'I'm Lovin' It'?", a: ["KFC", "Burger King", "McDonald's", "Wendy's"], correct: 2, category: "Brands" },
    { q: "In gaming, what does 'FPS' stand for?", a: ["Frames Per Second", "First Person Shooter", "Both A & B", "Fast Player Speed"], correct: 2, category: "Gaming" },
    { q: "What is the only fruit that has seeds on the outside?", a: ["Strawberry", "Raspberry", "Blueberry", "Fig"], correct: 0, category: "Food Facts" },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2, category: "Space" },
    { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correct: 2, category: "Art" },
    { q: "What does the 'www' stand for in a website browser?", a: ["World Wide Web", "World Web Wide", "Web World Wide", "Wild Wild West"], correct: 0, category: "Tech" },
    { q: "Which animal is known to have the longest memory?", a: ["Elephant", "Dolphin", "Crow", "Dog"], correct: 0, category: "Nature" },
    { q: "What is the most visited country in the world?", a: ["USA", "China", "Spain", "France"], correct: 3, category: "Travel" },
    { q: "Who is the 'King of Pop'?", a: ["Elvis", "Prince", "Michael Jackson", "Bruno Mars"], correct: 2, category: "Music" }
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
        // Shuffle questions
        const shuffled = [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5);

        // LIMIT to 10 rounds max
        const questions = shuffled.slice(0, 10);

        // Initialize Stats
        Object.keys(gameState.players).forEach(pid => {
            this.playerStats[pid] = { streak: 0, totalScore: 0, lastAnswerCorrect: false };
        });

        gameState.gameData = {
            round: 0,
            questions, // Store the full list
            question: questions[0],
            timer: 20,
            showResult: false,
            answers: {},
            scores: {} // Round specific scores
        };

        this.startTimer(gameState, broadcast);
    }

    private startTimer(gameState: GameState, broadcast: () => void) {
        // Simple tick mechanism handled by room manager usually, but for "Logic Completeness" we simulate here or assume external ticker calls update?
        // Wait, typical FamGame logic has implicit timer via RoomManager ticking `update`? 
        // No, RoomManager usually delegates `update` to `gameLogic.update`.
        // Let's implement `update` method.
    }

    // Standard Update Loop
    update(dt: number, gameState: GameState, broadcast: () => void) {
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

    onEnd(gameState: GameState) {
        // Cleanup
    }
}
