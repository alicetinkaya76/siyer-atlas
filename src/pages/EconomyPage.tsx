import { useState, useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { GridSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface Market {
  id: string;
  name: LocalizedText;
  lat: number;
  lng: number;
  type: string;
  period: string;
  description: string;
}

interface Currency {
  id: string;
  name: LocalizedText;
  origin: string;
  metal: string;
  weight_g: number;
  description: string;
}

interface TradePractice {
  id: string;
  name: LocalizedText;
  description: string;
  quran_ref?: string;
  type: string;
}

interface Commodity {
  id: string;
  name: LocalizedText;
  role: string;
}

interface Institution {
  id: string;
  name: LocalizedText;
  type: string;
  established: string;
  description: string;
}

interface WeightMeasure {
  id: string;
  name: LocalizedText;
  type: string;
  equivalent: string;
  description: string;
}

interface TradeGood {
  id: string;
  name: LocalizedText;
  origin: string;
  category: string;
  description: string;
}

interface EconomyData {
  version: string;
  markets: Market[];
  currencies: Currency[];
  trade_practices: TradePractice[];
  key_commodities: Commodity[];
  institutions: Institution[];
  weights_measures: WeightMeasure[];
}

/* ─── TAB DEFINITIONS ─── */
type TabKey = 'markets' | 'currencies' | 'trade_practices' | 'key_commodities' | 'institutions' | 'weights_measures' | 'trade_goods';

const TABS: { key: TabKey; icon: string; label: { tr: string; en: string; ar: string } }[] = [
  { key: 'markets', icon: '🏪', label: { tr: 'Pazarlar', en: 'Markets', ar: 'الأسواق' } },
  { key: 'currencies', icon: '🪙', label: { tr: 'Para Birimleri', en: 'Currencies', ar: 'العملات' } },
  { key: 'trade_practices', icon: '🤝', label: { tr: 'Ticaret Uygulamaları', en: 'Trade Practices', ar: 'الممارسات التجارية' } },
  { key: 'key_commodities', icon: '📦', label: { tr: 'Ticaret Malları', en: 'Commodities', ar: 'السلع' } },
  { key: 'trade_goods', icon: '🐪', label: { tr: 'İhracat Ürünleri', en: 'Trade Goods', ar: 'البضائع' } },
  { key: 'institutions', icon: '🏛️', label: { tr: 'Kurumlar', en: 'Institutions', ar: 'المؤسسات' } },
  { key: 'weights_measures', icon: '⚖️', label: { tr: 'Ölçüler', en: 'Weights & Measures', ar: 'الأوزان والمقاييس' } },
];

/* ─── PRACTICE TYPE COLORS ─── */
const TYPE_COLORS: Record<string, string> = {
  antlaşma: '#1d4ed8',
  yasaklanan: '#b91c1c',
  helal: '#15803d',
  vergi: '#7c3aed',
  kurum: '#a16207',
  ölçü: '#0891b2',
  default: '#6b7280',
};

/* ─── CARD COMPONENT ─── */
function EcoCard({ title, subtitle, badges, body, onMapClick }: {
  title: string;
  subtitle?: string;
  badges?: { text: string; color: string }[];
  body: string;
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
        {body.length > 200 ? `${body.slice(0, 200)}…` : body}
      </p>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function EconomyPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';
  const { localize } = useLocalizedField();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('markets');
  const [search, setSearch] = useState('');

  const { data: economy, isLoading } = useData<EconomyData>('economy');
  const { data: tradeGoods = [], isLoading: loadingGoods } = useData<TradeGood[]>('trade_goods');

  // Current tab items
  const items = useMemo(() => {
    if (activeTab === 'trade_goods') return tradeGoods;
    if (!economy) return [];
    return economy[activeTab] ?? [];
  }, [economy, activeTab, tradeGoods]);

  // Filtered items
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item: any) => {
      const name = typeof item.name === 'object' ? localize(item.name) : item.name;
      const desc = item.description || item.role || '';
      return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    });
  }, [items, search, localize]);

  if (isLoading || loadingGoods) {
    return (
      <div className="container-page">
        <div className="p-4">
          <GridSkeleton count={8} />
        </div>
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
          {lang === 'tr' ? '💰 Ekonomi' : lang === 'ar' ? '💰 الاقتصاد' : '💰 Economy'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {lang === 'tr'
            ? 'Siyer dönemi ekonomisi — pazarlar, para birimleri, ticaret uygulamaları'
            : lang === 'ar'
              ? 'اقتصاد عصر السيرة — الأسواق والعملات والممارسات التجارية'
              : 'Sira-era economy — markets, currencies, trade practices'}
        </p>
      </div>

      {/* Tab bar */}
      <div className="chips-scroll px-4 pb-3 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count = tab.key === 'trade_goods' ? tradeGoods.length : (economy?.[tab.key]?.length ?? 0);
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
            {activeTab === 'markets' &&
              (filtered as Market[]).map((m) => (
                <EcoCard
                  key={m.id}
                  title={localize(m.name)}
                  subtitle={m.period}
                  badges={[{ text: m.type, color: '#a16207' }]}
                  body={m.description}
                  onMapClick={m.lat && m.lng ? () => navigate(`/map?fly=${m.lat},${m.lng},10`) : undefined}
                />
              ))}

            {activeTab === 'currencies' &&
              (filtered as Currency[]).map((c) => (
                <EcoCard
                  key={c.id}
                  title={localize(c.name)}
                  subtitle={`${c.origin} · ${c.weight_g}g`}
                  badges={[{ text: c.metal, color: c.metal === 'altın' ? '#d4af37' : '#9ca3af' }]}
                  body={c.description}
                />
              ))}

            {activeTab === 'trade_practices' &&
              (filtered as TradePractice[]).map((tp) => (
                <EcoCard
                  key={tp.id}
                  title={localize(tp.name)}
                  subtitle={tp.quran_ref}
                  badges={[{
                    text: tp.type,
                    color: TYPE_COLORS[tp.type] || '#6b7280',
                  }]}
                  body={tp.description}
                />
              ))}

            {activeTab === 'key_commodities' &&
              (filtered as Commodity[]).map((c) => (
                <EcoCard
                  key={c.id}
                  title={localize(c.name)}
                  body={c.role}
                />
              ))}

            {activeTab === 'trade_goods' &&
              (filtered as TradeGood[]).map((tg) => (
                <EcoCard
                  key={tg.id}
                  title={localize(tg.name)}
                  subtitle={tg.origin}
                  badges={[{ text: tg.category, color: tg.category === 'koku' ? '#7c3aed' : tg.category === 'gıda' ? '#15803d' : tg.category === 'tekstil' ? '#d97706' : '#6b7280' }]}
                  body={tg.description}
                />
              ))}

            {activeTab === 'trade_goods' &&
              (filtered as TradeGood[]).map((tg) => (
                <EcoCard
                  key={tg.id}
                  title={localize(tg.name)}
                  subtitle={tg.origin}
                  badges={[{ text: tg.category, color: '#d97706' }]}
                  body={tg.description}
                />
              ))}

            {activeTab === 'institutions' &&
              (filtered as Institution[]).map((inst) => (
                <EcoCard
                  key={inst.id}
                  title={localize(inst.name)}
                  subtitle={inst.established}
                  badges={[{ text: inst.type, color: '#7c3aed' }]}
                  body={inst.description}
                />
              ))}

            {activeTab === 'weights_measures' &&
              (filtered as WeightMeasure[]).map((wm) => (
                <EcoCard
                  key={wm.id}
                  title={localize(wm.name)}
                  subtitle={wm.equivalent}
                  badges={[{ text: wm.type, color: '#0891b2' }]}
                  body={wm.description}
                />
              ))}
          </div>
        )}
      </div>

      {/* Stats footer */}
      {economy && (
        <div
          className="mx-4 mb-6 rounded-xl p-4 flex flex-wrap gap-4 justify-center"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {TABS.map((tab) => (
            <div key={tab.key} className="text-center">
              <span className="block text-lg font-bold" style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-display)' }}>
                {tab.key === 'trade_goods' ? tradeGoods.length : (economy[tab.key]?.length ?? 0)}
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
