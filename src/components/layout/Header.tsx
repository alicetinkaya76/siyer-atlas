import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export function Header() {
  const { t } = useTranslation();
  const isMobile = useAppStore((s) => s.isMobile);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);

  return (
    <header
      className="no-print glass-strong relative z-40 flex items-center gap-3 border-b px-4"
      style={{
        height: 'var(--header-height)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:opacity-80"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        aria-label="Toggle sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* Logo */}
      <a href="/" className="flex items-center gap-2.5 no-underline">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg, #d4af37, #e6bf55)',
            color: '#1a1a2e',
          }}
        >
          ☪
        </div>
        {!isMobile && (
          <div className="flex flex-col leading-tight">
            <span
              className="text-sm font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
            >
              {t('app_name')}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              570–661 CE
            </span>
          </div>
        )}
      </a>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors"
        style={{
          borderColor: 'var(--border-color)',
          color: 'var(--text-tertiary)',
          background: 'var(--bg-secondary)',
          minWidth: isMobile ? 'auto' : '220px',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        {!isMobile && <span>{t('search_placeholder')}</span>}
      </button>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Language switcher */}
      <LanguageSwitcher />
    </header>
  );
}
