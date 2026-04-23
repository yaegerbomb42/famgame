const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'client/src/games');
const games = fs.readdirSync(gamesDir);

const GAME_COLORS = {
  "word-race": "--game-word-race",
  "buzz": "--game-buzz",
  "hot-takes": "--game-hot-takes",
  "speed-draw": "--game-speed-draw",
  "brain-burst": "--game-brain-burst",
  "global-averages": "--game-global-avg",
  "skill-showdown": "--game-skill",
  "ai-mashup": "--game-ai-mashup",
  "compete": "--game-compete",
  "emoji-story": "--game-emoji",
  "mind-meld": "--game-mind-meld",
  "poll": "--game-poll",
  "roast-master": "--game-roast",
  "this-or-that": "--game-this-or-that",
  "two-truths": "--game-two-truths",
  "reaction": "--game-reaction",
  "chain-reaction": "--game-chain",
  "bluff": "--game-bluff",
  "trivia": "--game-trivia"
};

games.forEach(game => {
    const hostPath = path.join(gamesDir, game, 'Host.tsx');
    if (!fs.existsSync(hostPath)) return;

    let content = fs.readFileSync(hostPath, 'utf8');
    const colorVar = GAME_COLORS[game] || '--color-cyan';
    
    // Some TimerRings were added without usage or some usages remain as raw {timeLeft}s
    const needsTimerRing = content.includes('{timeLeft}s') || content.includes('timer}S') || content.includes('{timeLeft}');
    const hasImport = content.includes('TimerRing');

    if (needsTimerRing) {
        // Replace <div className="..."> {timeLeft}s </div>
        content = content.replace(/<div(?:[^>]+)?>\s*\{timeLeft\}s?\s*<\/div>/g, 
            `<TimerRing timeLeft={timeLeft} maxTime={30} size={100} accentColor="var(${colorVar})" accentGlow="var(${colorVar}-glow)" className="my-4" />`
        );
        // Replace stray {timeLeft}s
        content = content.replace(/\{timeLeft\}s/g, 
            `<TimerRing timeLeft={timeLeft} maxTime={30} size={100} accentColor="var(${colorVar})" accentGlow="var(${colorVar}-glow)" className="my-4" />`
        );
        
        // Add import if missing and we added TimerRing
        if (!hasImport && content.includes('<TimerRing')) {
             content = content.replace(/import { LeaderboardOverlay } from '\.\.\/\.\.\/components\/LeaderboardOverlay';/g, 
                 `import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';\nimport TimerRing from '../../components/ui/TimerRing';`
             );
        }
    } else {
        // Remove unused import
        content = content.replace(/import\s+TimerRing\s+from\s+[^;]+;\n?/g, '');
    }

    fs.writeFileSync(hostPath, content);
});
console.log('Fixed timers');
