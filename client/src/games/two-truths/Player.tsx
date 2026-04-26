import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';
import { ActionButton, GameScreen, HeroPanel, Panel, StatPill } from '../../components/ui/GameFrame';

const ACCENT = {
  primary: '#34d399',
  secondary: '#f472b6',
  glow: 'rgba(52, 211, 153, 0.26)',
};

const TwoTruthsPlayer: React.FC = () => {
  const { socket, gameState } = useGameStore();
  const { playClick, playSuccess, playError } = useSound();
  const [statements, setStatements] = useState(['', '', '']);
  const [lieIndex, setLieIndex] = useState<number | null>(null);
  const [localVoteIndex, setLocalVoteIndex] = useState<number | null>(null);

  const { phase, gameData, players } = (gameState as any) || {};
  const { subPhase, submissions = {}, playerOrder = [], subjectIndex = 0, votes = {}, timer = 0 } = gameData || {};

  const myId = socket?.id || '';
  const mySubmission = submissions[myId];
  const subjectId = playerOrder[subjectIndex];
  const subject = subjectId ? players?.[subjectId] : null;
  const liveStatements = useMemo(
    () => (subjectId && submissions[subjectId]?.statements) || [],
    [subjectId, submissions],
  );
  const isSubject = myId === subjectId;
  const myVote = votes[myId];

  const handleSubmit = () => {
    if (statements.some((entry) => !entry.trim()) || lieIndex === null) {
      playError();
      return;
    }
    socket?.emit('gameInput', { statements, lieIndex });
    playSuccess();
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleVote = (index: number) => {
    if (localVoteIndex !== null || myVote !== undefined || isSubject) return;
    setLocalVoteIndex(index);
    socket?.emit('gameInput', { voteIndex: index });
    playSuccess();
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <GameScreen accent={ACCENT}>
      <div className="flex h-full flex-col gap-5 p-5">
        <AnimatePresence mode="wait">
          {(phase === 'INTRO' || phase === 'RESULTS') && (
            <motion.div key={`static-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center">
              <HeroPanel
                accent={ACCENT}
                eyebrow={phase === 'RESULTS' ? 'Round Complete' : 'Two Truths'}
                title={
                  phase === 'RESULTS'
                    ? <>The TV is exposing <span className="text-pink-300">the best liar</span></>
                    : <>Write fast. Make one <span className="text-emerald-300">dangerously believable</span></>
                }
                subtitle={
                  phase === 'RESULTS'
                    ? 'Stay ready for the next player spotlight. This game feels best when each turn snaps into the next one.'
                    : 'Short, specific statements play better than long stories. One of them should feel just real enough to bait votes.'
                }
                icon={phase === 'RESULTS' ? '🕵️' : '🤥'}
                className="w-full max-w-4xl"
              />
            </motion.div>
          )}

          {phase === 'PLAYING' && subPhase === 'INPUT' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5 overflow-hidden">
              {mySubmission ? (
                <HeroPanel
                  accent={ACCENT}
                  eyebrow="Locked In"
                  title={<>Your mix is loaded. <span className="text-emerald-300">Now stay cool.</span></>}
                  subtitle="Everyone else is still writing. Hold position while the room catches up."
                  icon="✅"
                  aside={<StatPill label="Timer" value={`${Math.ceil(timer)}s`} accent={ACCENT.primary} />}
                  className="my-auto"
                />
              ) : (
                <>
                  <HeroPanel
                    accent={ACCENT}
                    eyebrow="Create Your Set"
                    title={<>Two truths. One <span className="text-pink-300">trap</span>.</>}
                    subtitle="Mark exactly one statement as the lie. Punchy lines land better than essays."
                    icon="✍️"
                    aside={<StatPill label="Time Left" value={`${Math.ceil(timer)}s`} accent={ACCENT.primary} />}
                  />

                  <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-2">
                    {statements.map((statement, index) => (
                      <Panel key={index} className={lieIndex === index ? 'border-pink-300/40 bg-pink-400/12' : ''}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/42">Statement {index + 1}</div>
                          <button
                            onClick={() => {
                              playClick();
                              setLieIndex(index);
                            }}
                            className={`rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition ${lieIndex === index ? 'border-pink-300/40 bg-pink-400/18 text-pink-100' : 'border-white/10 bg-black/20 text-white/62'}`}
                          >
                            {lieIndex === index ? 'Marked Lie' : 'Mark as Lie'}
                          </button>
                        </div>
                        <textarea
                          value={statement}
                          onChange={(event) => {
                            const next = [...statements];
                            next[index] = event.target.value;
                            setStatements(next);
                          }}
                          placeholder="Type something believable"
                          rows={3}
                          className="w-full resize-none rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-4 text-lg font-semibold text-white outline-none placeholder:text-white/24"
                        />
                      </Panel>
                    ))}
                  </div>

                  <ActionButton onClick={handleSubmit} disabled={statements.some((entry) => !entry.trim()) || lieIndex === null}>
                    Lock My Set
                  </ActionButton>
                </>
              )}
            </motion.div>
          )}

          {subPhase === 'VOTING' && (
            <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5 overflow-hidden">
              {isSubject ? (
                <HeroPanel
                  accent={ACCENT}
                  eyebrow="Pressure On"
                  title={<>They are reading <span className="text-pink-300">your tells</span></>}
                  subtitle="You cannot vote on your own set. Just enjoy the discomfort while everyone tries to sniff out the fake."
                  icon="😅"
                  aside={<StatPill label="Votes Coming" value={Object.keys(votes).length} accent={ACCENT.secondary} />}
                  className="my-auto"
                />
              ) : myVote !== undefined || localVoteIndex !== null ? (
                <HeroPanel
                  accent={ACCENT}
                  eyebrow="Vote Cast"
                  title={<>Your suspicion is <span className="text-emerald-300">locked</span></>}
                  subtitle="Now watch the host screen for the reveal. Good bluff rounds should move quickly from here."
                  icon="🗳️"
                  aside={<StatPill label="Subject" value={subject?.name || 'Player'} accent={ACCENT.primary} />}
                  className="my-auto"
                />
              ) : (
                <>
                  <HeroPanel
                    accent={ACCENT}
                    eyebrow="Spot the Lie"
                    title={
                      <>
                        Which line from <span className="text-pink-300">{subject?.name || 'this player'}</span> is fake?
                      </>
                    }
                    subtitle="The most believable lie usually wins. Trust your gut and tap once."
                    icon={subject?.avatar || '🕵️'}
                    aside={<StatPill label="Time Left" value={`${Math.ceil(timer)}s`} accent={ACCENT.primary} />}
                  />

                  <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-2">
                    {liveStatements.map((statement: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleVote(index)}
                        className="rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-300/35 hover:bg-emerald-400/10"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-white/10 text-lg font-black text-white/80">
                            {index + 1}
                          </div>
                          <div className="pt-1 text-xl font-black leading-tight tracking-[-0.03em] text-white">{statement}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {phase === 'REVEAL' && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Truth Reveal"
                title={<>The host screen has the <span className="text-pink-300">answer</span></>}
                subtitle="Use the reveal moment to reset quickly. The next player should be up almost immediately."
                icon="🎯"
                className="w-full max-w-4xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameScreen>
  );
};

export default TwoTruthsPlayer;
