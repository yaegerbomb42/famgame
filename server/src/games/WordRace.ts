import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';

export class WordRaceGame extends BaseGame {
    id = 'WORD_RACE' as const;
    name = 'Word Race';
    description = 'Solve the riddle as fast as you can!';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            rounds: [],
            currentRound: 0,
            totalRounds: 5,
            submissions: {}, // pid -> { word, time }
            wrongGuesses: {}, // pid -> string[]
            active: false,
            winnerId: null,
            roundResults: {},
        };

        try {
            const riddles = await AIGenerator.generateRiddles(5);
            gameState.gameData.rounds = riddles;
        } catch (e) {
            gameState.gameData.rounds = Array(5).fill({
                riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
                answer: "echo"
            });
        }
        
        this.transitionTo(gameState, 'INTRO', 8);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { currentRound, totalRounds, rounds } = gameState.gameData;

        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 25);
            gameState.gameData.submissions = {};
            gameState.gameData.wrongGuesses = {};
            gameState.gameData.winnerId = null;
            gameState.gameData.active = true;
            gameState.gameData.startTime = Date.now();
        } else if (this.phase === 'PLAYING') {
            gameState.gameData.active = false;
            this.transitionTo(gameState, 'REVEAL', 6);
        } else if (this.phase === 'REVEAL') {
            if (currentRound < totalRounds - 1) {
                gameState.gameData.currentRound++;
                this.transitionTo(gameState, 'INTRO', 8);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        if (this.phase === 'PLAYING' && gameState.gameData.active) {
            const { currentRound, rounds, winnerId } = gameState.gameData;
            const guess = (data.word || '').toLowerCase().trim();
            const correctAnswer = rounds[currentRound].answer.toLowerCase().trim();

            if (guess === correctAnswer) {
                if (!winnerId) {
                    gameState.gameData.winnerId = playerId;
                    gameState.gameData.submissions[playerId] = {
                        word: guess,
                        time: Date.now() - gameState.gameData.startTime
                    };
                    this.awardPoints(gameState, playerId, 500);
                    roast('Riddle Master', playerId);
                    
                    // End round early if someone wins? 
                    // Let's give others a chance to see? 
                    // Actually user said "race to input", so first one wins the round.
                    await this.onTimerEnd(gameState, broadcast, roast);
                }
            } else {
                // Wrong guess
                if (!gameState.gameData.wrongGuesses[playerId]) {
                    gameState.gameData.wrongGuesses[playerId] = [];
                }
                if (!gameState.gameData.wrongGuesses[playerId].includes(guess) && guess.length > 0) {
                    gameState.gameData.wrongGuesses[playerId].push(guess);
                    broadcast();
                }
            }
        }
    }
}

