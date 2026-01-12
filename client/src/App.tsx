import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import HostLogic from './components/HostLogic';
import PlayerLogic from './components/PlayerLogic';
import ParticleSystem from './components/ParticleSystem';
// import { motion, AnimatePresence } from 'framer-motion'; // Disabled for debugging

function GameContent() {
  const [role, setRole] = useState<'NONE' | 'HOST' | 'PLAYER'>('NONE');

  return (
    <div className="relative w-full h-screen overflow-hidden text-white selection:bg-game-primary selection:text-white">
      {/* DEBUG: This should always be visible */}
      <div className="fixed top-4 left-4 z-50 bg-red-500 text-white px-4 py-2 rounded font-bold">
        DEBUG: React is rendering - Role: {role}
      </div>

      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" /> {/* Dimmer for contrast */}
      <div className="bg-noise" />
      <ParticleSystem />

      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-game-primary rounded-full blur-[150px] opacity-20 animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-game-secondary rounded-full blur-[150px] opacity-20 animate-float" style={{ animationDelay: '-3s' }} />

      {/* Main Content */}
      {role === 'NONE' && (
        <div className="absolute inset-0 z-40 w-full h-full flex flex-col items-center justify-center p-4">
          <div className="mb-12 text-center">
            <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter mb-2">
              FAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-game-primary to-game-secondary">GAME</span>
            </h1>
            <p className="text-xl md:text-2xl font-mono text-white/50 tracking-[0.5em] uppercase">
              Protocol: Singularity
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
            <button
              onClick={() => setRole('HOST')}
              className="flex-1 glass-card p-12 rounded-3xl flex flex-col items-center justify-center gap-6 group hover:border-game-primary transition-all duration-300 hover:scale-105"
            >
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">📺</div>
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">HOST</h2>
                <p className="text-white/40">TV / Big Screen</p>
              </div>
            </button>

            <button
              onClick={() => setRole('PLAYER')}
              className="flex-1 glass-card p-12 rounded-3xl flex flex-col items-center justify-center gap-6 group hover:border-game-secondary transition-all duration-300 hover:scale-105"
            >
              <div className="text-6xl group-hover:scale-110 transition-transform duration-300">📱</div>
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">PLAYER</h2>
                <p className="text-white/40">Phone / Tablet</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {role === 'HOST' && <HostLogic key="host" />}
      {role === 'PLAYER' && <PlayerLogic key="player" />}
    </div>
  );
}

import { SoundProvider } from './context/SoundContext';
import React from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-red-900 text-white p-8 z-50">
          <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
          <pre className="text-sm overflow-auto">{this.state.error?.message}</pre>
          <pre className="text-xs mt-4 opacity-70">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <SoundProvider>
          <GameContent />
        </SoundProvider>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
