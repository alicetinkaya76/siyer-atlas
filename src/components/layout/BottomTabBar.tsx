import { useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@/config/routes';
import { useLocalizedField } from '@/hooks/useLocalizedField';

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { localize } = useLocalizedField();

  const tabs = NAV_ITEMS.filter((item) => item.showInBottomBar);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const activeIndex = tabs.findIndex((tab) => isActive(tab.path));

  return (
    <nav
      className="glass-strong no-print safe-bottom relative z-50 border-t"
      style={{
        height: 'var(--bottom-bar-height)',
        borderColor: 'var(--border-color)',
      }}
      aria-label="Mobile navigation"
    >
      {/* Animated gold indicator */}
      {activeIndex >= 0 && (
        <motion.div
          className="absolute top-0 h-[3px] rounded-b-full"
          style={{
            background: 'linear-gradient(90deg, #d4af37, #e6bf55)',
            width: `${100 / tabs.length}%`,
          }}
          animate={{ left: `${(activeIndex * 100) / tabs.length}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      )}

      <div className="flex h-full items-center justify-around px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-all"
              style={{
                color: active ? 'var(--text-accent)' : 'var(--text-tertiary)',
              }}
              aria-current={active ? 'page' : undefined}
            >
              <motion.span
                className="text-xl"
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {tab.icon}
              </motion.span>
              <span
                className="text-[10px] font-medium leading-tight"
                style={{ opacity: active ? 1 : 0.7 }}
              >
                {localize(tab.label)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
