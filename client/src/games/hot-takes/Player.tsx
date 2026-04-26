import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';
import { ActionButton, GameScreen, HeroPanel, Panel, StatPill } from '../../components/ui/GameFrame';

const ACCENT = {
  primary: '#fb7185',
  secondary: '#f59e0b',
  glow: 'rgba(251, 113, 133, 0.24)',
};

const HotTakesPlayer: React.FC = () => {
  const { socket, gameState } = useGameStore();
  const { playSuccess, playError } = useSound();
  const [take, setTake] = useState('');

  const gameData = (gameState?.gameData ?? {}) as Record<string, any>;
  const phase = (gameData.phase ?? gameState?.phase) as string | undefined;
  const { prompt = "What's your take?", submissions = {}, votes = {}, subPhase, timer = 0 } = gameData;
  const hasSubmitted = Boolean(submissions[socket?.id || '']);
  const hasVoted = Boolean(votes[socket?.id || '']);

  const voteOptions = useMemo(
    () => Object.entries(submissions).map(([playerId, text]) => ({ playerId, text: String(text) })),
    [submissions],
  );

  const handleSubmit = () => {
    if (!take.trim()) {
      playError();
      return;
    }
    socket?.emit('gameInput', { submission: take.trim() });
    playSuccess();
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleVote = (targetId: string) => {
    if (targetId === socket?.id) {
      playError();
      return;
    }
    socket?.emit('gameInput', { vote: targetId });
    playSuccess();
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <GameScreen accent={ACCENT}>
      <div className="flex h-full flex-col gap-5 p-5">
        <AnimatePresence mode="wait">
          {(phase === 'INTRO' || phase === 'RESULTS') && (
            <motion.div key={`hold-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center">
              <HeroPanel
                accent={ACCENT}
                eyebrow={phase === 'RESULTS' ? 'Results Incoming' : 'Hot Takes'}
                title={
                  phase === 'RESULTS'
                    ? <>Stand by for the <span className="text-amber-300">temperature check</span></>
                    : <>Pick a side and <span className="text-rose-300">commit</span></>
                }
                subtitle={
                  phase === 'RESULTS'
                    ? 'The host screen is ranking the room right now.'
                    : 'The best takes are short, confident, and just controversial enough to make somebody mad.'
                }
                icon={phase === 'RESULTS' ? '🏁' : '🔥'}
                className="w-full max-w-4xl"
              />
            </motion.div>
          )}

          {phase === 'REVEAL' && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Reveal"
                title={<>The room is picking the <span className="text-amber-300">winner</span></>}
                subtitle="Keep your eyes on the TV. This round should resolve fast so the app never feels stuck."
                icon="💥"
                className="w-full max-w-4xl"
              />
            </motion.div>
          )}

          {phase === 'PLAYING' && subPhase === 'INPUT' && (
            <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5 overflow-hidden">
              {hasSubmitted ? (
                <HeroPanel
                  accent={ACCENT}
                  eyebrow="Take Locked"
                  title={<>Your hot take is <span className="text-rose-300">in the fire</span></>}
                  subtitle="Now watch the clock while the rest of the room catches up."
                  icon="✅"
                  aside={<StatPill label="Time Left" value={`${Math.ceil(timer)}s`} accent={ACCENT.primary} />}
                  className="my-auto"
                />
              ) : (
                <>
                  <HeroPanel
                    accent={ACCENT}
                    eyebrow="Write Your Take"
                    title={<>Say it with your <span className="text-amber-300">full chest</span></>}
                    subtitle={prompt}
                    icon="🌶️"
                    aside={<StatPill label="Time Left" value={`${Math.ceil(timer)}s`} accent={ACCENT.primary} />}
                  />

                  <Panel className="flex-1">
                    <textarea
                      value={take}
                      onChange={(event) => setTake(event.target.value)}
                      placeholder="Type your hot take"
                      maxLength={120}
                      className="h-full min-h-[220px] w-full resize-none rounded-[1.4rem] border border-white/10 bg-black/20 px-5 py-5 text-2xl font-black leading-tight text-white outline-none placeholder:text-white/22"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/42">
                        Make it clear. Make it spicy.
                      </div>
                      <div className="text-sm font-black text-white/45">{take.length}/120</div>
                    </div>
                  </Panel>

                  <ActionButton onClick={handleSubmit} disabled={!take.trim()}>
                    Submit Take
                  </ActionButton>
                </>
              )}
            </motion.div>
          )}

          {phase === 'PLAYING' && subPhase === 'VOTE' && (
            <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5 overflow-hidden">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Vote"
                title={
                  hasVoted
                    ? <>Your vote is <span className="text-rose-300">locked</span></>
                    : <>Which take wins the <span className="text-amber-300">room</span>?</>
                }
                subtitle={prompt}
                icon="🗳️"
                aside={<StatPill label="Time Left" value={`${Math.ceil(timer)}s`} accent={ACCENT.secondary} />}
              />

              {hasVoted ? (
                <Panel className="my-auto text-center">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Vote Cast</div>
                  <div className="mt-4 text-3xl font-black tracking-[-0.03em] text-white">Watch the host screen for the result.</div>
                </Panel>
              ) : (
                <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-2">
                  {voteOptions.map(({ playerId, text }) => {
                    const mine = playerId === socket?.id;
                    return (
                      <button
                        key={playerId}
                        disabled={mine}
                        onClick={() => handleVote(playerId)}
                        className={`rounded-[1.7rem] border p-5 text-left transition ${mine ? 'border-white/10 bg-black/20 opacity-45' : 'border-white/10 bg-white/[0.06] hover:-translate-y-0.5 hover:border-rose-300/35 hover:bg-rose-400/10'}`}
                      >
                        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/42">
                          {mine ? 'Your Take' : 'Tap to Vote'}
                        </div>
                        <div className="mt-2 text-xl font-black leading-tight tracking-[-0.03em] text-white">“{text}”</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameScreen>
  );
};

export default HotTakesPlayer;
