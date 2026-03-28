import { useEffect, useRef } from 'react';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { ERA_RANGES, TIMELINE_START, TIMELINE_END } from '@/config/constants';

export function TimelineBar() {
  const {
    currentYear,
    setCurrentYear,
    playing,
    togglePlaying,
    setPlaying,
    speed,
    setSpeed,
    stepForward,
    stepBackward,
    rangeStart,
    rangeEnd,
  } = useTimelineStore();
  const { localize } = useLocalizedField();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Playback loop
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        useTimelineStore.getState().stepForward();
        if (useTimelineStore.getState().currentYear >= rangeEnd) {
          setPlaying(false);
        }
      }, 1000 / speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speed, rangeEnd, setPlaying]);

  const era = currentYear < 622 ? 'mekke' : currentYear < 632 ? 'medine' : 'hulefa';
  const eraInfo = ERA_RANGES[era];
  const eraColor = era === 'mekke' ? '#a16207' : era === 'medine' ? '#15803d' : '#1d4ed8';

  const speeds: (1 | 2 | 4)[] = [1, 2, 4];

  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Playback controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={stepBackward}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
            title="Step backward"
          >
            ◀◀
          </button>

          <button
            type="button"
            onClick={togglePlaying}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-base font-bold transition-all"
            style={{
              background: playing
                ? 'linear-gradient(135deg, #b91c1c, #dc2626)'
                : 'linear-gradient(135deg, #d4af37, #e6bf55)',
              color: playing ? '#fff' : '#1a1a2e',
              boxShadow: playing ? '0 4px 12px rgba(185, 28, 28, 0.3)' : 'var(--shadow-gold)',
            }}
          >
            {playing ? '⏸' : '▶'}
          </button>

          <button
            type="button"
            onClick={stepForward}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-colors"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
            title="Step forward"
          >
            ▶▶
          </button>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSpeed(s)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: speed === s ? 'var(--text-accent)' : 'transparent',
                color: speed === s ? '#1a1a2e' : 'var(--text-tertiary)',
                border: speed === s ? 'none' : '1px solid var(--border-color)',
              }}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Year display */}
        <div className="flex items-center gap-3 ms-auto">
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {currentYear} <span className="text-sm font-normal" style={{ color: 'var(--text-tertiary)' }}>CE</span>
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: `${eraColor}15`, color: eraColor, border: `1px solid ${eraColor}25` }}
          >
            {localize(eraInfo.label)}
          </span>
        </div>
      </div>

      {/* Full-width slider */}
      <div className="mt-3 relative">
        {/* Era color band behind slider */}
        <div
          className="absolute inset-x-0 h-2 rounded-full overflow-hidden"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          <div
            className="h-full"
            style={{
              background: `linear-gradient(to right,
                ${ERA_COLORS.mekke} 0%,
                ${ERA_COLORS.mekke} ${pct(622)}%,
                ${ERA_COLORS.medine} ${pct(622)}%,
                ${ERA_COLORS.medine} ${pct(632)}%,
                ${ERA_COLORS.hulefa} ${pct(632)}%,
                ${ERA_COLORS.hulefa} 100%)`,
            }}
          />
        </div>

        <input
          type="range"
          min={rangeStart}
          max={rangeEnd}
          value={currentYear}
          onChange={(e) => setCurrentYear(Number(e.target.value))}
          className="relative z-10 w-full h-2 appearance-none bg-transparent cursor-pointer"
          style={{ accentColor: 'var(--text-accent)' }}
        />

        <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span>{rangeStart}</span>
          <span>622</span>
          <span>632</span>
          <span>{rangeEnd}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── HELPERS ─── */

const ERA_COLORS = {
  mekke: 'rgba(161, 98, 7, 0.25)',
  medine: 'rgba(21, 128, 61, 0.25)',
  hulefa: 'rgba(29, 78, 216, 0.25)',
};

function pct(year: number): number {
  return ((year - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
}
