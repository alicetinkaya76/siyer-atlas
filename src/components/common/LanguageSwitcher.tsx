import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES } from '@/config/constants';
import { useAppStore } from '@/stores/useAppStore';
import type { Language } from '@/types';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]!;

  const switchLanguage = (code: Language) => {
    i18n.changeLanguage(code);
    setLanguage(code);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm transition-colors"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
        aria-label="Change language"
      >
        <span>{currentLang.flag}</span>
        <span className="text-xs font-medium uppercase">{currentLang.code}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-full z-50 mt-1 overflow-hidden rounded-lg py-1"
            style={{ minWidth: '140px' }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                style={{
                  color: lang.code === currentLang.code ? 'var(--text-accent)' : 'var(--text-primary)',
                  background: lang.code === currentLang.code ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === currentLang.code && (
                  <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
