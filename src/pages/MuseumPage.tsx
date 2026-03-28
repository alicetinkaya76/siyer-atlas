import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { MUSEUM_CATEGORIES, getCategoryColor, getCategoryIcon } from '@/config/museum';
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

export default function MuseumPage() {
  const { category: catParam } = useParams<{ category?: string }>();
  const { localize, lang } = useLocalizedField();
  const [search, setSearch] = useState('');
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);

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

  /* ─── Category Grid ─── */
  if (!activeCat) {
    return (
      <div className="page-enter flex flex-col gap-6 p-4 pb-24 sm:p-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {lang === 'en' ? 'Digital Museum' : 'Dijital Müze'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {masterIndex?.total_items ?? 260} {lang === 'en' ? 'items across' : 'öğe,'} {MUSEUM_CATEGORIES.length} {lang === 'en' ? 'categories' : 'kategori'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MUSEUM_CATEGORIES.map((cat) => (
              <Link key={cat.key} to={`/museum/${cat.key}`} className="card group flex flex-col gap-3 p-5 transition-all hover:translate-y-[-2px]" style={{ textDecoration: 'none', borderInlineStart: `4px solid ${cat.color}` }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}25` }}>{cat.icon}</span>
                  <div>
                    <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(cat.label)}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{cat.count} {lang === 'en' ? 'items' : 'öğe'}</p>
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Category Item List ─── */
  return (
    <div className="page-enter flex flex-col gap-4 p-4 pb-24 sm:p-6">
      <div className="mx-auto w-full max-w-6xl">
        <Link to="/museum" className="mb-3 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>← {lang === 'en' ? 'All Categories' : 'Tüm Kategoriler'}</Link>

        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: `${catMeta?.color ?? '#666'}12`, border: `1px solid ${catMeta?.color ?? '#666'}25` }}>
            {catMeta?.icon ?? '🏛️'}
          </span>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{catMeta ? localize(catMeta.label) : activeCat}</h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{filteredItems.length} / {catData?.total_items ?? '…'} {lang === 'en' ? 'items' : 'öğe'}</p>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input type="text" placeholder={lang === 'en' ? 'Search items…' : 'Öğe ara…'} value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setSelectedSubcat(null)} className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
              style={{ background: !selectedSubcat ? `${catMeta?.color ?? '#666'}18` : 'var(--bg-tertiary)', color: !selectedSubcat ? catMeta?.color ?? 'var(--text-primary)' : 'var(--text-tertiary)', border: `1px solid ${!selectedSubcat ? `${catMeta?.color ?? '#666'}40` : 'transparent'}` }}>
              {lang === 'en' ? 'All' : 'Tümü'}
            </button>
            {subcategories.map((sc) => (
              <button key={sc} onClick={() => setSelectedSubcat(sc === selectedSubcat ? null : sc)} className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{ background: selectedSubcat === sc ? `${catMeta?.color ?? '#666'}18` : 'var(--bg-tertiary)', color: selectedSubcat === sc ? catMeta?.color ?? 'var(--text-primary)' : 'var(--text-tertiary)', border: `1px solid ${selectedSubcat === sc ? `${catMeta?.color ?? '#666'}40` : 'transparent'}` }}>
                {SUBCAT_ICONS[sc] ?? '•'} {sc.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {loadingCat && <ListSkeleton count={6} />}

        {!loadingCat && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Link key={item.id} to={`/museum/${activeCat}/${item.id}`} className="card flex flex-col gap-2 p-4 transition-all hover:translate-y-[-1px]" style={{ textDecoration: 'none' }}>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: `${getCategoryColor(activeCat)}10`, border: `1px solid ${getCategoryColor(activeCat)}20` }}>
                    {SUBCAT_ICONS[item.subcategory] ?? getCategoryIcon(activeCat)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{localize(item.name)}</h3>
                    <p className="mt-0.5 text-xs capitalize" style={{ color: 'var(--text-tertiary)' }}>
                      {item.subcategory.replace(/_/g, ' ')}{item.period ? ` · ${item.period}` : ''}
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {localize(item.description).slice(0, 120)}{localize(item.description).length > 120 ? '…' : ''}
                </p>
              </Link>
            ))}
          </div>
        )}

        {!loadingCat && filteredItems.length === 0 && (
          <EmptyState type="no-filter" />
        )}
      </div>
    </div>
  );
}
