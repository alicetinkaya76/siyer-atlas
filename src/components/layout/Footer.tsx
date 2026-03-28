import { useTranslation } from 'react-i18next';
import { APP_VERSION, APP_URL, SISTER_PROJECT_URL } from '@/config/constants';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      className="no-print border-t px-6 py-4"
      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span>
            {t('app_name')} v{APP_VERSION}
          </span>
          <span>·</span>
          <span>Dr. Ali Çetinkaya</span>
          <span>·</span>
          <a
            href={SISTER_PROJECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 transition-colors hover:underline"
            style={{ color: 'var(--text-accent)' }}
          >
            islamicatlas.org
          </a>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <a
            href={`${APP_URL}/about`}
            className="underline-offset-2 hover:underline"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {t('nav:about')}
          </a>
          <span>·</span>
          <span>CC BY-NC-SA 4.0</span>
        </div>
      </div>
    </footer>
  );
}
