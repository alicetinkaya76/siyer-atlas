import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import {
  companionGroup,
  COMPANION_GROUP_LABELS,
  BATTLE_TYPE_LABELS,
} from '@/utils/dataHelpers';
import { Spinner } from '@/components/common/Spinner';
import type { LocalizedText } from '@/types';

/* ─── Raw JSON shapes ─── */
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
  conversion_note?: LocalizedText | string;
  quran_references?: { surah: number; ayah: number; context_tr?: string }[];
  events_participated?: string[];
  description?: LocalizedText | string;
  sources?: string[];
  gender?: string;
  category?: string | string[];
  relationships?: { target: string; type: string; label?: LocalizedText | { tr?: string; en?: string; order?: number } }[];
  professions?: (LocalizedText | string)[];
  museum_item_ids?: string[];
}

interface RawBattle {
  id: string;
  name: LocalizedText;
  date_hijri?: string;
  date_ce?: string;
  year_ce: number;
  type: string;
  location_id?: string;
  result?: string;
}

interface RawLocation {
  id: string;
  name: LocalizedText;
  lat: number;
  lng: number;
  type?: string;
}

type Tab = 'bio' | 'battles' | 'relations' | 'quran' | 'museum';

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

export default function CompanionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { localize, lang } = useLocalizedField();
  const { data: companions, isLoading: loadingC } = useData<RawCompanion[]>('companions');
  const { data: battles } = useData<RawBattle[]>('battles');
  const { data: locations } = useData<RawLocation[]>('locations');
  const { data: allCompanions } = useData<RawCompanion[]>('companions');
  const { data: museumCrossRef } = useData<MuseumCrossRef>('museum/museum_cross_ref');
  const { data: museumMaster } = useData<MuseumMasterIndex>('museum_master_index');

  const [tab, setTab] = useState<Tab>('bio');

  const companion = useMemo(
    () => companions?.find(c => c.id === id),
    [companions, id],
  );

  /* ─── Joined data ─── */
  const participatedBattles = useMemo(() => {
    if (!companion?.events_participated || !battles) return [];
    return companion.events_participated
      .map(eId => battles.find(b => b.id === eId))
      .filter(Boolean) as RawBattle[];
  }, [companion, battles]);

  const birthLocation = useMemo(
    () => locations?.find(l => l.id === companion?.birth_location_id),
    [locations, companion],
  );
  const deathLocation = useMemo(
    () => locations?.find(l => l.id === companion?.death_location_id),
    [locations, companion],
  );

  const relatedCompanions = useMemo(() => {
    if (!companion?.relationships || !allCompanions) return [];
    return companion.relationships.map(r => {
      const target = allCompanions.find(c => c.id === r.target);
      return { ...r, targetData: target };
    });
  }, [companion, allCompanions]);

  const museumItems = useMemo(() => {
    if (!companion || !museumCrossRef?.companion_to_items || !museumMaster?.items) return [];
    const itemIds = museumCrossRef.companion_to_items[companion.id] ?? [];
    return itemIds
      .map(itemId => museumMaster.items.find(it => it.id === itemId))
      .filter(Boolean) as MuseumIndexItem[];
  }, [companion, museumCrossRef, museumMaster]);

  if (loadingC) {
    return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!companion) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center">
        <span className="text-4xl">❌</span>
        <p style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Companion not found' : 'Sahâbî bulunamadı'}</p>
        <Link to="/companions" className="text-sm underline" style={{ color: 'var(--text-accent)' }}>
          ← {lang === 'en' ? 'Back to list' : 'Listeye dön'}
        </Link>
      </div>
    );
  }

  const groups = companionGroup(companion.category);
  const primaryGroup = groups[0] ?? 'other';
  const primaryGL = COMPANION_GROUP_LABELS[primaryGroup];
  const descText = typeof companion.description === 'string'
    ? companion.description
    : localize(companion.description as LocalizedText | undefined);

  const convNote = typeof companion.conversion_note === 'string'
    ? companion.conversion_note
    : localize(companion.conversion_note as LocalizedText | undefined);

  const TABS: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'bio', label: lang === 'en' ? 'Biography' : 'Biyografi', icon: '📜' },
    { key: 'battles', label: lang === 'en' ? 'Battles' : 'Savaşları', icon: '⚔️', count: participatedBattles.length },
    { key: 'relations', label: lang === 'en' ? 'Relations' : 'İlişkiler', icon: '🔗', count: relatedCompanions.length },
    { key: 'quran', label: lang === 'en' ? "Qur'an" : "Kur'ân", icon: '📖', count: companion.quran_references?.length ?? 0 },
    ...(museumItems.length > 0 ? [{ key: 'museum' as Tab, label: lang === 'en' ? 'Museum' : 'Müze', icon: '🏛️', count: museumItems.length }] : []),
  ];

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* Back */}
        <Link to="/companions" className="mb-4 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          ← {lang === 'en' ? 'All Companions' : 'Tüm Sahâbîler'}
        </Link>

        {/* ─── Hero ─── */}
        <div className="card mb-6 overflow-hidden">
          <div className="p-5 sm:p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ background: `${primaryGL.color}15`, border: `2px solid ${primaryGL.color}40` }}
              >
                {primaryGL.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  className="text-xl font-bold sm:text-2xl"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  {localize(companion.name)}
                </h1>
                {companion.full_name && (
                  <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {localize(companion.full_name)}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {groups.map(g => (
                    <span key={g} className="badge" style={{ background: `${COMPANION_GROUP_LABELS[g].color}12`, color: COMPANION_GROUP_LABELS[g].color, border: `1px solid ${COMPANION_GROUP_LABELS[g].color}25` }}>
                      {COMPANION_GROUP_LABELS[g].icon} {lang === 'en' ? COMPANION_GROUP_LABELS[g].en : COMPANION_GROUP_LABELS[g].tr}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: 'var(--border-color)' }}>
            {[
              { label: lang === 'en' ? 'Born' : 'Doğum', value: companion.birth_ce ? `${companion.birth_ce} CE` : '—', sub: birthLocation ? localize(birthLocation.name) : '' },
              { label: lang === 'en' ? 'Died' : 'Vefat', value: companion.death_ce ? `${companion.death_ce} CE` : '—', sub: companion.death_hijri ? `${companion.death_hijri} H` : '' },
              { label: lang === 'en' ? 'Tribe' : 'Kabile', value: companion.tribe || '—', sub: companion.clan ? localize(companion.clan) : '' },
              { label: lang === 'en' ? 'Conversion' : 'Müslüman oluş', value: companion.conversion_order ? `#${companion.conversion_order}` : '—', sub: '' },
            ].map((m, i) => (
              <div key={i} className="p-3" style={{ background: 'var(--bg-secondary)' }}>
                <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{m.label}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
                {m.sub && <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{m.sub}</p>}
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
          {tab === 'bio' && (
            <div className="flex flex-col gap-4">
              {/* Laqab + Kunya */}
              {(companion.kunya || companion.laqab) && (
                <div className="flex flex-wrap gap-3">
                  {companion.kunya && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Künyesi</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{companion.kunya}</p>
                    </div>
                  )}
                  {companion.laqab && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Lakabı</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{localize(companion.laqab)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Conversion note */}
              {convNote && (
                <div className="rounded-lg p-3" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-accent)' }}>
                    {lang === 'en' ? 'Conversion' : 'İhtidâ'}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-primary)' }}>{convNote}</p>
                </div>
              )}

              {/* Roles */}
              {companion.roles && companion.roles.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    {lang === 'en' ? 'Roles' : 'Görevleri'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {companion.roles.map((r, i) => {
                      const text = typeof r === 'string' ? r : localize(r);
                      return (
                        <span key={i} className="badge badge-gold">{text}</span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Professions */}
              {companion.professions && companion.professions.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    {lang === 'en' ? 'Professions' : 'Meslekleri'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {companion.professions.map((p, i) => {
                      const text = typeof p === 'string' ? p : localize(p);
                      return <span key={i} className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{text}</span>;
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              {descText && (
                <div>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    {lang === 'en' ? 'Biography' : 'Biyografi'}
                  </p>
                  <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{descText}</p>
                </div>
              )}

              {/* Sources */}
              {companion.sources && companion.sources.length > 0 && (
                <div className="mt-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    {lang === 'en' ? 'Sources' : 'Kaynaklar'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {companion.sources.join(' · ')}
                  </p>
                </div>
              )}

              {/* Death location */}
              {deathLocation && (
                <div className="mt-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    {lang === 'en' ? 'Burial place' : 'Vefat yeri'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{localize(deathLocation.name)}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'battles' && (
            <div className="flex flex-col gap-2">
              {participatedBattles.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {lang === 'en' ? 'No recorded battle participation' : 'Savaş kaydı bulunamadı'}
                </p>
              ) : (
                participatedBattles.map(b => {
                  const tl = BATTLE_TYPE_LABELS[b.type] ?? { tr: b.type, en: b.type, icon: '📌', color: '#888' };
                  return (
                    <Link
                      key={b.id}
                      to={`/battles/${b.id}`}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-[var(--bg-tertiary)]"
                      style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
                    >
                      <span className="text-lg">{tl.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{localize(b.name)}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {b.year_ce} CE · {b.date_hijri || ''} · {tl.tr}
                        </p>
                      </div>
                      <span className="badge" style={{ background: `${tl.color}15`, color: tl.color, fontSize: '0.65rem' }}>
                        {lang === 'en' ? tl.en : tl.tr}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {tab === 'relations' && (
            <div className="flex flex-col gap-2">
              {relatedCompanions.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {lang === 'en' ? 'No recorded relationships' : 'İlişki kaydı bulunamadı'}
                </p>
              ) : (
                relatedCompanions.map((r, i) => {
                  const relLabel = typeof r.label === 'object' && r.label
                    ? (lang === 'en' ? (r.label as { en?: string }).en : (r.label as { tr?: string }).tr) || r.type
                    : r.type;
                  const typeIcons: Record<string, string> = {
                    parent_child: '👨‍👧',
                    spouse: '💍',
                    sibling: '👥',
                    teacher: '📚',
                    student: '📖',
                    companion: '🤝',
                    muahat: '🕊️',
                  };
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'var(--bg-tertiary)' }}>
                      <span className="text-lg">{typeIcons[r.type] || '🔗'}</span>
                      <div className="min-w-0 flex-1">
                        {r.targetData ? (
                          <Link to={`/companions/${r.target}`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-display)', textDecoration: 'none' }}>
                            {localize(r.targetData.name)}
                          </Link>
                        ) : (
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.target}</p>
                        )}
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{relLabel}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === 'quran' && (
            <div className="flex flex-col gap-2">
              {!companion.quran_references || companion.quran_references.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {lang === 'en' ? 'No Quran references' : 'Kur\'ân referansı bulunamadı'}
                </p>
              ) : (
                companion.quran_references.map((qr, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg-tertiary)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-accent)' }}>
                      📖 {lang === 'en' ? `Surah ${qr.surah}:${qr.ayah}` : `${qr.surah}. Sûre, ${qr.ayah}. Âyet`}
                    </p>
                    {qr.context_tr && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{qr.context_tr}</p>
                    )}
                  </div>
                ))
              )}
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
