import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
  const resolvedTheme = useAppStore((s) => s.resolvedTheme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const { t } = useTranslation();

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
      aria-label={isDark ? t('light_mode') : t('dark_mode')}
      title={isDark ? t('light_mode') : t('dark_mode')}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ scale: 0, rotate: -90, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 90, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isDark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </motion.div>
    </button>
  );
}
