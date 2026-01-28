import { GameState, IGameLogic } from '../types';

export const TRIVIA_QUESTIONS = [
    { q: "Who is most likely to trip over nothing?", a: ["Dad", "Mom", "The Dog", "Grandma"], correct: 0 },
    { q: "What is the capital of Australia?", a: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
    { q: "Which planet is known as the Red Planet?", a: ["Venus", "Jupiter", "Mars", "Saturn"], correct: 2 },
    // Simplified list for now, can import full list
];

export class TriviaGame implements IGameLogic {
    id = 'TRIVIA' as const;
    name = 'Trivia';
    description = 'Answer correctly to win!';

    onStart(gameState: GameState, broadcast: () => void) {
        gameState.gameData = {
            questionIndex: 0,
            question: TRIVIA_QUESTIONS[0],
            timer: 30,
            showResult: false,
            answers: {}
        };
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        // data expected to be { answerIndex: number }
        const answerIndex = data.answerIndex;
        if (typeof answerIndex !== 'number') return;

        if (!gameState.gameData.answers) gameState.gameData.answers = {};
        gameState.gameData.answers[playerId] = answerIndex;

        const playerCount = Object.keys(gameState.players).length;
        const answerCount = Object.keys(gameState.gameData.answers).length;

        if (answerCount >= playerCount) {
            this.resolveRound(gameState);
        }
    }

    private resolveRound(gameState: GameState) {
        gameState.gameData.showResult = true;
        Object.entries(gameState.gameData.answers).forEach(([pid, ans]: [string, any]) => {
            if (ans === gameState.gameData.question.correct) {
                if (gameState.players[pid]) gameState.players[pid].score += 100;
            }
        });
    }

    onEnd(gameState: GameState) {
        // Cleanup
    }
}
