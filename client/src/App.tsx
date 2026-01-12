import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import HostLogic from './components/HostLogic';
import PlayerLogic from './components/PlayerLogic';
import ParticleSystem from './components/ParticleSystem';
import { motion, AnimatePresence } from 'framer-motion';

function GameContent() {
  const [role, setRole] = useState<'NONE' | 'HOST' | 'PLAYER'>('NONE');

  return (
    <div className="relative w-full h-screen overflow-hidden text-white selection:bg-game-primary selection:text-white">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" /> {/* Dimmer for contrast */}
      <div className="bg-noise" />
      <ParticleSystem />

      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-game-primary rounded-full blur-[150px] opacity-20 animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-game-secondary rounded-full blur-[150px] opacity-20 animate-float" style={{ animationDelay: '-3s' }} />

      <AnimatePresence mode='wait'>
        {role === 'NONE' && (
          <motion.div
            key="role-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4"
          >
            <div className="mb-12 text-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-7xl md:text-9xl font-display font-black tracking-tighter mb-2"
              >
                FAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">GAME</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl font-mono text-white/50 tracking-[0.5em] uppercase"
              >
                Protocol: Singularity
              </motion.p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(217, 70, 239, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRole('HOST')}
                className="flex-1 glass-card p-12 rounded-3xl flex flex-col items-center justify-center gap-6 group hover:border-game-primary transition-all duration-300"
              >
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">📺</div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">HOST</h2>
                  <p className="text-white/40">TV / Big Screen</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(6, 182, 212, 0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRole('PLAYER')}
                className="flex-1 glass-card p-12 rounded-3xl flex flex-col items-center justify-center gap-6 group hover:border-game-secondary transition-all duration-300"
              >
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">📱</div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">PLAYER</h2>
                  <p className="text-white/40">Phone / Tablet</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {role === 'HOST' && <HostLogic key="host" />}
        {role === 'PLAYER' && <PlayerLogic key="player" />}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
