import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import {
  resultCategory,
  RESULT_LABELS,
  BATTLE_TYPE_LABELS,
  type ResultCategory,
} from '@/utils/dataHelpers';
import { hasBattleSvg } from '@/config/battleSvgMap';
import { ListSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { FADE_IN, STAGGER_CHILDREN } from '@/config/constants';
import type { LocalizedText } from '@/types';

/* ─── Raw JSON shape ─── */
interface RawBattle {
  id: string;
  name: LocalizedText;
  date_hijri?: string;
  date_ce?: string;
  year_ce: number;
  type: string;
  location_id?: string;
  commander_muslim?: string;
  commander_enemy?: string;
  muslim_forces?: number | string;
  enemy_forces?: number | string;
  muslim_casualties?: number | string;
  enemy_casualties?: number | string;
  result?: string;
  quran_ref?: string;
  description?: LocalizedText | string;
  museum_item_ids?: string[];
}

export type { RawBattle };

type SortKey = 'year' | 'name';
type SortDir = 'asc' | 'desc';
type ViewMode = 'grid' | 'timeline';

const FUSE_OPTIONS: IFuseOptions<RawBattle> = {
  keys: [
    { name: 'name.tr', weight: 1 },
    { name: 'name.en', weight: 0.8 },
    { name: 'name.ar', weight: 0.7 },
    { name: 'commander_muslim', weight: 0.4 },
    { name: 'commander_enemy', weight: 0.3 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
};

/* ─── SVG ICONS ─── */
const Icons = {
  search: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  grid: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  timeline: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 12h18M12 3v18M3 6h4M3 18h4M17 6h4M17 18h4" />
    </svg>
  ),
  sword: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
      <path d="M15.765 2.776a1 1 0 0 1 1.414 0l4.045 4.045a1 1 0 0 1 0 1.414l-7.955 7.955-5.459-5.459z" />
    </svg>
  ),
  image: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  ),
  clear: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  sortAsc: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m3 8 4-4 4 4M7 4v16" /><path d="M11 12h4M11 16h7M11 20h10" />
    </svg>
  ),
  sortDesc: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m3 16 4 4 4-4M7 20V4" /><path d="M11 4h10M11 8h7M11 12h4" />
    </svg>
  ),
};

/* ─── ERA COLOR ─── */
function eraColor(yearCe: number): string {
  if (yearCe < 622) return '#8b4513'; // Mekke — henna
  if (yearCe < 632) return '#2d6a4f'; // Medine — emerald
  return '#2e5984'; // Hulefa — cini blue
}

function eraLabel(yearCe: number, lang: string): string {
  if (yearCe < 622) return lang === 'en' ? 'Meccan' : 'Mekke';
  if (yearCe < 632) return lang === 'en' ? 'Medinan' : 'Medine';
  return lang === 'en' ? 'Rashidun' : 'Hulefâ';
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function BattlesPage() {
  const { localize, lang } = useLocalizedField();
  const { data: battles, isLoading } = useData<RawBattle[]>('battles');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all');
  const [resultFilter, setResultFilter] = useState<ResultCategory | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const fuse = useMemo(() => (battles ? new Fuse(battles, FUSE_OPTIONS) : null), [battles]);

  /* ─── Type counts ─── */
  const typeCounts = useMemo(() => {
    if (!battles) return {} as Record<string, number>;
    const counts: Record<string, number> = { all: battles.length };
    for (const b of battles) {
      counts[b.type] = (counts[b.type] || 0) + 1;
    }
    return counts;
  }, [battles]);

  /* ─── Filtered ─── */
  const filtered = useMemo(() => {
    if (!battles) return [];
    let items = battles;

    if (search.trim() && fuse) {
      items = fuse.search(search.trim()).map(r => r.item);
    }
    if (typeFilter !== 'all') {
      items = items.filter(b => b.type === typeFilter);
    }
    if (resultFilter !== 'all') {
      items = items.filter(b => resultCategory(b.result) === resultFilter);
    }

    const sorted = [...items].sort((a, b) => {
      if (sortKey === 'year') return sortDir === 'asc' ? a.year_ce - b.year_ce : b.year_ce - a.year_ce;
      const nameA = localize(a.name).toLowerCase();
      const nameB = localize(b.name).toLowerCase();
      return sortDir === 'asc' ? nameA.localeCompare(nameB, 'tr') : nameB.localeCompare(nameA, 'tr');
    });

    return sorted;
  }, [battles, search, fuse, typeFilter, resultFilter, sortKey, sortDir, localize]);

  /* ─── SVG count ─── */
  const svgCount = useMemo(() => filtered.filter(b => hasBattleSvg(b.id)).length, [filtered]);

  if (isLoading) {
    return <div className="p-4 pb-24 sm:p-6"><div className="mx-auto w-full max-w-7xl"><ListSkeleton count={10} /></div></div>;
  }

  const typeKeys = ['all', 'gazve', 'seriyye', 'fetih', 'ridde', 'fitne', 'olay', 'deniz_savasi'] as const;
  const resultKeys = ['all', 'victory', 'conquest', 'treaty', 'defeat', 'inconclusive'] as const;

  return (
    <motion.div className="flex flex-col gap-4 p-4 pb-24 sm:p-6" {...FADE_IN}>
      <div className="mx-auto w-full max-w-7xl">
        {/* ─── Header ─── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(192,57,43,0.1)', color: '#c0392b' }}>
              {Icons.sword}
            </div>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {lang === 'en' ? 'Battles & Expeditions' : lang === 'ar' ? 'الغزوات والسرايا' : 'Savaşlar ve Seferler'}
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {filtered.length} / {battles?.length ?? 0} {lang === 'en' ? 'entries' : 'kayıt'}
                {svgCount > 0 && (
                  <span className="ml-2" style={{ color: 'var(--text-accent)' }}>
                    · {svgCount} SVG
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* View + Sort controls */}
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex rounded-lg p-0.5" style={{ background: 'var(--bg-tertiary)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-all"
                style={{
                  background: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                }}
                title={lang === 'en' ? 'Grid view' : 'Izgara görünümü'}
              >
                {Icons.grid}
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-all"
                style={{
                  background: viewMode === 'timeline' ? 'var(--bg-secondary)' : 'transparent',
                  color: viewMode === 'timeline' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: viewMode === 'timeline' ? 'var(--shadow-sm)' : 'none',
                }}
                title={lang === 'en' ? 'Timeline view' : 'Zaman çizelgesi'}
              >
                {Icons.timeline}
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border px-2.5 py-1.5 text-xs"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="year">{lang === 'en' ? 'Year' : 'Yıl'}</option>
              <option value="name">{lang === 'en' ? 'Name' : 'İsim'}</option>
            </select>
            <button
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              {sortDir === 'asc' ? Icons.sortAsc : Icons.sortDesc}
            </button>
          </div>
        </div>

        {/* ─── Search ─── */}
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
            {Icons.search}
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Search battles, commanders…' : 'Savaş, komutan ara…'}
            className="w-full rounded-xl border py-2.5 pl-9 pr-8 text-sm outline-none transition-colors focus:border-[var(--text-accent)]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
              {Icons.clear}
            </button>
          )}
        </div>

        {/* ─── Type filter chips ─── */}
        <div className="chips-scroll mb-3">
          {typeKeys.map(t => {
            const label = t === 'all'
              ? { tr: 'Tümü', en: 'All', icon: '', color: '#888' }
              : (BATTLE_TYPE_LABELS[t] || { tr: t, en: t, icon: '', color: '#888' });
            const active = typeFilter === t;
            const count = typeCounts[t] ?? 0;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: active ? `${label.color}15` : 'var(--bg-tertiary)',
                  color: active ? label.color : 'var(--text-secondary)',
                  border: `1px solid ${active ? `${label.color}35` : 'transparent'}`,
                }}
              >
                <span>{lang === 'en' ? label.en : label.tr}</span>
                {count > 0 && (
                  <span className="rounded-full px-1.5 text-[10px]" style={{
                    background: active ? `${label.color}18` : 'var(--bg-secondary)',
                    color: active ? label.color : 'var(--text-tertiary)',
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Result filter ─── */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {lang === 'en' ? 'Result:' : 'Sonuç:'}
          </span>
          {resultKeys.map(r => {
            const label = r === 'all' ? { tr: 'Tümü', en: 'All', color: '#888', icon: '' } : RESULT_LABELS[r];
            const active = resultFilter === r;
            return (
              <button
                key={r}
                onClick={() => setResultFilter(r)}
                className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                style={{
                  background: active ? `${label.color}18` : 'var(--bg-tertiary)',
                  color: active ? label.color : 'var(--text-secondary)',
                  border: `1px solid ${active ? `${label.color}35` : 'transparent'}`,
                }}
              >
                {lang === 'en' ? label.en : label.tr}
              </button>
            );
          })}
        </div>

        {/* ─── Results ─── */}
        {filtered.length === 0 ? (
          <EmptyState type="no-filter" />
        ) : viewMode === 'grid' ? (
          /* ═══ GRID VIEW ═══ */
          <motion.div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" {...STAGGER_CHILDREN}>
            {filtered.map((b, i) => (
              <BattleCard key={b.id} battle={b} localize={localize} lang={lang} index={i} />
            ))}
          </motion.div>
        ) : (
          /* ═══ TIMELINE VIEW ═══ */
          <TimelineView battles={filtered} localize={localize} lang={lang} />
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   BATTLE CARD
   ═══════════════════════════════════════════ */
function BattleCard({
  battle: b,
  localize,
  lang,
  index,
}: {
  battle: RawBattle;
  localize: (f: LocalizedText | undefined | null, fb?: string) => string;
  lang: string;
  index: number;
}) {
  const tl = BATTLE_TYPE_LABELS[b.type] || { tr: b.type, en: b.type, icon: '📌', color: '#888' };
  const rc = resultCategory(b.result);
  const rl = RESULT_LABELS[rc];
  const hasSvg = hasBattleSvg(b.id);
  const era = eraColor(b.year_ce);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link to={`/battles/${b.id}`} className="card flex flex-col gap-2.5 p-4" style={{ textDecoration: 'none' }}>
        {/* Era indicator line */}
        <div className="h-0.5 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${era}, ${era}40)` }} />

        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${tl.color}10`, border: `1.5px solid ${tl.color}25`, color: tl.color }}
          >
            {Icons.sword}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {localize(b.name)}
            </h3>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {b.year_ce} CE · {b.date_hijri || eraLabel(b.year_ce, lang)}
            </p>
          </div>
          {/* SVG indicator */}
          {hasSvg && (
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--text-accent)' }}
              title={lang === 'en' ? 'Has SVG formation' : 'SVG formasyon mevcut'}
            >
              {Icons.image}
            </div>
          )}
        </div>

        {/* Forces */}
        {(b.muslim_forces || b.enemy_forces) && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            {b.muslim_forces && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#2d6a4f' }} />
                {b.muslim_forces}
              </span>
            )}
            <span style={{ color: 'var(--text-tertiary)' }}>vs</span>
            {b.enemy_forces && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#c0392b' }} />
                {b.enemy_forces}
              </span>
            )}
          </div>
        )}

        {/* Commanders */}
        {(b.commander_muslim || b.commander_enemy) && (
          <p className="truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {b.commander_muslim || '?'} — {b.commander_enemy || '?'}
          </p>
        )}

        {/* Badges */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          <span className="badge" style={{ background: `${tl.color}10`, color: tl.color, border: `1px solid ${tl.color}20`, fontSize: '0.65rem' }}>
            {lang === 'en' ? tl.en : tl.tr}
          </span>
          <span className="badge" style={{ background: `${rl.color}10`, color: rl.color, border: `1px solid ${rl.color}20`, fontSize: '0.65rem' }}>
            {lang === 'en' ? rl.en : rl.tr}
          </span>
          {b.quran_ref && (
            <span className="badge" style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--text-accent)', fontSize: '0.65rem' }}>
              {lang === 'en' ? "Qur'an" : "Kur'ân"}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   TIMELINE VIEW
   ═══════════════════════════════════════════ */
function TimelineView({
  battles,
  localize,
  lang,
}: {
  battles: RawBattle[];
  localize: (f: LocalizedText | undefined | null, fb?: string) => string;
  lang: string;
}) {
  /* Group by year */
  const yearGroups = useMemo(() => {
    const groups: Record<number, RawBattle[]> = {};
    for (const b of battles) {
      if (!groups[b.year_ce]) groups[b.year_ce] = [];
      (groups[b.year_ce] ??= []).push(b);
    }
    return Object.entries(groups)
      .map(([year, items]) => ({ year: Number(year), items }))
      .sort((a, b) => a.year - b.year);
  }, [battles]);

  return (
    <div className="relative flex flex-col gap-0 pl-6 sm:pl-8">
      {/* Vertical line */}
      <div
        className="absolute left-2.5 top-0 bottom-0 w-px sm:left-3.5"
        style={{ background: 'var(--border-color)' }}
      />

      {yearGroups.map(({ year, items }) => {
        const era = eraColor(year);
        return (
          <div key={year} className="relative pb-6">
            {/* Year dot */}
            <div
              className="absolute -left-3.5 top-0 flex h-5 w-5 items-center justify-center rounded-full border-2 sm:-left-2.5"
              style={{ background: era, borderColor: 'var(--bg-primary)' }}
            />

            {/* Year label */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-bold tabular-nums" style={{ color: era }}>
                {year} CE
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                {eraLabel(year, lang)}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                ({items.length})
              </span>
            </div>

            {/* Battle items */}
            <div className="flex flex-col gap-2">
              {items.map((b) => {
                const tl = BATTLE_TYPE_LABELS[b.type] || { tr: b.type, en: b.type, icon: '📌', color: '#888' };
                const rc = resultCategory(b.result);
                const rl = RESULT_LABELS[rc];
                const hasSvg = hasBattleSvg(b.id);

                return (
                  <Link
                    key={b.id}
                    to={`/battles/${b.id}`}
                    className="flex items-center gap-3 rounded-xl p-3 transition-all hover:shadow-md"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${tl.color}10`, color: tl.color }}
                    >
                      {Icons.sword}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {localize(b.name)}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-[10px] font-medium" style={{ color: tl.color }}>
                          {lang === 'en' ? tl.en : tl.tr}
                        </span>
                        <span className="text-[10px]" style={{ color: rl.color }}>
                          {lang === 'en' ? rl.en : rl.tr}
                        </span>
                        {b.muslim_forces && b.enemy_forces && (
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                            {b.muslim_forces} vs {b.enemy_forces}
                          </span>
                        )}
                      </div>
                    </div>
                    {hasSvg && (
                      <div
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                        style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--text-accent)' }}
                      >
                        {Icons.image}
                      </div>
                    )}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
