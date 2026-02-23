# FamGame — Project Notes

## Architecture

- **Client**: Vite + React + TypeScript, Tailwind CSS, Framer Motion
- **Server**: Express + Socket.IO, TypeScript via ts-node
- **Dev**: `npm run dev` from root runs both via concurrently

## Key Patterns

- Game state is a single `gameState` object on the server, broadcast via Socket.IO
- Each game has a `currentGame` string type + `gameData: any` for state
- Host/Player split: separate React components per game in `games/<game-name>/`
- Games are registered in THREE places: `App.tsx` (GAME_MODES), `HostLogic.tsx` (GAMES), and `server/index.ts` (selectGame handler)
- Timer is server-managed via `startTimer()` function
- Sounds are synthesized via Web Audio API in `SoundContext.tsx`

## Known Issues

- IDE shows "Cannot find module" for react/framer-motion/etc — pre-existing; node_modules not resolved in TS server but Vite builds fine
- `gameData` is typed as `any` — works but not type-safe
- Single `gameState` object — only one room at a time

## Games Implemented (17 total)

TRIVIA, 2TRUTHS, HOT_TAKES, POLL, BUZZ_IN, WORD_RACE, REACTION, EMOJI_STORY, BLUFF, THIS_OR_THAT, SPEED_DRAW, CHAIN_REACTION, MIND_MELD, COMPETE, BRAIN_BURST, GLOBAL_AVERAGES, SKILL_SHOWDOWN

## Brain Burst Details

- 35 questions shuffled per game
- 10 prize tiers ($100 → $1M)
- Phases: INTRO → QUESTION → REVEAL → GAME_OVER
- 20s timer per question
- 50:50 lifeline (one per player per game)
- Streak bonuses up to 3x
- Auto-chains: Brain Burst → Global Averages → Skill Showdown

## Deployment

See `AGENT_HANDOFF.md` for full deployment instructions.
