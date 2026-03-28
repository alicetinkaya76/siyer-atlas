import { useState, useMemo, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import {
  resultCategory,
  RESULT_LABELS,
  BATTLE_TYPE_LABELS,
} from '@/utils/dataHelpers';
import { Spinner } from '@/components/common/Spinner';
import type { LocalizedText } from '@/types';

const ReconstructionViewer = lazy(() =>
  import('@/components/battle/ReconstructionViewer').then((m) => ({ default: m.ReconstructionViewer })),
);

/* ─── Recon index entry ─── */
interface ReconIndexEntry {
  path: string;
  tier: number;
  phases: number;
  landmarks: number;
  routes: number;
}

/* ─── Raw JSON shapes ─── */
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

interface RawLocation {
  id: string;
  name: LocalizedText;
  lat: number;
  lng: number;
  type?: string;
  description?: LocalizedText | string;
}

interface RawCompanion {
  id: string;
  name: LocalizedText;
  events_participated?: string[];
}

type Tab = 'overview' | 'forces' | 'quran' | 'participants' | 'reconstruction' | 'museum';

interface MuseumCrossRef {
  companion_to_items: Record<string, string[]>;
  battle_to_items: Record<string, string[]>;
}

interface MuseumIndexItem {
  id: string;
  name: LocalizedText;
  category: string;
}

interface MuseumMasterIndex {
  items: MuseumIndexItem[];
}

export default function BattleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { localize, lang } = useLocalizedField();
  const { data: battles, isLoading: loadingB } = useData<RawBattle[]>('battles');
  const { data: locations } = useData<RawLocation[]>('locations');
  const { data: companions } = useData<RawCompanion[]>('companions');
  const { data: reconIndex } = useData<Record<string, ReconIndexEntry>>('recon_index');
  const { data: museumCrossRef } = useData<MuseumCrossRef>('museum/museum_cross_ref');
  const { data: museumMaster } = useData<MuseumMasterIndex>('museum_master_index');

  const [tab, setTab] = useState<Tab>('overview');

  const battle = useMemo(() => battles?.find(b => b.id === id), [battles, id]);

  /* ─── Reconstruction lookup ─── */
  const reconEntry = useMemo(() => {
    if (!reconIndex || !battle) return null;
    return reconIndex[battle.id] ?? null;
  }, [reconIndex, battle]);

  const { data: reconData } = useData<Record<string, unknown>>(
    reconEntry ? reconEntry.path.replace('.json', '') : '__none__',
    !!reconEntry,
  );

  const location = useMemo(
    () => locations?.find(l => l.id === battle?.location_id),
    [locations, battle],
  );

  /* ─── Participants: companions who have this battle in events_participated ─── */
  const participants = useMemo(() => {
    if (!companions || !battle) return [];
    return companions.filter(c =>
      c.events_participated?.includes(battle.id),
    );
  }, [companions, battle]);

  const museumItems = useMemo(() => {
    if (!battle || !museumCrossRef?.battle_to_items || !museumMaster?.items) return [];
    const itemIds = museumCrossRef.battle_to_items[battle.id] ?? [];
    return itemIds
      .map(itemId => museumMaster.items.find(it => it.id === itemId))
      .filter(Boolean) as MuseumIndexItem[];
  }, [battle, museumCrossRef, museumMaster]);

  if (loadingB) {
    return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!battle) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center">
        <span className="text-4xl">❌</span>
        <p style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Battle not found' : 'Savaş bulunamadı'}</p>
        <Link to="/battles" className="text-sm underline" style={{ color: 'var(--text-accent)' }}>
          ← {lang === 'en' ? 'Back to list' : 'Listeye dön'}
        </Link>
      </div>
    );
  }

  const tl = BATTLE_TYPE_LABELS[battle.type] || { tr: battle.type, en: battle.type, icon: '📌', color: '#888' };
  const rc = resultCategory(battle.result);
  const rl = RESULT_LABELS[rc];

  const descText = typeof battle.description === 'string'
    ? battle.description
    : localize(battle.description as LocalizedText | undefined);

  const TABS: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'overview', label: lang === 'en' ? 'Overview' : 'Genel', icon: '📜' },
    { key: 'forces', label: lang === 'en' ? 'Forces' : 'Kuvvetler', icon: '🛡️' },
    { key: 'participants', label: lang === 'en' ? 'Companions' : 'Sahâbîler', icon: '👤', count: participants.length },
    { key: 'quran', label: lang === 'en' ? "Qur'an" : "Kur'ân", icon: '📖' },
    ...(reconEntry ? [{ key: 'reconstruction' as Tab, label: lang === 'en' ? 'Reconstruction' : 'Rekonstriksiyon', icon: '🗺️', count: reconEntry.phases }] : []),
    ...(museumItems.length > 0 ? [{ key: 'museum' as Tab, label: lang === 'en' ? 'Museum' : 'Müze', icon: '🏛️', count: museumItems.length }] : []),
  ];

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back */}
        <Link to="/battles" className="mb-4 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          ← {lang === 'en' ? 'All Battles' : 'Tüm Savaşlar'}
        </Link>

        {/* ─── Hero ─── */}
        <div className="card mb-6 overflow-hidden">
          <div className="p-5 sm:p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ background: `${tl.color}15`, border: `2px solid ${tl.color}40` }}
              >
                {tl.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold sm:text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  {localize(battle.name)}
                </h1>
                <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {battle.year_ce} CE · {battle.date_hijri || ''}
                  {location && ` · ${localize(location.name)}`}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="badge" style={{ background: `${tl.color}12`, color: tl.color, border: `1px solid ${tl.color}25` }}>
                    {tl.icon} {lang === 'en' ? tl.en : tl.tr}
                  </span>
                  <span className="badge" style={{ background: `${rl.color}12`, color: rl.color, border: `1px solid ${rl.color}25` }}>
                    {rl.icon} {lang === 'en' ? rl.en : rl.tr}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: 'var(--border-color)' }}>
            {[
              { label: lang === 'en' ? 'Muslim Forces' : 'Müslüman Kuvveti', value: battle.muslim_forces ?? '—', icon: '🟢' },
              { label: lang === 'en' ? 'Enemy Forces' : 'Düşman Kuvveti', value: battle.enemy_forces ?? '—', icon: '🔴' },
              { label: lang === 'en' ? 'Muslim Losses' : 'Müslüman Kaybı', value: battle.muslim_casualties ?? '—', icon: '💚' },
              { label: lang === 'en' ? 'Enemy Losses' : 'Düşman Kaybı', value: battle.enemy_casualties ?? '—', icon: '❤️' },
            ].map((s, i) => (
              <div key={i} className="p-3" style={{ background: 'var(--bg-secondary)' }}>
                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  {s.icon} {s.label}
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all"
              style={{
                background: tab === t.key ? 'var(--bg-secondary)' : 'transparent',
                color: tab === t.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className="rounded-full px-1.5 text-[10px]" style={{ background: 'var(--text-accent)', color: '#1a1a2e' }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ─── */}
        <div className="card p-5 sm:p-6">
          {tab === 'overview' && (
            <div className="flex flex-col gap-4">
              {/* Result */}
              {battle.result && (
                <div className="rounded-lg p-3" style={{ background: `${rl.color}08`, border: `1px solid ${rl.color}20` }}>
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: rl.color }}>
                    {lang === 'en' ? 'Result' : 'Sonuç'}
                  </p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.result}</p>
                </div>
              )}

              {/* Description */}
              {descText && (
                <div>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    {lang === 'en' ? 'Description' : 'Anlatı'}
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{descText}</p>
                </div>
              )}

              {/* Location */}
              {location && (
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    📍 {lang === 'en' ? 'Location' : 'Konum'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{localize(location.name)}</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'forces' && (
            <div className="flex flex-col gap-4">
              {/* Muslim side */}
              <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)' }}>
                <h3 className="mb-2 text-sm font-semibold" style={{ color: '#2d6a4f' }}>
                  🟢 {lang === 'en' ? 'Muslim Side' : 'Müslüman Taraf'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Commander' : 'Komutan'}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.commander_muslim || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Forces' : 'Kuvvet'}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.muslim_forces ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Casualties' : 'Kayıp'}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.muslim_casualties ?? '—'}</p>
                  </div>
                </div>
              </div>

              {/* Enemy side */}
              <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)' }}>
                <h3 className="mb-2 text-sm font-semibold" style={{ color: '#c0392b' }}>
                  🔴 {lang === 'en' ? 'Enemy Side' : 'Karşı Taraf'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Commander' : 'Komutan'}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.commander_enemy || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Forces' : 'Kuvvet'}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.enemy_forces ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Casualties' : 'Kayıp'}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.enemy_casualties ?? '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'participants' && (
            <div className="flex flex-col gap-2">
              {participants.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {lang === 'en' ? 'No recorded participants' : 'Katılımcı kaydı bulunamadı'}
                </p>
              ) : (
                <>
                  <p className="mb-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {participants.length} {lang === 'en' ? 'companions participated' : 'sahâbî katıldı'}
                  </p>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {participants.map(c => (
                      <Link
                        key={c.id}
                        to={`/companions/${c.id}`}
                        className="flex items-center gap-2 rounded-lg p-2.5 transition-colors hover:bg-[var(--bg-tertiary)]"
                        style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
                      >
                        <span className="text-sm">👤</span>
                        <span className="truncate text-sm font-medium" style={{ fontFamily: 'var(--font-display)' }}>
                          {localize(c.name)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'quran' && (
            <div className="flex flex-col gap-3">
              {!battle.quran_ref ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {lang === 'en' ? 'No Quran references' : 'Kur\'ân referansı bulunamadı'}
                </p>
              ) : (
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-accent)' }}>
                    📖 {lang === 'en' ? 'Quran References' : 'Kur\'ân Referansları'}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {battle.quran_ref}
                  </p>
                </div>
              )}

              {/* Museum items mention */}
              {museumItems.length > 0 && (
                <div className="rounded-lg p-4" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    🏛️ {lang === 'en' ? 'Related Museum Items' : 'İlgili Müze Öğeleri'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {museumItems.length} {lang === 'en' ? 'items — see Museum tab' : 'öğe — Müze sekmesine bakınız'}
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'reconstruction' && reconData && (
            <Suspense fallback={<div className="flex h-40 items-center justify-center"><Spinner size="md" /></div>}>
              <ReconstructionViewer data={reconData as never} />
            </Suspense>
          )}

          {tab === 'reconstruction' && !reconData && (
            <div className="flex h-40 items-center justify-center">
              <Spinner size="md" />
            </div>
          )}

          {tab === 'museum' && (
            <div className="flex flex-col gap-2">
              {museumItems.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {lang === 'en' ? 'No museum items' : 'Müze öğesi bulunamadı'}
                </p>
              ) : (
                museumItems.map((item) => {
                  const catIcons: Record<string, string> = { weapons: '⚔️', architecture: '🏗️', daily_life: '🏺', geography: '🗺️', medical: '🌿', manuscripts: '📜', flags: '🚩' };
                  const catColors: Record<string, string> = { weapons: '#8b4513', architecture: '#1a6b4a', daily_life: '#b8860b', geography: '#2e5984', medical: '#2d6a4f', manuscripts: '#6b3a2a', flags: '#1a1a2e' };
                  return (
                    <Link
                      key={item.id}
                      to={`/museum/${item.category}/${item.id}`}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ textDecoration: 'none', background: 'var(--bg-tertiary)' }}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${catColors[item.category] ?? '#666'}10` }}>
                        {catIcons[item.category] ?? '🏛️'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(item.name)}</p>
                        <p className="text-[10px] uppercase" style={{ color: catColors[item.category] ?? '#666' }}>{item.category.replace(/_/g, ' ')}</p>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>→</span>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
