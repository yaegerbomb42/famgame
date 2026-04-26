import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { useSound } from '../../context/SoundContext';
import { ActionButton, GameScreen, HeroPanel, Panel, StatPill } from '../../components/ui/GameFrame';
import TimerRing from '../../components/ui/TimerRing';

const ACCENT = {
  primary: '#38bdf8',
  secondary: '#fde047',
  glow: 'rgba(56, 189, 248, 0.22)',
};

const QUICK_PICKS = [10, 25, 40, 50, 60, 75, 90];

const PollPlayer: React.FC = () => {
  const { socket, gameState } = useGameStore();
  const { playSuccess } = useSound();
  const [guess, setGuess] = useState(50);

  const { phase, gameData } = (gameState as any) || {};
  const { currentQuestion = '...', submissions = {}, timer = 0 } = gameData || {};
  const hasGuessed = submissions[socket?.id || ''] !== undefined;

  const handleGuessSubmit = () => {
    if (hasGuessed) return;
    socket?.emit('gameInput', { guess });
    playSuccess();
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <GameScreen accent={ACCENT}>
      <div className="flex h-full flex-col gap-5 p-5">
        <AnimatePresence mode="wait">
          {(phase === 'INTRO' || phase === 'COUNTDOWN' || phase === 'RESULTS') && (
            <motion.div key={`hold-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center">
              <HeroPanel
                accent={ACCENT}
                eyebrow={phase === 'RESULTS' ? 'Results' : phase === 'COUNTDOWN' ? 'Next Round' : 'Poll Party'}
                title={
                  phase === 'RESULTS'
                    ? <>The reveal is on the <span className="text-yellow-300">big screen</span></>
                    : <>Guess the stat, then <span className="text-sky-300">trust your feel</span></>
                }
                subtitle={
                  phase === 'RESULTS'
                    ? 'The app is keeping the downtime short. Stay ready.'
                    : 'You are always aiming for the real percentage, not the funniest answer.'
                }
                icon={phase === 'RESULTS' ? '🏁' : phase === 'COUNTDOWN' ? '⏱️' : '📈'}
                className="w-full max-w-4xl"
              />
            </motion.div>
          )}

          {phase === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col gap-5 overflow-hidden">
              <HeroPanel
                accent={ACCENT}
                eyebrow="Your Estimate"
                title={currentQuestion}
                subtitle="Use the slider for precision, then slam the button once your number feels right."
                icon="📊"
                aside={<TimerRing timeLeft={timer} maxTime={14} size={112} accentColor={ACCENT.secondary} accentGlow="rgba(253,224,71,0.28)" />}
              />

              {hasGuessed ? (
                <Panel className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/42">Locked Guess</div>
                  <div className="mt-4 text-8xl font-black tracking-[-0.05em] text-yellow-300">
                    {submissions[socket?.id || '']}%
                  </div>
                  <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3">
                    <StatPill label="Status" value="Waiting Reveal" accent={ACCENT.primary} />
                    <StatPill label="Clock" value={`${Math.ceil(timer)}s`} accent={ACCENT.secondary} />
                  </div>
                </Panel>
              ) : (
                <>
                  <Panel>
                    <div className="text-center">
                      <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/42">Current Guess</div>
                      <div className="mt-3 text-8xl font-black tracking-[-0.05em] text-white">{guess}%</div>
                    </div>
                  </Panel>

                  <Panel className="space-y-6">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={guess}
                      onChange={(event) => setGuess(Number(event.target.value))}
                      className="dopamine-slider h-5 w-full rounded-full bg-white/10"
                    />
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] text-white/34">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PICKS.map((value) => (
                        <button
                          key={value}
                          onClick={() => setGuess(value)}
                          className={`rounded-full border px-3 py-2 text-sm font-black transition ${guess === value ? 'border-yellow-300/40 bg-yellow-300/20 text-yellow-100' : 'border-white/10 bg-black/20 text-white/65'}`}
                        >
                          {value}%
                        </button>
                      ))}
                    </div>
                  </Panel>

                  <ActionButton onClick={handleGuessSubmit}>
                    Lock It In
                  </ActionButton>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameScreen>
  );
};

export default PollPlayer;
