import { GameState, IGameLogic } from '../types';
import fs from 'fs';
import path from 'path';
import { generateTriviaQuestions, saveQuestions } from '../utils/TriviaGenerator';

const DATA_DIR = path.join(process.cwd(), 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'trivia_questions.json');
const HISTORY_FILE = path.join(DATA_DIR, 'trivia_history.json');

function getQuestions(): any[] {
    try {
        if (!fs.existsSync(QUESTIONS_FILE)) return [];
        return JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
    } catch (e) {
        console.error('Error reading trivia questions:', e);
        return [];
    }
}

function getHistory(): string[] {
    try {
        if (!fs.existsSync(HISTORY_FILE)) return [];
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function addToHistory(questionTexts: string[]) {
    try {
        const history = getHistory();
        const updated = Array.from(new Set([...history, ...questionTexts]));
        // Keep history size manageable if needed, but for now just append
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(updated, null, 2));
    } catch (e) {
        console.error('Error saving history:', e);
    }
}

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
        const questions = getQuestions();
        const categories = Array.from(new Set(questions.map(q => q.category)));
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
        const allQuestions = getQuestions();
        const history = getHistory();
        const historySet = new Set(history);

        let pool = allQuestions.filter(q => !historySet.has(q.q));

        if (category && category !== 'Any') {
            pool = pool.filter(q => q.category === category);
        }
        if (difficulty && difficulty !== 'Any') {
            pool = pool.filter(q => q.difficulty === difficulty);
        }

        // Fallback if pool is empty (recycle or get any)
        if (pool.length < 10) {
            console.log("Pool low, triggering background generation for", category);
            // Trigger background generation
            generateTriviaQuestions(category === 'Any' ? 'General' : category, 20).then(newQs => {
                saveQuestions(newQs);
            }).catch(e => console.error("Generation failed", e));

            // If absolutely empty, use what we have (even if used)
            if (pool.length === 0) {
                pool = allQuestions;
                if (category && category !== 'Any') pool = pool.filter(q => q.category === category);
            }
        }

        const shuffled = pool.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 10);

        // Add to history
        addToHistory(selected.map(q => q.q));

        gameState.gameData = {
            phase: 'ROUND',
            round: 0,
            questions: selected,
            question: selected[0],
            timer: 45, // Updated timer as per previous tasks
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
