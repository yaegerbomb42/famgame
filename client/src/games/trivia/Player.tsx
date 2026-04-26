import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';
import { ActionButton, GameScreen, HeroPanel, Panel, StatPill } from '../../components/ui/GameFrame';
import TimerRing from '../../components/ui/TimerRing';

const ACCENT = {
  primary: '#22d3ee',
  secondary: '#8b5cf6',
  glow: 'rgba(34, 211, 238, 0.28)',
};

const LETTERS = ['A', 'B', 'C', 'D'];

const TriviaPlayer: React.FC = () => {
  const { socket, gameState } = useGameStore();
  const { playSuccess } = useSound();

  const gameData = (gameState as any)?.gameData ?? {};
  const phase = (gameData.phase ?? gameState?.phase) as string | undefined;
  const {
    availableCategories = [],
    submissions = {},
    roundResults = {},
    votes = {},
    question,
    round = 0,
    totalRounds = 10,
    timer: serverTimeLeft = 0,
  } = gameData;

  const [localTimeLeft, setLocalTimeLeft] = useState(serverTimeLeft);
  const [customTheme, setCustomTheme] = useState('');

  useEffect(() => {
    setLocalTimeLeft(serverTimeLeft);
    if (serverTimeLeft <= 0 || !['PLAYING', 'VOTING'].includes(String(phase))) return;

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setLocalTimeLeft(Math.max(0, serverTimeLeft - elapsed));
    }, 100);

    return () => clearInterval(interval);
  }, [serverTimeLeft, phase]);

  const myId = socket?.id || '';
  const mySubmission = submissions[myId];
  const myVote = votes[myId];
  const myResult = roundResults[myId];
  const answerOptions = useMemo(
    () => (Array.isArray(question?.a) ? question.a : Array.isArray(question?.options) ? question.options : []),
    [question],
  );
  const selectedIdx = mySubmission?.index ?? null;

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null || mySubmission !== undefined) return;
    socket?.emit('gameInput', { answerIndex: idx });
    playSuccess();
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleVote = (category: string) => {
    if (myVote !== undefined) return;
    if (category === 'Custom') return;
    socket?.emit('gameInput', { category });
    playSuccess();
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleCustomSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customTheme.trim()) return;
    socket?.emit('gameInput', { customTheme: customTheme.trim(), category: 'Custom' });
    playSuccess();
  };

  return (
    <GameScreen accent={ACCENT}>
      <div className="flex h-full flex-col gap-5 p-5 md:p-6">
        <AnimatePresence mode="wait">
          {(phase === 'INTRO' || phase === 'COUNTDOWN' || phase === 'RESULTS') && (
            <motion.div key={`rest-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center">
              <HeroPanel
                accent={ACCENT}
                eyebrow={phase === 'RESULTS' ? 'Round Complete' : 'Trivia Rush'}
                title={
                  phase === 'RESULTS'
                    ? <>Eyes up. <span className="text-cyan-300">Scores are moving.</span></>
                    : <>Lock in fast. <span className="text-violet-300">Think faster.</span></>
                }
                subtitle={
                  phase === 'RESULTS'
                    ? 'The TV is showing the standings. Stay ready because the next question snaps in quickly.'
                    : 'Every second matters. Correct answers score, but quick confidence wins the bigger pop.'
                }
                icon={phase === 'RESULTS' ? '🏁' : '🧠'}
                className="w-full max-w-4xl"
              />
            </motion.div>
          )}

          {phase === 'VOTING' && (
            <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Pick the Category"
                title={
                  myVote !== undefined
                    ? <>Locked. <span className="text-cyan-300">Room is deciding.</span></>
                    : <>Choose the next <span className="text-violet-300">brain lane</span></>
                }
                subtitle={
                  myVote !== undefined
                    ? `Your vote: ${myVote}`
                    : 'Vote for the theme you want next. The host can steer, but the room can force the issue with momentum.'
                }
                icon="🗳️"
                aside={<TimerRing timeLeft={localTimeLeft} maxTime={12} size={108} accentColor={ACCENT.primary} accentGlow={ACCENT.glow} />}
              />

              <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-2">
                {availableCategories.map((category: string) => {
                  const active = myVote === category;
                  return (
                    <button
                      key={category}
                      disabled={myVote !== undefined}
                      onClick={() => handleVote(category)}
                      className={`rounded-[1.7rem] border p-5 text-left transition ${active ? 'border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_28px_rgba(34,211,238,0.2)]' : 'border-white/10 bg-white/[0.06]'} ${myVote !== undefined ? 'opacity-80' : 'hover:-translate-y-0.5 hover:border-white/25'}`}
                    >
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">
                        {active ? 'Your Pick' : 'Category'}
                      </div>
                      <div className="mt-2 text-2xl font-black uppercase tracking-[-0.03em] text-white">{category}</div>
                    </button>
                  );
                })}

                {availableCategories.includes('Custom') && myVote === 'Custom' ? (
                  <Panel>
                    <form onSubmit={handleCustomSubmit} className="space-y-3">
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Custom Theme</div>
                      <input
                        value={customTheme}
                        onChange={(event) => setCustomTheme(event.target.value)}
                        placeholder="Type a category"
                        className="w-full rounded-[1.2rem] border border-white/12 bg-black/25 px-4 py-4 text-lg font-semibold text-white outline-none placeholder:text-white/24"
                      />
                      <ActionButton disabled={!customTheme.trim()} className="w-full">
                        Submit Theme
                      </ActionButton>
                    </form>
                  </Panel>
                ) : null}
              </div>
            </motion.div>
          )}

          {phase === 'PLAYING' && question && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5">
              <HeroPanel
                accent={ACCENT}
                eyebrow={`Question ${round + 1} of ${totalRounds}`}
                title={question.q}
                subtitle="Tap once. Trust your first read. Fast answers score harder."
                aside={<TimerRing timeLeft={localTimeLeft} maxTime={18} size={112} accentColor={ACCENT.primary} accentGlow={ACCENT.glow} />}
              />

              {mySubmission ? (
                <Panel className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Answer Locked</div>
                  <div className="mt-4 text-7xl font-black tracking-[-0.04em] text-cyan-300">
                    {LETTERS[selectedIdx]}
                  </div>
                  <div className="mt-3 text-2xl font-black uppercase tracking-[0.16em] text-white/85">
                    {typeof answerOptions[selectedIdx] === 'string'
                      ? answerOptions[selectedIdx]
                      : answerOptions[selectedIdx]?.text || answerOptions[selectedIdx]?.answer}
                  </div>
                  <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
                    <StatPill label="Time Left" value={`${Math.ceil(localTimeLeft)}s`} accent={ACCENT.primary} />
                    <StatPill label="Mode" value="Speed Score" accent={ACCENT.secondary} />
                  </div>
                </Panel>
              ) : (
                <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pb-1">
                  {answerOptions.map((answer: any, index: number) => {
                    const text = typeof answer === 'string' ? answer : answer?.text || answer?.answer || '';
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelect(index)}
                        className="rounded-[1.7rem] border border-white/10 bg-white/[0.06] p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/10"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-cyan-300 text-lg font-black text-[#06111f]">
                            {LETTERS[index]}
                          </div>
                          <div className="pt-1 text-xl font-black leading-tight tracking-[-0.03em] text-white">{text}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {phase === 'REVEAL' && question && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5">
              <HeroPanel
                accent={ACCENT}
                eyebrow={myResult?.correct ? 'Correct' : 'Round Result'}
                title={
                  myResult?.correct
                    ? <>Nice hit. <span className="text-cyan-300">Points incoming.</span></>
                    : <>That one hurt. <span className="text-violet-300">Reload fast.</span></>
                }
                subtitle={`Correct answer: ${LETTERS[question.correct]} — ${
                  typeof answerOptions[question.correct] === 'string'
                    ? answerOptions[question.correct]
                    : answerOptions[question.correct]?.text || answerOptions[question.correct]?.answer
                }`}
                icon={myResult?.correct ? '✅' : '⚠️'}
                aside={
                  <div className="grid gap-3">
                    <StatPill label="You Picked" value={selectedIdx !== null ? LETTERS[selectedIdx] : 'None'} accent={myResult?.correct ? ACCENT.primary : '#fda4af'} />
                    <StatPill label="Round Points" value={`+${myResult?.points || 0}`} accent={ACCENT.secondary} />
                  </div>
                }
              />
              <Panel className="text-center">
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Keep Your Flow</div>
                <div className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">
                  The next question loads quickly, so stay sharp and keep your thumb ready.
                </div>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameScreen>
  );
};

export default TriviaPlayer;
