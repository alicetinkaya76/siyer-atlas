import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '@/hooks/useData';
import { StatsSkeleton } from '@/components/common/Skeleton';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface Battle { id: string; type: string; year_ce: number; result?: string; name: LocalizedText; }
interface Companion { id: string; group?: string; birth_ce?: number; death_ce?: number; }
interface MuseumMasterIndex { version: string; total_items: number; categories: Record<string, number>; items: unknown[]; }
interface TimelineEntry { id: string; year_ce: number; type?: string; }
interface AudioLayer { stats: { total_episodes: number; total_duration_hours: number; total_key_moments: number; linked_battles: number; linked_companions: number; } }

/* ─── Colors ─── */
const CHART_COLORS = ['#d4af37', '#2e5984', '#c0392b', '#15803d', '#7c3aed', '#8b4513', '#0891b2', '#d97706'];
const TYPE_COLORS: Record<string, string> = {
  gazve: '#c0392b', seriyye: '#2e5984', muhasara: '#8b4513', antlaşma: '#15803d',
  fetih: '#d4af37', sulh: '#7c3aed', other: '#666',
};
const GROUP_COLORS: Record<string, string> = {
  'aşere-i mübeşşere': '#d4af37',
  muhacir: '#2e5984',
  ensar: '#15803d',
  'kadın sahâbîler': '#7c3aed',
  'ehlibeyt': '#c0392b',
  'diğer': '#8b4513',
};

const MUSEUM_LABEL_KEYS: Record<string, string> = {
  weapons: 'stats_museum_weapons', architecture: 'stats_museum_architecture', daily_life: 'stats_museum_daily_life',
  geography: 'stats_museum_geography', medical: 'stats_museum_medical', manuscripts: 'stats_museum_manuscripts', flags: 'stats_museum_flags',
};

/* ─── Component ─── */
export default function StatsPage() {
  const { t } = useTranslation('pages');
  const { data: battles, isLoading: l1 } = useData<Battle[]>('battles');
  const { data: companions, isLoading: l2 } = useData<Companion[]>('companions');
  const { data: audioLayer, isLoading: l3 } = useData<AudioLayer>('audio_layer');
  const { data: museumIndex, isLoading: l4 } = useData<MuseumMasterIndex>('museum_master_index');
  const { data: timeline, isLoading: l5 } = useData<TimelineEntry[]>('timeline');
  const { data: hadith } = useData<{ entries: unknown[] }>('hadith');
  const { data: esbab } = useData<{ entries: unknown[] }>('esbab_nuzul');

  const isLoading = l1 || l2 || l3 || l4 || l5;

  // Summary stats
  const summaryStats = useMemo(() => {
    return [
      { icon: '⚔️', value: battles?.length ?? 0, label: t('stats_battles_seriyye'), color: '#c0392b' },
      { icon: '👤', value: companions?.length ?? 0, label: t('stats_companions'), color: '#7c3aed' },
      { icon: '📻', value: audioLayer?.stats?.total_episodes ?? 0, label: t('stats_radio_episodes'), color: '#2e5984' },
      { icon: '🏛️', value: museumIndex?.total_items ?? 0, label: t('stats_museum_items'), color: '#8b4513' },
      { icon: '📜', value: esbab?.entries?.length ?? 0, label: t('stats_esbab'), color: '#d4af37' },
      { icon: '📚', value: hadith?.entries?.length ?? 0, label: t('stats_hadith'), color: '#15803d' },
      { icon: '⏳', value: timeline?.length ?? 0, label: t('stats_timeline'), color: '#0891b2' },
      { icon: '⏱️', value: `${audioLayer?.stats?.total_duration_hours ?? 0}h`, label: t('stats_total_audio'), color: '#d97706' },
    ];
  }, [battles, companions, audioLayer, museumIndex, timeline, hadith, esbab]);

  // Battles by type
  const battlesByType = useMemo(() => {
    if (!battles) return [];
    const counts: Record<string, number> = {};
    for (const b of battles) {
      const t = b.type || 'other';
      counts[t] = (counts[t] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, fill: TYPE_COLORS[name] || '#666' }))
      .sort((a, b) => b.value - a.value);
  }, [battles]);

  // Battles by year (grouped by decade)
  const battlesByDecade = useMemo(() => {
    if (!battles) return [];
    const decades: Record<number, number> = {};
    for (const b of battles) {
      const decade = Math.floor(b.year_ce / 5) * 5; // 5-year buckets
      decades[decade] = (decades[decade] || 0) + 1;
    }
    return Object.entries(decades)
      .map(([year, count]) => ({ year: `${year}`, count }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [battles]);

  // Companions by group
  const companionsByGroup = useMemo(() => {
    if (!companions) return [];
    const counts: Record<string, number> = {};
    for (const c of companions) {
      const g = c.group || 'diğer';
      counts[g] = (counts[g] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, fill: GROUP_COLORS[name] || '#666' }))
      .sort((a, b) => b.value - a.value);
  }, [companions]);

  // Museum by category
  const museumByCategory = useMemo(() => {
    if (!museumIndex?.categories) return [];
    return Object.entries(museumIndex.categories).map(([cat, count]) => ({
      name: t(MUSEUM_LABEL_KEYS[cat] || cat),
      value: count as number,
    }));
  }, [museumIndex]);

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {t('stats_title')}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {t('stats_subtitle')}
            </p>
          </div>
        </div>

        {isLoading && <StatsSkeleton />}

        {!isLoading && (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {summaryStats.map((s) => (
                <div
                  key={s.label}
                  className="card flex flex-col items-center gap-1 p-4 text-center"
                  style={{ borderTop: `3px solid ${s.color}` }}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</span>
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Battles by Type */}
              <ChartCard title={t('stats_battle_types')} icon="⚔️" subtitle={t('stats_total', { count: battles?.length ?? 0 })}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={battlesByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={11}>
                      {battlesByType.map((d) => <Cell key={d.name} fill={d.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Battles by Year */}
              <ChartCard title={t('stats_battles_by_year')} icon="📅" subtitle={t('stats_year_buckets')}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={battlesByDecade}>
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#c0392b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Companions by Group */}
              <ChartCard title={t('stats_companion_groups')} icon="👤" subtitle={t('stats_total', { count: companions?.length ?? 0 })}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={companionsByGroup} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {companionsByGroup.map((d) => <Cell key={d.name} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Museum by Category */}
              <ChartCard title={t('stats_museum_categories')} icon="🏛️" subtitle={t('stats_total', { count: museumByCategory.reduce((s, c) => s + c.value, 0) })}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={museumByCategory} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {museumByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Data Completeness */}
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                📋 {t('stats_data_status')}
              </h2>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)' }}>
                      <th className="px-4 py-2 text-start text-xs font-bold" style={{ color: 'var(--text-tertiary)' }}>{t('stats_data_file')}</th>
                      <th className="px-4 py-2 text-end text-xs font-bold" style={{ color: 'var(--text-tertiary)' }}>{t('stats_records')}</th>
                      <th className="px-4 py-2 text-center text-xs font-bold" style={{ color: 'var(--text-tertiary)' }}>{t('stats_status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'companions.json', count: companions?.length ?? 0, target: 436 },
                      { name: 'battles.json', count: battles?.length ?? 0, target: 97 },
                      { name: 'timeline.json', count: timeline?.length ?? 0, target: 90 },
                      { name: 'esbab_nuzul.json', count: esbab?.entries?.length ?? 0, target: 355 },
                      { name: 'hadith.json', count: hadith?.entries?.length ?? 0, target: 387 },
                      { name: 'audio_episodes.json', count: audioLayer?.stats?.total_episodes ?? 0, target: 160 },
                    ].map((row) => {
                      const pct = row.target > 0 ? Math.round((row.count / row.target) * 100) : 0;
                      return (
                        <tr key={row.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td className="px-4 py-2.5 text-xs font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{row.name}</td>
                          <td className="px-4 py-2.5 text-end text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>{row.count.toLocaleString()}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? '#15803d' : pct >= 80 ? '#d4af37' : '#c0392b' }} />
                              </div>
                              <span className="text-[10px] font-bold tabular-nums" style={{ color: pct >= 100 ? '#15803d' : pct >= 80 ? '#d4af37' : '#c0392b' }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Chart Card ─── */
function ChartCard({ title, icon, subtitle, children }: { title: string; icon: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div>
          <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{title}</h3>
          {subtitle && <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
