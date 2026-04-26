import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import { GameScreen, HeroPanel, Panel, PlayerGrid, StatPill } from '../../components/ui/GameFrame';
import TimerRing from '../../components/ui/TimerRing';

interface HotTakesHostProps {
  gameState: any;
}

const ACCENT = {
  primary: '#fb7185',
  secondary: '#f59e0b',
  glow: 'rgba(251, 113, 133, 0.24)',
};

const HotTakesHost: React.FC<HotTakesHostProps> = ({ gameState }) => {
  const { phase, gameData, players } = gameState;
  const { submissions = {}, votes = {}, prompt = "What's your take?", subPhase, timer = 0 } = gameData || {};
  const participants = useMemo(() => Object.values(players).filter((p: any) => !p.isHost), [players]);

  if (phase === 'RESULTS') {
    return <LeaderboardOverlay entries={participants as any} title="Spice Rankings" />;
  }

  const scoredTakes = Object.entries(submissions).map(([playerId, text]) => ({
    playerId,
    text,
    votes: Object.values(votes).filter((vote) => vote === playerId).length,
  })).sort((a, b) => b.votes - a.votes);
  const winner = scoredTakes[0];

  return (
    <GameScreen accent={ACCENT}>
      <GameTransition phase={phase} gameState={gameState} isHost />

      <div className="flex h-full flex-col gap-5 p-5 md:p-8">
        <AnimatePresence mode="wait">
          {phase === 'PLAYING' && subPhase === 'INPUT' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Take Writing"
                title={
                  <>
                    Drop your most <span className="text-rose-300">defensible chaos</span>
                  </>
                }
                subtitle={prompt}
                icon="🌶️"
                aside={<TimerRing timeLeft={timer} maxTime={35} size={118} accentColor={ACCENT.primary} accentGlow={ACCENT.glow} />}
              />

              <Panel className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Takes In</div>
                  <div className="text-2xl font-black text-white">{Object.keys(submissions).length}/{participants.length}</div>
                </div>
                <PlayerGrid players={participants as any} readyMap={submissions} accent={ACCENT} readyLabel="Take Loaded" />
              </Panel>
            </motion.div>
          )}

          {phase === 'PLAYING' && subPhase === 'VOTE' && (
            <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5 overflow-hidden">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Crowd Vote"
                title={<>Which take hits the <span className="text-amber-300">hardest</span>?</>}
                subtitle={prompt}
                icon="🔥"
                aside={
                  <div className="grid gap-3">
                    <StatPill label="Votes Cast" value={Object.keys(votes).length} accent={ACCENT.primary} />
                    <StatPill label="Time Left" value={`${Math.ceil(timer)}s`} accent={ACCENT.secondary} />
                  </div>
                }
              />

              <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-2 xl:grid-cols-2">
                {scoredTakes.map(({ playerId, text, votes: takeVotes }) => (
                  <Panel key={playerId} className="flex flex-col justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-black/25 text-2xl">
                          {players[playerId]?.avatar || '💬'}
                        </div>
                        <div>
                          <div className="text-sm font-black uppercase tracking-[0.16em] text-white">{players[playerId]?.name || 'Player'}</div>
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{takeVotes} vote{takeVotes === 1 ? '' : 's'}</div>
                        </div>
                      </div>
                      <div className="mt-4 text-2xl font-black leading-tight tracking-[-0.03em] text-white">“{String(text)}”</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Object.entries(votes)
                        .filter(([, vote]) => vote === playerId)
                        .map(([voterId]) => (
                          <div key={voterId} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-xl">
                            {players[voterId]?.avatar || '👀'}
                          </div>
                        ))}
                    </div>
                  </Panel>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'REVEAL' && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Winning Take"
                title={
                  winner
                    ? <>“{String(winner.text)}”</>
                    : <>No take survived the <span className="text-amber-300">heat</span></>
                }
                subtitle={
                  winner
                    ? `${players[winner.playerId]?.name || 'A player'} pulled ${winner.votes} vote${winner.votes === 1 ? '' : 's'}.`
                    : 'The standings screen is next.'
                }
                icon="🏆"
                aside={winner ? <StatPill label="Votes" value={winner.votes} accent={ACCENT.primary} /> : undefined}
                className="w-full max-w-4xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameScreen>
  );
};

export default HotTakesHost;
