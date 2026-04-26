import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import { GameScreen, HeroPanel, Panel, StatPill } from '../../components/ui/GameFrame';
import TimerRing from '../../components/ui/TimerRing';

interface PollHostProps {
  gameState: any;
}

const ACCENT = {
  primary: '#38bdf8',
  secondary: '#fde047',
  glow: 'rgba(56, 189, 248, 0.22)',
};

const PollHost: React.FC<PollHostProps> = ({ gameState }) => {
  const { phase, gameData, players } = gameState;
  const { currentQuestion = '...', submissions = {}, correct = 50, timer = 0, currentRound = 0, totalRounds = 8 } = gameData || {};

  const participants = useMemo(() => Object.values(players).filter((p: any) => !p.isHost), [players]);

  if (phase === 'RESULTS' && currentRound === totalRounds - 1) {
    const hasLeaderboard = participants.some((p: any) => p.score > 0);
    if (hasLeaderboard) return <LeaderboardOverlay entries={participants as any} title="Poll Party Standings" />;
  }

  const guesses = participants.map((player: any) => {
    const guess = Number(submissions[player.id] ?? 0);
    const diff = Math.abs(guess - correct);
    return { player, guess, diff };
  });
  const closestDiff = Math.min(...guesses.map(({ diff }) => diff), Number.POSITIVE_INFINITY);

  return (
    <GameScreen accent={ACCENT}>
      <GameTransition phase={phase} gameState={gameState} isHost />

      <div className="flex h-full flex-col gap-5 p-5 md:p-8">
        <AnimatePresence mode="wait">
          {phase === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5 overflow-hidden">
              <HeroPanel
                accent={ACCENT}
                eyebrow={`Round ${currentRound + 1} of ${totalRounds}`}
                title={
                  <>
                    Guess the <span className="text-sky-300">real percentage</span>
                  </>
                }
                subtitle={currentQuestion}
                icon="📊"
                aside={<TimerRing timeLeft={timer} maxTime={14} size={118} accentColor={ACCENT.secondary} accentGlow="rgba(253, 224, 71, 0.28)" />}
              />

              <Panel>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/42">Locked Guesses</div>
                    <div className="mt-1 text-3xl font-black text-white">{Object.keys(submissions).length}/{participants.length}</div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 overflow-hidden rounded-full bg-white/8">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-sky-300 to-yellow-300"
                        animate={{ width: `${participants.length ? (Object.keys(submissions).length / participants.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Panel>

              <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-2 xl:grid-cols-2">
                {guesses.map(({ player, guess }) => {
                  const hasSubmitted = submissions[player.id] !== undefined;
                  return (
                    <Panel key={player.id} className={hasSubmitted ? 'border-sky-300/30 bg-sky-400/10' : ''}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-black/25 text-2xl">{player.avatar}</div>
                          <div>
                            <div className="text-sm font-black uppercase tracking-[0.16em] text-white">{player.name}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                              {hasSubmitted ? 'Locked In' : 'Thinking'}
                            </div>
                          </div>
                        </div>
                        <div className="text-3xl font-black text-sky-300">{hasSubmitted ? `${guess}%` : '...'}</div>
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </motion.div>
          )}

          {(phase === 'REVEAL' || phase === 'RESULTS') && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5 overflow-hidden">
              <HeroPanel
                accent={ACCENT}
                eyebrow="The Real Number"
                title={
                  <>
                    <span className="text-yellow-300">{correct}%</span> was the mark
                  </>
                }
                subtitle={currentQuestion}
                icon="🎯"
                aside={
                  <div className="grid gap-3">
                    <StatPill label="Closest Spread" value={`${closestDiff === Number.POSITIVE_INFINITY ? 0 : closestDiff}%`} accent={ACCENT.secondary} />
                    <StatPill label="Guesses" value={Object.keys(submissions).length} accent={ACCENT.primary} />
                  </div>
                }
              />

              <Panel className="flex-1">
                <div className="relative mx-auto mt-4 h-[min(42vh,360px)] w-full max-w-5xl">
                  <div className="absolute inset-x-6 bottom-10 h-4 rounded-full bg-white/10" />
                  {[0, 25, 50, 75, 100].map((marker) => (
                    <div key={marker} className="absolute bottom-4 flex -translate-x-1/2 flex-col items-center" style={{ left: `${marker}%` }}>
                      <div className="h-8 w-px bg-white/20" />
                      <div className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/34">{marker}%</div>
                    </div>
                  ))}

                  <div
                    className="absolute bottom-10 w-1 rounded-full bg-yellow-300 shadow-[0_0_30px_rgba(253,224,71,0.55)]"
                    style={{ left: `${correct}%`, height: '78%', transform: 'translateX(-50%)' }}
                  />

                  {guesses.filter(({ player }) => submissions[player.id] !== undefined).map(({ player, guess, diff }) => {
                    const closest = diff === closestDiff;
                    return (
                      <div key={player.id} className="absolute bottom-14 flex -translate-x-1/2 flex-col items-center" style={{ left: `${guess}%` }}>
                        <div className={`rounded-[1.2rem] border px-3 py-3 text-center ${closest ? 'border-yellow-300/40 bg-yellow-300/20 text-[#07111f]' : 'border-white/12 bg-black/30 text-white'}`}>
                          <div className="text-3xl">{player.avatar}</div>
                          <div className="mt-1 text-lg font-black">{guess}%</div>
                        </div>
                        <div className={`mt-2 h-20 w-px ${closest ? 'bg-yellow-300' : 'bg-white/12'}`} />
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameScreen>
  );
};

export default PollHost;
