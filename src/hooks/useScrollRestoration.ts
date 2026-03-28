import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Scrolls the main content area to top on route change.
 * Attach to AppShell so it fires for every navigation.
 */
export function useScrollRestoration() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Find the main scrollable container
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);
}
