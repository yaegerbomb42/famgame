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
];

function GameContent() {
  const [role, setRole] = useState<'NONE' | 'HOST' | 'PLAYER'>('NONE');

  const colors = {
    primary: '#ff00ff',
    secondary: '#00ffff',
    bg: '#0a0518',
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    color: 'white',
    fontFamily: "'Outfit', system-ui, sans-serif",
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    paddingTop: 'max(24px, env(safe-area-inset-top))',
    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
    zIndex: 10,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(4rem, 15vw, 12rem)',
    fontWeight: 900,
    marginBottom: '8px',
    letterSpacing: '-0.05em',
    textShadow: `0 0 60px ${colors.primary}40, 0 0 120px ${colors.secondary}30`,
  };

  const gradientTextStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 'clamp(16px, 4vw, 48px)',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '1000px',
    marginTop: '32px',
  };

  const buttonStyle: React.CSSProperties = {
    flex: '1 1 280px',
    maxWidth: '450px',
    minHeight: '180px',
    padding: 'clamp(24px, 5vw, 48px)',
    borderRadius: '32px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '2px solid rgba(255,255,255,0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: 'white',
    WebkitTapHighlightColor: 'transparent',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 'clamp(3rem, 8vw, 5rem)',
  };

  const buttonTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    fontWeight: 'bold',
  };

  if (role === 'HOST') {
    return <HostLogic />;
  }

  if (role === 'PLAYER') {
    return <PlayerLogic />;
  }

  return (
    <div style={containerStyle}>
      {/* Animated gradient orbs */}
      <div style={{
        position: 'absolute',
        top: '-30%',
        left: '-20%',
        width: '70vw',
        height: '70vw',
        background: `radial-gradient(circle, ${colors.primary}50 0%, transparent 70%)`,
        filter: 'blur(80px)',
        opacity: 0.6,
        animation: 'float 8s ease-in-out infinite',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30%',
        right: '-20%',
        width: '70vw',
        height: '70vw',
        background: `radial-gradient(circle, ${colors.secondary}50 0%, transparent 70%)`,
        filter: 'blur(80px)',
        opacity: 0.6,
        animation: 'float 8s ease-in-out infinite reverse',
        zIndex: 1,
      }} />

      {/* Additional floating particles */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${20 + i * 15}%`,
          left: `${10 + i * 20}%`,
          width: '4px',
          height: '4px',
          background: 'white',
          borderRadius: '50%',
          opacity: 0.3,
          animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`,
          zIndex: 2,
        }} />
      ))}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(255,255,255,0.15); }
          50% { border-color: rgba(255,255,255,0.3); }
        }
      `}</style>

      <div style={contentStyle}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={titleStyle}>
            FAM<span style={gradientTextStyle}>GAME</span>
          </h1>

          {/* Game modes display */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
            maxWidth: '600px',
          }}>
            {GAME_MODES.map((game) => (
              <div key={game.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                fontSize: 'clamp(0.75rem, 2vw, 1rem)',
              }}>
                <span>{game.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>{game.name}</span>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '8px',
          }}>
            {GAME_MODES.length} Party Games • 2-20 Players
          </p>
        </div>

        <div style={buttonContainerStyle}>
          <button
            style={buttonStyle}
            onClick={() => setRole('HOST')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.boxShadow = `0 20px 60px ${colors.primary}40`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={iconStyle}>📺</div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={buttonTitleStyle}>HOST</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}>TV / Big Screen</p>
            </div>
          </button>

          <button
            style={buttonStyle}
            onClick={() => setRole('PLAYER')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
              e.currentTarget.style.borderColor = colors.secondary;
              e.currentTarget.style.boxShadow = `0 20px 60px ${colors.secondary}40`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={iconStyle}>📱</div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={buttonTitleStyle}>PLAYER</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}>Phone / Tablet</p>
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
