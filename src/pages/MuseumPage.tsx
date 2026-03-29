import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { MUSEUM_CATEGORIES, getCategoryColor, getCategoryIcon } from '@/config/museum';
import { getCategorySvg, countCategorySvgs, getMuseumSvg } from '@/config/museumSvgMap';
import { GridSkeleton, ListSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface MasterIndex {
  version: string;
  total_items: number;
  categories: Record<string, { count: number; label: string }>;
  items: Array<{ id: string; name: LocalizedText; category: string }>;
}

interface CategoryData {
  category: string;
  total_items: number;
  items: CategoryItem[];
}

interface CategoryItem {
  id: string;
  subcategory: string;
  name: LocalizedText;
  type?: LocalizedText;
  period?: string;
  description: LocalizedText;
  visual_type?: string;
  tags?: string[];
}

const SUBCAT_ICONS: Record<string, string> = {
  swords: '🗡️', spears_lances: '🔱', armor: '🛡️', bows_arrows: '🏹', shields: '🛡️',
  siege_equipment: '🏰', helmets: '⛑️', daggers: '🔪',
  houses: '🏠', markets_buildings: '🏪', mosques: '🕌', sacred_structures: '🕋',
  camps_tents: '⛺', fortifications: '🏰',
  cooking_utensils: '🍳', pottery_vessels: '🏺', food_agriculture: '🌾', textiles_clothing: '👘',
  coins_currency: '🪙', weights_measures: '⚖️', writing_tools: '✍️', trade_goods: '📦', household_misc: '🏠',
  sacred_sites: '🕋', valleys_plains: '🏜️', caves_mountains: '⛰️', wells_springs: '💧',
  battlefields: '⚔️', deserts_landmarks: '🏜️', routes_roads: '🛤️', ports_coasts: '⚓',
  herbal: '🌿', nebevi_tedavi: '🩺', therapeutic: '💊', nebevi_gida: '🍯', hygiene: '🧼', surgical: '🔬', alet: '🔧',
  mushaf: '📜', sahife: '📄', hadith_collection: '📚', mektup: '✉️', treaty: '📃', vesika: '📋',
  rayah: '🏴', liwaa: '🚩', sefer_sancagi: '⚑', kabile_sancagi: '🏳️',
};

/* ─── SVG Indicator Badge ─── */
function SvgIndicator({ color }: { color: string }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium"
      style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m9 8 6 4-6 4z" />
      </svg>
      SVG
    </span>
  );
}

export default function MuseumPage() {
  const { category: catParam } = useParams<{ category?: string }>();
  const { localize, lang } = useLocalizedField();
  const [search, setSearch] = useState('');
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: masterIndex, isLoading: loadingMaster } = useData<MasterIndex>('museum_master_index');
  const activeCat = catParam || null;
  const { data: catData, isLoading: loadingCat } = useData<CategoryData>(
    activeCat ? `museum/museum_${activeCat}` : '__none__',
    !!activeCat,
  );
  const catMeta = activeCat ? MUSEUM_CATEGORIES.find((c) => c.key === activeCat) : null;

  const filteredItems = useMemo(() => {
    if (!catData?.items) return [];
    let items = catData.items;
    if (selectedSubcat) items = items.filter((it) => it.subcategory === selectedSubcat);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((it) => localize(it.name).toLowerCase().includes(q) || localize(it.description).toLowerCase().includes(q));
    }
    return items;
  }, [catData, selectedSubcat, search, localize]);

  const subcategories = useMemo(() => {
    if (!catData?.items) return [];
    return Array.from(new Set(catData.items.map((it) => it.subcategory))).sort();
  }, [catData]);

  if (loadingMaster) return <div className="p-4 pb-24 sm:p-6"><div className="mx-auto w-full max-w-7xl"><GridSkeleton count={6} /></div></div>;

  /* ─── Category Grid (Landing) ─── */
  if (!activeCat) {
    return (
      <div className="page-enter flex flex-col gap-6 p-4 pb-24 sm:p-6">
        <div className="mx-auto w-full max-w-6xl">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-6h6v6" />
                <path d="M10 10h4" />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {lang === 'ar' ? 'المتحف الرقمي' : lang === 'en' ? 'Digital Museum' : 'Dijital Müze'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {masterIndex?.total_items ?? 260} {lang === 'ar' ? 'قطعة في' : lang === 'en' ? 'items across' : 'öğe,'} {MUSEUM_CATEGORIES.length} {lang === 'ar' ? 'أقسام' : lang === 'en' ? 'categories' : 'kategori'}
              </p>
            </div>
          </div>

          {/* Category Cards with SVG Preview */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MUSEUM_CATEGORIES.map((cat) => {
              const catSvg = getCategorySvg(cat.key);
              const svgCount = countCategorySvgs(cat.subcategories);

              return (
                <Link
                  key={cat.key}
                  to={`/museum/${cat.key}`}
                  className="card group flex flex-col overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg"
                  style={{ textDecoration: 'none', borderInlineStart: `4px solid ${cat.color}` }}
                >
                  {/* SVG Preview Banner */}
                  {catSvg ? (
                    <div className="relative overflow-hidden" style={{ height: 140, background: '#FAF8F3' }}>
                      <img
                        src={catSvg.src}
                        alt={localize(catSvg.caption)}
                        className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        draggable={false}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-8" style={{ background: 'linear-gradient(transparent, var(--bg-primary))' }} />
                      {svgCount > 0 && (
                        <span
                          className="absolute top-2 right-2 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: 'rgba(26,26,46,0.7)', backdropFilter: 'blur(6px)', color: '#fff' }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="m9 8 6 4-6 4z" />
                          </svg>
                          {svgCount} SVG
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center" style={{ height: 100, background: 'var(--bg-tertiary)' }}>
                      <span className="text-4xl opacity-30">{cat.icon}</span>
                    </div>
                  )}

                  {/* Card Body */}
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: `${cat.color}10`, border: `1px solid ${cat.color}20` }}>
                        {cat.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(cat.label)}</h3>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {cat.count} {lang === 'ar' ? 'قطعة' : lang === 'en' ? 'items' : 'öğe'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cat.subcategories.slice(0, 4).map((sc) => (
                        <span key={sc} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                          {SUBCAT_ICONS[sc] ?? '•'} {sc.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {cat.subcategories.length > 4 && <span className="text-[10px] px-1" style={{ color: 'var(--text-tertiary)' }}>+{cat.subcategories.length - 4}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Category Item List ─── */
  const catColor = catMeta?.color ?? '#666';

  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        <Link to="/museum" className="mb-3 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>
          ← {lang === 'ar' ? 'جميع الأقسام' : lang === 'en' ? 'All Categories' : 'Tüm Kategoriler'}
        </Link>

        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: `${catColor}10`, border: `1px solid ${catColor}20` }}>
            {catMeta?.icon ?? '🏛️'}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{catMeta ? localize(catMeta.label) : activeCat}</h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{filteredItems.length} / {catData?.total_items ?? '…'} {lang === 'ar' ? 'قطعة' : lang === 'en' ? 'items' : 'öğe'}</p>
          </div>
        </div>

        {/* Search + View Toggle */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input type="text" placeholder={lang === 'ar' ? 'بحث...' : lang === 'en' ? 'Search items…' : 'Öğe ara…'} value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
          <div className="flex rounded-lg p-0.5" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setViewMode('grid')} className="flex items-center rounded-md px-2.5 py-1.5 transition-all"
              style={{ background: viewMode === 'grid' ? 'var(--bg-primary)' : 'transparent', color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)', boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </button>
            <button onClick={() => setViewMode('list')} className="flex items-center rounded-md px-2.5 py-1.5 transition-all"
              style={{ background: viewMode === 'list' ? 'var(--bg-primary)' : 'transparent', color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)', boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
            </button>
          </div>
        </div>

        {/* Subcategory Filter */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button onClick={() => setSelectedSubcat(null)} className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
            style={{ background: !selectedSubcat ? `${catColor}15` : 'var(--bg-tertiary)', color: !selectedSubcat ? catColor : 'var(--text-tertiary)', border: `1px solid ${!selectedSubcat ? `${catColor}35` : 'transparent'}` }}>
            {lang === 'ar' ? 'الكل' : lang === 'en' ? 'All' : 'Tümü'}
          </button>
          {subcategories.map((sc) => (
            <button key={sc} onClick={() => setSelectedSubcat(sc === selectedSubcat ? null : sc)} className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
              style={{ background: selectedSubcat === sc ? `${catColor}15` : 'var(--bg-tertiary)', color: selectedSubcat === sc ? catColor : 'var(--text-tertiary)', border: `1px solid ${selectedSubcat === sc ? `${catColor}35` : 'transparent'}` }}>
              {SUBCAT_ICONS[sc] ?? '•'} {sc.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loadingCat && <ListSkeleton count={6} />}

        {/* Grid View */}
        {!loadingCat && viewMode === 'grid' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const svgEntry = getMuseumSvg(item.id, item.subcategory);
              const hasSvg = !!svgEntry;
              return (
                <Link key={item.id} to={`/museum/${activeCat}/${item.id}`} className="card group flex flex-col overflow-hidden transition-all hover:translate-y-[-1px]" style={{ textDecoration: 'none' }}>
                  {hasSvg && (
                    <div className="relative overflow-hidden" style={{ height: 100, background: '#FAF8F3' }}>
                      <img src={svgEntry.src} alt={localize(item.name)} className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" loading="lazy" draggable={false} />
                      <div className="absolute inset-x-0 bottom-0 h-4" style={{ background: 'linear-gradient(transparent, var(--bg-primary))' }} />
                    </div>
                  )}
                  <div className="flex flex-col gap-2 p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${getCategoryColor(activeCat)}10`, border: `1px solid ${getCategoryColor(activeCat)}20` }}>
                        {SUBCAT_ICONS[item.subcategory] ?? getCategoryIcon(activeCat)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(item.name)}</h3>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <p className="text-xs capitalize" style={{ color: 'var(--text-tertiary)' }}>{item.subcategory.replace(/_/g, ' ')}{item.period ? ` · ${item.period}` : ''}</p>
                          {hasSvg && <SvgIndicator color={catColor} />}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {localize(item.description).slice(0, 120)}{localize(item.description).length > 120 ? '…' : ''}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* List View */}
        {!loadingCat && viewMode === 'list' && (
          <div className="flex flex-col gap-2">
            {filteredItems.map((item) => {
              const svgEntry = getMuseumSvg(item.id, item.subcategory);
              const hasSvg = !!svgEntry;
              return (
                <Link key={item.id} to={`/museum/${activeCat}/${item.id}`} className="card flex items-center gap-3 p-3 transition-all hover:translate-x-1" style={{ textDecoration: 'none' }}>
                  {hasSvg ? (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg" style={{ background: '#FAF8F3', border: '1px solid var(--border-color)' }}>
                      <img src={svgEntry.src} alt="" className="h-full w-full object-contain p-1" loading="lazy" draggable={false} />
                    </div>
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${catColor}08`, border: `1px solid ${catColor}15` }}>
                      {SUBCAT_ICONS[item.subcategory] ?? getCategoryIcon(activeCat)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(item.name)}</h3>
                    <p className="mt-0.5 text-xs capitalize" style={{ color: 'var(--text-tertiary)' }}>{item.subcategory.replace(/_/g, ' ')}{item.period ? ` · ${item.period}` : ''}</p>
                    <p className="mt-1 text-xs leading-relaxed line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{localize(item.description).slice(0, 100)}{localize(item.description).length > 100 ? '…' : ''}</p>
                  </div>
                  {hasSvg && <SvgIndicator color={catColor} />}
                  <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5"><path d="m9 18 6-6-6-6" /></svg>
                </Link>
              );
            })}
          </div>
        )}

        {!loadingCat && filteredItems.length === 0 && <EmptyState type="no-filter" />}
      </div>
    </div>
  );
}
