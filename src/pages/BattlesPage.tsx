import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import {
  resultCategory,
  RESULT_LABELS,
  BATTLE_TYPE_LABELS,
  type ResultCategory,
} from '@/utils/dataHelpers';
import { ListSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
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

export default function BattlesPage() {
  const { localize, lang } = useLocalizedField();
  const { data: battles, isLoading } = useData<RawBattle[]>('battles');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all');
  const [resultFilter, setResultFilter] = useState<ResultCategory | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

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

    // Sort
    const sorted = [...items].sort((a, b) => {
      if (sortKey === 'year') return sortDir === 'asc' ? a.year_ce - b.year_ce : b.year_ce - a.year_ce;
      const nameA = localize(a.name).toLowerCase();
      const nameB = localize(b.name).toLowerCase();
      return sortDir === 'asc' ? nameA.localeCompare(nameB, 'tr') : nameB.localeCompare(nameA, 'tr');
    });

    return sorted;
  }, [battles, search, fuse, typeFilter, resultFilter, sortKey, sortDir, localize]);

  if (isLoading) {
    return <div className="p-4 pb-24 sm:p-6"><div className="mx-auto w-full max-w-7xl"><ListSkeleton count={10} /></div></div>;
  }

  const typeKeys = ['all', 'gazve', 'seriyye', 'fetih', 'ridde', 'fitne', 'olay', 'deniz_savasi'] as const;
  const resultKeys = ['all', 'victory', 'conquest', 'treaty', 'defeat', 'inconclusive'] as const;

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <h1 className="text-xl font-bold sm:text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {lang === 'en' ? 'Battles & Expeditions' : lang === 'ar' ? 'الغزوات والسرايا' : 'Savaşlar ve Seferler'}
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {filtered.length} / {battles?.length ?? 0} {lang === 'en' ? 'entries' : 'kayıt'}
              </p>
            </div>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as SortKey)}
              className="rounded-md border px-2 py-1 text-xs"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <option value="year">{lang === 'en' ? 'Year' : 'Yıl'}</option>
              <option value="name">{lang === 'en' ? 'Name' : 'İsim'}</option>
            </select>
            <button
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="rounded-md border px-2 py-1 text-xs"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-tertiary)' }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Search battles…' : 'Savaş ara…'}
            className="w-full rounded-lg border py-2.5 pl-9 pr-8 text-sm outline-none"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-tertiary)' }}>✕</button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="mb-3 flex flex-wrap gap-2 overflow-x-auto">
          {typeKeys.map(t => {
            const label = t === 'all'
              ? { tr: 'Tümü', en: 'All', icon: '📋', color: '#888' }
              : (BATTLE_TYPE_LABELS[t] || { tr: t, en: t, icon: '📌', color: '#888' });
            const active = typeFilter === t;
            const count = typeCounts[t] ?? 0;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: active ? `${label.color}18` : 'var(--bg-tertiary)',
                  color: active ? label.color : 'var(--text-secondary)',
                  border: `1px solid ${active ? `${label.color}40` : 'transparent'}`,
                }}
              >
                <span>{label.icon}</span>
                <span>{lang === 'en' ? label.en : label.tr}</span>
                {count > 0 && (
                  <span className="rounded-full px-1.5 text-[10px]" style={{ background: active ? `${label.color}20` : 'var(--bg-secondary)', color: active ? label.color : 'var(--text-tertiary)' }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Result filter */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {lang === 'en' ? 'Result:' : 'Sonuç:'}
          </span>
          {resultKeys.map(r => {
            const label = r === 'all' ? { tr: 'Tümü', en: 'All', color: '#888', icon: '📋' } : RESULT_LABELS[r];
            const active = resultFilter === r;
            return (
              <button
                key={r}
                onClick={() => setResultFilter(r)}
                className="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
                style={{
                  background: active ? `${label.color}20` : 'var(--bg-tertiary)',
                  color: active ? label.color : 'var(--text-secondary)',
                  border: `1px solid ${active ? `${label.color}40` : 'transparent'}`,
                }}
              >
                {label.icon} {lang === 'en' ? label.en : label.tr}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <EmptyState type="no-filter" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(b => (
              <BattleCard key={b.id} battle={b} localize={localize} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Battle Card ─── */
function BattleCard({ battle: b, localize, lang }: { battle: RawBattle; localize: (f: LocalizedText | undefined | null, fb?: string) => string; lang: string }) {
  const tl = BATTLE_TYPE_LABELS[b.type] || { tr: b.type, en: b.type, icon: '📌', color: '#888' };
  const rc = resultCategory(b.result);
  const rl = RESULT_LABELS[rc];

  return (
    <Link to={`/battles/${b.id}`} className="card flex flex-col gap-2 p-4" style={{ textDecoration: 'none' }}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: `${tl.color}12`, border: `1.5px solid ${tl.color}35` }}
        >
          {tl.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {localize(b.name)}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {b.year_ce} CE · {b.date_hijri || ''}
          </p>
        </div>
      </div>

      {/* Forces */}
      {(b.muslim_forces || b.enemy_forces) && (
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {b.muslim_forces && <span>🟢 {b.muslim_forces}</span>}
          <span style={{ color: 'var(--text-tertiary)' }}>vs</span>
          {b.enemy_forces && <span>🔴 {b.enemy_forces}</span>}
        </div>
      )}

      {/* Commanders */}
      {(b.commander_muslim || b.commander_enemy) && (
        <p className="truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {b.commander_muslim || '?'} ⚡ {b.commander_enemy || '?'}
        </p>
      )}

      {/* Badges */}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        <span className="badge" style={{ background: `${tl.color}12`, color: tl.color, border: `1px solid ${tl.color}25`, fontSize: '0.65rem' }}>
          {tl.icon} {lang === 'en' ? tl.en : tl.tr}
        </span>
        <span className="badge" style={{ background: `${rl.color}12`, color: rl.color, border: `1px solid ${rl.color}25`, fontSize: '0.65rem' }}>
          {rl.icon} {lang === 'en' ? rl.en : rl.tr}
        </span>
        {b.quran_ref && (
          <span className="badge" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--text-accent)', fontSize: '0.65rem' }}>
            📖 {lang === 'en' ? "Qur'an" : "Kur'ân"}
          </span>
        )}
      </div>
    </Link>
  );
}
