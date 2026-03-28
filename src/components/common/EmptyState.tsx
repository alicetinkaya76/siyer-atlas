import { useTranslation } from 'react-i18next';

type EmptyType = 'no-results' | 'no-filter' | 'error';

const ILLUSTRATIONS: Record<EmptyType, React.ReactNode> = {
  'no-results': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24">
      <circle cx="52" cy="52" r="32" stroke="var(--text-tertiary)" strokeWidth="3" strokeDasharray="6 4" opacity="0.4" />
      <line x1="76" y1="76" x2="100" y2="100" stroke="var(--text-tertiary)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <circle cx="52" cy="52" r="12" stroke="var(--text-accent)" strokeWidth="2" opacity="0.3" />
      <path d="M46 52h12M52 46v12" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
    </svg>
  ),
  'no-filter': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24">
      <path d="M30 30h60l-20 30v20l-20 10V60L30 30z" stroke="var(--text-tertiary)" strokeWidth="2.5" strokeLinejoin="round" opacity="0.35" />
      <circle cx="80" cy="80" r="18" stroke="var(--text-accent)" strokeWidth="2" opacity="0.3" />
      <path d="M73 80h14M80 73v14" stroke="var(--text-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),
  'error': (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-24 w-24">
      <circle cx="60" cy="60" r="36" stroke="var(--text-tertiary)" strokeWidth="2.5" opacity="0.35" />
      <path d="M60 40v24" stroke="#c0392b" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <circle cx="60" cy="76" r="3" fill="#c0392b" opacity="0.6" />
    </svg>
  ),
};

const I18N_KEYS: Record<EmptyType, { title: string; desc: string }> = {
  'no-results': { title: 'pages:empty_no_results', desc: 'pages:empty_no_results_desc' },
  'no-filter': { title: 'pages:empty_no_filter', desc: 'pages:empty_no_filter_desc' },
  'error': { title: 'pages:empty_error', desc: 'pages:empty_error_desc' },
};

interface EmptyStateProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function EmptyState({ type = 'no-results', title, description, onRetry }: EmptyStateProps) {
  const { t } = useTranslation('pages');

  const keys = I18N_KEYS[type];
  const displayTitle = title ?? t(keys.title);
  const displayDesc = description ?? t(keys.desc);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {ILLUSTRATIONS[type]}
      <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
        {displayTitle}
      </h3>
      <p className="max-w-xs text-sm" style={{ color: 'var(--text-tertiary)' }}>
        {displayDesc}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all active:scale-95"
          style={{
            background: 'rgba(212,175,55,0.12)',
            color: 'var(--text-accent)',
            border: '1px solid rgba(212,175,55,0.25)',
          }}
        >
          {t('common:retry')}
        </button>
      )}
    </div>
  );
}
