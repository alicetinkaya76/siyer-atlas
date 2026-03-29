import { useState, useMemo, Suspense, lazy } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import {
  resultCategory,
  RESULT_LABELS,
  BATTLE_TYPE_LABELS,
} from '@/utils/dataHelpers';
import { getBattleSvg, BATTLE_CONTEXTUAL_SVGS, CONTEXTUAL_SVG_MAP } from '@/config/battleSvgMap';
import { BattleSvgViewer } from '@/components/battle/BattleSvgViewer';
import { Spinner } from '@/components/common/Spinner';
import { FADE_IN } from '@/config/constants';
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

type Tab = 'overview' | 'forces' | 'formation' | 'quran' | 'participants' | 'reconstruction' | 'museum';

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

/* ─── SVG ICON COMPONENTS ─── */
const Icons = {
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  overview: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  forces: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  formation: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  ),
  quran: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  ),
  participants: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  recon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  museum: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M8 10v11M12 10v11M16 10v11M20 10v11" />
    </svg>
  ),
  location: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  sword: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
      <path d="M15.765 2.776a1 1 0 0 1 1.414 0l4.045 4.045a1 1 0 0 1 0 1.414l-7.955 7.955-5.459-5.459z" />
    </svg>
  ),
  chevron: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  circle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
  ),
  heart: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  ),
};

/* ─── STAT CARD ─── */
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-3.5" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <p className="text-base font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

/* ─── FORCES RATIO BAR ─── */
function ForcesRatioBar({ muslim, enemy, lang }: { muslim: number; enemy: number; lang: string }) {
  const total = muslim + enemy;
  if (total === 0) return null;
  const muslimPct = Math.round((muslim / total) * 100);
  const enemyPct = 100 - muslimPct;

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
        {lang === 'en' ? 'Force Ratio' : 'Kuvvet Oranı'}
      </p>
      <div className="flex h-6 overflow-hidden rounded-full" style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          className="flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: '#2d6a4f', borderRadius: '9999px 0 0 9999px' }}
          initial={{ width: 0 }}
          animate={{ width: `${muslimPct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {muslimPct > 15 && `${muslim}`}
        </motion.div>
        <motion.div
          className="flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: '#c0392b', borderRadius: '0 9999px 9999px 0' }}
          initial={{ width: 0 }}
          animate={{ width: `${enemyPct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {enemyPct > 15 && `${enemy}`}
        </motion.div>
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
        <span>{muslimPct}% {lang === 'en' ? 'Muslim' : 'Müslüman'}</span>
        <span>{enemyPct}% {lang === 'en' ? 'Enemy' : 'Düşman'}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
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

  /* ─── SVG lookup ─── */
  const svgEntry = useMemo(() => (battle ? getBattleSvg(battle.id) : null), [battle]);

  /* ─── Reconstruction lookup (with ID mismatch fix) ─── */
  const reconEntry = useMemo(() => {
    if (!reconIndex || !battle) return null;
    // Direct match
    if (reconIndex[battle.id]) return reconIndex[battle.id];
    // Fix: gazve_fetih_mekke → gazve_mekke_fethi
    if (battle.id === 'gazve_fetih_mekke' && reconIndex['gazve_mekke_fethi']) {
      return reconIndex['gazve_mekke_fethi'];
    }
    return null;
  }, [reconIndex, battle]);

  const { data: reconData } = useData<Record<string, unknown>>(
    reconEntry ? reconEntry.path.replace('.json', '') : '__none__',
    !!reconEntry,
  );

  const location = useMemo(
    () => locations?.find(l => l.id === battle?.location_id),
    [locations, battle],
  );

  /* ─── Participants ─── */
  const participants = useMemo(() => {
    if (!companions || !battle) return [];
    return companions.filter(c => c.events_participated?.includes(battle.id));
  }, [companions, battle]);

  const museumItems = useMemo(() => {
    if (!battle || !museumCrossRef?.battle_to_items || !museumMaster?.items) return [];
    const itemIds = museumCrossRef.battle_to_items[battle.id] ?? [];
    return itemIds
      .map(itemId => museumMaster.items.find(it => it.id === itemId))
      .filter(Boolean) as MuseumIndexItem[];
  }, [battle, museumCrossRef, museumMaster]);

  /* ─── Loading / Not Found ─── */
  if (loadingB) {
    return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!battle) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'rgba(192,57,43,0.1)' }}>
          {Icons.sword}
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {lang === 'en' ? 'Battle not found' : 'Savaş bulunamadı'}
        </p>
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

  /* ─── Build tab list ─── */
  const TABS: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'overview', label: lang === 'en' ? 'Overview' : 'Genel', icon: Icons.overview },
    { key: 'forces', label: lang === 'en' ? 'Forces' : 'Kuvvetler', icon: Icons.forces },
    ...(svgEntry ? [{ key: 'formation' as Tab, label: lang === 'en' ? 'Formation' : 'Formasyon', icon: Icons.formation }] : []),
    { key: 'participants', label: lang === 'en' ? 'Companions' : 'Sahâbîler', icon: Icons.participants, count: participants.length },
    { key: 'quran', label: lang === 'en' ? "Qur'an" : "Kur'ân", icon: Icons.quran },
    ...(reconEntry ? [{ key: 'reconstruction' as Tab, label: lang === 'en' ? 'Map' : 'Harita', icon: Icons.recon, count: reconEntry.phases }] : []),
    ...(museumItems.length > 0 ? [{ key: 'museum' as Tab, label: lang === 'en' ? 'Museum' : 'Müze', icon: Icons.museum, count: museumItems.length }] : []),
  ];

  return (
    <motion.div className="flex flex-col gap-4 p-4 pb-24 sm:p-6" {...FADE_IN}>
      <div className="mx-auto w-full max-w-4xl">
        {/* ─── Breadcrumb ─── */}
        <Link
          to="/battles"
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--bg-tertiary)]"
          style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
        >
          {Icons.back}
          {lang === 'en' ? 'All Battles' : 'Tüm Savaşlar'}
        </Link>

        {/* ═══════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════ */}
        <div className="card mb-6 overflow-hidden">
          {/* SVG Hero Banner */}
          {svgEntry && (
            <BattleSvgViewer
              src={svgEntry.primary}
              caption={svgEntry.caption}
              secondarySrc={svgEntry.secondary}
              secondaryCaption={svgEntry.captionSecondary}
              mode="hero"
              maxHeight={340}
            />
          )}

          {/* Title Section */}
          <div className="p-5 sm:p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: `${tl.color}12`, border: `1.5px solid ${tl.color}30`, color: tl.color }}
              >
                {Icons.sword}
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
                    {lang === 'en' ? tl.en : tl.tr}
                  </span>
                  <span className="badge" style={{ background: `${rl.color}12`, color: rl.color, border: `1px solid ${rl.color}25` }}>
                    {lang === 'en' ? rl.en : rl.tr}
                  </span>
                  {svgEntry && (
                    <span className="badge" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--text-accent)', border: '1px solid rgba(212,175,55,0.2)' }}>
                      SVG
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Stat Strip ─── */}
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-5">
            <StatCard label={lang === 'en' ? 'Muslim Forces' : 'Müslüman Kuvveti'} value={battle.muslim_forces ?? '—'} icon={Icons.circle} color="#2d6a4f" />
            <StatCard label={lang === 'en' ? 'Enemy Forces' : 'Düşman Kuvveti'} value={battle.enemy_forces ?? '—'} icon={Icons.circle} color="#c0392b" />
            <StatCard label={lang === 'en' ? 'Muslim Losses' : 'Müslüman Kaybı'} value={battle.muslim_casualties ?? '—'} icon={Icons.heart} color="#2d6a4f" />
            <StatCard label={lang === 'en' ? 'Enemy Losses' : 'Düşman Kaybı'} value={battle.enemy_casualties ?? '—'} icon={Icons.heart} color="#c0392b" />
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            TABS
            ═══════════════════════════════════════════ */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl p-1" style={{ background: 'var(--bg-tertiary)' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-all"
              style={{
                background: tab === t.key ? 'var(--bg-secondary)' : 'transparent',
                color: tab === t.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span style={{ opacity: tab === t.key ? 1 : 0.5 }}>{t.icon}</span>
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className="rounded-full px-1.5 text-[10px] font-semibold" style={{
                  background: tab === t.key ? 'rgba(212,175,55,0.15)' : 'var(--bg-secondary)',
                  color: tab === t.key ? 'var(--text-accent)' : 'var(--text-tertiary)',
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            TAB CONTENT
            ═══════════════════════════════════════════ */}
        <div className="card p-5 sm:p-6">

          {/* ─── OVERVIEW ─── */}
          {tab === 'overview' && (
            <div className="flex flex-col gap-5">
              {battle.result && (
                <div className="rounded-xl p-4" style={{ background: `${rl.color}06`, border: `1px solid ${rl.color}18` }}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: rl.color }}>
                    {lang === 'en' ? 'Result' : 'Sonuç'}
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.result}</p>
                </div>
              )}

              {descText && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    {lang === 'en' ? 'Description' : 'Anlatı'}
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{descText}</p>
                </div>
              )}

              {location && (
                <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(46,89,132,0.1)', color: '#2e5984' }}>
                    {Icons.location}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{localize(location.name)}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                {svgEntry && (
                  <button onClick={() => setTab('formation')} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                    style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--text-accent)', border: '1px solid rgba(212,175,55,0.15)' }}>
                    {Icons.formation}
                    {lang === 'en' ? 'View Formation SVG' : 'Savaş Düzenini Gör'}
                    {Icons.chevron}
                  </button>
                )}
                {reconEntry && (
                  <button onClick={() => setTab('reconstruction')} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                    style={{ background: 'rgba(46,89,132,0.08)', color: '#2e5984', border: '1px solid rgba(46,89,132,0.15)' }}>
                    {Icons.recon}
                    {lang === 'en' ? `Reconstruction (${reconEntry.phases} phases)` : `Rekonstrüksiyon (${reconEntry.phases} faz)`}
                    {Icons.chevron}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ─── FORCES ─── */}
          {tab === 'forces' && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl p-5" style={{ background: 'rgba(45,106,79,0.04)', border: '1px solid rgba(45,106,79,0.12)' }}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#2d6a4f' }} />
                  <h3 className="text-sm font-bold" style={{ color: '#2d6a4f' }}>{lang === 'en' ? 'Muslim Side' : 'Müslüman Taraf'}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Commander' : 'Komutan'}</p>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.commander_muslim || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Forces' : 'Kuvvet'}</p>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.muslim_forces ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Casualties' : 'Kayıp'}</p>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.muslim_casualties ?? '—'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-5" style={{ background: 'rgba(192,57,43,0.04)', border: '1px solid rgba(192,57,43,0.12)' }}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: '#c0392b' }} />
                  <h3 className="text-sm font-bold" style={{ color: '#c0392b' }}>{lang === 'en' ? 'Enemy Side' : 'Karşı Taraf'}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Commander' : 'Komutan'}</p>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.commander_enemy || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Forces' : 'Kuvvet'}</p>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.enemy_forces ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'Casualties' : 'Kayıp'}</p>
                    <p className="mt-0.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{battle.enemy_casualties ?? '—'}</p>
                  </div>
                </div>
              </div>

              {battle.muslim_forces && battle.enemy_forces && (
                <ForcesRatioBar muslim={Number(battle.muslim_forces) || 0} enemy={Number(battle.enemy_forces) || 0} lang={lang} />
              )}
            </div>
          )}

          {/* ─── FORMATION SVG ─── */}
          {tab === 'formation' && svgEntry && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
                {Icons.formation}
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {lang === 'en'
                    ? 'Scroll to zoom · Drag to pan when zoomed · Click fullscreen for detailed view'
                    : 'Zoom için kaydır · Yakınlaştırıldığında sürükle · Detaylı görünüm için tam ekran'}
                </p>
              </div>
              <BattleSvgViewer
                src={svgEntry.primary}
                caption={svgEntry.caption}
                secondarySrc={svgEntry.secondary}
                secondaryCaption={svgEntry.captionSecondary}
                mode="tab"
                maxHeight={560}
              />
            </div>
          )}

          {/* ─── PARTICIPANTS ─── */}
          {tab === 'participants' && (
            <div className="flex flex-col gap-2">
              {participants.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>{Icons.participants}</div>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'No recorded participants' : 'Katılımcı kaydı bulunamadı'}</p>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                    {participants.length} {lang === 'en' ? 'companions participated' : 'sahâbî katıldı'}
                  </p>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {participants.map(c => (
                      <Link key={c.id} to={`/companions/${c.id}`}
                        className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--bg-tertiary)]"
                        style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(212,175,55,0.08)' }}>{Icons.participants}</div>
                        <span className="truncate text-sm font-medium" style={{ fontFamily: 'var(--font-display)' }}>{localize(c.name)}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ─── QURAN ─── */}
          {tab === 'quran' && (
            <div className="flex flex-col gap-4">
              {!battle.quran_ref ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>{Icons.quran}</div>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'No Quran references' : 'Kur\'ân referansı bulunamadı'}</p>
                </div>
              ) : (
                <div className="rounded-xl p-5" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <div className="mb-2 flex items-center gap-2">
                    {Icons.quran}
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-accent)' }}>
                      {lang === 'en' ? 'Quran References' : 'Kur\'ân Referansları'}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{battle.quran_ref}</p>
                </div>
              )}
            </div>
          )}

          {/* ─── RECONSTRUCTION ─── */}
          {tab === 'reconstruction' && reconData && (
            <Suspense fallback={<div className="flex h-40 items-center justify-center"><Spinner size="md" /></div>}>
              <ReconstructionViewer data={reconData as never} />
            </Suspense>
          )}
          {tab === 'reconstruction' && !reconData && (
            <div className="flex h-40 items-center justify-center"><Spinner size="md" /></div>
          )}

          {/* ─── MUSEUM ─── */}
          {tab === 'museum' && (
            <div className="flex flex-col gap-2">
              {museumItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>{Icons.museum}</div>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{lang === 'en' ? 'No museum items' : 'Müze öğesi bulunamadı'}</p>
                </div>
              ) : (
                museumItems.map((item) => {
                  const catColors: Record<string, string> = {
                    weapons: '#8b4513', architecture: '#1a6b4a', daily_life: '#b8860b',
                    geography: '#2e5984', medical: '#2d6a4f', manuscripts: '#6b3a2a', flags: '#1a1a2e',
                  };
                  const color = catColors[item.category] ?? '#666';
                  return (
                    <Link key={item.id} to={`/museum/${item.category}/${item.id}`}
                      className="flex items-center gap-3 rounded-xl p-3.5 transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ textDecoration: 'none', background: 'var(--bg-tertiary)' }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}10`, color }}>{Icons.museum}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(item.name)}</p>
                        <p className="text-[10px] font-medium uppercase" style={{ color }}>{item.category.replace(/_/g, ' ')}</p>
                      </div>
                      {Icons.chevron}
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ─── RELATED VISUALS (Contextual SVGs) ─── */}
        {battle && BATTLE_CONTEXTUAL_SVGS[battle.id] && (
          <div className="mt-6 flex flex-col gap-3">
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
              {lang === 'en' ? 'Related Visuals' : 'İlgili Görseller'}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BATTLE_CONTEXTUAL_SVGS[battle.id]!.map((svgKey) => {
                const ctx = CONTEXTUAL_SVG_MAP[svgKey];
                if (!ctx) return null;
                return (
                  <div key={svgKey} className="rounded-xl overflow-hidden transition-shadow hover:shadow-md" style={{ border: '1px solid var(--border-color)' }}>
                    <div className="relative" style={{ background: '#FAF8F3', height: 100 }}>
                      <img src={ctx.path} alt={localize(ctx.caption)} className="h-full w-full object-contain p-2" loading="lazy" />
                    </div>
                    <p className="px-2 py-1.5 text-[10px] font-medium truncate" style={{ color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)' }}>
                      {localize(ctx.caption)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
