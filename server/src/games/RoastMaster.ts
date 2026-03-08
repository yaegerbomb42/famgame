import { GameState, IGameLogic } from '../types';
import { getAIQuip, getCloser, getOpener } from './content/RoastTemplates';
import { RoastStats } from './logic/RoastStats';

type GameMode = 'STANDARD' | 'SPEED_ROAST' | 'GAUNTLET';

export class RoastMasterGame implements IGameLogic {
    id = 'ROAST_MASTER' as const;
    name = 'Roast Master';
    description = 'Write the best burns for assigned personas!';

    private personas = [
        { id: 'TECH_BRO', name: 'Zack "The Disruptor"', trait: 'Talks exclusively about blockchain and cold plunges' },
        { id: 'KAREN', name: 'Manager-Seeker Margaret', trait: 'Has a "Live Laugh Love" sign but doesn\'t do any of those' },
        { id: 'INFLUENCER', name: 'Crystal Skye', trait: 'Has been filming a TikTok for 14 hours straight' },
        { id: 'GMER', name: 'NoobSlayer99', trait: 'Hasn\'t seen sunlight since 2012' },
        { id: 'BOOMER', name: 'Uncle Jerry', trait: 'Typing with one finger and sharing minion memes' },
        { id: 'E_GIRL', name: 'Miku-chan', trait: 'Owns 47 different pairs of cat-ear headphones' },
        { id: 'CRYPTO_GURU', name: 'Chad "Moon" Steiner', trait: 'Will explain Web3 to you until your ears bleed' },
        { id: 'MLM_MOM', name: 'BossBabe Brenda', trait: 'Hey hun! 🌸 Want to start your own business? 💸' },
        { id: 'GYM_RAT', name: 'Swole Sam', trait: 'His entire personality is pre-workout and chicken breast' },
        { id: ' hipster', name: 'Atticus Von PBR', trait: ' Liked this game before it was cool and only plays on vinyl' },
        { id: 'CONSPIRACY', name: 'DeepState Dave', trait: 'His hat is made of high-quality, signal-blocking tin foil' },
        { id: 'ARTIST', name: 'Paint-Stained Portia', trait: 'Exists solely on black coffee and "the vibe"' }
    ];

    private stats: RoastStats | null = null;
    private mode: GameMode = 'STANDARD';

    onStart(gameState: GameState, broadcast: () => void) {
        const players = Object.keys(gameState.players).filter(id => !gameState.players[id].isHost);
        this.stats = new RoastStats(players);

        // Randomly select a mode for variety
        const rand = Math.random();
        if (rand > 0.8) this.mode = 'SPEED_ROAST';
        else if (rand > 0.9) this.mode = 'GAUNTLET';
        else this.mode = 'STANDARD';

        const shuffledPersonas = [...this.personas].sort(() => Math.random() - 0.5);

        const assignments: Record<string, any> = {};
        players.forEach((pid, idx) => {
            assignments[pid] = {
                targetId: pid,
                persona: shuffledPersonas[idx % shuffledPersonas.length],
                roasts: {}
            };
        });

        gameState.gameData = {
            phase: 'INTRO',
            timer: 12,
            assignments,
            currentRoastIdx: 0,
            reactions: [],
            roastsToVote: [],
            mode: this.mode,
            medals: {}
        };

        this.startTimer(gameState, broadcast);
    }

    private startTimer(gameState: GameState, broadcast: () => void) {
        const tick = () => {
            if (gameState.status !== 'PLAYING' || gameState.currentGame !== 'ROAST_MASTER') return;

            if (gameState.gameData.timer > 0) {
                gameState.gameData.timer--;
                broadcast();
                setTimeout(tick, 1000);
            } else {
                this.nextPhase(gameState, broadcast);
            }
        };
        setTimeout(tick, 1000);
    }

    private nextPhase(gameState: GameState, broadcast: () => void) {
        const currentPhase = gameState.gameData.phase;

        if (currentPhase === 'INTRO') {
            gameState.gameData.phase = 'WRITING';
            gameState.gameData.timer = 60;
            this.startTimer(gameState, broadcast);
        } else if (currentPhase === 'WRITING') {
            this.prepareReading(gameState);
            gameState.gameData.phase = 'READING';
            gameState.gameData.currentRoastIdx = 0;
            gameState.gameData.timer = this.mode === 'SPEED_ROAST' ? 7 : 10;
            this.startTimer(gameState, broadcast);
        } else if (currentPhase === 'READING') {
            if (gameState.gameData.currentRoastIdx < gameState.gameData.roastsToVote.length - 1) {
                gameState.gameData.currentRoastIdx++;
                gameState.gameData.timer = 10;
                this.startTimer(gameState, broadcast);
                this.startTimer(gameState, broadcast);
            } else {
                gameState.gameData.phase = 'VOTING';
                gameState.gameData.timer = this.mode === 'SPEED_ROAST' ? 10 : 20;
                this.startTimer(gameState, broadcast);
            }
        } else if (currentPhase === 'VOTING') {
            gameState.gameData.phase = 'WINNER';
            gameState.gameData.timer = 30; // Longer for awards

            // Generate awards
            if (this.stats) {
                gameState.gameData.medals = this.stats.generateReportCard();
            }

            this.startTimer(gameState, broadcast);
        }
        broadcast();
    }

    private prepareReading(gameState: GameState) {
        const allRoasts: any[] = [];
        Object.keys(gameState.gameData.assignments).forEach(targetId => {
            const assignment = gameState.gameData.assignments[targetId];
            Object.keys(assignment.roasts).forEach(authorId => {
                allRoasts.push({
                    authorId,
                    targetId,
                    text: assignment.roasts[authorId],
                    votes: 0,
                    score: 0,
                    personaName: assignment.persona.name,
                    targetName: gameState.players[targetId]?.name || 'Unknown'
                });
            });
        });

        // "Burn Analysis": Rank them roughly by length and keyword density for the AI host
        const analyizedRoasts = allRoasts.map(r => {
            const lengthScore = Math.min(r.text.length / 50, 1) * 20;
            const spicyKeywords = ['degenerate', 'failure', 'stink', 'basement', 'blockchain', 'waste', 'clown'].filter(w => r.text.toLowerCase().includes(w)).length * 10;
            const spicyRating = lengthScore + spicyKeywords;

            // Track stats
            if (this.stats) this.stats.trackSpiciness(r.authorId, spicyRating);

            const commentary = getAIQuip(spicyRating);
            return { ...r, spicyRating, commentary };
        });

        // Also ensure assignments have roasts if users didn't submit
        // In a real app we might leave them blank, but for "The Inferno" we autofill with AI insults
        // Implementation left simple for now.

        gameState.gameData.roastsToVote = analyizedRoasts.sort(() => Math.random() - 0.5);
    }

    onInput(gameState: GameState, playerId: string, data: any) {
        if (data.type === 'SUBMIT_ROAST' && gameState.gameData.phase === 'WRITING') {
            const { targetId, text } = data;
            if (gameState.gameData.assignments[targetId] && text.length > 2) {
                gameState.gameData.assignments[targetId].roasts[playerId] = text;
            }
        }

        if (data.type === 'VOTE' && gameState.gameData.phase === 'VOTING') {
            const { roastIdx } = data;
            const roast = gameState.gameData.roastsToVote[roastIdx];
            if (roast && roast.authorId !== playerId) {
                roast.votes++;
                if (gameState.players[roast.authorId]) {
                    gameState.players[roast.authorId].score += 100;
                }
            }
        }

        if (data.type === 'REACTION' && gameState.gameData.phase === 'READING') {
            const { emoji } = data;
            if (!gameState.gameData.reactions) gameState.gameData.reactions = [];
            gameState.gameData.reactions.push({
                id: Date.now() + Math.random(),
                emoji,
                playerId
            });
            // Keep only latest 20 reactions to avoid state bloat
            if (gameState.gameData.reactions.length > 20) {
                gameState.gameData.reactions.shift();
            }
        }
    }

    onEnd(gameState: GameState) {
        // Final cleanup
    }
}
