import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import { ActionButton, GameScreen, HeroPanel, Panel, PlayerGrid, StatPill } from '../../components/ui/GameFrame';
import TimerRing from '../../components/ui/TimerRing';

interface TriviaHostProps {
  gameState: any;
}

const ACCENT = {
  primary: '#22d3ee',
  secondary: '#8b5cf6',
  glow: 'rgba(34, 211, 238, 0.28)',
};

const LETTERS = ['A', 'B', 'C', 'D'];

const TriviaHost: React.FC<TriviaHostProps> = ({ gameState }) => {
  const { phase, gameData, players } = gameState;
  const {
    question,
    availableCategories = [],
    votes = {},
    submissions = {},
    timer: hostTimer,
    timeLeft: hostTimeLeft,
    round = 0,
    totalRounds = 5,
    roundResults = {},
  } = gameData || {};

  const participants = useMemo(
    () => Object.values(players).filter((p: any) => !p.isHost),
    [players],
  );
  const liveTime = hostTimer ?? hostTimeLeft ?? 0;
  const [localTimeLeft, setLocalTimeLeft] = useState(liveTime);

  useEffect(() => {
    setLocalTimeLeft(liveTime);
    if (liveTime <= 0 || !['PLAYING', 'REVEAL'].includes(phase)) return;

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setLocalTimeLeft(Math.max(0, liveTime - elapsed));
    }, 100);

    return () => clearInterval(interval);
  }, [liveTime, phase]);

  if (phase === 'RESULTS') {
    return <LeaderboardOverlay entries={participants as any} title="Trivia Rush Standings" />;
  }

  const voteCounts = Object.values(votes).reduce<Record<string, number>>((acc, category: any) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  const topVoteCount = Math.max(0, ...Object.values(voteCounts));
  const answerOptions = Array.isArray(question?.a)
    ? question.a
    : Array.isArray(question?.options)
      ? question.options
      : [];
  const answeredCount = Object.keys(submissions).length;
  const correctEntries = participants
    .map((player: any) => ({
      player,
      result: roundResults[player.id],
    }))
    .filter(({ result }) => result?.correct)
    .sort((a, b) => (b.result?.points || 0) - (a.result?.points || 0));

  return (
    <GameScreen accent={ACCENT}>
      <GameTransition phase={phase} gameState={gameState} isHost />

      <div className="flex h-full flex-col gap-5 p-5 md:p-8">
        <AnimatePresence mode="wait">
          {phase === 'LOADING' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center"
            >
              <HeroPanel
                accent={ACCENT}
                eyebrow="Question Forge"
                title={
                  <>
                    Building the next <span className="text-cyan-300">brain melter</span>
                  </>
                }
                subtitle="Fresh questions are loading right now so the room keeps moving without awkward dead air."
                icon="⚙️"
                aside={
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/30 text-3xl"
                  >
                    🧠
                  </motion.div>
                }
                className="w-full max-w-4xl"
              />
            </motion.div>
          )}

          {phase === 'VOTING' && (
            <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Category Vote"
                title={
                  <>
                    Let the room choose the <span className="text-violet-300">vibe</span>
                  </>
                }
                subtitle="Majority wins, but the host can instantly steer into the best category when the energy is obvious."
                icon="🗳️"
                aside={
                  <div className="grid grid-cols-2 gap-3">
                    <StatPill label="Players" value={participants.length} accent={ACCENT.primary} />
                    <StatPill label="Votes In" value={Object.keys(votes).length} accent={ACCENT.secondary} />
                  </div>
                }
              />

              <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-2 md:grid-cols-2 xl:grid-cols-3">
                {availableCategories.map((category: string) => {
                  const totalVotes = voteCounts[category] || 0;
                  const leading = totalVotes > 0 && totalVotes === topVoteCount;

                  return (
                    <Panel key={category} className={`relative overflow-hidden ${leading ? 'border-cyan-300/40 bg-cyan-400/10' : ''}`}>
                      {leading ? (
                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.14),transparent)] opacity-70 animate-spotlight" />
                      ) : null}
                      <div className="relative flex h-full flex-col justify-between gap-5">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.26em] text-white/45">
                            {leading ? 'Leading Pick' : 'In Rotation'}
                          </div>
                          <h3 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">{category}</h3>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex -space-x-3">
                            {Array.from({ length: totalVotes }).map((_, index) => (
                              <div
                                key={`${category}-${index}`}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-lg shadow-[0_0_18px_rgba(255,255,255,0.08)]"
                              >
                                🧠
                              </div>
                            ))}
                          </div>
                          <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-white/72">
                            {totalVotes} vote{totalVotes === 1 ? '' : 's'}
                          </div>
                        </div>
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === 'PLAYING' && question && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5">
              <HeroPanel
                accent={ACCENT}
                eyebrow={`Round ${round + 1} of ${totalRounds}`}
                title={question.q}
                subtitle="Fast locks earn more points. Momentum matters, so the room should feel pressure the whole time."
                aside={<TimerRing timeLeft={localTimeLeft} maxTime={18} size={124} accentColor={ACCENT.primary} accentGlow={ACCENT.glow} />}
              />

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {answerOptions.map((answer: any, index: number) => {
                    const text = typeof answer === 'string' ? answer : answer?.text || answer?.answer || '';
                    return (
                      <Panel key={index} className="group flex min-h-36 items-start gap-4 transition hover:-translate-y-1 hover:border-white/20">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-cyan-300 text-xl font-black text-[#06111f] shadow-[0_0_24px_rgba(34,211,238,0.3)]">
                          {LETTERS[index]}
                        </div>
                        <div className="pt-1 text-left text-2xl font-black leading-tight tracking-[-0.03em] text-white">
                          {text}
                        </div>
                      </Panel>
                    );
                  })}
                </div>

                <Panel className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Answer Pressure</div>
                      <div className="mt-1 text-3xl font-black tracking-tight text-white">
                        {answeredCount}/{participants.length} locked
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-cyan-300">
                      Live
                    </div>
                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                      animate={{ width: `${participants.length ? (answeredCount / participants.length) * 100 : 0}%` }}
                    />
                  </div>

                  <PlayerGrid players={participants as any} readyMap={submissions} accent={ACCENT} readyLabel="Locked" />
                </Panel>
              </div>
            </motion.div>
          )}

          {phase === 'REVEAL' && question && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Correct Answer"
                title={
                  <>
                    <span className="text-cyan-300">{LETTERS[question.correct]}</span> {typeof answerOptions[question.correct] === 'string'
                      ? answerOptions[question.correct]
                      : answerOptions[question.correct]?.text || answerOptions[question.correct]?.answer}
                  </>
                }
                subtitle="Quick reveals keep the energy hot. Celebrate the speed demons, then snap forward to the next prompt."
                icon="✅"
                aside={
                  <div className="grid gap-3">
                    <StatPill label="Correct" value={correctEntries.length} accent={ACCENT.primary} />
                    <StatPill label="Missed" value={participants.length - correctEntries.length} accent="#fda4af" />
                  </div>
                }
              />

              <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <Panel className="flex flex-col gap-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Question Recap</div>
                  <div className="text-3xl font-black tracking-[-0.03em] text-white">{question.q}</div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {answerOptions.map((answer: any, index: number) => {
                      const text = typeof answer === 'string' ? answer : answer?.text || answer?.answer || '';
                      const isCorrect = index === question.correct;
                      return (
                        <div
                          key={index}
                          className={`rounded-[1.4rem] border px-4 py-4 text-left ${isCorrect ? 'border-cyan-300/50 bg-cyan-400/12 shadow-[0_0_26px_rgba(34,211,238,0.16)]' : 'border-white/8 bg-black/20'}`}
                        >
                          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/40">{LETTERS[index]}</div>
                          <div className="mt-2 text-lg font-black leading-tight text-white">{text}</div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>

                <Panel className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Best Round Scores</div>
                    <ActionButton className="pointer-events-none px-4 py-2 text-xs">Next Up Fast</ActionButton>
                  </div>
                  <div className="space-y-3 overflow-y-auto">
                    {correctEntries.length ? correctEntries.map(({ player, result }: any, index: number) => (
                      <div key={player.id} className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-black/25 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/10 text-2xl">{player.avatar}</div>
                          <div>
                            <div className="text-sm font-black uppercase tracking-[0.16em] text-white">{player.name}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                              {index === 0 ? 'Fastest Correct' : `Streak x${result?.streak || 1}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-cyan-300">+{result?.points || 0}</div>
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">points</div>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-[1.4rem] border border-rose-300/20 bg-rose-400/10 px-5 py-6 text-center text-lg font-black uppercase tracking-[0.16em] text-rose-100">
                        Nobody landed that one. Brutal.
                      </div>
                    )}
                  </div>
                </Panel>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameScreen>
  );
};

export default TriviaHost;
