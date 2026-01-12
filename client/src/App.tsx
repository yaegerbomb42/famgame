import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import HostLogic from './components/HostLogic';
import PlayerLogic from './components/PlayerLogic';
import { SoundProvider } from './context/SoundContext';

function GameContent() {
  const [role, setRole] = useState<'NONE' | 'HOST' | 'PLAYER'>('NONE');

  // Using inline styles to guarantee visibility - Tailwind may not be compiling
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0a0518',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
  };

  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 100,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(3rem, 10vw, 8rem)',
    fontWeight: 900,
    marginBottom: '8px',
    letterSpacing: '-0.05em',
  };

  const gradientTextStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #d946ef, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.5em',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '32px',
    marginTop: '48px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const buttonStyle: React.CSSProperties = {
    flex: '1 1 300px',
    maxWidth: '400px',
    padding: '48px',
    borderRadius: '24px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    color: 'white',
  };

  if (role === 'HOST') {
    return <HostLogic />;
  }

  if (role === 'PLAYER') {
    return <PlayerLogic />;
  }

  return (
    <div style={containerStyle}>
      {/* Background gradient orbs */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '60vw',
        height: '60vw',
        background: '#d946ef',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.15,
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '60vw',
        height: '60vw',
        background: '#06b6d4',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.15,
        zIndex: 1,
      }} />

      {/* Main content */}
      <div style={contentStyle}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={titleStyle}>
            FAM<span style={gradientTextStyle}>GAME</span>
          </h1>
          <p style={subtitleStyle}>Protocol: Singularity</p>
        </div>

        <div style={buttonContainerStyle}>
          <button
            style={buttonStyle}
            onClick={() => setRole('HOST')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = '#d946ef';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <div style={{ fontSize: '4rem' }}>�</div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '8px' }}>HOST</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>TV / Big Screen</p>
            </div>
          </button>

          <button
            style={buttonStyle}
            onClick={() => setRole('PLAYER')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = '#06b6d4';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <div style={{ fontSize: '4rem' }}>📱</div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '8px' }}>PLAYER</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Phone / Tablet</p>
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
