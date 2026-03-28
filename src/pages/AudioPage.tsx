import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { useData } from '@/hooks/useData';
import { ListSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

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


const PERIOD_FILTERS = [
  { key: 'all', i18nKey: 'audio_period_all', icon: '📻', range: [0, 999] },
  { key: 'mekke_early', i18nKey: 'audio_period_mekke_early', icon: '🕋', range: [1, 20] },
  { key: 'mekke_mid', i18nKey: 'audio_period_mekke_mid', icon: '🌙', range: [21, 40] },
  { key: 'mekke_late', i18nKey: 'audio_period_mekke_late', icon: '✨', range: [41, 60] },
  { key: 'medine_early', i18nKey: 'audio_period_medine_early', icon: '🕌', range: [61, 90] },
  { key: 'medine_mid', i18nKey: 'audio_period_medine_mid', icon: '⚔️', range: [91, 120] },
  { key: 'medine_late', i18nKey: 'audio_period_medine_late', icon: '🏳️', range: [121, 160] },
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
      battle: layer.index.by_battle,
      companion: layer.index.by_companion,
      event: layer.index.by_event,
      location: layer.index.by_location,
      tribe: layer.index.by_tribe,
    };
    const idx = indexMap[entityFilter];
    if (!idx) return [];
    return Object.entries(idx)
      .map(([k, v]) => ({ id: k, count: v.length }))
      .sort((a, b) => b.count - a.count);
  }, [layer, entityFilter]);

  // Filtered episodes from entity index
  const entityEpNums = useMemo(() => {
    if (!layer?.index || entityFilter === 'all' || !entityValue) return null;
    const indexMap: Record<string, Record<string, number[]>> = {
      battle: layer.index.by_battle,
      companion: layer.index.by_companion,
      event: layer.index.by_event,
      location: layer.index.by_location,
      tribe: layer.index.by_tribe,
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

    // Period filter
    if (periodFilter !== 'all') {
      const pf = PERIOD_FILTERS.find((p) => p.key === periodFilter);
      if (pf) items = items.filter((e) => e.bolum_no >= pf.range[0] && e.bolum_no <= pf.range[1]);
    }

    // Entity filter
    if (entityEpNums) {
      items = items.filter((e) => entityEpNums.has(e.bolum_no));
    }

    // Search
    if (search.trim() && fuse) {
      const searchItems = fuse.search(search.trim());
      const matchIds = new Set(searchItems.map((r) => r.item.bolum_no));
      items = items.filter((e) => matchIds.has(e.bolum_no));
    }

    return items;
  }, [episodes, periodFilter, entityEpNums, search, fuse]);

  // Audio control (simulated — no actual MP3 hosting)
  const handlePlay = useCallback((epNo: number) => {
    if (playingEp === epNo) {
      setIsPlaying(!isPlaying);
      return;
    }
    setPlayingEp(epNo);
    setIsPlaying(true);
    
  }, [playingEp, isPlaying]);

  const stats = layer?.stats;
  const isLoading = le || ll;

  return (
    <div className={`page-enter flex flex-col gap-4 p-4 sm:p-6 ${playingEp !== null ? 'pb-36' : 'pb-24'}`}>
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl">🎧</span>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Asr-ı Saadet Radyo Tiyatrosu
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {stats
                ? t('audio_subtitle', { episodes: stats.total_episodes, hours: stats.total_duration_hours, moments: stats.total_key_moments })
                : t('audio_subtitle_default')}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl p-3 sm:grid-cols-5" style={{ background: 'var(--bg-tertiary)' }}>
            {[
              { icon: '📻', val: stats.total_episodes, label: t('audio_stat_episodes') },
              { icon: '⏱️', val: `${stats.total_duration_hours}h`, label: t('audio_stat_duration') },
              { icon: '⚔️', val: stats.linked_battles, label: t('audio_stat_battles') },
              { icon: '👤', val: stats.linked_companions, label: t('audio_stat_companions') },
              { icon: '📍', val: stats.linked_locations, label: t('audio_stat_locations') },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 text-center">
                <span className="text-lg">{s.icon}</span>
                <span className="text-base font-bold" style={{ color: 'var(--text-accent)' }}>{s.val}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('audio_search')}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Period Filter */}
        <div className="chips-scroll mb-3">
          {PERIOD_FILTERS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriodFilter(p.key)}
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-all"
              style={{
                background: periodFilter === p.key ? 'rgba(212,175,55,0.15)' : 'var(--bg-tertiary)',
                color: periodFilter === p.key ? 'var(--text-accent)' : 'var(--text-tertiary)',
                border: `1px solid ${periodFilter === p.key ? 'rgba(212,175,55,0.3)' : 'transparent'}`,
              }}
            >
              {p.icon} {t(p.i18nKey)}
            </button>
          ))}
        </div>

        {/* Entity Filter */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTER_TYPE_META.map((meta) => (
            <button
              key={meta.key}
              onClick={() => { setEntityFilter(meta.key); setEntityValue(null); }}
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
              <button
                key={opt.id}
                onClick={() => setEntityValue(entityValue === opt.id ? null : opt.id)}
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

        {/* Now Playing Bar — sticky at bottom */}
        {playingEp !== null && episodes && (() => {
          const ep = episodes.find((e) => e.bolum_no === playingEp);
          if (!ep) return null;
          return (
            <div className="now-playing-sticky px-4 py-2" style={{ background: 'var(--glass-bg)', borderTop: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="mx-auto flex max-w-4xl items-center gap-3">
                <button onClick={() => handlePlay(playingEp)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg transition-transform active:scale-90" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--text-accent)' }}>
                  {isPlaying ? '⏸' : '▶️'}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {ep.bolum_no}. {ep.title}
                  </p>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: '0%', background: 'linear-gradient(90deg, #d4af37, #e6bf55)' }} />
                  </div>
                </div>
                <button onClick={() => { setPlayingEp(null); setIsPlaying(false); }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>✕</button>
              </div>
            </div>
          );
        })()}

        {isLoading && <ListSkeleton count={6} />}

        {/* Results count */}
        {!isLoading && (
          <p className="mb-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {t('audio_results', { shown: filteredEpisodes.length, total: episodes?.length ?? 160 })}
          </p>
        )}

        {/* Episode list */}
        {!isLoading && (
          <div className="flex flex-col gap-2">
            {filteredEpisodes.map((ep) => {
              const isExpanded = expandedEp === ep.bolum_no;
              const isEpPlaying = playingEp === ep.bolum_no && isPlaying;
              const hasEntities = ep.companions.length > 0 || ep.battles.length > 0 || ep.locations.length > 0 || ep.events.length > 0 || ep.tribes.length > 0;
              const periodColor = ep.bolum_no <= 40 ? '#8b4513' : ep.bolum_no <= 60 ? '#d4af37' : '#15803d';

              return (
                <div key={ep.bolum_no} className="card overflow-hidden transition-all" style={{ borderInlineStart: `3px solid ${periodColor}` }}>
                  {/* Header Row */}
                  <div className="flex items-center gap-2 p-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlay(ep.bolum_no); }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm transition-transform active:scale-90"
                      style={{ background: isEpPlaying ? 'rgba(212,175,55,0.2)' : 'rgba(212,175,55,0.08)', color: 'var(--text-accent)' }}
                    >
                      {isEpPlaying ? '⏸' : '▶'}
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

                    <span className="shrink-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="flex flex-col gap-3 px-3 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                      {/* Key Moments */}
                      {ep.key_moments.length > 0 && (
                        <div className="mt-3">
                          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-accent)' }}>🎬 {t('audio_key_moments')}</h4>
                          <div className="flex flex-col gap-1.5">
                            {ep.key_moments.map((km, i) => (
                              <div key={i} className="flex items-start gap-2 rounded-lg p-2" style={{ background: 'rgba(212,175,55,0.04)' }}>
                                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums" style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--text-accent)' }}>{km.ts}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{km.tr}</p>
                                  {km.ar && <p className="mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)', direction: 'rtl' }}>{km.ar}</p>}
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
                          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-accent)' }}>🔗 {t('audio_links')}</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {ep.companions.map((cid) => (
                              <Link key={cid} to={`/companions/${cid}`} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', textDecoration: 'none' }}>👤 {cid.replace(/_/g, ' ')}</Link>
                            ))}
                            {ep.battles.map((bid) => (
                              <Link key={bid} to={`/battles/${bid}`} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: 'rgba(192,57,43,0.08)', color: '#c0392b', textDecoration: 'none' }}>⚔️ {bid.replace(/_/g, ' ')}</Link>
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
                  )}
                </div>
              );
            })}
            {filteredEpisodes.length === 0 && <EmptyState type="no-results" />}
          </div>
        )}
      </div>
    </div>
  );
}
