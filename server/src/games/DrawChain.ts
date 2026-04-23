import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';

export class DrawChainGame extends BaseGame {
    id = 'DRAW_CHAIN' as const;
    name = 'Draw Chain';
    description = 'Submit wacky prompts, draw them, and guess what others sketched in a hilarious chain reaction.';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            subPhase: 'SUBMIT_PROMPTS',
            userPrompts: {}, // pid -> string[]
            promptPool: [], // flattened prompts
            assignments: {}, // pid -> prompt
            drawings: {}, // pid -> dataUrl
            guesses: {}, // drawingPid -> { guesserPid -> guess }
            currentDrawingIndex: 0,
            round: 1,
            maxRounds: 3
        };
        
        this.transitionTo(gameState, 'INTRO', 10);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase, round, maxRounds } = gameState.gameData;

        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 30); // 30s to submit 3 prompts
            gameState.gameData.subPhase = 'SUBMIT_PROMPTS';
        } else if (this.phase === 'PLAYING') {
            if (subPhase === 'SUBMIT_PROMPTS') {
                this.assignPrompts(gameState);
                gameState.gameData.subPhase = 'DRAWING';
                this.transitionTo(gameState, 'PLAYING', 60);
            } else if (subPhase === 'DRAWING') {
                gameState.gameData.subPhase = 'GUESSING';
                gameState.gameData.currentDrawingIndex = 0;
                this.transitionTo(gameState, 'PLAYING', 30); // 30s per drawing
            } else if (subPhase === 'GUESSING') {
                const drawings = Object.keys(gameState.gameData.drawings);
                if (gameState.gameData.currentDrawingIndex < drawings.length - 1) {
                    gameState.gameData.currentDrawingIndex++;
                    this.transitionTo(gameState, 'PLAYING', 30);
                } else {
                    if (round < maxRounds) {
                        gameState.gameData.round++;
                        gameState.gameData.subPhase = 'SUBMIT_PROMPTS';
                        gameState.gameData.userPrompts = {};
                        gameState.gameData.drawings = {};
                        gameState.gameData.guesses = {};
                        this.transitionTo(gameState, 'PLAYING', 30);
                    } else {
                        this.transitionTo(gameState, 'REVEAL', 10);
                    }
                }
            }
        } else if (this.phase === 'REVEAL') {
            this.onEnd(gameState, broadcast, roast);
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase } = gameState.gameData;

        if (this.phase === 'PLAYING') {
            if (subPhase === 'SUBMIT_PROMPTS') {
                if (Array.isArray(data.prompts)) {
                    gameState.gameData.userPrompts[playerId] = data.prompts.slice(0, 3);
                    if (Object.keys(gameState.gameData.userPrompts).length >= this.getActivePlayerCount(gameState)) {
                        await this.onTimerEnd(gameState, broadcast, roast);
                    }
                }
            } else if (subPhase === 'DRAWING') {
                if (data.drawing) {
                    gameState.gameData.drawings[playerId] = data.drawing;
                    if (Object.keys(gameState.gameData.drawings).length >= this.getActivePlayerCount(gameState)) {
                        await this.onTimerEnd(gameState, broadcast, roast);
                    }
                }
            } else if (subPhase === 'GUESSING') {
                if (data.guess) {
                    const drawings = Object.keys(gameState.gameData.drawings);
                    const currentDrawingPid = drawings[gameState.gameData.currentDrawingIndex];
                    
                    if (!gameState.gameData.guesses[currentDrawingPid]) {
                        gameState.gameData.guesses[currentDrawingPid] = {};
                    }
                    
                    if (!gameState.gameData.guesses[currentDrawingPid][playerId]) {
                        gameState.gameData.guesses[currentDrawingPid][playerId] = data.guess;
                        await this.evaluateGuess(gameState, currentDrawingPid, playerId, data.guess);
                        broadcast();
                    }
                }
            }
        }
    }

    private assignPrompts(gameState: GameState) {
        const pids = this.getNonHostPlayerIds(gameState);
        const allPrompts: { text: string, owner: string }[] = [];
        
        Object.entries(gameState.gameData.userPrompts).forEach(([pid, prompts]: [string, any]) => {
            prompts.forEach((p: string) => allPrompts.push({ text: p, owner: pid }));
        });

        // Fallback if no prompts
        if (allPrompts.length === 0) {
            pids.forEach(pid => allPrompts.push({ text: "A mysterious thing", owner: 'system' }));
        }

        // Shuffle
        for (let i = allPrompts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allPrompts[i], allPrompts[j]] = [allPrompts[j], allPrompts[i]];
        }

        pids.forEach((pid, index) => {
            // Try to find a prompt NOT by this user
            let promptIndex = allPrompts.findIndex(p => p.owner !== pid);
            if (promptIndex === -1) promptIndex = 0;
            
            const selected = allPrompts.splice(promptIndex, 1)[0];
            gameState.gameData.assignments[pid] = selected.text;
        });
    }

    private async evaluateGuess(gameState: GameState, drawingPid: string, guesserPid: string, guess: string) {
        const targetPrompt = gameState.gameData.assignments[drawingPid];
        const similarity = await AIGenerator.checkSemanticSimilarity(guess, targetPrompt);
        
        if (similarity >= 0.8) {
            const points = similarity >= 1.0 ? 500 : 300;
            this.awardPoints(gameState, guesserPid, points);
            // Award drawer too
            this.awardPoints(gameState, drawingPid, 200);
            
            // Mark as correct for UI
            gameState.gameData.guesses[drawingPid][guesserPid] = { text: guess, correct: true, points };
        } else {
            gameState.gameData.guesses[drawingPid][guesserPid] = { text: guess, correct: false, similarity };
        }
    }
}
