import { useState, useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { useTranslation } from 'react-i18next';
import { GridSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface Poet {
  id: string;
  name: LocalizedText;
  period: string;
  death_approx: string;
  tribe: string;
  title: string;
  description: string;
  muallaka: boolean;
  famous_lines?: string[];
  related_events?: string[];
}

interface LiteraryForm {
  id: string;
  name: LocalizedText;
  description: string;
  structure?: Record<string, string>;
  examples?: string[];
}

interface PoetryEvent {
  id: string;
  name: LocalizedText;
  location: string;
  description: string;
  period: string;
  related_poets?: string[];
}

interface QuranPoetry {
  id: string;
  surah: number;
  surah_name: LocalizedText;
  ayah_start: number;
  ayah_end: number;
  description: string;
  related_poets?: string[];
}

interface LiteratureData {
  version: string;
  poets: Poet[];
  literary_forms: LiteraryForm[];
  poetry_events: PoetryEvent[];
  quran_and_poetry: QuranPoetry[];
}

/* ─── Tab defs ─── */
type TabKey = 'poets' | 'literary_forms' | 'poetry_events' | 'quran_and_poetry';

const TABS: { key: TabKey; icon: string; label: { tr: string; en: string; ar: string } }[] = [
  { key: 'poets', icon: '🖊️', label: { tr: 'Şairler', en: 'Poets', ar: 'الشعراء' } },
  { key: 'literary_forms', icon: '📜', label: { tr: 'Edebî Formlar', en: 'Literary Forms', ar: 'الأشكال الأدبية' } },
  { key: 'poetry_events', icon: '🎭', label: { tr: 'Şiir Olayları', en: 'Poetry Events', ar: 'أحداث شعرية' } },
  { key: 'quran_and_poetry', icon: '📖', label: { tr: 'Kur\'ân ve Şiir', en: 'Quran & Poetry', ar: 'القرآن والشعر' } },
];

/* ─── Period chip colors ─── */
const PERIOD_COLORS: Record<string, string> = {
  câhiliye: '#a16207',
  'câhiliye-islâm': '#7c3aed',
  islâm: '#15803d',
  Câhiliye: '#a16207',
  'Peygamberlik sonrası': '#15803d',
  default: '#6b7280',
};

/* ─── Card ─── */
function LitCard({ title, subtitle, badges, body, footer }: {
  title: string;
  subtitle?: string;
  badges?: { text: string; color: string }[];
  body: string;
  footer?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 transition-all hover:scale-[1.01]"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <h4
        className="text-sm font-bold leading-tight mb-1"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        {title}
      </h4>
      {subtitle && (
        <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
          {subtitle}
        </p>
      )}
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {badges.map((b, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: `${b.color}15`,
                color: b.color,
                border: `1px solid ${b.color}30`,
              }}
            >
              {b.text}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {body.length > 220 ? `${body.slice(0, 220)}…` : body}
      </p>
      {footer && (
        <p className="text-[11px] mt-2 italic" style={{ color: 'var(--text-tertiary)' }}>
          {footer}
        </p>
      )}
    </div>
  );
}

/* ─── Main ─── */
export default function LiteraturePage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';
  const { localize } = useLocalizedField();
  const [activeTab, setActiveTab] = useState<TabKey>('poets');
  const [search, setSearch] = useState('');

  const { data: lit, isLoading } = useData<LiteratureData>('literature');

  const items = useMemo(() => {
    if (!lit) return [];
    return (lit[activeTab] ?? []) as any[];
  }, [lit, activeTab]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item: any) => {
      const name = typeof item.name === 'object' ? localize(item.name) : (item.surah_name ? localize(item.surah_name) : '');
      const desc = item.description || '';
      const title = item.title || '';
      return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || title.toLowerCase().includes(q);
    });
  }, [items, search, localize]);

  if (isLoading) {
    return (
      <div className="container-page">
        <div className="p-4"><GridSkeleton count={8} /></div>
      </div>
    );
  }

  return (
    <div className="container-page">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1
          className="text-xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {lang === 'tr' ? '📜 Edebiyat' : lang === 'ar' ? '📜 الأدب' : '📜 Literature'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {lang === 'tr'
            ? 'Câhiliye ve İslâm dönemi Arap edebiyatı — şairler, formlar, olaylar'
            : lang === 'ar'
              ? 'الأدب العربي في الجاهلية والإسلام — الشعراء والأشكال والأحداث'
              : 'Pre-Islamic and Islamic Arabic literature — poets, forms, events'}
        </p>
      </div>

      {/* Tab bar */}
      <div className="chips-scroll px-4 pb-3 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count = lit?.[tab.key]?.length ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
              style={{
                background: active ? 'rgba(212,175,55,0.15)' : 'var(--card-bg)',
                color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
                border: active ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--glass-border)',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label[lang]}</span>
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === 'tr' ? 'Ara…' : lang === 'ar' ? 'ابحث…' : 'Search…'}
          className="w-full px-3 py-2 rounded-xl text-sm"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {filtered.length === 0 ? (
          <EmptyState type={search ? 'no-results' : 'no-filter'} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeTab === 'poets' &&
              (filtered as Poet[]).map((p) => (
                <LitCard
                  key={p.id}
                  title={localize(p.name)}
                  subtitle={`${p.death_approx} · ${p.tribe}`}
                  badges={[
                    { text: p.period, color: PERIOD_COLORS[p.period] || '#6b7280' },
                    ...(p.muallaka ? [{ text: lang === 'tr' ? 'Muallakāt' : 'Muʿallaqāt', color: '#d4af37' }] : []),
                  ]}
                  body={p.description}
                  footer={p.title}
                />
              ))}

            {activeTab === 'literary_forms' &&
              (filtered as LiteraryForm[]).map((f) => (
                <LitCard
                  key={f.id}
                  title={localize(f.name)}
                  body={f.description}
                  footer={f.structure ? Object.entries(f.structure).map(([k, v]) => `${k}: ${v}`).join(' · ').slice(0, 120) : undefined}
                />
              ))}

            {activeTab === 'poetry_events' &&
              (filtered as PoetryEvent[]).map((e) => (
                <LitCard
                  key={e.id}
                  title={localize(e.name)}
                  subtitle={e.period}
                  badges={[{ text: e.location, color: '#1d4ed8' }]}
                  body={e.description}
                />
              ))}

            {activeTab === 'quran_and_poetry' &&
              (filtered as QuranPoetry[]).map((q) => (
                <LitCard
                  key={q.id}
                  title={localize(q.surah_name)}
                  subtitle={`${lang === 'tr' ? 'Sûre' : lang === 'ar' ? 'سورة' : 'Surah'} ${q.surah} · ${lang === 'tr' ? 'Âyet' : lang === 'ar' ? 'آية' : 'Ayah'} ${q.ayah_start}–${q.ayah_end}`}
                  badges={[{ text: '📖', color: '#15803d' }]}
                  body={q.description}
                />
              ))}
          </div>
        )}
      </div>

      {/* Stats footer */}
      {lit && (
        <div
          className="mx-4 mb-6 rounded-xl p-4 flex flex-wrap gap-4 justify-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
        >
          {TABS.map((tab) => (
            <div key={tab.key} className="text-center">
              <span className="block text-lg font-bold" style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-display)' }}>
                {lit[tab.key]?.length ?? 0}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {tab.label[lang]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
