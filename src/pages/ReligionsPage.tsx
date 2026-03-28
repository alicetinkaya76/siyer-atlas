import { useState, useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { GridSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface Religion {
  id: string;
  name: LocalizedText;
  region: string;
  type: string;
  description: string;
  center?: { lat: number; lng: number };
  quran_refs?: string[];
  key_figures?: string[];
}

interface Idol {
  id: string;
  name: LocalizedText;
  type: string;
  region: string;
  description: string;
  location?: string;
  worshippers?: string[];
  quran_refs?: string[];
  destruction?: string;
}

interface Ritual {
  id: string;
  name: LocalizedText;
  type: string;
  description: string;
  related_quran?: string[];
  islamic_reform?: string;
}

interface ReligionData {
  version: string;
  religions: Religion[];
  idols: Idol[];
  rituals: Ritual[];
}

/* ─── Tab defs ─── */
type TabKey = 'religions' | 'idols' | 'rituals';

const TABS: { key: TabKey; icon: string; label: { tr: string; en: string; ar: string } }[] = [
  { key: 'religions', icon: '🕌', label: { tr: 'Dinler & İnançlar', en: 'Religions & Beliefs', ar: 'الأديان والمعتقدات' } },
  { key: 'idols', icon: '🗿', label: { tr: 'Putlar', en: 'Idols', ar: 'الأصنام' } },
  { key: 'rituals', icon: '🔥', label: { tr: 'Ritüeller', en: 'Rituals', ar: 'الطقوس' } },
];

/* ─── Type colors ─── */
const TYPE_COLORS: Record<string, string> = {
  putperestlik: '#b91c1c',
  hristiyanlık: '#1d4ed8',
  yahudilik: '#a16207',
  zerdüştlük: '#d97706',
  sabiilik: '#7c3aed',
  haniflik: '#15803d',
  tanrica: '#b91c1c',
  tanrı: '#a16207',
  put: '#6b7280',
  totem: '#0891b2',
  ibadet: '#15803d',
  kefaret: '#b91c1c',
  kehanet: '#7c3aed',
  cenaze: '#6b7280',
  sosyal: '#0891b2',
  ticari: '#d97706',
  default: '#6b7280',
};

/* ─── Card ─── */
function RelCard({ title, subtitle, badges, body, quranRefs, footer, onMapClick }: {
  title: string;
  subtitle?: string;
  badges?: { text: string; color: string }[];
  body: string;
  quranRefs?: string[];
  footer?: string;
  onMapClick?: () => void;
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
      <div className="flex items-start justify-between gap-2">
        <h4
          className="text-sm font-bold leading-tight mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {title}
        </h4>
        {onMapClick && (
          <button
            type="button"
            onClick={onMapClick}
            className="flex-shrink-0 text-xs px-2 py-1 rounded-lg transition-all hover:scale-105"
            style={{
              background: 'rgba(212,175,55,0.1)',
              color: 'var(--text-accent)',
              border: '1px solid rgba(212,175,55,0.2)',
            }}
            title="Haritada göster"
          >
            🗺️
          </button>
        )}
      </div>
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
      {quranRefs && quranRefs.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {quranRefs.slice(0, 3).map((ref, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: 'rgba(21,128,61,0.1)', color: '#15803d', border: '1px solid rgba(21,128,61,0.2)' }}
            >
              📖 {ref.length > 30 ? `${ref.slice(0, 30)}…` : ref}
            </span>
          ))}
        </div>
      )}
      {footer && (
        <p className="text-[11px] mt-2 italic" style={{ color: 'var(--text-tertiary)' }}>
          {footer}
        </p>
      )}
    </div>
  );
}

/* ─── Main ─── */
export default function ReligionsPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';
  const { localize } = useLocalizedField();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('religions');
  const [search, setSearch] = useState('');

  const { data: rel, isLoading } = useData<ReligionData>('pre_islamic_religions');

  const items = useMemo(() => {
    if (!rel) return [];
    return (rel[activeTab] ?? []) as any[];
  }, [rel, activeTab]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item: any) => {
      const name = typeof item.name === 'object' ? localize(item.name) : '';
      const desc = item.description || '';
      return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
  }, [items, search, localize]);

  const handleMapClick = (lat: number, lng: number) => {
    navigate(`/map?fly=${lat},${lng},10`);
  };

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
          {lang === 'tr' ? '🕌 Câhiliye İnançları' : lang === 'ar' ? '🕌 معتقدات الجاهلية' : '🕌 Pre-Islamic Beliefs'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {lang === 'tr'
            ? 'İslâm öncesi Arabistan\'da dinler, putlar ve ritüeller'
            : lang === 'ar'
              ? 'الأديان والأصنام والطقوس في شبه الجزيرة العربية قبل الإسلام'
              : 'Religions, idols, and rituals in pre-Islamic Arabia'}
        </p>
      </div>

      {/* Tab bar */}
      <div className="chips-scroll px-4 pb-3 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count = rel?.[tab.key]?.length ?? 0;
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
            {activeTab === 'religions' &&
              (filtered as Religion[]).map((r) => (
                <RelCard
                  key={r.id}
                  title={localize(r.name)}
                  subtitle={r.region}
                  badges={[{ text: r.type, color: TYPE_COLORS[r.type] || '#6b7280' }]}
                  body={r.description}
                  quranRefs={r.quran_refs}
                  onMapClick={r.center ? () => handleMapClick(r.center!.lat, r.center!.lng) : undefined}
                />
              ))}

            {activeTab === 'idols' &&
              (filtered as Idol[]).map((idol) => (
                <RelCard
                  key={idol.id}
                  title={localize(idol.name)}
                  subtitle={idol.worshippers?.join(', ')}
                  badges={[{ text: idol.type, color: TYPE_COLORS[idol.type] || '#6b7280' }]}
                  body={idol.description}
                  quranRefs={idol.quran_refs}
                  footer={idol.destruction}
                />
              ))}

            {activeTab === 'rituals' &&
              (filtered as Ritual[]).map((rit) => (
                <RelCard
                  key={rit.id}
                  title={localize(rit.name)}
                  badges={[{ text: rit.type, color: TYPE_COLORS[rit.type] || '#6b7280' }]}
                  body={rit.description}
                  quranRefs={rit.related_quran}
                  footer={rit.islamic_reform}
                />
              ))}
          </div>
        )}
      </div>

      {/* Stats footer */}
      {rel && (
        <div
          className="mx-4 mb-6 rounded-xl p-4 flex flex-wrap gap-4 justify-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
        >
          {TABS.map((tab) => (
            <div key={tab.key} className="text-center">
              <span className="block text-lg font-bold" style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-display)' }}>
                {rel[tab.key]?.length ?? 0}
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
