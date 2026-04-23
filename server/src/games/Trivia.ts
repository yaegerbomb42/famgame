import { GameState, GameType } from '../types';
import fs from 'fs';
import path from 'path';
import { AIGenerator, TriviaQuestion } from '../utils/AIGenerator';
import { BaseGame } from './logic/BaseGame';

const DATA_DIR = path.join(process.cwd(), 'data');
const QUESTIONS_FILE = path.join(DATA_DIR, 'trivia_questions.json');
const HISTORY_FILE = path.join(DATA_DIR, 'trivia_history.json');

function getQuestions(): any[] {
    try {
        if (!fs.existsSync(QUESTIONS_FILE)) return [];
        return JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
    } catch (e) {
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

export class TriviaGame extends BaseGame {
    id = 'TRIVIA' as GameType;
    name = 'Trivia';
    description = 'Answer fast to keep your streak alive!';

    private playerStreaks: Record<string, number> = {};
    private loadingCategory: string | null = null;

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            round: 0,
            question: null,
            availableCategories: [],
            votes: {},
            submissions: {},
            roundResults: {}
        };
        // Standard transition to INTRO handled by BaseGame
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void): Promise<void> {
        if (this.phase === 'INTRO') {
            const pool = getQuestions();
            const categories = Array.from(new Set(pool.map(q => q.category)));
            // Show all categories instead of selecting a random subset
            gameState.gameData.availableCategories = categories.sort();
            this.transitionTo(gameState, 'VOTING', 0); // Disable timer for voting phase
        } else if (this.phase === 'VOTING') {
            this.resolveVoting(gameState, broadcast); // Pass broadcast
        } else if (this.phase === 'PLAYING') {
            this.resolveRound(gameState); // Move to resolveRound helper
        } else if (this.phase === 'REVEAL') {
            if (this.round < this.maxRounds - 1) {
                this.nextRound(gameState);
            } else {
                this.onEnd(gameState, broadcast, (c, t) => {}); // Roast not needed for transition
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'VOTING') {
            const isHost = gameState.players[playerId]?.isHost;
            if (data.category) {
                gameState.gameData.votes[playerId] = data.category;
            } else if (data.customTheme && isHost) {
                gameState.gameData.customTheme = data.customTheme;
                gameState.gameData.votes[playerId] = 'Custom';
            }

            const humanCount = this.getActivePlayerCount(gameState);
            let shouldResolve = false;

            if (isHost && (data.category || data.customTheme)) {
                // Host selected a category or custom theme
                shouldResolve = true;
            } else {
                // Check for majority vote
                const counts: Record<string, number> = {};
                Object.values(gameState.gameData.votes).forEach((cat: any) => {
                    counts[cat] = (counts[cat] || 0) + 1;
                });
                
                const majorityNeeded = Math.floor(humanCount / 2) + 1;
                for (const count of Object.values(counts)) {
                    if (count >= majorityNeeded) {
                        shouldResolve = true;
                        break;
                    }
                }

                // Or resolve if everyone has voted
                if (Object.keys(gameState.gameData.votes).length >= humanCount) {
                    shouldResolve = true;
                }
            }

            if (shouldResolve) {
                await this.resolveVoting(gameState, broadcast);
            }
            broadcast();
        } else if (this.phase === 'PLAYING' && typeof data.answerIndex === 'number') {
            if (gameState.gameData.submissions[playerId]) return;
            
            gameState.gameData.submissions[playerId] = {
                index: data.answerIndex,
                timeRemaining: Number(this.timer.toFixed(1))
            };

            const humanCount = this.getActivePlayerCount(gameState);
            if (Object.keys(gameState.gameData.submissions).length >= humanCount) {
                this.timer = 0;
                await this.onTimerEnd(gameState, broadcast);
            }
            broadcast();
        }
    }

    private async resolveVoting(gameState: GameState, broadcast: () => void) {
        const counts: Record<string, number> = {};
        Object.values(gameState.gameData.votes).forEach((cat: any) => {
            counts[cat] = (counts[cat] || 0) + 1;
        });

        let winner = 'Any';
        let max = -1;
        Object.entries(counts).forEach(([cat, val]) => {
            if (val > max) { max = val; winner = cat; }
        });

        if (winner === 'Any') {
            const pool = getQuestions();
            const categories = Array.from(new Set(pool.map(q => q.category)));
            winner = categories[Math.floor(Math.random() * categories.length)] || 'General';
        }

        let categoryToUse = winner;
        if (winner === 'Custom' && gameState.gameData.customTheme) {
            categoryToUse = gameState.gameData.customTheme;
        }

        this.loadingCategory = categoryToUse;
        this.transitionTo(gameState, 'LOADING', 15);

        const finish = (questions: any[]) => {
            if (this.phase !== 'LOADING') return;
            let finalQuestions = questions || [];
            
            if (finalQuestions.length < 10) {
                const pool = getQuestions().filter(q => categoryToUse === 'Any' || q.category === categoryToUse);
                const backup = pool.sort(() => Math.random() - 0.5).slice(0, 10 - finalQuestions.length);
                finalQuestions = [...finalQuestions, ...backup];
            }

            // Sort by difficulty: Easy (1-3), Medium (4-7), Hard (8-10)
            const easy = finalQuestions.filter(q => q.difficulty === 'Easy');
            const medium = finalQuestions.filter(q => q.difficulty === 'Medium');
            const hard = finalQuestions.filter(q => q.difficulty === 'Hard');
            
            const sorted = [
                ...easy.sort(() => Math.random() - 0.5).slice(0, 3),
                ...medium.sort(() => Math.random() - 0.5).slice(0, 4),
                ...hard.sort(() => Math.random() - 0.5).slice(0, 3)
            ];

            this.startTrivia(gameState, sorted.length >= 5 ? sorted : finalQuestions.slice(0, 10));
            broadcast();
        };

        try {
            const questions = await AIGenerator.generateTrivia(categoryToUse, 15); // Ask for more to ensure difficulty mix
            finish(questions);
        } catch (e) {
            finish([]);
        }
    }

    private resolveLoadingTimeout(gameState: GameState, broadcast: () => void) {
        if (this.phase !== 'LOADING') return;
        const cat = this.loadingCategory || 'Any';
        let pool = getQuestions().filter(q => cat === 'Any' || q.category === cat);
        if (!pool.length) pool = getQuestions();
        const selected = pool.sort(() => Math.random() - 0.5).slice(0, 10);
        this.startTrivia(gameState, selected);
    }

    private startTrivia(gameState: GameState, questions: any[]) {
        this.loadingCategory = null;
        this.round = 0;
        this.maxRounds = questions.length;

        gameState.gameData = {
            ...gameState.gameData,
            questions,
            question: questions[0],
            round: 0,
            timer: 25,
            submissions: {},
            roundResults: {}
        };
        this.transitionTo(gameState, 'PLAYING', 25);
    }

    private resolveRound(gameState: GameState) {
        const currentQ = gameState.gameData.question;
        const results: Record<string, any> = {};

        this.getNonHostPlayerIds(gameState).forEach(pid => {
            const sub = gameState.gameData.submissions[pid];
            const isCorrect = sub && Number(sub.index) === Number(currentQ.correct);
            
            if (isCorrect) {
                const streak = (this.playerStreaks[pid] || 0) + 1;
                this.playerStreaks[pid] = streak;
                const points = 100 + Math.floor(sub.timeRemaining * 10) * (streak >= 3 ? 2 : 1);
                this.awardPoints(gameState, pid, points);
                results[pid] = { points, correct: true, streak };
            } else {
                this.playerStreaks[pid] = 0;
                results[pid] = { points: 0, correct: false, streak: 0 };
            }
        });

        gameState.gameData.roundResults = results;
        this.transitionTo(gameState, 'REVEAL', 8);
    }

    private nextRound(gameState: GameState) {
        this.round++;
        if (this.round >= this.maxRounds) {
            // Need broadcast here? BaseGame uses it. nextRound is called from onTimerEnd which has it.
            // But nextRound doesn't have it. Passing a dummy.
            this.onEnd(gameState, () => {}, (c, t) => {});
            return;
        }

        gameState.gameData.round = this.round;
        gameState.gameData.question = gameState.gameData.questions[this.round];
        gameState.gameData.submissions = {};
        gameState.gameData.roundResults = {};
        this.transitionTo(gameState, 'PLAYING', 25);
    }
}
