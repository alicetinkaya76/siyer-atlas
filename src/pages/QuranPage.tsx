import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { Spinner } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface EsbabEntry {
  id: string;
  surah: number;
  surah_name: LocalizedText;
  ayah_start: number;
  ayah_end: number;
  topic: LocalizedText;
  category: string;
  nuzul_summary: LocalizedText;
  links?: {
    persons?: string[];
    events?: string[];
    locations?: string[];
    battles?: string[];
    tribes?: string[];
  };
  sources?: Array<{ author: string; title: string }>;
}

interface HadithEntry {
  id: string;
  topic: LocalizedText;
  category: string;
  hadith_text_tr: string;
  narrator?: string;
  source_primary?: string;
  source_secondary?: string;
  sahih_grade?: string;
  links?: {
    persons?: string[];
    events?: string[];
    locations?: string[];
    battles?: string[];
    esbab_nuzul?: string[];
  };
  companion_ids?: string[];
}

interface EsbabData {
  entries: EsbabEntry[];
}

interface HadithData {
  entries: HadithEntry[];
  categories: Record<string, string>;
}

type TabView = 'esbab' | 'hadith';

const ESBAB_CATEGORY_LABELS: Record<string, { tr: string; en: string; icon: string; color: string }> = {
  ibadet: { tr: 'İbadet', en: 'Worship', icon: '🤲', color: '#15803d' },
  ahlak: { tr: 'Ahlâk', en: 'Ethics', icon: '✨', color: '#d4af37' },
  ahkam: { tr: 'Ahkâm', en: 'Rulings', icon: '⚖️', color: '#2e5984' },
  siyer: { tr: 'Siyer', en: 'Sīrah', icon: '📖', color: '#8b4513' },
  akide: { tr: 'Akîde', en: 'Creed', icon: '🌙', color: '#7c3aed' },
  kissa: { tr: 'Kıssa', en: 'Story', icon: '📜', color: '#0891b2' },
  munafik: { tr: 'Münâfıklar', en: 'Hypocrites', icon: '🎭', color: '#b91c1c' },
  ehlikitab: { tr: 'Ehl-i Kitab', en: 'People of Book', icon: '📚', color: '#d97706' },
  savaş: { tr: 'Savaş', en: 'Warfare', icon: '⚔️', color: '#c0392b' },
  aile: { tr: 'Aile', en: 'Family', icon: '👨‍👩‍👧', color: '#1a6b4a' },
};

const HADITH_CATEGORY_LABELS: Record<string, { tr: string; en: string; icon: string; color: string }> = {
  siyer: { tr: 'Siyer', en: 'Sīrah', icon: '📖', color: '#8b4513' },
  'ahkâm': { tr: 'Ahkâm', en: 'Rulings', icon: '⚖️', color: '#2e5984' },
  'fazîlet': { tr: 'Fazîlet', en: 'Virtues', icon: '⭐', color: '#d4af37' },
  'akîde': { tr: 'Akîde', en: 'Creed', icon: '🌙', color: '#7c3aed' },
  'ahlâk': { tr: 'Ahlâk', en: 'Ethics', icon: '✨', color: '#15803d' },
  'megâzî': { tr: 'Megâzî', en: 'Campaigns', icon: '⚔️', color: '#c0392b' },
  'zühd': { tr: 'Zühd', en: 'Asceticism', icon: '🕊️', color: '#6b7280' },
  'ilim': { tr: 'İlim', en: 'Knowledge', icon: '📚', color: '#0891b2' },
};

export default function QuranPage() {
  const { localize, lang } = useLocalizedField();
  const navigate = useNavigate();

  // Determine tab from URL
  const path = window.location.pathname;
  const activeTab: TabView = path.includes('/hadith') ? 'hadith' : 'esbab';

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: esbabData, isLoading: le } = useData<EsbabData>('esbab_nuzul');
  const { data: hadithData, isLoading: lh } = useData<HadithData>('hadith');

  // Esbab entries
  const esbabEntries = useMemo(() => {
    if (!esbabData?.entries) return [];
    let items = esbabData.entries;
    if (selectedCat) items = items.filter((e) => e.category === selectedCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((e) =>
        localize(e.topic).toLowerCase().includes(q) ||
        localize(e.surah_name).toLowerCase().includes(q) ||
        localize(e.nuzul_summary).toLowerCase().includes(q),
      );
    }
    return items;
  }, [esbabData, selectedCat, search, localize]);

  // Esbab categories for filter
  const esbabCats = useMemo(() => {
    if (!esbabData?.entries) return [];
    return Array.from(new Set(esbabData.entries.map((e) => e.category))).sort();
  }, [esbabData]);

  // Hadith entries
  const hadithEntries = useMemo(() => {
    if (!hadithData?.entries) return [];
    let items = hadithData.entries;
    if (selectedCat) items = items.filter((h) => h.category === selectedCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((h) =>
        localize(h.topic).toLowerCase().includes(q) ||
        h.hadith_text_tr.toLowerCase().includes(q) ||
        (h.narrator ?? '').toLowerCase().includes(q),
      );
    }
    return items;
  }, [hadithData, selectedCat, search, localize]);

  const hadithCats = useMemo(() => {
    if (!hadithData?.entries) return [];
    return Array.from(new Set(hadithData.entries.map((h) => h.category))).sort();
  }, [hadithData]);

  const isLoading = le || lh;

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {lang === 'en' ? "Qur'an & Hadith Links" : "Kur'ân ve Hadis Bağlantıları"}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {esbabData?.entries?.length ?? 355} {lang === 'en' ? 'asbāb entries' : 'esbâb kaydı'} · {hadithData?.entries?.length ?? 387} {lang === 'en' ? 'hadiths' : 'hadis'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg p-1" style={{ background: 'var(--bg-tertiary)' }}>
          {[
            { key: 'esbab' as TabView, label: lang === 'en' ? 'Asbāb al-Nuzūl' : 'Esbâb-ı Nüzûl', icon: '📜', count: esbabData?.entries?.length },
            { key: 'hadith' as TabView, label: lang === 'en' ? 'Hadith' : 'Hadis', icon: '📚', count: hadithData?.entries?.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => { navigate(`/quran/${t.key}`); setSelectedCat(null); setSearch(''); setExpandedId(null); }}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all"
              style={{
                background: activeTab === t.key ? 'var(--bg-secondary)' : 'transparent',
                color: activeTab === t.key ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: activeTab === t.key ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count && <span className="rounded-full px-1.5 text-[10px]" style={{ background: 'var(--text-accent)', color: '#1a1a2e' }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Search + Category Filter */}
        <div className="mb-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search…' : 'Ara…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCat(null)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
              style={{ background: !selectedCat ? 'rgba(212,175,55,0.15)' : 'var(--bg-tertiary)', color: !selectedCat ? 'var(--text-accent)' : 'var(--text-tertiary)', border: `1px solid ${!selectedCat ? 'rgba(212,175,55,0.3)' : 'transparent'}` }}
            >
              {lang === 'en' ? 'All' : 'Tümü'}
            </button>
            {(activeTab === 'esbab' ? esbabCats : hadithCats).map((cat) => {
              const labels = activeTab === 'esbab' ? ESBAB_CATEGORY_LABELS : HADITH_CATEGORY_LABELS;
              const meta = labels[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat === selectedCat ? null : cat)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: selectedCat === cat ? `${meta?.color ?? '#666'}18` : 'var(--bg-tertiary)',
                    color: selectedCat === cat ? meta?.color ?? 'var(--text-primary)' : 'var(--text-tertiary)',
                    border: `1px solid ${selectedCat === cat ? `${meta?.color ?? '#666'}40` : 'transparent'}`,
                  }}
                >
                  {meta?.icon ?? '•'} {lang === 'en' ? (meta?.en ?? cat) : (meta?.tr ?? cat)}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading && <div className="flex h-40 items-center justify-center"><Spinner size="md" /></div>}

        {/* ─── ESBAB TAB ─── */}
        {!isLoading && activeTab === 'esbab' && (
          <div className="flex flex-col gap-2">
            <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
              {esbabEntries.length} {lang === 'en' ? 'entries' : 'kayıt'}
            </p>
            {esbabEntries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const catMeta = ESBAB_CATEGORY_LABELS[entry.category];
              return (
                <div
                  key={entry.id}
                  className="card overflow-hidden transition-all"
                  style={{ borderInlineStart: `3px solid ${catMeta?.color ?? '#666'}` }}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full p-4 text-start flex items-start gap-3"
                    style={{ background: 'transparent' }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold" style={{ background: `${catMeta?.color ?? '#666'}10`, color: catMeta?.color ?? '#666' }}>
                      {entry.surah}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {localize(entry.surah_name)} ({entry.ayah_start}{entry.ayah_end !== entry.ayah_start ? `–${entry.ayah_end}` : ''})
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{localize(entry.topic)}</p>
                    </div>
                    <span className="text-xs shrink-0 mt-1" style={{ color: 'var(--text-tertiary)' }}>{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-sm leading-relaxed pt-3" style={{ color: 'var(--text-primary)' }}>{localize(entry.nuzul_summary)}</p>

                      {/* Cross-ref links */}
                      {entry.links && (
                        <div className="flex flex-wrap gap-2">
                          {entry.links.persons?.map((pid) => (
                            <Link key={pid} to={`/companions/${pid}`} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', textDecoration: 'none' }}>
                              👤 {pid}
                            </Link>
                          ))}
                          {entry.links.battles?.map((bid) => (
                            <Link key={bid} to={`/battles/${bid}`} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(185,28,28,0.08)', color: '#b91c1c', textDecoration: 'none' }}>
                              ⚔️ {bid}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Sources */}
                      {entry.sources && entry.sources.length > 0 && (
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          📎 {entry.sources.map((s) => `${s.author}, ${s.title}`).join(' · ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {esbabEntries.length === 0 && <EmptyState type="no-filter" />}
          </div>
        )}

        {/* ─── HADITH TAB ─── */}
        {!isLoading && activeTab === 'hadith' && (
          <div className="flex flex-col gap-2">
            <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
              {hadithEntries.length} {lang === 'en' ? 'hadiths' : 'hadis'}
            </p>
            {hadithEntries.map((h) => {
              const isExpanded = expandedId === h.id;
              const catMeta = HADITH_CATEGORY_LABELS[h.category];
              return (
                <div
                  key={h.id}
                  className="card overflow-hidden transition-all"
                  style={{ borderInlineStart: `3px solid ${catMeta?.color ?? '#666'}` }}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : h.id)}
                    className="w-full p-4 text-start flex items-start gap-3"
                    style={{ background: 'transparent' }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${catMeta?.color ?? '#666'}10` }}>
                      {catMeta?.icon ?? '📜'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {localize(h.topic)}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        {h.narrator && `${h.narrator} · `}{h.source_primary ?? ''}{h.sahih_grade ? ` (${h.sahih_grade})` : ''}
                      </p>
                    </div>
                    <span className="text-xs shrink-0 mt-1" style={{ color: 'var(--text-tertiary)' }}>{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      {/* Hadith text */}
                      <div className="rounded-lg p-3 mt-3" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>
                          {h.hadith_text_tr.length > 400 ? h.hadith_text_tr.slice(0, 400) + '…' : h.hadith_text_tr}
                        </p>
                      </div>

                      {/* Sources */}
                      <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {h.source_primary && <span>📚 {h.source_primary}</span>}
                        {h.source_secondary && <span>· {h.source_secondary}</span>}
                        {h.sahih_grade && <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(21,128,61,0.08)', color: '#15803d' }}>{h.sahih_grade}</span>}
                      </div>

                      {/* Cross-ref links */}
                      {(h.companion_ids?.length || h.links?.battles?.length) && (
                        <div className="flex flex-wrap gap-2">
                          {h.companion_ids?.map((cid) => (
                            <Link key={cid} to={`/companions/${cid}`} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', textDecoration: 'none' }}>
                              👤 {cid}
                            </Link>
                          ))}
                          {h.links?.battles?.map((bid) => (
                            <Link key={bid} to={`/battles/${bid}`} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(185,28,28,0.08)', color: '#b91c1c', textDecoration: 'none' }}>
                              ⚔️ {bid}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {hadithEntries.length === 0 && <EmptyState type="no-filter" />}
          </div>
        )}
      </div>
    </div>
  );
}
