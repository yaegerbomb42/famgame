export type GameStatus = 'LOBBY' | 'GAME_SELECT' | 'PLAYING' | 'RESULTS';

export type GameType =
    | 'TRIVIA'
    | '2TRUTHS'
    | 'HOT_TAKES'
    | 'POLL'
    | 'BUZZ_IN'
    | 'WORD_RACE'
    | 'REACTION'
    | 'EMOJI_STORY'
    | 'BLUFF'
    | 'THIS_OR_THAT'
    | 'SPEED_DRAW'
    | 'CHAIN_REACTION'
    | 'MIND_MELD'
    | 'COMPETE'
    | 'ROAST_MASTER'
    | 'AI_MASHUP'
    | 'GLOBAL_AVERAGES'
    | 'SKILL_SHOWDOWN'
    | 'BRAIN_BURST'
    | 'ODD_ONE_OUT'
    | 'DRAW_CHAIN';

export interface Player {
    id: string;
    name: string;
    avatar: string;
    color?: string;
    score: number;
    bannedUntil?: number;
    isHost?: boolean;
    gameVote?: string; // ID of the game they voted for
}

export interface GameState {
    roomCode: string;
    hostId: string | null;
    players: Record<string, Player>;
    status: GameStatus;
    currentGame?: GameType;
    gameData?: any; // Specific data for the active game
    gameVotes: Record<string, number>;
    timer?: number; // Seconds remaining
    leaderboard: { name: string; score: number }[];
    isPublic?: boolean;
    continuousMode?: boolean;
    customQuips?: Array<{text: string, mood: 'hype' | 'savage' | 'neutral' | 'sad'}>;
    phase?: string; // Sub-phase for games
}

export interface IGameLogic {
    onStart(gameState: GameState, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> | void;
    update(dt: number, gameState: GameState, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> | void;
    onInput(gameState: GameState, playerId: string, data: any, broadcast: () => void, roast: (context?: string, targetId?: string) => void): Promise<void> | void;
    onEnd(gameState: GameState, broadcast: () => void, roast: (context?: string, targetId?: string) => void): void;
    onPlayerLeave(gameState: GameState, playerId: string, broadcast: () => void): Promise<void> | void;
}
