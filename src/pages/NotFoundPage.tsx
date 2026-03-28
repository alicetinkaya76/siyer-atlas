import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { FADE_IN } from '@/config/constants';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center"
      style={{ minHeight: '60vh' }}
      {...FADE_IN}
    >
      <div className="text-7xl opacity-20">🕌</div>
      <h1
        className="text-3xl font-bold"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        404
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>{t('not_found_desc')}</p>
      <button
        onClick={() => navigate('/')}
        className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all"
        style={{
          background: 'linear-gradient(135deg, #d4af37, #e6bf55)',
          color: '#1a1a2e',
        }}
      >
        {t('go_home')}
      </button>
    </motion.div>
  );
}
