import { GameType, IGameLogic } from '../types';
import { TriviaGame } from './Trivia';
import { TwoTruthsGame } from './TwoTruths';
import { HotTakesGame } from './HotTakes';
import { PollGame } from './Poll';
import { BuzzInGame } from './BuzzIn';
import { WordRaceGame } from './WordRace';
import { ReactionGame } from './Reaction';
import { EmojiStoryGame } from './EmojiStory';
import { BluffGame } from './Bluff';
import { ThisOrThatGame } from './ThisOrThat';
import { SpeedDrawGame } from './SpeedDraw';
import { DrawChainGame } from './DrawChain';
import { ChainReactionGame } from './ChainReaction';
import { MindMeldGame } from './MindMeld';
import { CompeteGame } from './Compete';
import { RoastMasterGame } from './RoastMaster';
import { BrainBurstGame } from './BrainBurst';
import { AIMashupGame } from './AIMashup';
import { GlobalAveragesGame } from './GlobalAverages';
import { SkillShowdownGame } from './SkillShowdown';
import { OddOneOutGame } from './OddOneOut';

export type GameConstructor = new () => IGameLogic;

export const GAME_REGISTRY: Record<GameType, GameConstructor> = {
    TRIVIA: TriviaGame,
    '2TRUTHS': TwoTruthsGame,
    HOT_TAKES: HotTakesGame,
    POLL: PollGame,
    BUZZ_IN: BuzzInGame,
    WORD_RACE: WordRaceGame,
    REACTION: ReactionGame,
    EMOJI_STORY: EmojiStoryGame,
    BLUFF: BluffGame,
    THIS_OR_THAT: ThisOrThatGame,
    SPEED_DRAW: SpeedDrawGame,
    DRAW_CHAIN: DrawChainGame,
    CHAIN_REACTION: ChainReactionGame,
    MIND_MELD: MindMeldGame,
    COMPETE: CompeteGame,
    ROAST_MASTER: RoastMasterGame,
    BRAIN_BURST: BrainBurstGame,
    AI_MASHUP: AIMashupGame,
    GLOBAL_AVERAGES: GlobalAveragesGame,
    SKILL_SHOWDOWN: SkillShowdownGame,
    ODD_ONE_OUT: OddOneOutGame
};
