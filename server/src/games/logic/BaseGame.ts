import { GameState, IGameLogic, GameType, Player } from '../../types';

export abstract class BaseGame implements IGameLogic {
    abstract id: GameType;
    abstract name: string;
    abstract description: string;

    // Standard Phases: 'LOBBY' | 'INTRO' | 'PLAYING' | 'REVEAL' | 'RESULTS' | 'LEADERBOARD'
    protected phase: string = 'LOBBY';
    protected timer: number = 0;
    protected round: number = 0;
    protected maxRounds: number = 5;
    protected phaseStartTime: number = 0;
    protected minPhaseTime: number = 0;
    protected introTime: number = 10;

    // Hook for sub-classes to initialize their specific data
    protected abstract initGameData(gameState: GameState, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> | void;

    async onStart(gameState: GameState, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> {
        this.round = 0;
        
        // Deep reset of gameData ensuring no leakage from previous games
        gameState.gameData = {
            gameName: this.name,
            gameDescription: this.description,
            phase: 'INTRO',
            submissions: {},
            votes: {},
            roundResults: {},
            timer: 0
        };

        await this.initGameData(gameState, broadcast, roast);
        
        // Ensure INTRO transition after data is initialized, using the game's specific introTime
        this.transitionTo(gameState, 'INTRO', this.introTime); 
        broadcast();
    }

    async update(dt: number, gameState: GameState, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> {
        if (this.timer > 0) {
            this.timer -= dt;
            gameState.gameData.timer = this.timer <= 0 ? 0 : Number(this.timer.toFixed(1));
            
            if (this.timer <= 0) {
                this.timer = 0;
                await this.onTimerEnd(gameState, broadcast, roast);
            }
        }
    }

    protected abstract onTimerEnd(gameState: GameState, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> | void;

    async onInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> {
        // Base Guard: Only accept input from registered players who are not the Host
        const player = gameState.players[playerId];
        if (!player || player.isHost) {
            return;
        }

        // Base Guard: Only accept input during the correct phase 
        // (Most games only accept input during PLAYING, but we allow games to override this)
        const currentPhase = this.phase;
        if (currentPhase === 'RESULTS' || currentPhase === 'INTRO') {
            return;
        }

        await this.handlePlayerInput(gameState, playerId, data, broadcast, roast);
        broadcast(); // Systemic broadcast to ensure UI updates (e.g. checkmarks)
    }

    protected abstract handlePlayerInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> | void;

    async onPlayerLeave(gameState: GameState, playerId: string, broadcast: () => void): Promise<void> {
        // Robustness: Check if we should auto-resolve if this was the last player we were waiting for
        // Note: the leave logic doesn't currently need roast, but onTimerEnd will be called if it was the last player
        const playersNeeded = this.getActivePlayerCount(gameState);
        const submissions = Object.keys(gameState.gameData.submissions || {}).length;

        if (playersNeeded > 0 && submissions >= playersNeeded) {
            // We need a way to call onTimerEnd with roast here. 
            // For now, we'll assume leave doesn't trigger a Roast directly or we'll pass a dummy.
            await this.onTimerEnd(gameState, broadcast, () => {});
        } else if (playersNeeded === 0) {
            this.onEnd(gameState, broadcast, () => {});
            broadcast();
        }
    }

    onEnd(gameState: GameState, broadcast: () => void, roast: (context?: string, targetId?: string) => void): void {
        this.transitionTo(gameState, 'RESULTS');
    }

    protected transitionTo(gameState: GameState, phase: string, timer: number = 0) {
        this.phase = phase;
        this.timer = timer;
        this.phaseStartTime = Date.now();
        this.minPhaseTime = phase === 'INTRO' ? 5000 : 0; // 5s min for Intro
        
        gameState.phase = phase; // Set top-level for Host screens
        gameState.gameData.phase = phase; // Set in gameData for Player screens
        gameState.gameData.timer = Math.ceil(timer);
    }

    protected canTransitionInstantly(): boolean {
        if (this.phase !== 'INTRO') return true;
        const elapsed = Date.now() - this.phaseStartTime;
        return elapsed >= this.minPhaseTime;
    }

    // Helper: Get count of human players (non-hosts)
    protected getActivePlayerCount(gameState: GameState): number {
        return this.getNonHostPlayerIds(gameState).length;
    }

    protected getNonHostPlayerIds(gameState: GameState): string[] {
        return Object.entries(gameState.players)
            .filter(([_, p]) => !p.isHost)
            .map(([id, _]) => id);
    }

    // Helper: Award points with a beautiful 'Glow' metadata for the client
    protected awardPoints(gameState: GameState, playerId: string, points: number) {
        if (gameState.players[playerId]) {
            gameState.players[playerId].score += points;
            // Add to round results for animation
            if (!gameState.gameData.roundResults) gameState.gameData.roundResults = {};
            gameState.gameData.roundResults[playerId] = {
                points,
                total: gameState.players[playerId].score,
                glow: points > 0 ? 'GOLD' : 'NONE'
            };
        }
    }
}
