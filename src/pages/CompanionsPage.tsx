import { useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import {
  companionGroup,
  COMPANION_GROUP_LABELS,
  type CompanionGroup,
} from '@/utils/dataHelpers';
import { ListSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { LocalizedText } from '@/types';

/* ─── Raw JSON shape (matches companions.json) ─── */
interface RawCompanion {
  id: string;
  name: LocalizedText;
  kunya?: string;
  laqab?: LocalizedText;
  full_name?: LocalizedText;
  birth_ce?: number;
  death_ce?: number;
  death_hijri?: number;
  birth_location_id?: string;
  death_location_id?: string;
  tribe?: string;
  clan?: LocalizedText;
  rank?: number | string;
  roles?: (LocalizedText | string)[];
  conversion_order?: number;
  conversion_note?: LocalizedText;
  quran_references?: unknown[];
  events_participated?: string[];
  description?: LocalizedText | string;
  sources?: string[];
  gender?: string;
  category?: string | string[];
  relationships?: unknown[];
  professions?: (LocalizedText | string)[];
  museum_item_ids?: string[];
}

export type { RawCompanion };

type ViewMode = 'grid' | 'list';

/* ─── FUSE CONFIG ─── */
const FUSE_OPTIONS: IFuseOptions<RawCompanion> = {
  keys: [
    { name: 'name.tr', weight: 1 },
    { name: 'name.en', weight: 0.8 },
    { name: 'name.ar', weight: 0.7 },
    { name: 'kunya', weight: 0.6 },
    { name: 'laqab.tr', weight: 0.5 },
    { name: 'laqab.en', weight: 0.4 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
};

export default function CompanionsPage() {
  const { localize, lang } = useLocalizedField();
  const { data: companions, isLoading } = useData<RawCompanion[]>('companions');

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<CompanionGroup | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const fuse = useMemo(
    () => (companions ? new Fuse(companions, FUSE_OPTIONS) : null),
    [companions],
  );

  const filtered = useMemo(() => {
    if (!companions) return [];
    let items = companions;
    if (search.trim() && fuse) {
      items = fuse.search(search.trim()).map(r => r.item);
    }
    if (groupFilter !== 'all') {
      items = items.filter(c => companionGroup(c.category).includes(groupFilter));
    }
    if (genderFilter !== 'all') {
      items = items.filter(c => c.gender === genderFilter);
    }
    return items;
  }, [companions, search, fuse, groupFilter, genderFilter]);

  const groupCounts = useMemo(() => {
    if (!companions) return {} as Record<string, number>;
    const counts: Record<string, number> = { all: companions.length };
    for (const c of companions) {
      for (const g of companionGroup(c.category)) {
        counts[g] = (counts[g] || 0) + 1;
      }
    }
    return counts;
  }, [companions]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  const clearFilters = useCallback(() => {
    setSearch('');
    setGroupFilter('all');
    setGenderFilter('all');
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 pb-24 sm:p-6">
        <div className="mx-auto w-full max-w-7xl">
          <ListSkeleton count={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <h1
                className="text-xl font-bold sm:text-2xl"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                {lang === 'en' ? 'Companions' : lang === 'ar' ? 'الصحابة' : 'Sahâbîler'}
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {filtered.length} / {companions?.length ?? 0}{' '}
                {lang === 'en' ? 'companions' : 'sahâbî'}
              </p>
            </div>
          </div>
          <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>
            {(['grid', 'list'] as const).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: viewMode === m ? 'var(--bg-secondary)' : 'transparent',
                  color: viewMode === m ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: viewMode === m ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {m === 'grid' ? '▦ Grid' : '☰ List'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'en' ? 'Search companions…' : 'Sahâbî ara…'}
            className="w-full rounded-lg border py-2.5 pl-9 pr-8 text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-tertiary)' }}>✕</button>
          )}
        </div>

        {/* Group Filter Pills */}
        <div className="mb-3 flex flex-wrap gap-2 overflow-x-auto">
          {(['all', 'asere', 'badri', 'muhacir', 'ansar', 'ehl_beyt', 'women'] as const).map(g => {
            const label = g === 'all'
              ? { tr: 'Tümü', en: 'All', color: '#888', icon: '📋' }
              : COMPANION_GROUP_LABELS[g];
            const active = groupFilter === g;
            const count = groupCounts[g] ?? 0;
            return (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: active ? `${label.color}18` : 'var(--bg-tertiary)',
                  color: active ? label.color : 'var(--text-secondary)',
                  border: `1px solid ${active ? `${label.color}40` : 'transparent'}`,
                }}
              >
                <span>{label.icon}</span>
                <span>{lang === 'en' ? label.en : label.tr}</span>
                <span className="rounded-full px-1.5 text-[10px]" style={{ background: active ? `${label.color}20` : 'var(--bg-secondary)', color: active ? label.color : 'var(--text-tertiary)' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gender + Clear */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {lang === 'en' ? 'Gender:' : 'Cinsiyet:'}
          </span>
          {(['all', 'male', 'female'] as const).map(g => {
            const labels: Record<string, string> = lang === 'en'
              ? { all: 'All', male: 'Male', female: 'Female' }
              : { all: 'Tümü', male: 'Erkek', female: 'Kadın' };
            const active = genderFilter === g;
            return (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
                style={{
                  background: active ? 'var(--text-accent)' : 'var(--bg-tertiary)',
                  color: active ? '#1a1a2e' : 'var(--text-secondary)',
                }}
              >
                {labels[g]}
              </button>
            );
          })}
          {(search || groupFilter !== 'all' || genderFilter !== 'all') && (
            <button onClick={clearFilters} className="ml-auto text-xs underline" style={{ color: 'var(--text-tertiary)' }}>
              {lang === 'en' ? 'Clear all' : 'Temizle'}
            </button>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <EmptyState type="no-filter" />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(c => (
              <CompanionCard key={c.id} companion={c} localize={localize} lang={lang} />
            ))}
          </div>
        ) : (
          <div
            ref={parentRef}
            className="rounded-lg border"
            style={{ height: Math.min(filtered.length * 80, 600), overflow: 'auto', borderColor: 'var(--border-color)' }}
          >
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map(vRow => {
                const c = filtered[vRow.index];
                if (!c) return null;
                return (
                  <div
                    key={c.id}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${vRow.size}px`, transform: `translateY(${vRow.start}px)` }}
                  >
                    <CompanionListRow companion={c} localize={localize} lang={lang} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Grid Card ─── */
function CompanionCard({ companion: c, localize, lang }: { companion: RawCompanion; localize: (f: LocalizedText | undefined | null, fb?: string) => string; lang: string }) {
  const groups = companionGroup(c.category);
  const primaryGroup = groups[0] ?? 'other';
  const gl = COMPANION_GROUP_LABELS[primaryGroup];
  return (
    <Link to={`/companions/${c.id}`} className="card flex flex-col gap-2 p-4" style={{ textDecoration: 'none' }}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg" style={{ background: `${gl.color}15`, border: `1.5px solid ${gl.color}40` }}>
          {gl.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {localize(c.name)}
          </h3>
          {c.kunya && <p className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>{c.kunya}</p>}
        </div>
      </div>
      {(c.birth_ce || c.death_ce) && (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {c.birth_ce ?? '?'} – {c.death_ce ? `${c.death_ce} CE` : '?'}
          {c.death_hijri ? ` (${c.death_hijri} H)` : ''}
        </p>
      )}
      <div className="flex flex-wrap gap-1">
        {groups.map(g => (
          <span key={g} className="badge" style={{ background: `${COMPANION_GROUP_LABELS[g].color}12`, color: COMPANION_GROUP_LABELS[g].color, border: `1px solid ${COMPANION_GROUP_LABELS[g].color}25`, fontSize: '0.65rem' }}>
            {COMPANION_GROUP_LABELS[g].icon} {lang === 'en' ? COMPANION_GROUP_LABELS[g].en : COMPANION_GROUP_LABELS[g].tr}
          </span>
        ))}
      </div>
      {c.events_participated && c.events_participated.length > 0 && (
        <p className="mt-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>
          ⚔️ {c.events_participated.length} {lang === 'en' ? 'events' : 'olay'}
        </p>
      )}
    </Link>
  );
}

/* ─── List Row ─── */
function CompanionListRow({ companion: c, localize }: { companion: RawCompanion; localize: (f: LocalizedText | undefined | null, fb?: string) => string; lang: string }) {
  const groups = companionGroup(c.category);
  const primaryGroup = groups[0] ?? 'other';
  const gl = COMPANION_GROUP_LABELS[primaryGroup];
  return (
    <Link to={`/companions/${c.id}`} className="flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderColor: 'var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)', height: '100%' }}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base" style={{ background: `${gl.color}15`, border: `1.5px solid ${gl.color}40` }}>{gl.icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{localize(c.name)}</p>
        <p className="truncate text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {c.kunya && `${c.kunya} · `}{c.death_ce ? `v. ${c.death_ce} CE` : ''}{c.tribe ? ` · ${c.tribe}` : ''}
        </p>
      </div>
      <div className="hidden shrink-0 gap-1 sm:flex">
        {groups.slice(0, 2).map(g => (
          <span key={g} className="badge" style={{ background: `${COMPANION_GROUP_LABELS[g].color}12`, color: COMPANION_GROUP_LABELS[g].color, fontSize: '0.6rem' }}>{COMPANION_GROUP_LABELS[g].icon}</span>
        ))}
      </div>
      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>›</span>
    </Link>
  );
}
