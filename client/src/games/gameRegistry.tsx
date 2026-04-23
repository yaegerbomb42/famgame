import React from 'react';
import type { GameState } from '../store/useGameStore';

// Host Components
import TriviaHost from './trivia/Host';
import ReactionHost from './reaction/Host';
import BrainBurstHost from './brain-burst/Host';
import GlobalAveragesHost from './global-averages/Host';
import SkillShowdownHost from './skill-showdown/Host';
import AIMashupHost from './ai-mashup/Host';
import BluffHost from './bluff/Host';
import BuzzHost from './buzz/Host';
import ChainReactionHost from './chain-reaction/Host';
import CompeteHost from './compete/Host';
import EmojiStoryHost from './emoji-story/Host';
import HotTakesHost from './hot-takes/Host';
import MindMeldHost from './mind-meld/Host';
import PollHost from './poll/Host';
import RoastMasterHost from './roast-master/Host';
import SpeedDrawHost from './speed-draw/Host';
import ThisOrThatHost from './this-or-that/Host';
import TwoTruthsHost from './two-truths/Host';
import WordRaceHost from './word-race/Host';
import OddOneOutHost from './odd-one-out/Host';
import DrawChainHost from './draw-chain/Host';

// Player Components
import TriviaPlayer from './trivia/Player';
import ReactionPlayer from './reaction/Player';
import BrainBurstPlayer from './brain-burst/Player';
import GlobalAveragesPlayer from './global-averages/Player';
import SkillShowdownPlayer from './skill-showdown/Player';
import AIMashupPlayer from './ai-mashup/Player';
import BluffPlayer from './bluff/Player';
import BuzzPlayer from './buzz/Player';
import ChainReactionPlayer from './chain-reaction/Player';
import CompetePlayer from './compete/Player';
import EmojiStoryPlayer from './emoji-story/Player';
import HotTakesPlayer from './hot-takes/Player';
import MindMeldPlayer from './mind-meld/Player';
import PollPlayer from './poll/Player';
import RoastMasterPlayer from './roast-master/Player';
import SpeedDrawPlayer from './speed-draw/Player';
import ThisOrThatPlayer from './this-or-that/Player';
import TwoTruthsPlayer from './two-truths/Player';
import WordRacePlayer from './word-race/Player';
import OddOneOutPlayer from './odd-one-out/Player';
import DrawChainPlayer from './draw-chain/Player';

export type GameComponentProps = {
    gameState: GameState;
};

export const HOST_COMPONENTS: Record<string, React.FC<GameComponentProps>> = {
    TRIVIA: TriviaHost,
    REACTION: ReactionHost,
    BRAIN_BURST: BrainBurstHost,
    GLOBAL_AVERAGES: GlobalAveragesHost,
    SKILL_SHOWDOWN: SkillShowdownHost,
    AI_MASHUP: AIMashupHost,
    BLUFF: BluffHost,
    BUZZ_IN: BuzzHost,
    CHAIN_REACTION: ChainReactionHost,
    COMPETE: CompeteHost,
    EMOJI_STORY: EmojiStoryHost,
    HOT_TAKES: HotTakesHost,
    MIND_MELD: MindMeldHost,
    POLL: PollHost,
    ROAST_MASTER: RoastMasterHost,
    SPEED_DRAW: SpeedDrawHost,
    THIS_OR_THAT: ThisOrThatHost,
    '2TRUTHS': TwoTruthsHost,
    WORD_RACE: WordRaceHost,
    ODD_ONE_OUT: OddOneOutHost,
    DRAW_CHAIN: DrawChainHost
};

export const PLAYER_COMPONENTS: Record<string, React.FC<GameComponentProps>> = {
    TRIVIA: TriviaPlayer,
    REACTION: ReactionPlayer,
    BRAIN_BURST: BrainBurstPlayer,
    GLOBAL_AVERAGES: GlobalAveragesPlayer,
    SKILL_SHOWDOWN: SkillShowdownPlayer,
    AI_MASHUP: AIMashupPlayer,
    BLUFF: BluffPlayer,
    BUZZ_IN: BuzzPlayer,
    CHAIN_REACTION: ChainReactionPlayer,
    COMPETE: CompetePlayer,
    EMOJI_STORY: EmojiStoryPlayer,
    HOT_TAKES: HotTakesPlayer,
    MIND_MELD: MindMeldPlayer,
    POLL: PollPlayer,
    ROAST_MASTER: RoastMasterPlayer,
    SPEED_DRAW: SpeedDrawPlayer,
    THIS_OR_THAT: ThisOrThatPlayer,
    '2TRUTHS': TwoTruthsPlayer,
    WORD_RACE: WordRacePlayer,
    ODD_ONE_OUT: OddOneOutPlayer,
    DRAW_CHAIN: DrawChainPlayer
};
