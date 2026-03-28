import { useState, useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '@/components/common/Spinner';
import { FoodSVG } from '@/components/museum/FoodSVG';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface FoodItem {
  id: string;
  name: LocalizedText;
  icon: string;
  color: string;
  category: string;
  mizac: string;
  paired_with?: string;
  pairing_reason?: LocalizedText;
  description: LocalizedText;
  hadith_refs: string[];
  quran_refs?: string[];
  preparation?: LocalizedText;
  location?: { lat: number; lng: number; label: LocalizedText };
  benefits: string[];
  ingredients?: string[];
  spiritual_context?: LocalizedText;
}

interface MizacPair {
  hot: string;
  cold: string;
  principle: LocalizedText;
}

interface MesaData {
  title: LocalizedText;
  description: LocalizedText;
  video_source: string;
  foods: FoodItem[];
  mizac_pairs: MizacPair[];
  medine_kitchen: {
    title: LocalizedText;
    items: string[];
    description: LocalizedText;
  };
}

/* ─── Mizac Colors ─── */
const MIZAC_COLORS: Record<string, { bg: string; color: string; label: { tr: string; en: string; ar: string } }> = {
  sıcak: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', label: { tr: 'Sıcak', en: 'Hot', ar: 'حار' } },
  soğuk: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb', label: { tr: 'Soğuk', en: 'Cold', ar: 'بارد' } },
  dengeli: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', label: { tr: 'Dengeli', en: 'Balanced', ar: 'معتدل' } },
};

/* ─── Category Labels ─── */
const CAT_LABELS: Record<string, { tr: string; en: string; ar: string }> = {
  meyve: { tr: 'Meyve', en: 'Fruit', ar: 'فاكهة' },
  sebze: { tr: 'Sebze', en: 'Vegetable', ar: 'خضار' },
  yemek: { tr: 'Yemek', en: 'Dish', ar: 'طبق' },
  çorba: { tr: 'Çorba', en: 'Soup', ar: 'حساء' },
  gıda: { tr: 'Gıda', en: 'Food', ar: 'غذاء' },
  içecek: { tr: 'İçecek', en: 'Beverage', ar: 'مشروب' },
  medine_mutfagi: { tr: 'Medine Mutfağı', en: 'Medinan Kitchen', ar: 'مطبخ المدينة' },
};

/* ─── CIRCULAR TABLE ─── */
function CircularTable({ foods, selectedId, onSelect }: {
  foods: FoodItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const cx = 180, cy = 180, r = 140;

  return (
    <div className="relative mx-auto" style={{ width: 360, height: 360 }}>
      {/* Center ornament */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-full"
        style={{
          width: 100, height: 100,
          background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
          border: '2px solid rgba(212,175,55,0.3)',
        }}
      >
        <span className="text-2xl">☪</span>
        <span className="text-[9px] font-bold mt-0.5" style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-display)' }}>
          مائدة نبوية
        </span>
      </div>

      {/* Circular ring */}
      <svg className="absolute inset-0" width={360} height={360}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" opacity={0.5} />
      </svg>

      {/* Food items around the circle */}
      {foods.map((food, i) => {
        const angle = (2 * Math.PI * i) / foods.length - Math.PI / 2;
        const x = cx + r * Math.cos(angle) - 24;
        const y = cy + r * Math.sin(angle) - 24;
        const isSelected = selectedId === food.id;

        return (
          <motion.button
            key={food.id}
            type="button"
            onClick={() => onSelect(food.id)}
            className="absolute flex flex-col items-center justify-center rounded-2xl overflow-hidden transition-all"
            style={{
              left: x, top: y, width: 52, height: 52,
              background: isSelected ? `${food.color}15` : 'var(--card-bg)',
              border: isSelected ? `2px solid ${food.color}` : '1px solid var(--glass-border)',
              boxShadow: isSelected ? `0 0 16px ${food.color}30` : 'var(--shadow-sm)',
              zIndex: isSelected ? 10 : 1,
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.95 }}
            title={food.name.tr}
          >
            <FoodSVG foodId={food.id} size={48} />
          </motion.button>
        );
      })}

      {/* Connection lines for paired items */}
      {foods.map((food) => {
        if (!food.paired_with || selectedId !== food.id) return null;
        const pairedFood = foods.find((f) => f.id === food.paired_with);
        if (!pairedFood) return null;

        const i1 = foods.indexOf(food);
        const i2 = foods.indexOf(pairedFood);
        const a1 = (2 * Math.PI * i1) / foods.length - Math.PI / 2;
        const a2 = (2 * Math.PI * i2) / foods.length - Math.PI / 2;
        const x1 = cx + r * Math.cos(a1);
        const y1 = cy + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2);
        const y2 = cy + r * Math.sin(a2);

        return (
          <svg key={`pair-${food.id}`} className="absolute inset-0 pointer-events-none" width={360} height={360}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--text-accent)" strokeWidth="2" strokeDasharray="6 4" opacity={0.6}
            />
            <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={12} fill="var(--text-accent)" opacity={0.15} />
            <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fill="var(--text-accent)" fontSize="10" fontWeight="bold">⚖</text>
          </svg>
        );
      })}
    </div>
  );
}

/* ─── MIZAC BALANCE CARD ─── */
function MizacBalanceCard({ food, pairedFood, reason, lang }: {
  food: FoodItem;
  pairedFood: FoodItem;
  reason: string;
  lang: 'tr' | 'en' | 'ar';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(220,38,38,0.05), rgba(37,99,235,0.05))',
        border: '1px solid rgba(212,175,55,0.2)',
      }}
    >
      <h4 className="text-xs font-bold mb-3 text-center" style={{ color: 'var(--text-accent)', fontFamily: 'var(--font-display)' }}>
        ⚖️ {lang === 'tr' ? 'Mizaç Dengesi' : lang === 'ar' ? 'التوازن المزاجي' : 'Temperament Balance'}
      </h4>
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">{food.icon}</span>
          {(() => { const m = MIZAC_COLORS[food.mizac]; return (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={m ? { background: m.bg, color: m.color } : {}}>
              {m?.label[lang] ?? food.mizac}
            </span>
          ); })()}
        </div>
        <span className="text-xl" style={{ color: 'var(--text-accent)' }}>+</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">{pairedFood.icon}</span>
          {(() => { const m = MIZAC_COLORS[pairedFood.mizac]; return (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={m ? { background: m.bg, color: m.color } : {}}>
              {m?.label[lang] ?? pairedFood.mizac}
            </span>
          ); })()}
        </div>
        <span className="text-xl">→</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl">⚖️</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
            {lang === 'tr' ? 'Denge' : lang === 'ar' ? 'توازن' : 'Balance'}
          </span>
        </div>
      </div>
      <p className="text-xs text-center mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {reason}
      </p>
    </motion.div>
  );
}

/* ─── INFO PANEL ─── */
function InfoPanel({ food, allFoods, lang, localize, onMapClick }: {
  food: FoodItem;
  allFoods: FoodItem[];
  lang: 'tr' | 'en' | 'ar';
  localize: (field: LocalizedText | undefined | null) => string;
  onMapClick?: (lat: number, lng: number) => void;
}) {
  const pairedFood = food.paired_with ? allFoods.find((f) => f.id === food.paired_with) : null;
  const mizac = MIZAC_COLORS[food.mizac];
  const catLabel = CAT_LABELS[food.category]?.[lang] ?? food.category;

  return (
    <motion.div
      key={food.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3"
    >
      {/* Hero SVG */}
      <div className="flex justify-center mb-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${food.color}20`, boxShadow: `0 4px 24px ${food.color}10` }}
        >
          <FoodSVG foodId={food.id} size={220} />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{ background: `${food.color}15`, border: `2px solid ${food.color}40` }}
        >
          {food.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {localize(food.name)}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: `${food.color}12`, color: food.color, border: `1px solid ${food.color}25` }}>
              {catLabel}
            </span>
            {mizac && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: mizac.bg, color: mizac.color }}>
                {mizac.label[lang]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mizac Balance */}
      {pairedFood && food.pairing_reason && (
        <MizacBalanceCard
          food={food}
          pairedFood={pairedFood}
          reason={localize(food.pairing_reason)}
          lang={lang}
        />
      )}

      {/* Description */}
      <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {localize(food.description)}
        </p>
      </div>

      {/* Spiritual Context (Telbine etc.) */}
      {food.spiritual_context && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <h4 className="text-xs font-bold mb-2" style={{ color: 'var(--text-accent)' }}>
            ✨ {lang === 'tr' ? 'Manevî Boyut' : lang === 'ar' ? 'البعد الروحي' : 'Spiritual Dimension'}
          </h4>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {localize(food.spiritual_context)}
          </p>
        </div>
      )}

      {/* Hadith References */}
      {food.hadith_refs.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
          <h4 className="text-xs font-bold mb-2" style={{ color: 'var(--text-accent)' }}>
            📜 {lang === 'tr' ? 'Hadis-i Şerifler' : lang === 'ar' ? 'الأحاديث الشريفة' : 'Hadith References'}
          </h4>
          <div className="flex flex-col gap-2">
            {food.hadith_refs.map((ref, i) => (
              <p key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {ref.startsWith('"') ? (
                  <em style={{ color: 'var(--text-primary)' }}>{ref}</em>
                ) : (
                  <span className="opacity-70">{ref}</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Quran References */}
      {food.quran_refs && food.quran_refs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {food.quran_refs.map((ref, i) => (
            <span key={i} className="px-2 py-1 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(21,128,61,0.08)', color: '#15803d', border: '1px solid rgba(21,128,61,0.15)' }}>
              📖 {ref}
            </span>
          ))}
        </div>
      )}

      {/* Ingredients */}
      {food.ingredients && food.ingredients.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
          <h4 className="text-xs font-bold mb-2" style={{ color: 'var(--text-accent)' }}>
            🧾 {lang === 'tr' ? 'Malzemeler' : lang === 'ar' ? 'المكونات' : 'Ingredients'}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {food.ingredients.map((ing, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preparation */}
      {food.preparation && (
        <div className="rounded-xl p-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
          <h4 className="text-xs font-bold mb-2" style={{ color: 'var(--text-accent)' }}>
            👨‍🍳 {lang === 'tr' ? 'Hazırlanışı' : lang === 'ar' ? 'طريقة التحضير' : 'Preparation'}
          </h4>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {localize(food.preparation)}
          </p>
        </div>
      )}

      {/* Benefits */}
      {food.benefits.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {food.benefits.map((b, i) => (
            <span key={i} className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.15)' }}>
              ✦ {b}
            </span>
          ))}
        </div>
      )}

      {/* Map Link */}
      {food.location && onMapClick && (
        <button
          type="button"
          onClick={() => onMapClick(food.location!.lat, food.location!.lng)}
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition-all hover:scale-[1.01]"
          style={{ background: 'rgba(212,175,55,0.08)', color: 'var(--text-accent)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          🗺️ {localize(food.location.label)}
          <span className="ml-auto opacity-60">→</span>
        </button>
      )}
    </motion.div>
  );
}

/* ─── MAIN PAGE ─── */
export default function MesaNebeviPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';
  const { localize } = useLocalizedField();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const { data: mesa, isLoading } = useData<MesaData>('mesa_nebevi');

  const foods = useMemo(() => mesa?.foods ?? [], [mesa]);
  const selectedFood = useMemo(() => foods.find((f) => f.id === selectedId) ?? null, [foods, selectedId]);

  const categories = useMemo(() => {
    const cats = new Set(foods.map((f) => f.category));
    return ['all', ...cats];
  }, [foods]);

  const filteredFoods = useMemo(() => {
    if (filter === 'all') return foods;
    return foods.filter((f) => f.category === filter);
  }, [foods, filter]);

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="container-page">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1
          className="text-xl font-bold mb-1"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          🍽️ {localize(mesa?.title)}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {localize(mesa?.description)}
        </p>
      </div>

      {/* Category Chips */}
      <div className="chips-scroll px-4 pb-3 flex gap-2 overflow-x-auto">
        {categories.map((cat) => {
          const active = filter === cat;
          const label = cat === 'all'
            ? (lang === 'tr' ? 'Tümü' : lang === 'ar' ? 'الكل' : 'All')
            : (CAT_LABELS[cat]?.[lang] ?? cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className="flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
              style={{
                background: active ? 'rgba(212,175,55,0.15)' : 'var(--card-bg)',
                color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
                border: active ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--glass-border)',
              }}
            >
              {label} ({cat === 'all' ? foods.length : foods.filter((f) => f.category === cat).length})
            </button>
          );
        })}
      </div>

      {/* Main Layout: Table + Panel */}
      <div className="px-4 pb-8 flex flex-col lg:flex-row gap-6">
        {/* Left: Circular Table */}
        <div className="flex flex-col items-center gap-4 lg:w-[400px] shrink-0">
          <CircularTable
            foods={filteredFoods}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
          />

          {/* Quick list under table (mobile fallback + desktop complement) */}
          <div className="w-full grid grid-cols-2 gap-2">
            {filteredFoods.map((food) => (
              <button
                key={food.id}
                type="button"
                onClick={() => setSelectedId(selectedId === food.id ? null : food.id)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-start transition-all"
                style={{
                  background: selectedId === food.id ? `${food.color}12` : 'var(--card-bg)',
                  border: selectedId === food.id ? `1px solid ${food.color}40` : '1px solid var(--glass-border)',
                }}
              >
              <span className="shrink-0 rounded-lg overflow-hidden" style={{ width: 36, height: 36 }}>
                <FoodSVG foodId={food.id} size={36} />
              </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {localize(food.name)}
                  </p>
                  <p className="text-[10px]" style={{ color: MIZAC_COLORS[food.mizac]?.color ?? 'var(--text-tertiary)' }}>
                    {MIZAC_COLORS[food.mizac]?.label[lang] ?? food.mizac}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Source credit */}
          <div className="w-full rounded-xl p-3 text-center" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              📹 {mesa?.video_source}
            </p>
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {selectedFood ? (
              <InfoPanel
                food={selectedFood}
                allFoods={foods}
                lang={lang}
                localize={localize}
                onMapClick={(lat, lng) => navigate(`/map?fly=${lat},${lng},14`)}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-16 rounded-2xl"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
              >
                <span className="text-5xl">🍽️</span>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
                  {lang === 'tr' ? 'Bir yiyecek seçin' : lang === 'ar' ? 'اختر طعاماً' : 'Select a food item'}
                </p>
                <p className="text-xs max-w-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                  {lang === 'tr'
                    ? 'Soldaki tablodan veya listeden bir yiyecek seçerek hadis referansları, mizaç bilgisi ve tarihî bağlamı keşfedin.'
                    : lang === 'ar'
                      ? 'اختر طعاماً من الجدول أو القائمة لاكتشاف مراجع الأحاديث والمزاج والسياق التاريخي.'
                      : 'Select a food from the table or list to discover hadith references, temperament info, and historical context.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
