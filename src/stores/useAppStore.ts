import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, ThemeMode } from '@/types';

interface AppState {
  /* ─── Theme ─── */
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  /* ─── Language ─── */
  language: Language;
  setLanguage: (lang: Language) => void;

  /* ─── Layout ─── */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  /* ─── Command Palette ─── */
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode;
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      resolvedTheme: resolveTheme('system'),
      setThemeMode: (mode) => {
        const resolved = resolveTheme(mode);
        applyTheme(resolved);
        set({ themeMode: mode, resolvedTheme: resolved });
      },
      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ themeMode: next, resolvedTheme: next });
      },

      language: 'tr',
      setLanguage: (lang) => set({ language: lang }),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      isMobile: false,
      setIsMobile: (mobile) => set({ isMobile: mobile, sidebarOpen: !mobile }),

      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: 'siyer-atlas-app',
      partialize: (state) => ({
        themeMode: state.themeMode,
        language: state.language,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = useAppStore.getState();
    if (state.themeMode === 'system') {
      const resolved = getSystemTheme();
      applyTheme(resolved);
      useAppStore.setState({ resolvedTheme: resolved });
    }
  });
}
