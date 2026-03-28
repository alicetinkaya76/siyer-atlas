import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { useTranslation } from 'react-i18next';
import type { LocalizedText } from '@/types';

/* ─── Search result type ─── */
interface SearchResult {
  id: string;
  label: string;
  type: string;
  icon: string;
  url: string;
  subtitle?: string;
}

/* ─── Data shapes (minimal for search) ─── */
interface CompanionMin { id: string; name: LocalizedText; category?: string; }
interface BattleMin { battle_id: string; name: string; year_ce: number; type: string; }
interface LocationMin { id: string; name: LocalizedText; type: string; }
interface GeoItem { id: string; name: LocalizedText; type: string; }
interface GeoData { mountains?: GeoItem[]; valleys?: GeoItem[]; rivers_water?: GeoItem[]; deserts_plains?: GeoItem[]; mountain_passes?: GeoItem[]; ports_coasts?: GeoItem[]; islands?: GeoItem[]; }
interface LitData { poets?: Array<{ id: string; name: LocalizedText; period: string }>; }
interface RelData { religions?: Array<{ id: string; name: LocalizedText; type: string }>; idols?: Array<{ id: string; name: LocalizedText }>; }
interface EcoData { markets?: Array<{ id: string; name: LocalizedText }>; }

/* ─── NAV RESULTS (always available) ─── */
const NAV_ITEMS: SearchResult[] = [
  { id: 'nav-map', label: 'Harita / Map / الخريطة', type: 'nav', icon: '🗺️', url: '/map' },
  { id: 'nav-companions', label: 'Sahâbîler / Companions / الصحابة', type: 'nav', icon: '👤', url: '/companions' },
  { id: 'nav-battles', label: 'Savaşlar / Battles / الغزوات', type: 'nav', icon: '⚔️', url: '/battles' },
  { id: 'nav-museum', label: 'Dijital Müze / Museum / المتحف', type: 'nav', icon: '🏛️', url: '/museum' },
  { id: 'nav-quran', label: 'Kur\'ân / Quran / القرآن', type: 'nav', icon: '📖', url: '/quran/esbab' },
  { id: 'nav-network', label: 'İlişki Ağları / Networks / الشبكات', type: 'nav', icon: '🕸️', url: '/network' },
  { id: 'nav-prophet', label: 'Hz. Peygamber / Prophet / النبي ﷺ', type: 'nav', icon: '☪️', url: '/prophet' },
  { id: 'nav-audio', label: 'Radyo Tiyatrosu / Radio Drama / المسرح', type: 'nav', icon: '🎧', url: '/audio' },
  { id: 'nav-economy', label: 'Ekonomi / Economy / الاقتصاد', type: 'nav', icon: '💰', url: '/economy' },
  { id: 'nav-geography', label: 'Coğrafya / Geography / الجغرافيا', type: 'nav', icon: '🌍', url: '/geography' },
  { id: 'nav-literature', label: 'Edebiyat / Literature / الأدب', type: 'nav', icon: '📜', url: '/literature' },
  { id: 'nav-religions', label: 'Câhiliye İnançları / Pre-Islamic / الجاهلية', type: 'nav', icon: '🕌', url: '/religions' },
  { id: 'nav-timeline', label: 'Zaman Çizelgesi / Timeline / الخط الزمني', type: 'nav', icon: '⏳', url: '/timeline' },
  { id: 'nav-stats', label: 'İstatistikler / Statistics / الإحصائيات', type: 'nav', icon: '📊', url: '/stats' },
  { id: 'nav-about', label: 'Hakkında / About / حول', type: 'nav', icon: 'ℹ️', url: '/about' },
];

const TYPE_LABELS: Record<string, string> = {
  nav: '📂 Sayfa',
  companion: '👤 Sahâbî',
  battle: '⚔️ Savaş',
  location: '📍 Mekân',
  geography: '🌍 Coğrafya',
  poet: '📜 Şair',
  religion: '🕌 Din',
  idol: '🗿 Put',
  market: '💰 Pazar',
  museum: '🏛️ Müze',
};

/* ─── COMPONENT ─── */
export function CommandPalette() {
  const navigate = useNavigate();
  const { localize } = useLocalizedField();
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';

  const open = useAppStore((s) => s.commandPaletteOpen);
  const setOpen = useAppStore((s) => s.setCommandPaletteOpen);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch search data
  const { data: companions = [] } = useData<CompanionMin[]>('companions');
  const { data: timeline = [] } = useData<BattleMin[]>('timeline');
  const { data: locations = [] } = useData<LocationMin[]>('locations');
  const { data: geoData } = useData<GeoData>('geography');
  const { data: litData } = useData<LitData>('literature');
  const { data: relData } = useData<RelData>('pre_islamic_religions');
  const { data: ecoData } = useData<EcoData>('economy');

  // Build flat searchable list
  const allResults = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [...NAV_ITEMS];

    // Companions
    for (const c of companions) {
      results.push({
        id: `comp-${c.id}`,
        label: localize(c.name),
        type: 'companion',
        icon: '👤',
        url: `/companions/${c.id}`,
        subtitle: c.category?.replace(/_/g, ' '),
      });
    }

    // Battles
    for (const b of timeline) {
      results.push({
        id: `battle-${b.battle_id}`,
        label: b.name,
        type: 'battle',
        icon: '⚔️',
        url: `/battles/${b.battle_id}`,
        subtitle: `${b.year_ce} CE · ${b.type}`,
      });
    }

    // Locations
    for (const l of locations) {
      results.push({
        id: `loc-${l.id}`,
        label: localize(l.name),
        type: 'location',
        icon: '📍',
        url: `/map?fly=${(l as any).lat},${(l as any).lng},12`,
        subtitle: l.type,
      });
    }

    // Geography
    if (geoData) {
      const GEO_KEYS = ['mountains', 'valleys', 'rivers_water', 'deserts_plains', 'mountain_passes', 'ports_coasts', 'islands'] as const;
      for (const key of GEO_KEYS) {
        const arr = geoData[key];
        if (Array.isArray(arr)) {
          for (const g of arr) {
            results.push({
              id: `geo-${g.id}`,
              label: localize(g.name),
              type: 'geography',
              icon: '🌍',
              url: `/map?fly=${(g as any).lat},${(g as any).lng},12`,
              subtitle: key.replace(/_/g, ' '),
            });
          }
        }
      }
    }

    // Poets
    if (litData?.poets) {
      for (const p of litData.poets) {
        results.push({
          id: `poet-${p.id}`,
          label: localize(p.name),
          type: 'poet',
          icon: '📜',
          url: '/literature',
          subtitle: p.period,
        });
      }
    }

    // Religions & Idols
    if (relData?.religions) {
      for (const r of relData.religions) {
        results.push({
          id: `rel-${r.id}`,
          label: localize(r.name),
          type: 'religion',
          icon: '🕌',
          url: '/religions',
          subtitle: r.type,
        });
      }
    }
    if (relData?.idols) {
      for (const idol of relData.idols) {
        results.push({
          id: `idol-${idol.id}`,
          label: localize(idol.name),
          type: 'idol',
          icon: '🗿',
          url: '/religions',
        });
      }
    }

    // Markets
    if (ecoData?.markets) {
      for (const m of ecoData.markets) {
        results.push({
          id: `market-${m.id}`,
          label: localize(m.name),
          type: 'market',
          icon: '💰',
          url: '/economy',
        });
      }
    }

    return results;
  }, [companions, timeline, locations, geoData, litData, relData, ecoData, localize]);

  // Filter results
  const filtered = useMemo(() => {
    if (!query.trim()) return NAV_ITEMS.slice(0, 8);
    const q = query.toLowerCase();
    const scored = allResults
      .map((r) => {
        const label = r.label.toLowerCase();
        const sub = (r.subtitle || '').toLowerCase();
        let score = 0;
        if (label === q) score = 100;
        else if (label.startsWith(q)) score = 80;
        else if (label.includes(q)) score = 60;
        else if (sub.includes(q)) score = 40;
        else return null;
        // Boost nav items slightly
        if (r.type === 'nav') score += 5;
        return { ...r, score };
      })
      .filter(Boolean) as (SearchResult & { score: number })[];

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 12);
  }, [query, allResults]);

  // Reset selection on filter change
  useEffect(() => { setSelectedIndex(0); }, [filtered]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  // Navigate
  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false);
    navigate(result.url);
  }, [navigate, setOpen]);

  // Keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]!);
    }
  };

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9999]"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            className="fixed left-1/2 top-[15%] z-[10000] w-[92%] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl shadow-2xl"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--border-color)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'tr' ? 'Sahâbî, savaş, mekân, sayfa ara…' : lang === 'ar' ? 'ابحث عن صحابي، غزوة، مكان، صفحة…' : 'Search companions, battles, places, pages…'}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <kbd
                className="hidden sm:inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', border: '1px solid var(--border-color)' }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <span className="text-2xl">🔍</span>
                  <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {lang === 'tr' ? 'Sonuç bulunamadı' : lang === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
                  </p>
                </div>
              ) : (
                filtered.map((result, i) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-start transition-colors"
                    style={{
                      background: i === selectedIndex ? 'rgba(212,175,55,0.08)' : 'transparent',
                      borderInlineStart: i === selectedIndex ? '2px solid var(--text-accent)' : '2px solid transparent',
                    }}
                  >
                    <span className="text-lg shrink-0">{result.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {result.label}
                      </p>
                      {result.subtitle && (
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>
                      {TYPE_LABELS[result.type] ?? result.type}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t px-4 py-2" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                {filtered.length} {lang === 'tr' ? 'sonuç' : lang === 'ar' ? 'نتيجة' : 'results'}
              </span>
              <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                <span>↑↓ {lang === 'tr' ? 'gezin' : 'navigate'}</span>
                <span>↵ {lang === 'tr' ? 'seç' : 'select'}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
