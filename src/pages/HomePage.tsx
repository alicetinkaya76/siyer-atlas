import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { DATA_COUNTS, FADE_IN, STAGGER_CHILDREN } from '@/config/constants';
import { GeometricPattern } from '@/components/common/GeometricPattern';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface TimelineEntry { battle_id: string; name: string; year_ce: number; date_hijri: string; type: string; tier: number; lat: number; lng: number; result: string; }
interface Companion { id: string; name: LocalizedText; category?: string; death_ce?: number; }

/* ─── EXPLORE GRID DATA ─── */
const EXPLORE = [
  { path: '/map', icon: '🗺️', grad: 'linear-gradient(135deg,#1d4ed8,#2e5984)', count: DATA_COUNTS.locations, tr: 'Harita', en: 'Interactive Map', ar: 'الخريطة التفاعلية', dTr: '9 katman — savaşlar, mekânlar, kabileler, coğrafya', dEn: '9 layers — battles, locations, tribes, geography', dAr: '٩ طبقات — المعارك والأماكن والقبائل والجغرافيا', span: 'sm:col-span-2' },
  { path: '/companions', icon: '👤', grad: 'linear-gradient(135deg,#7c3aed,#6d28d9)', count: DATA_COUNTS.companions, tr: 'Sahâbîler', en: 'Companions', ar: 'الصحابة', dTr: 'Biyografi, ilişki ağı, doğum-vefat haritası', dEn: 'Biography, networks, birth-death map', dAr: 'السيرة الذاتية والشبكات والخريطة' },
  { path: '/battles', icon: '⚔️', grad: 'linear-gradient(135deg,#b91c1c,#991b1b)', count: DATA_COUNTS.battles, tr: 'Savaşlar', en: 'Battles', ar: 'الغزوات', dTr: 'Gazve, seriyye, ridde — zaman çizelgesiyle', dEn: 'Ghazwa, sariyya, ridda — with timeline', dAr: 'الغزوات والسرايا والردة — مع الخط الزمني' },
  { path: '/museum', icon: '🏛️', grad: 'linear-gradient(135deg,#a16207,#92400e)', count: DATA_COUNTS.museumItems, tr: 'Dijital Müze', en: 'Digital Museum', ar: 'المتحف الرقمي', dTr: '7 kategori — silahlar, mimari, günlük hayat…', dEn: '7 categories — weapons, architecture, daily life…', dAr: '٧ فئات — الأسلحة والعمارة والحياة اليومية…' },
  { path: '/quran/esbab', icon: '📖', grad: 'linear-gradient(135deg,#15803d,#166534)', count: DATA_COUNTS.esbab, tr: 'Kur\'ân Bağlantıları', en: 'Quran Links', ar: 'روابط القرآن', dTr: 'Esbâb-ı nüzûl ve hadis cross-ref', dEn: 'Asbāb al-nuzūl and hadith cross-ref', dAr: 'أسباب النزول والأحاديث' },
  { path: '/network', icon: '🕸️', grad: 'linear-gradient(135deg,#0891b2,#0e7490)', count: DATA_COUNTS.teacherStudentEdges, tr: 'İlişki Ağları', en: 'Networks', ar: 'الشبكات', dTr: 'Hoca-talebe, kabile, muâhât grafları', dEn: 'Teacher-student, tribal, muāhāt graphs', dAr: 'شبكات الأستاذ والتلميذ والقبائل والمؤاخاة' },
];

const SECONDARY = [
  { path: '/geography', icon: '🌍', tr: 'Coğrafya', en: 'Geography', ar: 'الجغرافيا', count: 87 },
  { path: '/literature', icon: '📜', tr: 'Edebiyat', en: 'Literature', ar: 'الأدب', count: 85 },
  { path: '/religions', icon: '🕌', tr: 'Câhiliye İnançları', en: 'Pre-Islamic Beliefs', ar: 'معتقدات الجاهلية', count: 83 },
  { path: '/economy', icon: '💰', tr: 'Ekonomi', en: 'Economy', ar: 'الاقتصاد', count: 99 },
  { path: '/prophet', icon: '☪️', tr: 'Hz. Peygamber', en: 'The Prophet', ar: 'النبي ﷺ' },
  { path: '/audio', icon: '🎧', tr: 'Radyo Tiyatrosu', en: 'Radio Drama', ar: 'المسرح الإذاعي', count: 160 },
  { path: '/timeline', icon: '⏳', tr: 'Zaman Çizelgesi', en: 'Timeline', ar: 'الخط الزمني' },
  { path: '/stats', icon: '📊', tr: 'İstatistikler', en: 'Statistics', ar: 'الإحصائيات' },
];

/* ─── ANIMATED STAT ─── */
function AnimStat({ value, label, icon, delay = 0 }: { value: number | string; label: string; icon: string; delay?: number }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1 px-4 py-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-2xl font-bold tabular-nums sm:text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-accent)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
    </motion.div>
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
  const featuredCompanions = useMemo(() => companions.filter((c) => c.category === 'asere_mubesere').slice(0, 8), [companions]);

  const t3 = (tr: string, en: string, ar: string) => lang === 'tr' ? tr : lang === 'ar' ? ar : en;

  return (
    <div className="flex flex-col">
      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden px-6 py-16 lg:py-24" style={{ background: 'var(--bg-secondary)' }}>
        <GeometricPattern opacity={0.035} />
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />

        <motion.div
          className="relative z-10 mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-3xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #d4af37, #e6bf55, #d4af37)', color: '#1a1a2e', boxShadow: '0 8px 32px rgba(212,175,55,0.3)' }}
          >
            ☪
          </div>

          <h1
            className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {t3('Siyer Atlası', 'Siyer Atlas', 'أطلس السيرة')}
          </h1>

          <p className="mx-auto max-w-xl text-lg leading-relaxed sm:text-xl" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            {t3('Asr-ı Saâdet İnteraktif Dijital Atlası', 'Interactive Digital Atlas of the Prophetic Era', 'الأطلس الرقمي التفاعلي لعصر السعادة')}
          </p>

          <p className="mt-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            570–661 CE · {t3('Üç dil', 'Trilingual', 'ثلاث لغات')} · {t3('Açık erişim', 'Open access', 'وصول مفتوح')}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <motion.button
              onClick={() => navigate('/map')}
              className="rounded-xl px-7 py-3 text-sm font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #d4af37, #e6bf55)', color: '#1a1a2e', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              🗺️ {t3('Haritayı Keşfet', 'Explore the Map', 'استكشف الخريطة')}
            </motion.button>
            <motion.button
              onClick={() => navigate('/museum')}
              className="rounded-xl border px-7 py-3 text-sm font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              🏛️ {t3('Dijital Müze', 'Digital Museum', 'المتحف الرقمي')}
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ━━━ STATS RIBBON ━━━ */}
      <section className="border-y" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-primary)' }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center [&>*+*]:border-l" style={{ borderColor: 'var(--border-color)' }}>
          <AnimStat value={DATA_COUNTS.companions} label={t3('Sahâbî', 'Companions', 'صحابي')} icon="👤" delay={0.1} />
          <AnimStat value={DATA_COUNTS.battles} label={t3('Savaş', 'Battles', 'غزوة')} icon="⚔️" delay={0.15} />
          <AnimStat value={DATA_COUNTS.museumItems} label={t3('Müze Objesi', 'Museum Items', 'قطعة متحف')} icon="🏛️" delay={0.2} />
          <AnimStat value={DATA_COUNTS.locations} label={t3('Mekân', 'Locations', 'مكان')} icon="📍" delay={0.25} />
          <AnimStat value={DATA_COUNTS.audioEpisodes} label={t3('Bölüm', 'Episodes', 'حلقة')} icon="🎧" delay={0.3} />
          <AnimStat value="3" label={t3('Dil', 'Languages', 'لغات')} icon="🌐" delay={0.35} />
        </div>
      </section>

      {/* ━━━ EXPLORE GRID ━━━ */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.h2 className="mb-8 text-center text-xl font-bold sm:text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }} {...FADE_IN}>
            {t3('Keşfet', 'Explore', 'استكشف')}
          </motion.h2>

          <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" {...STAGGER_CHILDREN}>
            {EXPLORE.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group relative overflow-hidden rounded-2xl p-5 text-start ${item.span ?? ''}`}
                style={{ background: item.grad, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                {...FADE_IN}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl drop-shadow-sm">{item.icon}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white sm:text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                    {t3(item.tr, item.en, item.ar)}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    {t3(item.dTr, item.dEn, item.dAr)}
                  </p>
                </div>
                <span className="absolute bottom-4 end-4 text-white/40 transition-all group-hover:text-white/80 group-hover:translate-x-1">→</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ FEATURED — Battles & Companions ━━━ */}
      <section className="px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Battles */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                ⚔️ {t3('Büyük Gazveler', 'Major Battles', 'الغزوات الكبرى')}
              </h3>
              <button type="button" onClick={() => navigate('/battles')} className="text-xs font-semibold" style={{ color: 'var(--text-accent)' }}>
                {t3('Tümü →', 'View all →', 'عرض الكل ←')}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {featuredBattles.map((b) => (
                <button
                  key={b.battle_id}
                  type="button"
                  onClick={() => navigate(`/battles/${b.battle_id}`)}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 text-start transition-all hover:scale-[1.01]"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg" style={{ background: 'rgba(185,28,28,0.08)' }}>⚔️</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{b.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{b.date_hijri} · {b.year_ce} CE</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="text-[10px] font-semibold" style={{ color: '#d4af37' }}>{'★'.repeat(4 - b.tier)}</span>
                    <span className="text-[10px] max-w-[100px] truncate" style={{ color: 'var(--text-tertiary)' }}>{b.result}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Companions — Aşere */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                👤 {t3('Aşere-i Mübeşşere', 'The Ten Promised Paradise', 'العشرة المبشرون بالجنة')}
              </h3>
              <button type="button" onClick={() => navigate('/companions')} className="text-xs font-semibold" style={{ color: 'var(--text-accent)' }}>
                {t3('Tümü →', 'View all →', 'عرض الكل ←')}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {featuredCompanions.map((c) => (
                <motion.button
                  key={c.id}
                  onClick={() => navigate(`/companions/${c.id}`)}
                  className="flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition-all"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-lg" style={{ background: 'rgba(124,58,237,0.08)' }}>👤</span>
                  <span className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    {localize(c.name)}
                  </span>
                  {c.death_ce && <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>ö. {c.death_ce} CE</span>}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ SECONDARY LINKS ━━━ */}
      <section className="px-4 py-10 sm:px-6" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="mx-auto max-w-5xl">
          <h3 className="mb-6 text-center text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            {t3('Daha Fazlası', 'More Modules', 'المزيد')}
          </h3>
          <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-4" {...STAGGER_CHILDREN}>
            {SECONDARY.map((item) => (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="group flex items-center gap-3 rounded-xl px-4 py-3.5 text-start transition-all"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}
                {...FADE_IN}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-xl">{item.icon}</span>
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
      <section className="px-6 py-8 text-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          {t3(
            'Siyer Atlası — 570-661 CE dönemi için kapsamlı dijital atlas. Açık erişim, üç dil desteği.',
            'Siyer Atlas — comprehensive digital atlas for 570–661 CE. Open access, trilingual.',
            'أطلس السيرة — أطلس رقمي شامل للفترة ٥٧٠-٦٦١ م. وصول مفتوح، ثلاثي اللغة.',
          )}
        </p>
        <a href="https://islamicatlas.org" target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs font-medium" style={{ color: 'var(--text-accent)' }}>
          islamicatlas.org ↗
        </a>
      </section>
    </div>
  );
}
