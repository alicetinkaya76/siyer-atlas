import { useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useData } from '@/hooks/useData';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { DATA_COUNTS, APP_VERSION, FADE_IN, STAGGER_CHILDREN } from '@/config/constants';
import { GeometricPattern } from '@/components/common/GeometricPattern';
import type { LocalizedText } from '@/types';

/* ─── Types ─── */
interface MetadataFile {
  project: string;
  description: LocalizedText;
  total_files: number;
  total_reconstructions: number;
}

/* ─── Static Content ─── */
const DATA_SOURCES = [
  { key: 'ibn_hisham', label: 'İbn Hişâm, es-Sîretü\'n-Nebeviyye' },
  { key: 'taberi', label: 'Taberî, Târîhü\'l-Ümem ve\'l-Mülûk' },
  { key: 'ibn_sad', label: 'İbn Sa\'d, et-Tabakâtü\'l-Kübrâ' },
  { key: 'vakidi', label: 'Vâkıdî, Kitâbü\'l-Megâzî' },
  { key: 'dia', label: 'TDV İslâm Ansiklopedisi (DİA)' },
  { key: 'watt', label: 'W. M. Watt, Muhammad at Medina' },
  { key: 'lings', label: 'M. Lings, Muhammad: His Life Based on the Earliest Sources' },
  { key: 'hamidullah', label: 'M. Hamidullah, İslam Peygamberi' },
];

const TECH_STACK = [
  { name: 'React 19', desc: 'UI', color: '#61dafb' },
  { name: 'TypeScript', desc: 'Types', color: '#3178c6' },
  { name: 'Vite 6', desc: 'Build', color: '#646cff' },
  { name: 'Tailwind 4', desc: 'CSS', color: '#38bdf8' },
  { name: 'Leaflet', desc: 'Maps', color: '#199900' },
  { name: 'D3.js', desc: 'Viz', color: '#f9a03c' },
  { name: 'Recharts', desc: 'Charts', color: '#8884d8' },
  { name: 'Framer Motion', desc: 'Motion', color: '#e63e8b' },
  { name: 'Zustand', desc: 'State', color: '#7c3aed' },
  { name: 'TanStack Query', desc: 'Data', color: '#ef4444' },
  { name: 'Fuse.js', desc: 'Search', color: '#d4af37' },
  { name: 'i18next', desc: 'i18n', color: '#15803d' },
];

const DATASET_CARDS = [
  { icon: '👤', key: 'companions', count: DATA_COUNTS.companions, path: '/companions' },
  { icon: '⚔️', key: 'battles', count: DATA_COUNTS.battles, path: '/battles' },
  { icon: '📍', key: 'locations', count: DATA_COUNTS.locations, path: '/map' },
  { icon: '🏕️', key: 'tribes', count: DATA_COUNTS.tribes, path: '/network/tribes' },
  { icon: '📖', key: 'esbab', count: DATA_COUNTS.esbab, path: '/quran/esbab' },
  { icon: '📿', key: 'hadith', count: DATA_COUNTS.hadith, path: '/quran/hadith' },
  { icon: '🏛️', key: 'museum', count: DATA_COUNTS.museumItems, path: '/museum' },
  { icon: '🎧', key: 'audio', count: DATA_COUNTS.audioEpisodes, path: '/audio' },
  { icon: '🕸️', key: 'network', count: DATA_COUNTS.teacherStudentEdges, path: '/network' },
  { icon: '🎖️', key: 'recon', count: DATA_COUNTS.reconstructions, path: '/battles' },
];

/* ─── Component ─── */
export default function AboutPage() {
  const { t } = useTranslation('pages');
  const { localize } = useLocalizedField();
  const { data: metadata } = useData<MetadataFile>('metadata');

  const description = useMemo(() => {
    if (metadata?.description) return localize(metadata.description);
    return t('about_desc');
  }, [metadata, localize, t]);

  return (
    <div className="page-enter flex flex-col">
      {/* Hero */}
      <section
        className="geometric-bg relative flex flex-col items-center justify-center px-6 py-12 text-center lg:py-16"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <GeometricPattern opacity={0.03} />
        <motion.div className="relative z-10 max-w-2xl" {...FADE_IN}>
          <div
            className="gold-gradient mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-xl shadow-lg"
            style={{ color: '#1a1a2e' }}
          >
            ☪
          </div>
          <h1
            className="mb-2 text-3xl font-bold tracking-tight lg:text-4xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            {t('about_title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-accent)' }}>
            v{APP_VERSION} · 570–661 CE
          </p>
          <p
            className="mx-auto mt-3 max-w-lg text-base leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
          >
            {description}
          </p>
        </motion.div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 pb-24">
        {/* Dataset Overview Grid */}
        <section className="mb-10">
          <h2
            className="mb-4 text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            📊 {t('about_dataset')}
          </h2>
          <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" {...STAGGER_CHILDREN}>
            {DATASET_CARDS.map((d) => (
              <motion.div key={d.key} {...FADE_IN}>
                <Link
                  to={d.path}
                  className="card flex flex-col items-center gap-1.5 px-3 py-4 text-center no-underline"
                >
                  <span className="text-xl">{d.icon}</span>
                  <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-accent)' }}>
                    {d.count.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-medium leading-tight" style={{ color: 'var(--text-secondary)' }}>
                    {t(`about_data_${d.key}`)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Data Sources */}
        <section className="mb-10">
          <h2
            className="mb-4 text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            📚 {t('about_sources')}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {DATA_SOURCES.map((s) => (
              <div
                key={s.key}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                <span className="text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-10">
          <h2
            className="mb-4 text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            ⚙️ {t('about_technology')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <span
                key={tech.name}
                className="rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  background: `${tech.color}12`,
                  color: tech.color,
                  border: `1px solid ${tech.color}30`,
                }}
              >
                {tech.name}
                <span className="ms-1 opacity-60">· {tech.desc}</span>
              </span>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-10">
          <h2
            className="mb-4 text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            👥 {t('about_team')}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card px-4 py-4">
              <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Dr. Ali Çetinkaya
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {t('about_team_cetinkaya_role')}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('about_team_cetinkaya_desc')}
              </p>
            </div>
            <div className="card px-4 py-4">
              <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Dr. Hüseyin Gökalp
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {t('about_team_gokalp_role')}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('about_team_gokalp_desc')}
              </p>
            </div>
          </div>
        </section>

        {/* License & Links */}
        <section className="mb-10">
          <div
            className="rounded-xl px-5 py-4"
            style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {t('about_license_text')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://github.com/alicetinkaya76/siyer-atlas"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-3 py-1.5 text-xs font-medium no-underline"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                GitHub →
              </a>
              <a
                href="https://islamicatlas.org"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg px-3 py-1.5 text-xs font-medium no-underline"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                islamicatlas.org →
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
