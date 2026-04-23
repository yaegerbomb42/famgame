import { GameType } from '../types';

export interface GameCatalogEntry {
    id: GameType;
    name: string;
    icon: string;
    minPlayers: number;
}

export const GAME_CATALOG: GameCatalogEntry[] = [
    { id: 'TRIVIA', name: 'Trivia Rush', icon: '❓', minPlayers: 1 },
    { id: '2TRUTHS', name: 'Two Truths', icon: '🎭', minPlayers: 2 },
    { id: 'HOT_TAKES', name: 'Hot Takes', icon: '🌶️', minPlayers: 2 },
    { id: 'POLL', name: 'Poll Party', icon: '📊', minPlayers: 1 },
    { id: 'BUZZ_IN', name: 'Buzz In', icon: '⚡', minPlayers: 2 },
    { id: 'WORD_RACE', name: 'Word Race', icon: '⌨️', minPlayers: 1 },
    { id: 'REACTION', name: 'Reaction', icon: '🎯', minPlayers: 1 },
    { id: 'EMOJI_STORY', name: 'Emoji Story', icon: '😂', minPlayers: 1 },
    { id: 'BLUFF', name: 'Bluff', icon: '🎲', minPlayers: 3 },
    { id: 'THIS_OR_THAT', name: 'This or That', icon: '⚖️', minPlayers: 1 },
    { id: 'SPEED_DRAW', name: 'Speed Draw', icon: '🎨', minPlayers: 1 },
    { id: 'CHAIN_REACTION', name: 'Chain Reaction', icon: '🔗', minPlayers: 2 },
    { id: 'MIND_MELD', name: 'Mind Meld', icon: '🧠', minPlayers: 2 },
    { id: 'COMPETE', name: 'Compete', icon: '🥊', minPlayers: 2 },
    { id: 'ROAST_MASTER', name: 'Roast Master', icon: '🔥', minPlayers: 2 },
    { id: 'BRAIN_BURST', name: 'Brain Burst', icon: '💥', minPlayers: 1 },
    { id: 'AI_MASHUP', name: 'AI Mashup', icon: '🤖', minPlayers: 1 },
    { id: 'GLOBAL_AVERAGES', name: 'Global Avg', icon: '🌍', minPlayers: 1 },
    { id: 'SKILL_SHOWDOWN', name: 'Skill Showdown', icon: '🎯', minPlayers: 1 },
    { id: 'ODD_ONE_OUT', name: 'Odd One Out', icon: '🔍', minPlayers: 1 },
    { id: 'DRAW_CHAIN', name: 'Draw Chain', icon: '🔗', minPlayers: 2 },
];
