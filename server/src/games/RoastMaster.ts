import { GameState } from '../types';
import { BaseGame } from './logic/BaseGame';
import { AIGenerator } from '../utils/AIGenerator';

const PERSONAS = [
    { id: 'TECH_BRO', name: 'Zack "The Disruptor"', trait: 'Talks exclusively about blockchain and cold plunges' },
    { id: 'KAREN', name: 'Manager-Seeker Margaret', trait: 'Has a "Live Laugh Love" sign but doesn\'t do any of those' },
    { id: 'INFLUENCER', name: 'Crystal Skye', trait: 'Has been filming a TikTok for 14 hours straight' },
    { id: 'GMER', name: 'NoobSlayer99', trait: 'Hasn\'t seen sunlight since 2012' },
];

export class RoastMasterGame extends BaseGame {
    id = 'ROAST_MASTER' as const;
    name = 'Roast Master';
    description = 'Write the best burns for assigned personas!';

    protected async initGameData(gameState: GameState): Promise<void> {
        gameState.gameData = {
            ...gameState.gameData,
            round: 1,
            totalRounds: 3,
            assignments: {},
            roasts: [],
            currentRoastIdx: 0,
            subPhase: 'WRITING',
            votedPlayers: {},
            roundResults: {},
        };
        await this.prepareRound(gameState);
        this.transitionTo(gameState, 'INTRO', 8);
    }

    private async prepareRound(gameState: GameState) {
        const players = this.getNonHostPlayerIds(gameState);
        const assignments: Record<string, any> = {};
        const targets = [...players].sort(() => Math.random() - 0.5);

        const assignmentPromises = players.map(async (pid, i) => {
            const targetId = targets[(i + 1) % targets.length];
            const targetName = gameState.players[targetId].name;
            const trait = await AIGenerator.generateRoastPrompt(targetName);
            
            return {
                pid,
                data: {
                    targetId,
                    targetName,
                    trait: `Roast ${targetName}: ${trait}`,
                    roast: null,
                }
            };
        });

        const results = await Promise.all(assignmentPromises);
        results.forEach(res => {
            assignments[res.pid] = res.data;
        });

        gameState.gameData.assignments = assignments;
        gameState.gameData.roasts = [];
        gameState.gameData.currentRoastIdx = 0;
        gameState.gameData.subPhase = 'WRITING';
        gameState.gameData.votedPlayers = {};
    }

    protected async onTimerEnd(gameState: GameState, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase, currentRoastIdx, roasts } = gameState.gameData;

        if (this.phase === 'INTRO') {
            this.transitionTo(gameState, 'PLAYING', 60);
        } else if (this.phase === 'PLAYING') {
            if (subPhase === 'WRITING') {
                this.startReading(gameState);
            } else if (subPhase === 'READING') {
                if (currentRoastIdx < roasts.length - 1) {
                    gameState.gameData.currentRoastIdx++;
                    this.timer = 12; // Increased from 10
                    gameState.gameData.timer = 12;
                } else {
                    gameState.gameData.subPhase = 'VOTING';
                    this.timer = 20; // Increased from 15
                    gameState.gameData.timer = 20;
                }
            } else if (subPhase === 'VOTING') {
                this.phase = 'PROCESSING';
                broadcast();
                await this.resolveVotes(gameState);
                this.transitionTo(gameState, 'REVEAL', 8);
            }
        } else if (this.phase === 'REVEAL') {
            if (gameState.gameData.round < gameState.gameData.totalRounds) {
                gameState.gameData.round++;
                await this.prepareRound(gameState);
                this.transitionTo(gameState, 'PLAYING', 60);
            } else {
                this.onEnd(gameState, broadcast, roast);
            }
        }
        broadcast();
    }

    protected async handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (c?: string, t?: string) => void): Promise<void> {
        const { subPhase } = gameState.gameData;

        if (this.phase === 'PLAYING') {
            if (subPhase === 'WRITING') {
                if (data.roast && gameState.gameData.assignments[playerId]) {
                    gameState.gameData.assignments[playerId].roast = data.roast;
                    const playerCount = this.getActivePlayerCount(gameState);
                    const roastCount = Object.values(gameState.gameData.assignments).filter((a: any) => a.roast).length;
                    if (roastCount >= playerCount) {
                        await this.onTimerEnd(gameState, broadcast, roast);
                    }
                }
            } else if (subPhase === 'VOTING') {
                if (data.voteIdx !== undefined && !gameState.gameData.votedPlayers[playerId]) {
                    if (gameState.gameData.roasts[data.voteIdx]) {
                        gameState.gameData.roasts[data.voteIdx].votes = (gameState.gameData.roasts[data.voteIdx].votes || 0) + 1;
                        gameState.gameData.votedPlayers[playerId] = true;
                        
                        const voterCount = Object.keys(gameState.gameData.votedPlayers).length;
                        if (voterCount >= this.getActivePlayerCount(gameState)) {
                            await this.onTimerEnd(gameState, broadcast, roast);
                        }
                    }
                }
            }
        }
    }

    private startReading(gameState: GameState) {
        const roasts: any[] = [];
        Object.keys(gameState.gameData.assignments).forEach((pid) => {
            const a = gameState.gameData.assignments[pid];
            if (a.roast) {
                roasts.push({
                    authorId: pid,
                    text: a.roast,
                    targetName: a.targetName,
                    trait: a.trait,
                    votes: 0,
                });
            }
        });
        gameState.gameData.roasts = roasts.sort(() => Math.random() - 0.5);
        gameState.gameData.subPhase = 'READING';
        this.transitionTo(gameState, 'PLAYING', 12);
    }

    private resolveVotes(gameState: GameState) {
        gameState.gameData.roasts.forEach((r: any) => {
            if (r.votes > 0) {
                this.awardPoints(gameState, r.authorId, r.votes * 100);
            }
        });
    }
}
