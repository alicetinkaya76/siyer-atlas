import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/* ─── Styles (must come before components) ─── */
import '@/styles/globals.css';

/* ─── i18n initialization ─── */
import '@/i18n';

/* ─── Theme initialization ─── */

/* ─── App ─── */
import App from '@/App';

// Apply persisted theme immediately to prevent flash
const stored = localStorage.getItem('siyer-atlas-app');
if (stored) {
  try {
    const { state } = JSON.parse(stored);
    if (state?.themeMode === 'dark' || (state?.themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch {
    // ignore parse errors
  }
}

// Mount
const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
