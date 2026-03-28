import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTimelineStore } from '@/stores/useTimelineStore';
import { useUnifiedTimeline } from '@/hooks/useUnifiedTimeline';
import { TimelineChart } from '@/components/timeline/TimelineChart';
import { TimelineBar } from '@/components/timeline/TimelineBar';
import { EventTypeLegend } from '@/components/timeline/EventTypeLegend';
import { Spinner } from '@/components/common/Spinner';
import { FADE_IN } from '@/config/constants';
import type { UnifiedEvent } from '@/types';

/* ─── CATEGORY COLORS (same as chart) ─── */
const CAT_COLORS: Record<string, string> = {
  battle: '#dc2626', seriyye: '#f97316', conquest: '#ea580c',
  milestone: '#d4af37', political: '#1d4ed8', revelation: '#7c3aed', migration: '#15803d',
};

/* ─── EVENT LIST ─── */

function EventList({ events }: { events: UnifiedEvent[] }) {
  const currentYear = useTimelineStore((s) => s.currentYear);
  const setCurrentYear = useTimelineStore((s) => s.setCurrentYear);

  const visibleEvents = useMemo(
    () => events.filter((e) => e.year_ce <= currentYear).reverse(),
    [events, currentYear],
  );

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        maxHeight: 440,
        overflowY: 'auto',
      }}
    >
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
      >
        <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Olaylar
        </h3>
        <span className="badge badge-gold text-xs">{visibleEvents.length}</span>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
        {visibleEvents.map((ev) => (
          <button
            key={ev.id}
            type="button"
            onClick={() => setCurrentYear(ev.year_ce)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-start transition-colors hover:opacity-80"
            style={{ background: ev.year_ce === currentYear ? 'rgba(212, 175, 55, 0.06)' : 'transparent' }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: CAT_COLORS[ev.category] ?? '#6b7280' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{ev.name}</p>
              {ev.result && (
                <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{ev.result}</p>
              )}
            </div>
            <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
              <span className="text-xs tabular-nums" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {ev.year_ce}
              </span>
              {ev.tier <= 2 && (
                <span className="text-xs" style={{ color: 'var(--text-accent)' }}>
                  {'★'.repeat(4 - ev.tier)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── STATS STRIP ─── */

function StatsStrip({ events, militaryCount, prophetCount }: { events: UnifiedEvent[]; militaryCount: number; prophetCount: number }) {
  const currentYear = useTimelineStore((s) => s.currentYear);

  const stats = useMemo(() => {
    const visible = events.filter((e) => e.year_ce <= currentYear);
    return {
      total: visible.length,
      battles: visible.filter((e) => e.category === 'battle' || e.category === 'conquest' || e.category === 'seriyye').length,
      milestones: visible.filter((e) => e.category === 'milestone').length,
      tier1: visible.filter((e) => e.tier === 1).length,
    };
  }, [events, currentYear]);

  const items = [
    { label: 'Görünen Olay', value: stats.total, color: 'var(--text-accent)' },
    { label: 'Askerî', value: `${stats.battles} / ${militaryCount}`, color: '#dc2626' },
    { label: 'Dönüm Noktası', value: `${stats.milestones} / ${prophetCount}`, color: '#d4af37' },
    { label: 'Tier ★★★', value: stats.tier1, color: '#7c3aed' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="card px-4 py-3 text-center">
          <p className="text-2xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: item.color }}>
            {item.value}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN PAGE ─── */

export default function TimelinePage() {
  useTranslation();
  const { events, isLoading, militaryCount, prophetCount } = useUnifiedTimeline();

  return (
    <motion.div {...FADE_IN} className="flex flex-col gap-5 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">⏳</span>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Zaman Çizelgesi
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            570–661 CE · {militaryCount} askerî + {prophetCount} genel = {events.length} olay
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <StatsStrip events={events} militaryCount={militaryCount} prophetCount={prophetCount} />
          <TimelineBar />

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
          >
            <TimelineChart events={events} />
          </div>

          <EventTypeLegend />
          <EventList events={events} />
        </>
      )}
    </motion.div>
  );
}
