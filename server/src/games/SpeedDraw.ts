import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';

const DRAW_PROMPTS = ['Cat', 'House', 'Car', 'Sun', 'Tree', 'Pizza', 'Robot', 'Ghost', 'Dragon', 'Rocket'];

export class SpeedDrawGame extends BaseGame {
    id = 'SPEED_DRAW' as const;
    name = 'Speed Draw';
    description = 'Sketch the prompt as quickly and accurately as possible before time runs out.';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            playerPrompts: {}, // pid -> prompt
            submissions: {}, 
            liveDrawings: {},
            votes: {},       
            subPhase: 'DRAWING',
            roundResults: {}
        };

        const playerIds = this.getNonHostPlayerIds(gameState);
        try {
            const prompts = await AIGenerator.generateDrawingPrompts(playerIds.length);
            playerIds.forEach((pid, i) => {
                gameState.gameData.playerPrompts[pid] = prompts[i] || "A happy little accident";
            });
        } catch (e) {
            playerIds.forEach(pid => {
                gameState.gameData.playerPrompts[pid] = "A mysterious object";
            });
        }
        
        this.transitionTo(gameState, 'INTRO', 10);
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase } = gameState.gameData;

        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 60); // 60s for drawing
        } else if (this.phase === 'PLAYING') {
            if (subPhase === 'DRAWING') {
                if (this.getActivePlayerCount(gameState) <= 1) {
                    this.transitionTo(gameState, 'REVEAL', 10);
                } else {
                    gameState.gameData.subPhase = 'VOTING';
                    this.transitionTo(gameState, 'PLAYING', 30); // 30s for judging/voting
                }
            } else {
                this.resolveVotes(gameState);
                this.transitionTo(gameState, 'REVEAL', 10);
            }
        } else if (this.phase === 'REVEAL') {
            this.onEnd(gameState, broadcast, roast);
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase } = gameState.gameData;

        if (this.phase === 'PLAYING') {
            if (subPhase === 'DRAWING') {
                if (data.drawing) {
                    gameState.gameData.submissions[playerId] = data.drawing;
                    // Also update final live version for consistency
                    gameState.gameData.liveDrawings[playerId] = data.drawing;
                    if (Object.keys(gameState.gameData.submissions).length >= this.getActivePlayerCount(gameState)) {
                        await this.onTimerEnd(gameState, broadcast, roast);
                    }
                } else if (data.liveDrawing) {
                    // Update work-in-progress sketch
                    gameState.gameData.liveDrawings[playerId] = data.liveDrawing;
                }
            } else if (subPhase === 'VOTING') {
                if (data.targetPid) {
                    gameState.gameData.votes[playerId] = data.targetPid;
                    if (Object.keys(gameState.gameData.votes).length >= this.getActivePlayerCount(gameState)) {
                        await this.onTimerEnd(gameState, broadcast, roast);
                    }
                }
            }
        }
    }

    private resolveVotes(gameState: GameState) {
        Object.values(gameState.gameData.votes).forEach((targetId: any) => {
            this.awardPoints(gameState, targetId, 100);
        });
    }
}
