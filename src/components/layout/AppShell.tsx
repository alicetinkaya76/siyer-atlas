import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/stores/useAppStore';
import { useMobileDetect } from '@/hooks/useMediaQuery';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomTabBar } from './BottomTabBar';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';
import { Spinner } from '@/components/common/Spinner';

export function AppShell() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const isMobile = useAppStore((s) => s.isMobile);
  useMobileDetect();
  useScrollRestoration();

  return (
    <div className="flex h-dvh flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'var(--sidebar-width)', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex-shrink-0 overflow-hidden border-r"
                style={{
                  borderColor: 'var(--border-color)',
                  background: 'var(--bg-secondary)',
                }}
              >
                <Sidebar />
              </motion.aside>
            )}
          </AnimatePresence>
        )}

        {/* Main Content */}
        <main
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
          style={{ background: 'var(--bg-primary)' }}
        >
          <Suspense fallback={<PageLoader />}>
            <div className="page-enter flex-1">
              <Outlet />
            </div>
          </Suspense>

          {/* Footer (desktop only, scrolled with content) */}
          {!isMobile && <Footer />}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {isMobile && <BottomTabBar />}

      {/* Command Palette (⌘K) */}
      <CommandPalette />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center" style={{ minHeight: '60vh' }}>
      <Spinner size="lg" />
    </div>
  );
}
