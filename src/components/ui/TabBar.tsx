import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Fuel,
  Compass,
  Calculator,
  Settings,
  Sun,
  Moon,
  Plus,
  Zap,
  ChevronRight,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const TabBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    fuelEntries,
    kpis,
    config,
    isDarkMode,
    setTheme,
    theme,
    setActiveModal,
  } = useApp();

  const pendingCount = fuelEntries.filter((e) => e.isPending).length;

  const tabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'Listen/Live',
      icon: LayoutDashboard,
    },
    {
      id: 'fuel-log',
      label: 'Fuel Log',
      icon: Fuel,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'trips',
      label: 'Trips',
      icon: Compass,
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleToggleTheme = () => {
    if (theme === 'system') {
      setTheme(isDarkMode ? 'light' : 'dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const remainingPercent = Math.min(
    100,
    Math.max(5, (kpis.latestRangeGauge / kpis.fullRangeBenchmark) * 100)
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none select-none">
      {/* Floating Apple Music "Now Playing" Telemetry Mini Player */}
      <div className="w-full max-w-lg mx-auto px-3.5 mb-2 pointer-events-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="relative overflow-hidden rounded-[20px] apple-mini-player border border-black/[0.08] dark:border-white/[0.12] p-2 flex items-center justify-between gap-3 shadow-xl"
        >
          {/* Subtle tank level progress line across bottom */}
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${remainingPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-neutral-900 dark:bg-white"
            />
          </div>

          {/* Left: Mini Squircle Album Tile / Vehicle Graphic */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer group"
            id="mini-player-telemetry-btn"
          >
            <div className="relative w-10 h-10 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-black text-sm shadow-md shrink-0 overflow-hidden group-active:scale-95 transition-transform border border-white/20 dark:border-black/20">
              <Zap className="w-5 h-5 fill-current" />
              <div className="absolute inset-0 bg-white/10 pointer-events-none" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-neutral-900 dark:text-neutral-100 truncate">
                  {config.name}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 uppercase tracking-tight border border-black/5 dark:border-white/5">
                  {kpis.latestRangeGauge} {config.distanceUnit}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-medium">
                {kpis.avgFuelEconomy > 0
                  ? `${kpis.avgFuelEconomy.toFixed(1)} ${config.distanceUnit}/${config.volumeUnit} avg`
                  : 'Log fills to compute stats'}
                {' · '}
                <span className="text-neutral-400 dark:text-neutral-500">
                  {Math.round(remainingPercent)}% tank
                </span>
              </p>
            </div>
          </button>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Log Fill-up Button (Play/Action style) */}
            <motion.button
              type="button"
              id="mini-player-log-fuel-btn"
              onClick={() => setActiveModal('log-fuel')}
              whileTap={{ scale: 0.9 }}
              title="Quick Log Refuel"
              className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 flex items-center justify-center shadow-sm cursor-pointer border border-white/10 dark:border-black/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </motion.button>

            {/* Theme Toggle Button */}
            <motion.button
              type="button"
              id="mini-player-theme-toggle"
              onClick={handleToggleTheme}
              whileTap={{ scale: 0.9 }}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 flex items-center justify-center cursor-pointer border border-black/5 dark:border-white/10"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-neutral-100" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-800" />
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Apple iOS Frosted Glass Tab Bar Dock */}
      <nav
        id="ios-bottom-tab-bar"
        aria-label="iOS Navigation Bar"
        className="w-full ios-glass-bar pointer-events-auto safe-pb"
      >
        <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                id={`ios-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative flex flex-col items-center justify-center flex-1 py-1 focus:outline-none cursor-pointer group"
              >
                {/* Micro bounce on tap */}
                <motion.div
                  whileTap={{ scale: 0.86 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors duration-200',
                        isActive
                          ? 'text-neutral-950 dark:text-white stroke-[2.4]'
                          : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 stroke-[1.8]'
                      )}
                    />

                    {/* Notification Badge */}
                    {tab.badge && (
                      <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] font-black flex items-center justify-center shadow-xs">
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  <span
                    className={cn(
                      'text-[10px] tracking-tight mt-1 transition-colors duration-200',
                      isActive
                        ? 'text-neutral-950 dark:text-white font-bold'
                        : 'text-neutral-400 dark:text-neutral-500 font-medium group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                    )}
                  >
                    {tab.label === 'Listen/Live' ? 'Live' : tab.label}
                  </span>
                </motion.div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
