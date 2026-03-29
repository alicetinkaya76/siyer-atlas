import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { useData } from '@/hooks/useData';
import { ListSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { FADE_IN } from '@/config/constants';

/* ─── Types ─── */
interface KeyMoment {
  ts: string;
  speaker: string;
  tr: string;
  ar?: string;
  en?: string;
}

interface AudioEpisode {
  bolum_no: number;
  title: string;
  mp3: string;
  duration_sec: number;
  char_count: number;
  events: string[];
  companions: string[];
  locations: string[];
  battles: string[];
  tribes: string[];
  date_range_ce: string[];
  key_moments: KeyMoment[];
}

interface AudioLayer {
  version: string;
  stats: {
    total_episodes: number;
    total_duration_sec: number;
    total_duration_hours: number;
    total_key_moments: number;
    linked_battles: number;
    linked_companions: number;
    linked_events: number;
    linked_locations: number;
    linked_tribes: number;
  };
  index: {
    by_battle: Record<string, number[]>;
    by_companion: Record<string, number[]>;
    by_event: Record<string, number[]>;
    by_location: Record<string, number[]>;
    by_tribe: Record<string, number[]>;
  };
}

type FilterType = 'all' | 'battle' | 'companion' | 'event' | 'location' | 'tribe';

/* ─── Helpers ─── */
function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatHMS(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}sa ${m}dk`;
  return `${m}dk`;
}

/* ─── Waveform Visual ─── */
function WaveformBars({ playing, barCount = 32 }: { playing: boolean; barCount?: number }) {
  const barsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!barsRef.current || !playing) return;
    const bars = barsRef.current.children;
    const raf = { id: 0 };
    let time = 0;
    const animate = () => {
      time += 0.06;
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i] as HTMLElement;
        const h = 20 + Math.sin(time + i * 0.5) * 15 + Math.sin(time * 1.7 + i * 0.3) * 10;
        bar.style.height = `${Math.max(4, h)}%`;
      }
      raf.id = requestAnimationFrame(animate);
    };
    raf.id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.id);
  }, [playing]);
  return (
    <div ref={barsRef} className="flex items-end gap-[2px]" style={{ height: 28 }}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div key={i} className="rounded-sm" style={{ width: 3, height: playing ? '40%' : '15%', background: playing ? 'linear-gradient(to top, rgba(212,175,55,0.4), rgba(212,175,55,0.9))' : 'rgba(212,175,55,0.25)', transition: playing ? 'none' : 'height 0.5s ease' }} />
      ))}
    </div>
  );
}

/* ─── Speaker Avatar ─── */
function SpeakerBadge({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const hue = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold" style={{ background: `hsl(${hue}, 35%, 85%)`, color: `hsl(${hue}, 50%, 30%)` }}>{initial}</span>
  );
}


const PERIOD_FILTERS = [
  { key: 'all', i18nKey: 'audio_period_all', icon: '📻', range: [0, 999], color: '#d4af37' },
  { key: 'mekke_early', i18nKey: 'audio_period_mekke_early', icon: '🕋', range: [1, 20], color: '#8b4513' },
  { key: 'mekke_mid', i18nKey: 'audio_period_mekke_mid', icon: '🌙', range: [21, 40], color: '#a0522d' },
  { key: 'mekke_late', i18nKey: 'audio_period_mekke_late', icon: '✨', range: [41, 60], color: '#d4af37' },
  { key: 'medine_early', i18nKey: 'audio_period_medine_early', icon: '🕌', range: [61, 90], color: '#15803d' },
  { key: 'medine_mid', i18nKey: 'audio_period_medine_mid', icon: '⚔️', range: [91, 120], color: '#dc2626' },
  { key: 'medine_late', i18nKey: 'audio_period_medine_late', icon: '🏳️', range: [121, 160], color: '#2e5984' },
] as const;

const FILTER_TYPE_META: { key: FilterType; i18nKey: string; icon: string; color: string }[] = [
  { key: 'all', i18nKey: 'audio_filter_all', icon: '📻', color: '#d4af37' },
  { key: 'battle', i18nKey: 'audio_filter_battle', icon: '⚔️', color: '#c0392b' },
  { key: 'companion', i18nKey: 'audio_filter_companion', icon: '👤', color: '#7c3aed' },
  { key: 'event', i18nKey: 'audio_filter_event', icon: '📅', color: '#2e5984' },
  { key: 'location', i18nKey: 'audio_filter_location', icon: '📍', color: '#15803d' },
  { key: 'tribe', i18nKey: 'audio_filter_tribe', icon: '🏕️', color: '#8b4513' },
];

const FUSE_OPTIONS: IFuseOptions<AudioEpisode> = {
  keys: [
    { name: 'title', weight: 1 },
    { name: 'key_moments.tr', weight: 0.5 },
    { name: 'key_moments.speaker', weight: 0.4 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
};

/* ─── Component ─── */
export default function AudioPage() {
  const { t } = useTranslation('pages');
  const { data: episodes, isLoading: le } = useData<AudioEpisode[]>('audio_episodes');
  const { data: layer, isLoading: ll } = useData<AudioLayer>('audio_layer');

  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState<FilterType>('all');
  const [entityValue, setEntityValue] = useState<string | null>(null);
  const [expandedEp, setExpandedEp] = useState<number | null>(null);
  const [playingEp, setPlayingEp] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);


  // Entity options based on filter type
  const entityOptions = useMemo(() => {
    if (!layer?.index || entityFilter === 'all') return [];
    const indexMap: Record<string, Record<string, number[]>> = {
      battle: layer.index.by_battle, companion: layer.index.by_companion,
      event: layer.index.by_event, location: layer.index.by_location, tribe: layer.index.by_tribe,
    };
    const idx = indexMap[entityFilter];
    if (!idx) return [];
    return Object.entries(idx).map(([k, v]) => ({ id: k, count: v.length })).sort((a, b) => b.count - a.count);
  }, [layer, entityFilter]);

  // Filtered episodes from entity index
  const entityEpNums = useMemo(() => {
    if (!layer?.index || entityFilter === 'all' || !entityValue) return null;
    const indexMap: Record<string, Record<string, number[]>> = {
      battle: layer.index.by_battle, companion: layer.index.by_companion,
      event: layer.index.by_event, location: layer.index.by_location, tribe: layer.index.by_tribe,
    };
    return new Set(indexMap[entityFilter]?.[entityValue] ?? []);
  }, [layer, entityFilter, entityValue]);

  // Fuse search
  const fuse = useMemo(() => {
    if (!episodes) return null;
    return new Fuse(episodes, FUSE_OPTIONS);
  }, [episodes]);

  // Filtered list
  const filteredEpisodes = useMemo(() => {
    if (!episodes) return [];
    let items = [...episodes];
    if (periodFilter !== 'all') {
      const pf = PERIOD_FILTERS.find((p) => p.key === periodFilter);
      if (pf) items = items.filter((e) => e.bolum_no >= pf.range[0] && e.bolum_no <= pf.range[1]);
    }
    if (entityEpNums) items = items.filter((e) => entityEpNums.has(e.bolum_no));
    if (search.trim() && fuse) {
      const matchIds = new Set(fuse.search(search.trim()).map((r) => r.item.bolum_no));
      items = items.filter((e) => matchIds.has(e.bolum_no));
    }
    return items;
  }, [episodes, periodFilter, entityEpNums, search, fuse]);

  // Audio control
  const handlePlay = useCallback((epNo: number) => {
    if (playingEp === epNo) { setIsPlaying(!isPlaying); return; }
    setPlayingEp(epNo); setIsPlaying(true);
  }, [playingEp, isPlaying]);

  const handlePrev = useCallback(() => {
    if (!episodes || playingEp === null) return;
    const idx = episodes.findIndex((e) => e.bolum_no === playingEp);
    if (idx > 0) { setPlayingEp(episodes[idx - 1]!.bolum_no); setIsPlaying(true); }
  }, [episodes, playingEp]);

  const handleNext = useCallback(() => {
    if (!episodes || playingEp === null) return;
    const idx = episodes.findIndex((e) => e.bolum_no === playingEp);
    if (idx < episodes.length - 1) { setPlayingEp(episodes[idx + 1]!.bolum_no); setIsPlaying(true); }
  }, [episodes, playingEp]);

  const stats = layer?.stats;
  const isLoading = le || ll;

  return (
    <motion.div {...FADE_IN} className={`flex flex-col gap-4 p-4 sm:p-6 ${playingEp !== null ? 'pb-36' : 'pb-24'}`}>
      <div className="mx-auto w-full max-w-4xl">
        {/* ─── Header Banner ─── */}
        <div className="mb-5 rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(26,26,46,0.04))', border: '1px solid rgba(212,175,55,0.15)' }}>
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 18V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <circle cx="9.5" cy="14" r="2.5" /><path d="M12 14V6" /><path d="M15 8l-3-2-3 2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Asr-ı Saadet Radyo Tiyatrosu
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {stats ? `${stats.total_episodes} bölüm · ${stats.total_duration_hours} saat · ${stats.total_key_moments} sahne` : '160 bölüm · Dramatize siyer anlatımı'}
              </p>
            </div>
          </div>
          <div className="absolute right-4 bottom-3 opacity-20"><WaveformBars playing={false} barCount={24} /></div>
        </div>

        {/* ─── Stats Grid ─── */}
        {stats && (
          <div className="mb-4 grid grid-cols-5 gap-2">
            {[
              { val: stats.total_episodes, label: 'Bölüm', color: 'var(--text-accent)', icon: '📻' },
              { val: `${stats.total_duration_hours}`, label: 'Saat', color: '#2e5984', icon: '⏱️' },
              { val: stats.linked_battles, label: 'Savaş', color: '#c0392b', icon: '⚔️' },
              { val: stats.linked_companions, label: 'Sahâbî', color: '#7c3aed', icon: '👤' },
              { val: stats.linked_locations, label: 'Mekân', color: '#15803d', icon: '📍' },
            ].map((s) => (
              <div key={s.label} className="card flex flex-col items-center gap-0.5 p-2 text-center">
                <span className="text-sm">{s.icon}</span>
                <span className="text-base font-bold tabular-nums" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.val}</span>
                <span className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ─── Search ─── */}
        <div className="mb-3 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('audio_search')}
            className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-[rgba(212,175,55,0.3)]"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-tertiary)' }}>✕</button>}
        </div>

        {/* ─── Period Filter ─── */}
        <div className="chips-scroll mb-3">
          {PERIOD_FILTERS.map((p) => (
            <button key={p.key} onClick={() => setPeriodFilter(p.key)}
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
              style={{
                background: periodFilter === p.key ? `${p.color}18` : 'var(--bg-tertiary)',
                color: periodFilter === p.key ? p.color : 'var(--text-tertiary)',
                border: `1px solid ${periodFilter === p.key ? `${p.color}40` : 'transparent'}`,
              }}
            >
              {p.icon} {t(p.i18nKey)}
            </button>
          ))}
        </div>

        {/* ─── Entity Filter ─── */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTER_TYPE_META.map((meta) => (
            <button key={meta.key} onClick={() => { setEntityFilter(meta.key); setEntityValue(null); }}
              className="rounded-full px-2.5 py-1 text-xs font-medium transition-all"
              style={{
                background: entityFilter === meta.key ? `${meta.color}18` : 'var(--bg-tertiary)',
                color: entityFilter === meta.key ? meta.color : 'var(--text-tertiary)',
                border: `1px solid ${entityFilter === meta.key ? `${meta.color}40` : 'transparent'}`,
              }}
            >
              {meta.icon} {t(meta.i18nKey)}
            </button>
          ))}
        </div>

        {/* Entity value chips */}
        {entityFilter !== 'all' && entityOptions.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {entityOptions.slice(0, 20).map((opt) => {
              const filterMeta = FILTER_TYPE_META.find(f => f.key === entityFilter)!;
              return (
              <button key={opt.id} onClick={() => setEntityValue(entityValue === opt.id ? null : opt.id)}
                className="rounded-full px-2 py-0.5 text-[11px] font-medium transition-all"
                style={{
                  background: entityValue === opt.id ? `${filterMeta.color}20` : 'var(--bg-secondary)',
                  color: entityValue === opt.id ? filterMeta.color : 'var(--text-tertiary)',
                  border: `1px solid ${entityValue === opt.id ? `${filterMeta.color}40` : 'var(--border-color)'}`,
                }}
              >
                {opt.id.replace(/_/g, ' ')} ({opt.count})
              </button>
              );
            })}
          </div>
        )}

        {isLoading && <ListSkeleton count={6} />}

        {/* ─── Results count ─── */}
        {!isLoading && (
          <p className="mb-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {t('audio_results', { shown: filteredEpisodes.length, total: episodes?.length ?? 160 })}
          </p>
        )}

        {/* ─── Episode list ─── */}
        {!isLoading && (
          <div className="flex flex-col gap-2">
            {filteredEpisodes.map((ep) => {
              const isExpanded = expandedEp === ep.bolum_no;
              const isEpPlaying = playingEp === ep.bolum_no && isPlaying;
              const hasEntities = ep.companions.length > 0 || ep.battles.length > 0 || ep.locations.length > 0 || ep.events.length > 0 || ep.tribes.length > 0;
              const periodColor = ep.bolum_no <= 40 ? '#8b4513' : ep.bolum_no <= 60 ? '#d4af37' : ep.bolum_no <= 120 ? '#15803d' : '#2e5984';

              return (
                <div key={ep.bolum_no} className="card overflow-hidden transition-shadow" style={{ borderInlineStart: `3px solid ${periodColor}`, boxShadow: isEpPlaying ? '0 0 0 1px rgba(212,175,55,0.3), 0 4px 12px rgba(212,175,55,0.08)' : undefined }}>
                  {/* Header Row */}
                  <div className="flex items-center gap-2 p-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlay(ep.bolum_no); }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm transition-all active:scale-90"
                      style={{ background: isEpPlaying ? 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))' : 'rgba(212,175,55,0.08)', color: 'var(--text-accent)', boxShadow: isEpPlaying ? '0 0 12px rgba(212,175,55,0.15)' : 'none' }}
                    >
                      {isEpPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      )}
                    </button>

                    <button onClick={() => setExpandedEp(isExpanded ? null : ep.bolum_no)} className="min-w-0 flex-1 text-start" style={{ background: 'transparent' }}>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold tabular-nums" style={{ color: periodColor, minWidth: '24px' }}>{ep.bolum_no}</span>
                        <h3 className="truncate text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{ep.title}</h3>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        <span>⏱ {formatDuration(ep.duration_sec)}</span>
                        {ep.key_moments.length > 0 && <span>🎬 {t('audio_scenes', { count: ep.key_moments.length })}</span>}
                        {ep.date_range_ce.length > 0 && <span>📅 {ep.date_range_ce.join('–')} CE</span>}
                      </div>
                    </button>

                    <div className="hidden shrink-0 items-center gap-1 sm:flex">
                      {ep.battles.length > 0 && <span className="rounded-full px-1.5 py-0.5 text-[10px]" style={{ background: 'rgba(192,57,43,0.08)', color: '#c0392b' }}>⚔️ {ep.battles.length}</span>}
                      {ep.companions.length > 0 && <span className="rounded-full px-1.5 py-0.5 text-[10px]" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}>👤 {ep.companions.length}</span>}
                    </div>

                    <span className="shrink-0 text-xs transition-transform" style={{ color: 'var(--text-tertiary)', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-3 px-3 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                          {/* Key Moments with Speaker Badges */}
                          {ep.key_moments.length > 0 && (
                            <div className="mt-3">
                              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--text-accent)' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                {t('audio_key_moments')}
                              </h4>
                              <div className="flex flex-col gap-1.5 rounded-xl p-2" style={{ background: 'rgba(212,175,55,0.03)' }}>
                                {ep.key_moments.map((km, i) => (
                                  <div key={i} className="flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-[rgba(212,175,55,0.05)]">
                                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums" style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--text-accent)', fontFamily: 'var(--font-mono)' }}>{km.ts}</span>
                                    <SpeakerBadge name={km.speaker} />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{km.tr}</p>
                                      {km.ar && <p className="mt-0.5 text-xs leading-snug" style={{ color: 'var(--text-tertiary)', direction: 'rtl', fontFamily: 'var(--font-body)' }}>{km.ar}</p>}
                                      <p className="mt-0.5 text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>— {km.speaker}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Entity Links */}
                          {hasEntities && (
                            <div>
                              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--text-accent)' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                {t('audio_links')}
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {ep.companions.map((cid) => (
                                  <Link key={cid} to={`/companions/${cid}`} className="rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors hover:brightness-90" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', textDecoration: 'none' }}>👤 {cid.replace(/_/g, ' ')}</Link>
                                ))}
                                {ep.battles.map((bid) => (
                                  <Link key={bid} to={`/battles/${bid}`} className="rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors hover:brightness-90" style={{ background: 'rgba(192,57,43,0.08)', color: '#c0392b', textDecoration: 'none' }}>⚔️ {bid.replace(/_/g, ' ')}</Link>
                                ))}
                                {ep.locations.map((lid) => (
                                  <span key={lid} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(21,128,61,0.08)', color: '#15803d' }}>📍 {lid.replace(/_/g, ' ')}</span>
                                ))}
                                {ep.events.map((eid) => (
                                  <span key={eid} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(46,89,132,0.08)', color: '#2e5984' }}>📅 {eid.replace(/^evt_/, '').replace(/_/g, ' ')}</span>
                                ))}
                                {ep.tribes.map((tid) => (
                                  <span key={tid} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(139,69,19,0.08)', color: '#8b4513' }}>🏕️ {tid.replace(/_/g, ' ')}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            {filteredEpisodes.length === 0 && <EmptyState type="no-results" />}
          </div>
        )}

        {/* ─── Now Playing Bar (sticky bottom with waveform) ─── */}
        <AnimatePresence>
          {playingEp !== null && episodes && (() => {
            const ep = episodes.find((e) => e.bolum_no === playingEp);
            if (!ep) return null;
            const epIdx = episodes.findIndex((e) => e.bolum_no === playingEp);
            return (
              <motion.div
                key="now-playing"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[env(safe-area-inset-bottom,8px)] pt-2"
                style={{ background: 'var(--glass-bg, rgba(26,26,46,0.9))', backdropFilter: 'blur(20px) saturate(1.5)', borderTop: '1px solid rgba(212,175,55,0.2)' }}
              >
                <div className="mx-auto flex max-w-4xl items-center gap-2">
                  {/* Prev */}
                  <button onClick={handlePrev} disabled={epIdx <= 0} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30" style={{ color: 'var(--text-accent)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
                  </button>
                  {/* Play/Pause */}
                  <button onClick={() => handlePlay(playingEp)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-90" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))', color: 'var(--text-accent)' }}>
                    {isPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>
                  {/* Next */}
                  <button onClick={handleNext} disabled={!episodes || epIdx >= episodes.length - 1} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30" style={{ color: 'var(--text-accent)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                  </button>
                  {/* Track info + Waveform */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      {ep.bolum_no}. {ep.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <WaveformBars playing={isPlaying} barCount={20} />
                      <span className="text-[10px] tabular-nums shrink-0" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{formatHMS(ep.duration_sec)}</span>
                    </div>
                  </div>
                  {/* Close */}
                  <button onClick={() => { setPlayingEp(null); setIsPlaying(false); }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
