import { useState, useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { GridSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface GeoItem {
  id: string;
  name: LocalizedText;
  lat: number;
  lng: number;
  type: string;
  description: string;
  elevation_m?: number;
  related_events?: string[];
  quran_refs?: string[];
  significance?: string;
  length_km?: number;
  flow_direction?: string;
  area_km2?: number;
}

interface GeographyData {
  version: string;
  mountains: GeoItem[];
  valleys: GeoItem[];
  rivers_water: GeoItem[];
  deserts_plains: GeoItem[];
  mountain_passes: GeoItem[];
  ports_coasts: GeoItem[];
  islands: GeoItem[];
}

/* ─── Tab defs ─── */
type TabKey = keyof Omit<GeographyData, 'version' | 'description'>;

const TABS: { key: TabKey; icon: string; color: string; label: { tr: string; en: string; ar: string } }[] = [
  { key: 'mountains', icon: '⛰️', color: '#7c3aed', label: { tr: 'Dağlar', en: 'Mountains', ar: 'الجبال' } },
  { key: 'valleys', icon: '🏜️', color: '#a16207', label: { tr: 'Vadiler', en: 'Valleys', ar: 'الأودية' } },
  { key: 'rivers_water', icon: '💧', color: '#0891b2', label: { tr: 'Sular', en: 'Waters', ar: 'المياه' } },
  { key: 'deserts_plains', icon: '🏝️', color: '#d97706', label: { tr: 'Çöller & Ovalar', en: 'Deserts & Plains', ar: 'الصحاري والسهول' } },
  { key: 'mountain_passes', icon: '🛤️', color: '#6b7280', label: { tr: 'Geçitler', en: 'Passes', ar: 'الممرات' } },
  { key: 'ports_coasts', icon: '⚓', color: '#1d4ed8', label: { tr: 'Limanlar', en: 'Ports & Coasts', ar: 'الموانئ' } },
  { key: 'islands', icon: '🏝️', color: '#15803d', label: { tr: 'Adalar', en: 'Islands', ar: 'الجزر' } },
];

/* ─── Card ─── */
function GeoCard({ title, subtitle, badges, body, quranRefs, onMapClick }: {
  title: string;
  subtitle?: string;
  badges?: { text: string; color: string }[];
  body: string;
  quranRefs?: string[];
  onMapClick: () => void;
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
          {quranRefs.map((ref, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{ background: 'rgba(21,128,61,0.1)', color: '#15803d', border: '1px solid rgba(21,128,61,0.2)' }}
            >
              📖 {ref}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main ─── */
export default function GeographyPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';
  const { localize } = useLocalizedField();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('mountains');
  const [search, setSearch] = useState('');

  const { data: geo, isLoading } = useData<GeographyData>('geography');

  const items = useMemo(() => {
    if (!geo) return [];
    return (geo[activeTab] ?? []) as GeoItem[];
  }, [geo, activeTab]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const name = localize(item.name);
      return name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    });
  }, [items, search, localize]);

  const totalItems = useMemo(() => {
    if (!geo) return 0;
    return TABS.reduce((sum, tab) => sum + ((geo[tab.key] as GeoItem[])?.length ?? 0), 0);
  }, [geo]);

  const handleMapClick = (lat: number, lng: number) => {
    navigate(`/map?fly=${lat},${lng},12`);
  };

  if (isLoading) {
    return (
      <div className="container-page">
        <div className="p-4"><GridSkeleton count={8} /></div>
      </div>
    );
  }

  const currentTabDef = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="container-page">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1
          className="text-xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          {lang === 'tr' ? '🌍 Coğrafya' : lang === 'ar' ? '🌍 الجغرافيا' : '🌍 Geography'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {lang === 'tr'
            ? `Siyer coğrafyası — ${totalItems} doğal ve tarihî yer`
            : lang === 'ar'
              ? `جغرافيا السيرة — ${totalItems} موقع طبيعي وتاريخي`
              : `Sira geography — ${totalItems} natural and historical sites`}
        </p>
      </div>

      {/* Tab bar */}
      <div className="chips-scroll px-4 pb-3 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count = (geo?.[tab.key] as GeoItem[] | undefined)?.length ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); setSearch(''); }}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
              style={{
                background: active ? `${tab.color}15` : 'var(--card-bg)',
                color: active ? tab.color : 'var(--text-secondary)',
                border: active ? `1px solid ${tab.color}30` : '1px solid var(--glass-border)',
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
            {filtered.map((item) => {
              const stats: string[] = [];
              if (item.elevation_m) stats.push(`${item.elevation_m}m`);
              if (item.length_km) stats.push(`${item.length_km} km`);
              if (item.area_km2) stats.push(`${item.area_km2} km²`);
              if (item.flow_direction) stats.push(item.flow_direction);

              return (
                <GeoCard
                  key={item.id}
                  title={localize(item.name)}
                  subtitle={stats.length > 0 ? stats.join(' · ') : undefined}
                  badges={[{ text: currentTabDef.label[lang], color: currentTabDef.color }]}
                  body={item.description}
                  quranRefs={item.quran_refs}
                  onMapClick={() => handleMapClick(item.lat, item.lng)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Stats footer */}
      {geo && (
        <div
          className="mx-4 mb-6 rounded-xl p-4 flex flex-wrap gap-4 justify-center"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
        >
          {TABS.map((tab) => (
            <div key={tab.key} className="text-center">
              <span className="block text-lg font-bold" style={{ color: tab.color, fontFamily: 'var(--font-display)' }}>
                {(geo[tab.key] as GeoItem[])?.length ?? 0}
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
