import { GameState, IGameLogic } from '../types';

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

export class PollGame implements IGameLogic {
    id = 'POLL' as const;
    name = 'Poll Party';
    description = 'Vote for your friends!';

    onStart(gameState: GameState, broadcast: () => void) {
        this.startNewPoll(gameState);
    }

    startNewPoll(gameState: GameState) {
        gameState.gameData = {
            phase: 'VOTING',
            prompt: POLL_PROMPTS[Math.floor(Math.random() * POLL_PROMPTS.length)],
            votes: {},
        };
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (gameState.gameData.phase === 'VOTING') {
            // Data: { targetId: string }
            if (data.targetId) {
                gameState.gameData.votes[playerId] = data.targetId;

                const playerCount = Object.keys(gameState.players).length;
                const voteCount = Object.keys(gameState.gameData.votes).length;

                if (voteCount >= playerCount) {
                    gameState.gameData.phase = 'RESULTS';
                }
            }
        }
    }

    // Called by RoomManager on "nextRound"
    nextRound(gameState: GameState) {
        this.startNewPoll(gameState);
    }

    onEnd(gameState: GameState) { }
}
