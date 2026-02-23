import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import HostLogic from './components/HostLogic';
import PlayerLogic from './components/PlayerLogic';
import { SoundProvider } from './context/SoundContext';

const GAME_MODES = [
  { name: 'Trivia', icon: '🧠', color: '#ff6b6b' },
  { name: 'Two Truths', icon: '🤥', color: '#4ecdc4' },
  { name: 'Hot Takes', icon: '🔥', color: '#ff9f43' },
  { name: 'Poll Party', icon: '📊', color: '#a55eea' },
  { name: 'Buzz In', icon: '🔔', color: '#26de81' },
  { name: 'Word Race', icon: '⌨️', color: '#45aaf2' },
  { name: 'Reaction', icon: '⚡', color: '#fed330' },
  // New games
  { name: 'Emoji Story', icon: '📖', color: '#ff6b9d' },
  { name: 'Bluff', icon: '🎭', color: '#5f27cd' },
  { name: 'Speed Draw', icon: '🎨', color: '#00d2d3' },
  { name: 'This or That', icon: '⚖️', color: '#ff9ff3' },
  { name: 'Brain Burst', icon: '💰', color: '#f9ca24' },
];

function GameContent() {
  // Auto-detect join code in URL — QR deep link
  const hasJoinCode = new URLSearchParams(window.location.search).has('code');
  const [role, setRole] = useState<'NONE' | 'HOST' | 'PLAYER'>(hasJoinCode ? 'PLAYER' : 'NONE');

  if (role === 'HOST') {
    return <HostLogic />;
  }

  if (role === 'PLAYER') {
    return <PlayerLogic />;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#0a0518',
      color: 'white',
      fontFamily: "'Outfit', system-ui, sans-serif",
      overflow: 'auto', // Allow scrolling on mobile
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Animated gradient orbs */}
      <div style={{
        position: 'fixed',
        top: '-20%',
        left: '-15%',
        width: 'min(70vw, 600px)',
        height: 'min(70vw, 600px)',
        background: 'radial-gradient(circle, rgba(255,0,255,0.4) 0%, transparent 70%)',
        filter: 'blur(60px)',
        opacity: 0.5,
        animation: 'float 8s ease-in-out infinite',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-20%',
        right: '-15%',
        width: 'min(70vw, 600px)',
        height: 'min(70vw, 600px)',
        background: 'radial-gradient(circle, rgba(0,255,255,0.4) 0%, transparent 70%)',
        filter: 'blur(60px)',
        opacity: 0.5,
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* Main content - scrollable */}
      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom))',
        zIndex: 10,
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(3rem, 12vw, 10rem)',
          fontWeight: 900,
          marginBottom: '8px',
          letterSpacing: '-0.03em',
          textAlign: 'center',
          textShadow: '0 0 60px rgba(255,0,255,0.3), 0 0 120px rgba(0,255,255,0.2)',
          lineHeight: 1,
        }}>
          FAM<span style={{
            background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>GAME</span>
        </h1>

        {/* Game modes chips - responsive wrap */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'clamp(6px, 1.5vw, 12px)',
          marginBottom: 'clamp(12px, 3vh, 24px)',
          maxWidth: '700px',
          padding: '0 8px',
        }}>
          {GAME_MODES.map((game) => (
            <div key={game.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 'clamp(4px, 1vw, 8px) clamp(8px, 2vw, 14px)',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '16px',
              fontSize: 'clamp(0.65rem, 1.8vw, 0.9rem)',
              whiteSpace: 'nowrap',
            }}>
              <span>{game.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>{game.name}</span>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 'clamp(16px, 4vh, 40px)',
          textAlign: 'center',
        }}>
          {GAME_MODES.length} Party Games • 2-20 Players
        </p>

        {/* Buttons - stack on mobile */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 'clamp(12px, 3vw, 32px)',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '900px',
          padding: '0 16px',
        }}>
          <button
            onClick={() => setRole('HOST')}
            style={{
              flex: '1 1 250px',
              maxWidth: '400px',
              minHeight: 'clamp(140px, 25vh, 220px)',
              padding: 'clamp(20px, 4vw, 48px)',
              borderRadius: 'clamp(20px, 4vw, 32px)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'white',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
              e.currentTarget.style.borderColor = '#ff00ff';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(255,0,255,0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>📺</div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 2.5rem)', fontWeight: 'bold', marginBottom: '4px' }}>HOST</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.75rem, 2vw, 1.1rem)' }}>TV / Big Screen</p>
            </div>
          </button>

          <button
            onClick={() => setRole('PLAYER')}
            style={{
              flex: '1 1 250px',
              maxWidth: '400px',
              minHeight: 'clamp(140px, 25vh, 220px)',
              padding: 'clamp(20px, 4vw, 48px)',
              borderRadius: 'clamp(20px, 4vw, 32px)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'white',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.03) translateY(-4px)';
              e.currentTarget.style.borderColor = '#00ffff';
              e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,255,255,0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>📱</div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 2.5rem)', fontWeight: 'bold', marginBottom: '4px' }}>PLAYER</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.75rem, 2vw, 1.1rem)' }}>Phone / Tablet</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <SoundProvider>
        <GameContent />
      </SoundProvider>
    </GameProvider>
  );
}

export default App;
