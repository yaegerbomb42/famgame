import { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import type { GameStore } from './store/useGameStore';
import HostLogic from './components/HostLogic';
import PlayerLogic from './components/PlayerLogic';
import { SoundProvider } from './context/SoundContext';
import { motion, AnimatePresence } from 'framer-motion';



function Home() {
  const setRole = useGameStore((state: GameStore) => state.setRole);
  const initSocket = useGameStore((state: GameStore) => state.initSocket);

  useEffect(() => {
    // Check for room code in URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setRole('PLAYER');
    }

    initSocket();
  }, [initSocket, setRole]);

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
          className="text-[clamp(3rem,12vw,10rem)] font-black mb-8 tracking-tighter text-center leading-none"
        >
          FAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary drop-shadow-[0_0_60px_rgba(255,0,255,0.3)]">GAME</span>
        </motion.h1>

        <p className="text-[clamp(1.2rem,3vw,1.8rem)] text-white/80 mb-16 text-center font-bold tracking-wide max-w-2xl leading-relaxed">
          The ultimate social hub for your next game night.
          <br />
          <span className="text-game-secondary">Connect, Chat, Play.</span>
        </p>

        <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full max-w-4xl px-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRole('HOST')}
            className="flex-1 min-h-[160px] md:min-h-[240px] p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 border-[3px] border-white/10 hover:border-game-primary/50 transition-all flex flex-col items-center justify-center gap-4 group shadow-xl hover:shadow-[0_0_50px_rgba(255,0,255,0.2)]"
          >
            <div className="text-6xl md:text-8xl group-hover:scale-110 transition-transform duration-300">📺</div>
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-tight">Host</h2>
              <p className="text-white/50 text-base md:text-xl font-medium">Create a Room on TV</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRole('PLAYER')}
            className="flex-1 min-h-[160px] md:min-h-[240px] p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 border-[3px] border-white/10 hover:border-game-secondary/50 transition-all flex flex-col items-center justify-center gap-4 group shadow-xl hover:shadow-[0_0_50px_rgba(0,255,255,0.2)]"
          >
            <div className="text-6xl md:text-8xl group-hover:scale-110 transition-transform duration-300">📱</div>
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-tight">Join</h2>
              <p className="text-white/50 text-base md:text-xl font-medium">Enter Code on Phone</p>
            </div>
          </motion.button>
        </div>
      </main>
    </div>
  );
}

import { VoiceChat } from './components/VoiceChat';
import { PersonaProvider } from './context/PersonaContext';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const role = useGameStore((state: GameStore) => state.role);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SoundProvider>
      <PersonaProvider>
        <VoiceChat />
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingScreen key="loading" />
          ) : (
            <>
              {role === 'NONE' && <Home key="home" />}
              {role === 'HOST' && <HostLogic key="host" />}
              {role === 'PLAYER' && <PlayerLogic key="player" />}
            </>
          )}
        </AnimatePresence>
      </PersonaProvider>
    </SoundProvider>
  );
}

export default App;