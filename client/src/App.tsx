import { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import type { GameStore } from './store/useGameStore';
import HostLogic from './components/HostLogic';
import PlayerLogic from './components/PlayerLogic';
import { SoundProvider } from './context/SoundContext';
import { motion, AnimatePresence } from 'framer-motion';


import { useSound } from './context/SoundContext';
import { HostModal } from './components/HostModal';
import { NarratorHUD } from './components/NarratorHUD';
import { CelebrationOverlay } from './components/CelebrationOverlay';

function Home({ navigateTo }: { navigateTo: (path: string) => void }) {
  const setRole = useGameStore((state: GameStore) => state.setRole);
  const initSocket = useGameStore((state: GameStore) => state.initSocket);
  const publicRoomPreference = useGameStore((state: GameStore) => state.publicRoomPreference);
  const setPublicRoomPreference = useGameStore((state: GameStore) => state.setPublicRoomPreference);
  const { playClick } = useSound();

  const [showHostModal, setShowHostModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) setRole('PLAYER');
    initSocket();
  }, [initSocket, setRole]);

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-['Outfit'] select-none">
      {/* Dynamic Glowing Background Accents */}
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] bg-cyan-500/15 blur-[180px] rounded-full" 
      />
      <motion.div 
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] bg-pink-500/10 blur-[180px] rounded-full" 
      />

      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-16">
        {/* Playful Branding */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 mb-6 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Family Party Games</span>
          </div>
          <h1 className="text-7xl md:text-[9rem] font-black tracking-tight leading-none mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-yellow-300 to-pink-400 bg-clip-text text-transparent">FAM</span>
            <span className="bg-gradient-to-r from-lime-400 via-cyan-400 to-yellow-300 bg-clip-text text-transparent">GAME</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">Play Together • Laugh Together</p>
        </motion.div>

        {/* Action Cards */}
        <div className="flex flex-col md:flex-row gap-10 w-full justify-center items-stretch">
          {/* HOST CARD */}
          <motion.button
            whileHover={{ y: -10, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClick(); setRole('HOST'); }}
            className="flex-1 flex flex-col items-center gap-8 group p-10 rounded-[40px] border-4 border-cyan-400/30 bg-gradient-to-br from-cyan-900/20 to-cyan-500/10 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_60px_rgba(0,255,255,0.5)]"
          >
            <div className="w-32 h-32 rounded-[35px] bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-7xl shadow-[0_0_40px_rgba(0,255,255,0.6)] group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(0,255,255,0.8)] transition-all duration-300">
              🎮
            </div>
            <div className="text-center">
              <h2 className="text-5xl font-black mb-1 text-cyan-300">Host Game</h2>
              <p className="text-white/50 font-semibold uppercase tracking-wider text-sm">Start the Party</p>
            </div>
          </motion.button>

          {/* JOIN CARD */}
          <motion.button
            whileHover={{ y: -10, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClick(); setRole('PLAYER'); }}
            className="flex-1 flex flex-col items-center gap-8 group p-10 rounded-[40px] border-4 border-pink-400/30 bg-gradient-to-br from-pink-900/20 to-pink-500/10 backdrop-blur-sm transition-all duration-300 hover:border-pink-400 hover:shadow-[0_0_60px_rgba(255,0,128,0.5)]"
          >
            <div className="w-32 h-32 rounded-[35px] bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-7xl shadow-[0_0_40px_rgba(255,0,128,0.6)] group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(255,0,128,0.8)] transition-all duration-300">
              👨‍👩‍👧‍👦
            </div>
            <div className="text-center">
              <h2 className="text-5xl font-black mb-1 text-pink-300">Join Game</h2>
              <p className="text-white/50 font-semibold uppercase tracking-wider text-sm">Enter Code</p>
            </div>
          </motion.button>
        </div>
      </main>

      <div className="absolute top-8 right-8 z-50 flex flex-col gap-4">
        {/* Public/Private Toggle */}
        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-2 border border-white/10 flex items-center shadow-2xl">
           <button
             onClick={() => { playClick(); setPublicRoomPreference(true); }}
             className={`px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${publicRoomPreference ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(0,255,255,0.4)]' : 'text-white/40 hover:text-white'}`}
           >
             Public Event
           </button>
           <button
             onClick={() => { playClick(); setPublicRoomPreference(false); }}
             className={`px-6 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${!publicRoomPreference ? 'bg-pink-500 text-white shadow-[0_0_20px_rgba(255,0,128,0.4)]' : 'text-white/40 hover:text-white'}`}
           >
             Private Match
           </button>
        </div>

        {/* Host Account Button */}
        <button 
          onClick={() => { playClick(); setShowHostModal(true); }}
          className="bg-white/5 backdrop-blur-md rounded-full px-6 py-3 border border-white/10 flex items-center gap-2 group transition-all hover:bg-white/10 shadow-xl"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-cyan-400 transition-colors">Host Sign In</span>
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        </button>

        <HostModal isOpen={showHostModal} onClose={() => setShowHostModal(false)} />
      </div>

      {/* Subtle Settings Access -> Now Live Lobbies Viewer */}
      <div className="absolute bottom-8 opacity-60 hover:opacity-100 transition-all duration-300">
        <button 
          onClick={() => navigateTo('/rooms')}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-400/20 to-teal-400/20 border border-emerald-400/30 text-xs font-black uppercase tracking-[0.3em] text-emerald-300 hover:text-emerald-100 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          View Live Lobbies
        </button>
      </div>
    </div>
  );
}

import { PersonaProvider } from './context/PersonaContext';
import LoadingScreen from './components/LoadingScreen';
import { RoomViewer } from './components/RoomViewer';
import { Admin } from './components/Admin';

function App() {
  const role = useGameStore((state: GameStore) => state.role);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SoundProvider>
      <PersonaProvider>
        <AnimatePresence mode="wait">
          {path === '/rooms' ? (
            <RoomViewer key="rooms" onBack={() => navigateTo('/')} />
          ) : path === '/admin' ? (
            <Admin key="admin" onBack={() => navigateTo('/')} />
          ) : loading ? (
            <LoadingScreen key="loading" />
          ) : (
            <>
              {role === 'NONE' && <Home key="home" navigateTo={navigateTo} />}
              {role === 'HOST' && <HostLogic key="host" />}
              {role === 'PLAYER' && <PlayerLogic key="player" />}
              {role !== 'NONE' && (
                <>
                  <NarratorHUD />
                  <CelebrationOverlay />
                </>
              )}
            </>
          )}
        </AnimatePresence>
      </PersonaProvider>
    </SoundProvider>
  );
}

export default App;