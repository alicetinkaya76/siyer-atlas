import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { ListSkeleton } from '@/components/common/Skeleton';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface ProphetEvent {
  id: string;
  event: LocalizedText;
  date_ce: number;
  date_hijri: string;
  age: number;
  location_id: string;
  description: LocalizedText;
  quran_refs: string[];
  hadith_refs: string[];
  significance: LocalizedText;
  source_refs: string[];
}

interface FamilyMember {
  id: string;
  name: LocalizedText;
  relation: string;
  relation_detail: LocalizedText;
  birth_ce: number;
  death_ce: number;
  companion_id: string;
  key_facts: LocalizedText;
  children?: string[];
  quran_refs: string[];
  hadith_refs: string[];
}

interface CharacterTrait {
  id: string;
  trait: LocalizedText;
  description: LocalizedText;
  quran_refs: string[];
  hadith_refs: string[];
  examples: Array<{ tr: string; en: string }>;
}

interface ProphetBattle {
  id: string;
  battle_id: string;
  name: LocalizedText;
  date_ce: number;
  date_hijri: string;
  prophet_role: LocalizedText;
  quran_refs: string[];
  hadith_refs: string[];
  key_lessons: Array<{ tr: string; en: string }>;
}

interface InnerCircleMember {
  id: string;
  companion_id: string;
  name: LocalizedText;
  closeness_rank: number;
  role: LocalizedText;
  special_title: string;
  key_moments: Array<{ tr: string; en: string }>;
  quran_ref: string;
}

interface MedicineEntry {
  id: string;
  topic: LocalizedText;
  category: string;
  description: LocalizedText;
  quran_ref: { surah: number; ayah: number; text_tr: string };
  hadith_refs: string[];
  usage: LocalizedText;
}

interface TradeEntry {
  id: string;
  topic: LocalizedText;
  period: LocalizedText;
  description: LocalizedText;
  hadith_refs: string[];
  location_ids: string[];
  economic_principles: Array<{ tr: string; en: string }>;
}

interface DataWrapper<T> {
  entries: T[];
}

/* ─── Tab Config ─── */
const TABS = [
  { key: 'events', i18nKey: 'prophet_tab_events', icon: '📜', dataKey: 'prophet_events', color: '#d4af37' },
  { key: 'family', i18nKey: 'prophet_tab_family', icon: '👨‍👩‍👧', dataKey: 'prophet_family', color: '#1a6b4a' },
  { key: 'character', i18nKey: 'prophet_tab_character', icon: '✨', dataKey: 'prophet_character', color: '#7c3aed' },
  { key: 'battles', i18nKey: 'prophet_tab_battles', icon: '⚔️', dataKey: 'prophet_battles', color: '#c0392b' },
  { key: 'inner_circle', i18nKey: 'prophet_tab_inner_circle', icon: '🤝', dataKey: 'prophet_inner_circle', color: '#2e5984' },
  { key: 'medicine', i18nKey: 'prophet_tab_medicine', icon: '🌿', dataKey: 'prophet_medicine', color: '#15803d' },
  { key: 'trade', i18nKey: 'prophet_tab_trade', icon: '🐪', dataKey: 'prophet_trade', color: '#8b4513' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/* ─── Relations ─── */
const RELATION_ICONS: Record<string, string> = {
  eş: '💍', çocuk: '👶', torun: '👶', amca: '👨', baba: '👨', anne: '👩',
  süt_anne: '🍼', süt_kardeş: '👦', hala: '👩', dede: '👴',
};

const MED_CATEGORY_COLORS: Record<string, string> = {
  'gıda/tedâvî': '#15803d',
  'hijyen': '#2e5984',
  'tedâvî': '#7c3aed',
  'ruhî sağlık': '#d4af37',
  'genel sağlık': '#8b4513',
};

/* ─── Component ─── */
export default function ProphetPage() {
  const { t } = useTranslation('pages');
  const { localize, lang } = useLocalizedField();
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const activeTab: TabKey = (TABS.find((t) => t.key === section)?.key ?? 'events') as TabKey;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load all prophet data
  const { data: eventsData, isLoading: l1 } = useData<DataWrapper<ProphetEvent>>('prophet_events');
  const { data: familyData, isLoading: l2 } = useData<DataWrapper<FamilyMember>>('prophet_family');
  const { data: characterData, isLoading: l3 } = useData<DataWrapper<CharacterTrait>>('prophet_character');
  const { data: battlesData, isLoading: l4 } = useData<DataWrapper<ProphetBattle>>('prophet_battles');
  const { data: circleData, isLoading: l5 } = useData<DataWrapper<InnerCircleMember>>('prophet_inner_circle');
  const { data: medicineData, isLoading: l6 } = useData<DataWrapper<MedicineEntry>>('prophet_medicine');
  const { data: tradeData, isLoading: l7 } = useData<DataWrapper<TradeEntry>>('prophet_trade');

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6 || l7;

  const tabMeta = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-xl"
            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            ☪️
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {lang === 'en' ? 'Prophet Muhammad ﷺ' : 'Hz. Muhammed ﷺ'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              570–632 CE · {t('prophet_subtitle')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { navigate(`/prophet/${tab.key}`); setExpandedId(null); }}
              className="flex shrink-0 items-center gap-1 rounded-md px-2.5 py-2 text-xs font-medium transition-all"
              style={{
                background: activeTab === tab.key ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === tab.key ? tab.color : 'var(--text-tertiary)',
                boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{t(tab.i18nKey)}</span>
            </button>
          ))}
        </div>

        {isLoading && <ListSkeleton count={5} />}

        {/* ─── EVENTS TAB ─── */}
        {!isLoading && activeTab === 'events' && eventsData?.entries && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('prophet_milestones', { count: eventsData.entries.length })}</p>
            {eventsData.entries.map((ev) => {
              const isExp = expandedId === ev.id;
              return (
                <div key={ev.id} className="card overflow-hidden" style={{ borderInlineStart: `3px solid ${tabMeta.color}` }}>
                  <button onClick={() => setExpandedId(isExp ? null : ev.id)} className="flex w-full items-start gap-3 p-4 text-start" style={{ background: 'transparent' }}>
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg" style={{ background: `${tabMeta.color}10`, color: tabMeta.color }}>
                      <span className="text-sm font-bold">{ev.date_ce}</span>
                      <span className="text-[9px]">CE</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(ev.event)}</h3>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{ev.date_hijri ? `H ${ev.date_hijri} · ` : ''}{t('prophet_age', { age: ev.age })}</p>
                    </div>
                    <span className="shrink-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>{isExp ? '▲' : '▼'}</span>
                  </button>
                  {isExp && (
                    <div className="flex flex-col gap-3 px-4 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="pt-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{localize(ev.description)}</p>
                      {ev.significance && <div className="rounded-lg p-3" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-accent)' }}>✨ {localize(ev.significance)}</p>
                      </div>}
                      {ev.quran_refs?.length > 0 && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>📖 {ev.quran_refs.join(' · ')}</p>}
                      {ev.hadith_refs?.length > 0 && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>📚 {ev.hadith_refs.join(' · ')}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── FAMILY TAB ─── */}
        {!isLoading && activeTab === 'family' && familyData?.entries && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('prophet_family_members', { count: familyData.entries.length })}</p>
            {familyData.entries.map((fm) => {
              const isExp = expandedId === fm.id;
              const relIcon = RELATION_ICONS[fm.relation] ?? '👤';
              return (
                <div key={fm.id} className="card overflow-hidden" style={{ borderInlineStart: `3px solid ${tabMeta.color}` }}>
                  <button onClick={() => setExpandedId(isExp ? null : fm.id)} className="flex w-full items-start gap-3 p-4 text-start" style={{ background: 'transparent' }}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${tabMeta.color}10` }}>{relIcon}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(fm.name)}</h3>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{localize(fm.relation_detail)} · {fm.birth_ce}–{fm.death_ce} CE</p>
                    </div>
                    <span className="shrink-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>{isExp ? '▲' : '▼'}</span>
                  </button>
                  {isExp && (
                    <div className="flex flex-col gap-3 px-4 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="pt-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{localize(fm.key_facts)}</p>
                      {fm.companion_id && <Link to={`/companions/${fm.companion_id}`} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', textDecoration: 'none', width: 'fit-content' }}>👤 {t('prophet_go_companion')}</Link>}
                      {fm.quran_refs?.length > 0 && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>📖 {fm.quran_refs.join(' · ')}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── CHARACTER TAB ─── */}
        {!isLoading && activeTab === 'character' && characterData?.entries && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('prophet_traits', { count: characterData.entries.length })}</p>
            {characterData.entries.map((ch) => {
              const isExp = expandedId === ch.id;
              return (
                <div key={ch.id} className="card overflow-hidden" style={{ borderInlineStart: `3px solid ${tabMeta.color}` }}>
                  <button onClick={() => setExpandedId(isExp ? null : ch.id)} className="flex w-full items-start gap-3 p-4 text-start" style={{ background: 'transparent' }}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${tabMeta.color}10` }}>✨</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(ch.trait)}</h3>
                      <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{localize(ch.description)}</p>
                    </div>
                    <span className="shrink-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>{isExp ? '▲' : '▼'}</span>
                  </button>
                  {isExp && (
                    <div className="flex flex-col gap-3 px-4 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="pt-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{localize(ch.description)}</p>
                      {ch.examples?.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <h5 className="text-xs font-bold" style={{ color: 'var(--text-accent)' }}>📎 {t('prophet_examples')}</h5>
                          {ch.examples.map((ex, i) => (
                            <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>• {lang === 'en' ? ex.en : ex.tr}</p>
                          ))}
                        </div>
                      )}
                      {ch.quran_refs?.length > 0 && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>📖 {ch.quran_refs.join(' · ')}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── BATTLES TAB ─── */}
        {!isLoading && activeTab === 'battles' && battlesData?.entries && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('prophet_battles_count', { count: battlesData.entries.length })}</p>
            {battlesData.entries.map((b) => {
              const isExp = expandedId === b.id;
              return (
                <div key={b.id} className="card overflow-hidden" style={{ borderInlineStart: `3px solid ${tabMeta.color}` }}>
                  <button onClick={() => setExpandedId(isExp ? null : b.id)} className="flex w-full items-start gap-3 p-4 text-start" style={{ background: 'transparent' }}>
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg" style={{ background: `${tabMeta.color}10`, color: tabMeta.color }}>
                      <span className="text-sm font-bold">{b.date_ce}</span>
                      <span className="text-[9px]">CE</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(b.name)}</h3>
                      <p className="mt-0.5 line-clamp-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{localize(b.prophet_role)}</p>
                    </div>
                    <span className="shrink-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>{isExp ? '▲' : '▼'}</span>
                  </button>
                  {isExp && (
                    <div className="flex flex-col gap-3 px-4 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="pt-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{localize(b.prophet_role)}</p>
                      {b.key_lessons?.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <h5 className="text-xs font-bold" style={{ color: 'var(--text-accent)' }}>💡 {t('prophet_lessons')}</h5>
                          {b.key_lessons.map((l, i) => (
                            <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>• {lang === 'en' ? l.en : l.tr}</p>
                          ))}
                        </div>
                      )}
                      <Link to={`/battles/${b.battle_id}`} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'rgba(192,57,43,0.08)', color: '#c0392b', textDecoration: 'none', width: 'fit-content' }}>⚔️ {t('prophet_go_battle')}</Link>
                      {b.quran_refs?.length > 0 && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>📖 {b.quran_refs.join(' · ')}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── INNER CIRCLE TAB ─── */}
        {!isLoading && activeTab === 'inner_circle' && circleData?.entries && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('prophet_close_companions', { count: circleData.entries.length })}</p>
            {[...circleData.entries].sort((a, b) => a.closeness_rank - b.closeness_rank).map((ic) => {
              const isExp = expandedId === ic.id;
              return (
                <div key={ic.id} className="card overflow-hidden" style={{ borderInlineStart: `3px solid ${tabMeta.color}` }}>
                  <button onClick={() => setExpandedId(isExp ? null : ic.id)} className="flex w-full items-start gap-3 p-4 text-start" style={{ background: 'transparent' }}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold" style={{ background: `${tabMeta.color}10`, color: tabMeta.color }}>#{ic.closeness_rank}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(ic.name)}</h3>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{ic.special_title} · {localize(ic.role)}</p>
                    </div>
                    <span className="shrink-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>{isExp ? '▲' : '▼'}</span>
                  </button>
                  {isExp && (
                    <div className="flex flex-col gap-3 px-4 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                      {ic.key_moments?.length > 0 && (
                        <div className="flex flex-col gap-1 pt-3">
                          <h5 className="text-xs font-bold" style={{ color: 'var(--text-accent)' }}>🎯 {t('prophet_key_moments')}</h5>
                          {ic.key_moments.map((km, i) => (
                            <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>• {lang === 'en' ? km.en : km.tr}</p>
                          ))}
                        </div>
                      )}
                      <Link to={`/companions/${ic.companion_id}`} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', textDecoration: 'none', width: 'fit-content' }}>👤 {t('prophet_go_companion')}</Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── MEDICINE TAB ─── */}
        {!isLoading && activeTab === 'medicine' && medicineData?.entries && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{medicineData.entries.length} {lang === 'en' ? 'remedies & practices' : 'tavsiye'}</p>
            {medicineData.entries.map((med) => {
              const isExp = expandedId === med.id;
              const catColor = MED_CATEGORY_COLORS[med.category] ?? '#15803d';
              return (
                <div key={med.id} className="card overflow-hidden" style={{ borderInlineStart: `3px solid ${catColor}` }}>
                  <button onClick={() => setExpandedId(isExp ? null : med.id)} className="flex w-full items-start gap-3 p-4 text-start" style={{ background: 'transparent' }}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${catColor}10` }}>🌿</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(med.topic)}</h3>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>{med.category}</p>
                    </div>
                    <span className="shrink-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>{isExp ? '▲' : '▼'}</span>
                  </button>
                  {isExp && (
                    <div className="flex flex-col gap-3 px-4 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="pt-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{localize(med.description)}</p>
                      {med.usage && <div className="rounded-lg p-3" style={{ background: 'rgba(21,128,61,0.04)', border: '1px solid rgba(21,128,61,0.12)' }}>
                        <p className="text-xs" style={{ color: '#15803d' }}>💊 {localize(med.usage)}</p>
                      </div>}
                      {med.quran_ref?.text_tr && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>📖 {med.quran_ref.surah}:{med.quran_ref.ayah} — {med.quran_ref.text_tr.slice(0, 100)}…</p>}
                      {med.hadith_refs?.length > 0 && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>📚 {med.hadith_refs.join(' · ')}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TRADE TAB ─── */}
        {!isLoading && activeTab === 'trade' && tradeData?.entries && (
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>{tradeData.entries.length} {lang === 'en' ? 'trade activities' : 'ticaret faaliyeti'}</p>
            {tradeData.entries.map((tr) => {
              const isExp = expandedId === tr.id;
              return (
                <div key={tr.id} className="card overflow-hidden" style={{ borderInlineStart: `3px solid ${tabMeta.color}` }}>
                  <button onClick={() => setExpandedId(isExp ? null : tr.id)} className="flex w-full items-start gap-3 p-4 text-start" style={{ background: 'transparent' }}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${tabMeta.color}10` }}>🐪</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(tr.topic)}</h3>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{localize(tr.period)}</p>
                    </div>
                    <span className="shrink-0 text-xs" style={{ color: 'var(--text-tertiary)' }}>{isExp ? '▲' : '▼'}</span>
                  </button>
                  {isExp && (
                    <div className="flex flex-col gap-3 px-4 pb-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="pt-3 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{localize(tr.description)}</p>
                      {tr.economic_principles?.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <h5 className="text-xs font-bold" style={{ color: 'var(--text-accent)' }}>⚖️ {t('prophet_principles')}</h5>
                          {tr.economic_principles.map((p, i) => (
                            <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>• {lang === 'en' ? p.en : p.tr}</p>
                          ))}
                        </div>
                      )}
                      {tr.hadith_refs?.length > 0 && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>📚 {tr.hadith_refs.join(' · ')}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
