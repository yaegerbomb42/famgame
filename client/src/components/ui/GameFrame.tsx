import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type Accent = {
  primary: string;
  secondary: string;
  glow: string;
};

interface GameScreenProps {
  accent: Accent;
  children: ReactNode;
  className?: string;
}

export function GameScreen({ accent, children, className }: GameScreenProps) {
  const style = {
    '--game-frame-primary': accent.primary,
    '--game-frame-secondary': accent.secondary,
    '--game-frame-glow': accent.glow,
  } as CSSProperties;

  return (
    <div
      className={clsx(
        'relative flex h-full w-full flex-col overflow-hidden bg-[#07111f] text-white',
        className,
      )}
      style={style}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),transparent_20%),linear-gradient(160deg,#08101d_0%,#0b1526_45%,#050913_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--game-frame-glow),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_80%_80%,color-mix(in_srgb,var(--game-frame-primary)_30%,transparent),transparent_34%)] opacity-90" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="relative z-10 flex h-full w-full flex-col">{children}</div>
    </div>
  );
}

interface HeroPanelProps {
  accent: Accent;
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export function HeroPanel({
  accent,
  eyebrow,
  title,
  subtitle,
  icon,
  aside,
  className,
}: HeroPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:p-8',
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `linear-gradient(135deg, ${accent.glow} 0%, rgba(255,255,255,0.04) 45%, transparent 100%)`,
        }}
      />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-white/65">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accent.primary, boxShadow: `0 0 16px ${accent.glow}` }}
            />
            {eyebrow}
          </div>
          <div className="text-balance text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] md:text-6xl">
            {title}
          </div>
          {subtitle ? (
            <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-white/72 md:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-4 self-start md:self-center">
          {icon ? (
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.75rem] border border-white/12 bg-black/25 text-6xl shadow-[0_0_45px_var(--game-frame-glow)] md:h-28 md:w-28"
            >
              {icon}
            </motion.div>
          ) : null}
          {aside}
        </div>
      </div>
    </motion.section>
  );
}

interface StatPillProps {
  label: string;
  value: ReactNode;
  accent?: string;
}

export function StatPill({ label, value, accent }: StatPillProps) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-black/25 px-4 py-3 shadow-inner backdrop-blur-xl">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/42">{label}</div>
      <div className="mt-1 text-xl font-black tracking-tight" style={accent ? { color: accent } : undefined}>
        {value}
      </div>
    </div>
  );
}

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <div
      className={clsx(
        'rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PlayerGridProps {
  players: Array<{ id: string; name: string; avatar?: string }>;
  readyMap?: Record<string, unknown>;
  accent: Accent;
  readyLabel?: string;
}

export function PlayerGrid({ players, readyMap = {}, accent, readyLabel = 'Ready' }: PlayerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {players.map((player) => {
        const ready = Boolean(readyMap[player.id]);
        return (
          <motion.div
            key={player.id}
            layout
            className={clsx(
              'relative overflow-hidden rounded-[1.55rem] border px-4 py-4 transition-all',
              ready ? 'border-white/20 bg-white/[0.12]' : 'border-white/8 bg-black/20',
            )}
            style={ready ? { boxShadow: `0 0 28px ${accent.glow}` } : undefined}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-white/10 bg-black/25 text-3xl"
                style={ready ? { boxShadow: `0 0 18px ${accent.glow}` } : undefined}
              >
                {player.avatar || '👤'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-black uppercase tracking-[0.16em] text-white">{player.name}</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                  {ready ? readyLabel : 'Thinking'}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

interface ActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ActionButton({ children, onClick, disabled, className }: ActionButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'rounded-[1.6rem] border border-white/20 bg-gradient-to-r from-[var(--game-frame-primary)] to-[var(--game-frame-secondary)] px-6 py-4 text-base font-black uppercase tracking-[0.18em] text-[#08101d] shadow-[0_18px_40px_var(--game-frame-glow)] transition disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none md:text-lg',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
