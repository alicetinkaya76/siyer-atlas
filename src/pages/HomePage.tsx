import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { DATA_COUNTS, FADE_IN, STAGGER_CHILDREN } from '@/config/constants';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface TimelineEntry { battle_id: string; name: string; year_ce: number; date_hijri: string; type: string; tier: number; lat: number; lng: number; result: string; }
interface Companion { id: string; name: LocalizedText; category?: string; death_ce?: number; }

/* ─── EXPLORE GRID — Cohesive Islamic palette ─── */
const EXPLORE = [
  { path: '/map', svgIcon: 'map', grad: 'linear-gradient(135deg, #1a1a2e 0%, #2a3562 100%)', count: DATA_COUNTS.locations, tr: 'İnteraktif Harita', en: 'Interactive Map', ar: 'الخريطة التفاعلية', dTr: '9 katman — savaşlar, mekânlar, kabileler, coğrafya', dEn: '9 layers — battles, locations, tribes, geography', dAr: '٩ طبقات — المعارك والأماكن والقبائل والجغرافيا', span: 'sm:col-span-2' },
  { path: '/companions', svgIcon: 'users', grad: 'linear-gradient(135deg, #2d6a4f 0%, #40916c 100%)', count: DATA_COUNTS.companions, tr: 'Sahâbîler', en: 'Companions', ar: 'الصحابة', dTr: 'Biyografi, ilişki ağı, doğum-vefat haritası', dEn: 'Biography, networks, birth-death map', dAr: 'السيرة الذاتية والشبكات والخريطة' },
  { path: '/battles', svgIcon: 'swords', grad: 'linear-gradient(135deg, #7a6124 0%, #a08030 100%)', count: DATA_COUNTS.battles, tr: 'Gazveler ve Seriyyeler', en: 'Battles & Expeditions', ar: 'الغزوات والسرايا', dTr: 'Gazve, seriyye, ridde — zaman çizelgesiyle', dEn: 'Ghazwa, sariyya, ridda — with timeline', dAr: 'الغزوات والسرايا والردة — مع الخط الزمني' },
  { path: '/museum', svgIcon: 'museum', grad: 'linear-gradient(135deg, #544218 0%, #7a6124 100%)', count: DATA_COUNTS.museumItems, tr: 'Dijital Müze', en: 'Digital Museum', ar: 'المتحف الرقمي', dTr: '7 kategori — silahlar, mimari, günlük hayat…', dEn: '7 categories — weapons, architecture, daily life…', dAr: '٧ فئات — الأسلحة والعمارة والحياة اليومية…' },
  { path: '/quran/esbab', svgIcon: 'book', grad: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', count: DATA_COUNTS.esbab, tr: 'Kur\'ân Bağlantıları', en: 'Quran Links', ar: 'روابط القرآن', dTr: 'Esbâb-ı nüzûl ve hadis cross-ref', dEn: 'Asbāb al-nuzūl and hadith cross-ref', dAr: 'أسباب النزول والأحاديث' },
  { path: '/network', svgIcon: 'network', grad: 'linear-gradient(135deg, #2e5984 0%, #3b7bbf 100%)', count: DATA_COUNTS.teacherStudentEdges, tr: 'İlişki Ağları', en: 'Networks', ar: 'الشبكات', dTr: 'Hoca-talebe, kabile, muâhât grafları', dEn: 'Teacher-student, tribal, muāhāt graphs', dAr: 'شبكات الأستاذ والتلميذ والقبائل والمؤاخاة' },
];

const SECONDARY = [
  { path: '/geography', svgIcon: 'globe', tr: 'Coğrafya', en: 'Geography', ar: 'الجغرافيا', count: 87 },
  { path: '/literature', svgIcon: 'scroll', tr: 'Edebiyat', en: 'Literature', ar: 'الأدب', count: 85 },
  { path: '/religions', svgIcon: 'temple', tr: 'Câhiliye İnançları', en: 'Pre-Islamic Beliefs', ar: 'معتقدات الجاهلية', count: 83 },
  { path: '/economy', svgIcon: 'coins', tr: 'Ekonomi', en: 'Economy', ar: 'الاقتصاد', count: 99 },
  { path: '/prophet', svgIcon: 'crescent', tr: 'Hz. Peygamber', en: 'The Prophet', ar: 'النبي ﷺ' },
  { path: '/audio', svgIcon: 'headphones', tr: 'Radyo Tiyatrosu', en: 'Radio Drama', ar: 'المسرح الإذاعي', count: 160 },
  { path: '/timeline', svgIcon: 'timeline', tr: 'Zaman Çizelgesi', en: 'Timeline', ar: 'الخط الزمني' },
  { path: '/stats', svgIcon: 'chart', tr: 'İstatistikler', en: 'Statistics', ar: 'الإحصائيات' },
];

/* ─── MINI SVG ICONS (replaces emojis for polish) ─── */
function SvgIcon({ name, size = 20, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const s = { width: size, height: size };
  switch (name) {
    case 'map': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>;
    case 'users': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'swords': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l8.5 8.5" /><path d="M22 2l-8.5 8.5" /><path d="M7 13.5L2 22l8.5-5" /><path d="M17 13.5L22 22l-8.5-5" /><circle cx="12" cy="12" r="2" /></svg>;
    case 'museum': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /><path d="M10 9h4" /></svg>;
    case 'book': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
    case 'network': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" /><line x1="12" y1="8" x2="5" y2="16" /><line x1="12" y1="8" x2="19" y2="16" /></svg>;
    case 'globe': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
    case 'scroll': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 0 0-2-2H2" /><path d="M19 17V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2" /></svg>;
    case 'temple': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7h20L12 2z" /><path d="M2 22h20" /><path d="M6 7v15" /><path d="M18 7v15" /><path d="M10 7v15" /><path d="M14 7v15" /></svg>;
    case 'coins': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><circle cx="9" cy="9" r="7" /><path d="M15 15a7 7 0 1 0 0-6" /></svg>;
    case 'crescent': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M12 3a9 9 0 1 0 9 9c0-1.2-.24-2.4-.68-3.5A7 7 0 0 1 12 3z" /></svg>;
    case 'headphones': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5z" /><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z" /></svg>;
    case 'timeline': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22" /><circle cx="12" cy="6" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="18" r="2" /><line x1="14" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="10" y2="12" /><line x1="14" y1="18" x2="20" y2="18" /></svg>;
    case 'chart': return <svg {...s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case 'star': return <svg {...s} viewBox="0 0 24 24" fill={color} stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>;
    default: return null;
  }
}

/* ─── ANIMATED STAT (refined — smaller, inline) ─── */
function AnimStat({ value, label, delay = 0 }: { value: number | string; label: string; delay?: number }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2.5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="text-lg font-bold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-accent)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
    </motion.div>
  );
}

/* ─── DECORATIVE DIVIDER ─── */
function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, var(--text-accent))' }} />
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill="var(--text-accent)" opacity="0.5" />
      </svg>
      <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, var(--text-accent), transparent)' }} />
    </div>
  );
}

/* ─── MAIN ─── */
export default function HomePage() {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'tr' | 'en' | 'ar';
  const { localize } = useLocalizedField();
  const navigate = useNavigate();

  const { data: timeline = [] } = useData<TimelineEntry[]>('timeline');
  const { data: companions = [] } = useData<Companion[]>('companions');

  const featuredBattles = useMemo(() => timeline.filter((t) => t.tier === 1).slice(0, 5), [timeline]);
  const featuredCompanions = useMemo(() => companions.filter((c) => c.category === 'asere_mubesere').slice(0, 10), [companions]);

  const t3 = (tr: string, en: string, ar: string) => lang === 'tr' ? tr : lang === 'ar' ? ar : en;

  return (
    <div className="flex flex-col">
      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden px-6 py-14 lg:py-20" style={{ background: 'var(--bg-secondary)' }}>
        {/* Decorative geometric background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg stroke='%23d4af37' stroke-width='0.5' fill='none'%3E%3Cpolygon points='40,8 46,20 58,20 48,28 52,40 40,32 28,40 32,28 22,20 34,20'/%3E%3Ccircle cx='40' cy='40' r='16' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />

        <motion.div
          className="relative z-10 mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Refined logo mark */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{
            background: 'linear-gradient(135deg, #d4af37, #e6bf55)',
            boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
          }}>
            <SvgIcon name="crescent" size={26} color="#1a1a2e" />
          </div>

          <h1
            className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {t3('Siyer Atlası', 'Siyer Atlas', 'أطلس السيرة')}
          </h1>

          <p className="mx-auto max-w-lg text-base leading-relaxed sm:text-lg" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            {t3('Asr-ı Saâdet İnteraktif Dijital Atlası', 'Interactive Digital Atlas of the Prophetic Era', 'الأطلس الرقمي التفاعلي لعصر السعادة')}
          </p>

          <p className="mt-2 text-xs tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
            570–661 CE · {t3('Üç dil', 'Trilingual', 'ثلاث لغات')} · {t3('Açık erişim', 'Open access', 'وصول مفتوح')}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <motion.button
              onClick={() => navigate('/map')}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-md"
              style={{ background: 'linear-gradient(135deg, #d4af37, #e6bf55)', color: '#1a1a2e', boxShadow: '0 4px 16px rgba(212,175,55,0.25)' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <SvgIcon name="map" size={16} color="#1a1a2e" />
              {t3('Haritayı Keşfet', 'Explore the Map', 'استكشف الخريطة')}
            </motion.button>
            <motion.button
              onClick={() => navigate('/museum')}
              className="flex items-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <SvgIcon name="museum" size={16} />
              {t3('Dijital Müze', 'Digital Museum', 'المتحف الرقمي')}
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ━━━ STATS RIBBON (compact) ━━━ */}
      <section className="border-y" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center divide-x" style={{ '--tw-divide-opacity': '0.15' } as any}>
          <AnimStat value={DATA_COUNTS.companions} label={t3('Sahâbî', 'Companions', 'صحابي')} delay={0.1} />
          <AnimStat value={DATA_COUNTS.battles} label={t3('Savaş', 'Battles', 'غزوة')} delay={0.15} />
          <AnimStat value={DATA_COUNTS.museumItems} label={t3('Müze Objesi', 'Museum Items', 'قطعة متحف')} delay={0.2} />
          <AnimStat value={DATA_COUNTS.locations} label={t3('Mekân', 'Locations', 'مكان')} delay={0.25} />
          <AnimStat value={DATA_COUNTS.audioEpisodes} label={t3('Bölüm', 'Episodes', 'حلقة')} delay={0.3} />
          <AnimStat value="3" label={t3('Dil', 'Languages', 'لغات')} delay={0.35} />
        </div>
      </section>

      {/* ━━━ EXPLORE GRID ━━━ */}
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div className="mb-6 text-center" {...FADE_IN}>
            <h2 className="text-lg font-bold sm:text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {t3('Keşfet', 'Explore', 'استكشف')}
            </h2>
            <OrnamentalDivider />
          </motion.div>

          <motion.div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" {...STAGGER_CHILDREN}>
            {EXPLORE.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group relative overflow-hidden rounded-xl p-5 text-start ${item.span ?? ''}`}
                style={{ background: item.grad, boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}
                {...FADE_IN}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(0,0,0,0.16)' }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Subtle inner glow */}
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 60%)' }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.12)' }}>
                      <SvgIcon name={item.svgIcon} size={18} color="rgba(255,255,255,0.9)" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white sm:text-base" style={{ fontFamily: 'var(--font-display)' }}>
                    {t3(item.tr, item.en, item.ar)}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/60 line-clamp-2">
                    {t3(item.dTr, item.dEn, item.dAr)}
                  </p>
                </div>
                <span className="absolute bottom-3.5 end-4 text-white/30 text-sm transition-all group-hover:text-white/70 group-hover:translate-x-0.5">→</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ FEATURED — Battles & Companions ━━━ */}
      <section className="px-4 pb-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Battles */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                <SvgIcon name="swords" size={16} color="var(--text-accent)" />
                {t3('Büyük Gazveler', 'Major Battles', 'الغزوات الكبرى')}
              </h3>
              <button type="button" onClick={() => navigate('/battles')} className="text-xs font-semibold" style={{ color: 'var(--text-accent)' }}>
                {t3('Tümü →', 'View all →', 'عرض الكل ←')}
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {featuredBattles.map((b) => (
                <button
                  key={b.battle_id}
                  type="button"
                  onClick={() => navigate(`/battles/${b.battle_id}`)}
                  className="group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-start transition-all hover:scale-[1.01]"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ background: 'rgba(212,175,55,0.08)' }}>
                    <SvgIcon name="swords" size={14} color="var(--text-accent)" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{b.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{b.date_hijri} · {b.year_ce} CE</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {[...Array(4 - b.tier)].map((_, i) => (
                      <SvgIcon key={i} name="star" size={10} color="#d4af37" />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Companions — Aşere */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                <SvgIcon name="users" size={16} color="var(--text-accent)" />
                {t3('Aşere-i Mübeşşere', 'The Ten Promised Paradise', 'العشرة المبشرون بالجنة')}
              </h3>
              <button type="button" onClick={() => navigate('/companions')} className="text-xs font-semibold" style={{ color: 'var(--text-accent)' }}>
                {t3('Tümü →', 'View all →', 'عرض الكل ←')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
              {featuredCompanions.map((c) => (
                <motion.button
                  key={c.id}
                  onClick={() => navigate(`/companions/${c.id}`)}
                  className="flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-center transition-all"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
                  whileHover={{ scale: 1.03, borderColor: 'rgba(212,175,55,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.12)' }}>
                    <SvgIcon name="users" size={14} color="var(--text-accent)" />
                  </span>
                  <span className="text-[11px] font-semibold leading-tight line-clamp-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {localize(c.name)}
                  </span>
                  {c.death_ce && <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>ö. {c.death_ce}</span>}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ SECONDARY LINKS ━━━ */}
      <section className="px-4 py-8 sm:px-6" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 text-center">
            <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              {t3('Daha Fazlası', 'More Modules', 'المزيد')}
            </h3>
            <OrnamentalDivider />
          </div>
          <motion.div className="grid grid-cols-2 gap-2 sm:grid-cols-4" {...STAGGER_CHILDREN}>
            {SECONDARY.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="group flex items-center gap-2.5 rounded-lg px-3 py-3 text-start transition-all"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
                {...FADE_IN}
                whileHover={{ scale: 1.02, borderColor: 'rgba(212,175,55,0.2)' }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ background: 'rgba(212,175,55,0.06)' }}>
                  <SvgIcon name={item.svgIcon} size={15} color="var(--text-accent)" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{t3(item.tr, item.en, item.ar)}</p>
                  {item.count && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.count} {t3('kayıt', 'items', 'سجل')}</p>}
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ TAGLINE ━━━ */}
      <section className="px-6 py-6 text-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          {t3(
            'Siyer Atlası — 570-661 CE dönemi için kapsamlı dijital atlas. Açık erişim, üç dil desteği.',
            'Siyer Atlas — comprehensive digital atlas for 570–661 CE. Open access, trilingual.',
            'أطلس السيرة — أطلس رقمي شامل للفترة ٥٧٠-٦٦١ م. وصول مفتوح، ثلاثي اللغة.',
          )}
        </p>
        <a href="https://islamicatlas.org" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[11px] font-medium" style={{ color: 'var(--text-accent)' }}>
          islamicatlas.org ↗
        </a>
      </section>
    </div>
  );
}
