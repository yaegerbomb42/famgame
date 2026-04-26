import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameTransition } from '../../components/GameTransition';
import { LeaderboardOverlay } from '../../components/LeaderboardOverlay';
import { GameScreen, HeroPanel, Panel, PlayerGrid, StatPill } from '../../components/ui/GameFrame';
import TimerRing from '../../components/ui/TimerRing';

interface TwoTruthsHostProps {
  gameState: any;
}

const ACCENT = {
  primary: '#34d399',
  secondary: '#f472b6',
  glow: 'rgba(52, 211, 153, 0.26)',
};

const TwoTruthsHost: React.FC<TwoTruthsHostProps> = ({ gameState }) => {
  const { phase, gameData, players } = gameState;
  const { playerOrder = [], subjectIndex = 0, submissions = {}, timer = 0, subPhase, votes = {} } = gameData || {};

  const participants = useMemo(
    () => Object.values(players).filter((p: any) => !p.isHost),
    [players],
  );

  if (phase === 'RESULTS') {
    return <LeaderboardOverlay entries={participants as any} title="Lie Detector Standings" />;
  }

  const currentSubjectId = playerOrder[subjectIndex];
  const subject = currentSubjectId ? players[currentSubjectId] : null;
  const submission = currentSubjectId ? submissions[currentSubjectId] : null;
  const statements = Array.isArray(submission?.statements) ? submission.statements : [];

  return (
    <GameScreen accent={ACCENT}>
      <GameTransition phase={phase} gameState={gameState} isHost />

      <div className="flex h-full flex-col gap-5 p-5 md:p-8">
        <AnimatePresence mode="wait">
          {phase === 'PLAYING' && subPhase === 'INPUT' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Write Phase"
                title={
                  <>
                    Everyone writes <span className="text-emerald-300">two truths</span> and one lie
                  </>
                }
                subtitle="The game moves best when everyone writes short, vivid statements. This screen makes the room feel live instead of stalled."
                icon="🎭"
                aside={<TimerRing timeLeft={timer} maxTime={35} size={118} accentColor={ACCENT.primary} accentGlow={ACCENT.glow} />}
              />

              <Panel className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Submissions In</div>
                  <div className="text-2xl font-black text-white">{Object.keys(submissions).length}/{participants.length}</div>
                </div>
                <PlayerGrid players={participants as any} readyMap={submissions} accent={ACCENT} readyLabel="Ready to Fool" />
              </Panel>
            </motion.div>
          )}

          {(phase === 'PLAYING' && subPhase === 'VOTING' && subject) || (phase === 'REVEAL' && subject) ? (
            <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5">
              <HeroPanel
                accent={ACCENT}
                eyebrow={phase === 'REVEAL' ? 'Truth Reveal' : 'Spot the Lie'}
                title={
                  <>
                    {subject.name}'s <span className="text-pink-300">story stack</span>
                  </>
                }
                subtitle={
                  phase === 'REVEAL'
                    ? 'The lie is highlighted below. Keep the reveal fast so the next player can step right in.'
                    : 'Players vote on the statement that smells fake. Suspense works best when we keep this page readable and punchy.'
                }
                icon={subject.avatar || '🕵️'}
                aside={
                  <div className="grid gap-3">
                    <StatPill label="Subject" value={subject.name} accent={ACCENT.primary} />
                    {phase === 'PLAYING' ? (
                      <StatPill label="Time Left" value={`${Math.ceil(timer)}s`} accent={ACCENT.secondary} />
                    ) : (
                      <StatPill label="Votes Cast" value={Object.keys(votes).length} accent={ACCENT.secondary} />
                    )}
                  </div>
                }
              />

              <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-2">
                {statements.map((text: string, index: number) => {
                  const voteAvatars = Object.entries(votes)
                    .filter(([, voteIndex]) => Number(voteIndex) === index)
                    .map(([playerId]) => players[playerId]?.avatar || '👀');
                  const isLie = phase === 'REVEAL' && index === submission?.lieIndex;

                  return (
                    <Panel
                      key={`${subject.id}-${index}`}
                      className={`relative overflow-hidden ${isLie ? 'border-pink-300/40 bg-pink-400/12 shadow-[0_0_32px_rgba(244,114,182,0.18)]' : ''}`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] text-xl font-black ${isLie ? 'bg-pink-300 text-[#08101d]' : 'bg-white/10 text-white/80'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/42">
                              {isLie ? 'The Lie' : phase === 'REVEAL' ? 'Truth' : 'Statement'}
                            </div>
                            <div className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em] text-white">{text}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {voteAvatars.length ? voteAvatars.map((avatar, voteIndex) => (
                            <div key={`${index}-${voteIndex}`} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/25 text-2xl">
                              {avatar}
                            </div>
                          )) : (
                            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white/42">
                              No votes yet
                            </div>
                          )}
                        </div>
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </GameScreen>
  );
};

export default TwoTruthsHost;
