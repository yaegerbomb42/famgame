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
    | 'COMPETE';

export interface Player {
    id: string;
    name: string;
    avatar: string;
    score: number;
    bannedUntil?: number;
    isHost?: boolean;
    gameVote?: string; // ID of the game they voted for
}

export interface ChatMessage {
    id: string;
    playerId: string | null;
    name: string;
    avatar?: string;
    text: string;
    timestamp: number;
    isSystem?: boolean;
    isAi?: boolean;
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
    chat: ChatMessage[];
    aiPersona: { name: string; avatar: string };
}

export interface IGameLogic {
    id: GameType;
    name: string;
    description: string;
    onStart(gameState: GameState, broadcast: () => void): void;
    onInput(gameState: GameState, playerId: string, data: any): void;
    onTick?(gameState: GameState): void; // Called every second if needed
    onEnd(gameState: GameState): void;
}
