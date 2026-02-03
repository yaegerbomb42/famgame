import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import HostLogic from './components/HostLogic';
import PlayerLogic from './components/PlayerLogic';
import { SoundProvider } from './context/SoundContext';
import { motion, AnimatePresence } from 'framer-motion';

const GAME_MODES = [
  { name: 'Trivia', icon: '🧠' },
  { name: 'Two Truths', icon: '🤥' },
  { name: 'Hot Takes', icon: '🔥' },
  { name: 'Poll Party', icon: '📊' },
  { name: 'Buzz In', icon: '🔔' },
  { name: 'Word Race', icon: '⌨️' },
  { name: 'Reaction', icon: '⚡' },
  { name: 'Emoji Story', icon: '📖' },
  { name: 'Bluff', icon: '🎭' },
  { name: 'Speed Draw', icon: '🎨' },
  { name: 'This or That', icon: '⚖️' },
];

function Home() {
  const setRole = useGameStore((state) => state.setRole);
  const initSocket = useGameStore((state) => state.initSocket);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  return (
    <div className="fixed inset-0 bg-game-bg text-white font-sans overflow-auto flex flex-col">
      {/* Animated gradient orbs */}
      <div className="fixed -top-[20%] -left-[15%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-radial-gradient-purple blur-[60px] opacity-50 animate-float pointer-events-none z-0" 
           style={{ background: 'radial-gradient(circle, rgba(255,0,255,0.4) 0%, transparent 70%)' }} />
      <div className="fixed -bottom-[20%] -right-[15%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-radial-gradient-cyan blur-[60px] opacity-50 animate-float-reverse pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle, rgba(0,255,255,0.4) 0%, transparent 70%)' }} />

      <main className="relative flex-1 flex flex-col items-center justify-center min-h-screen p-4 md:p-8 z-10">
        <motion.h1 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[clamp(3rem,12vw,10rem)] font-black mb-2 tracking-tighter text-center leading-none"
        >
          FAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary drop-shadow-[0_0_60px_rgba(255,0,255,0.3)]">GAME</span>
        </motion.h1>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 max-w-2xl px-2">
          {GAME_MODES.map((game, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={game.name} 
              className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full text-[clamp(0.65rem,1.8vw,0.9rem)] whitespace-nowrap border border-white/5"
            >
              <span>{game.icon}</span>
              <span className="text-white/60">{game.name}</span>
            </motion.div>
          ))}
        </div>

        <p className="text-[clamp(0.9rem,2.5vw,1.4rem)] color-white/50 mb-10 text-center font-light tracking-wide">
          {GAME_MODES.length} Party Games • 2-20 Players
        </p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-4xl px-4">
          <motion.button
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRole('HOST')}
            className="flex-1 min-h-[140px] md:min-h-[220px] p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 border-2 border-white/10 hover:border-game-primary transition-colors flex flex-col items-center justify-center gap-3 group"
          >
            <div className="text-5xl md:text-8xl group-hover:drop-shadow-[0_0_30px_rgba(255,0,255,0.5)] transition-all">📺</div>
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1">HOST</h2>
              <p className="text-white/40 text-sm md:text-lg">TV / Big Screen</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRole('PLAYER')}
            className="flex-1 min-h-[140px] md:min-h-[220px] p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 border-2 border-white/10 hover:border-game-secondary transition-colors flex flex-col items-center justify-center gap-3 group"
          >
            <div className="text-5xl md:text-8xl group-hover:drop-shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all">📱</div>
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1">PLAYER</h2>
              <p className="text-white/40 text-sm md:text-lg">Phone / Tablet</p>
            </div>
          </motion.button>
        </div>
      </main>
    </div>
  );
}

import { VoiceChat } from './components/VoiceChat';
import { PersonaProvider } from './context/PersonaContext';
import { Persona } from './components/Persona';

function App() {
  const role = useGameStore((state) => state.role);

  return (
    <SoundProvider>
      <PersonaProvider>
        <Persona />
        <VoiceChat />
        <AnimatePresence mode="wait">
          {role === 'NONE' && <Home key="home" />}
          {role === 'HOST' && <HostLogic key="host" />}
          {role === 'PLAYER' && <PlayerLogic key="player" />}
        </AnimatePresence>
      </PersonaProvider>
    </SoundProvider>
  );
}

export default App;
