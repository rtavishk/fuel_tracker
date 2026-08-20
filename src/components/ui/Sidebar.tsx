import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Fuel,
  Compass,
  Calculator,
  Settings,
  Zap,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { AnimatedProgressBar } from '../animated/AnimatedProgressBar';
import { AnimatedNumber } from '../animated/AnimatedNumber';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    config,
    kpis,
    setActiveModal,
    fuelEntries,
  } = useApp();

  const pendingCount = fuelEntries.filter((e) => e.isPending).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'fuel-log',
      label: 'Fuel Log & Stats',
      icon: Fuel,
      badge: pendingCount > 0 ? `${pendingCount} pending` : undefined,
    },
    { id: 'trips', label: 'Daily Trip Log', icon: Compass },
    { id: 'calculator', label: 'Fuel Calculator', icon: Calculator },
  ];

  // Remaining range percentage based on full tank benchmark
  const remainingRangePercent = Math.min(
    100,
    Math.max(0, Math.round((kpis.latestRangeGauge / kpis.fullRangeBenchmark) * 100))
  );

  return (
    <aside
      id="desktop-sidebar"
      className="hidden sm:flex flex-col w-64 lg:w-72 bg-white/80 dark:bg-[#161618]/80 backdrop-blur-2xl border-r border-black/5 dark:border-white/10 h-screen sticky top-0 shrink-0 select-none z-30"
    >
      {/* Brand & Vehicle Header */}
      <div className="p-6 border-b border-black/5 dark:border-white/5">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base tracking-tight truncate leading-tight text-neutral-900 dark:text-white">
              {config.name}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              Hybrid DHT · {config.tankCapacityLitres}L Tank
            </p>
          </div>
        </motion.div>

        {/* Live Fuel & Range Gauge Mini Card */}
        <motion.div
          className="mt-4 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">Remaining Range</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              <AnimatedNumber value={kpis.latestRangeGauge} />{' '}
              <span className="font-normal text-[11px] text-neutral-500">{config.distanceUnit}</span>
            </span>
          </div>

          {/* Range Animated Progress Bar */}
          <AnimatedProgressBar
            value={remainingRangePercent}
            height="h-2"
            colorClassName={
              remainingRangePercent > 40
                ? 'bg-emerald-500'
                : remainingRangePercent > 20
                ? 'bg-amber-500'
                : 'bg-red-500'
            }
          />

          <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5">
            <span>Benchmark: {Math.round(kpis.fullRangeBenchmark)} km</span>
            <span>~{kpis.projectedDaysToEmpty} days left</span>
          </div>
        </motion.div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              type="button"
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 bg-blue-600 rounded-2xl shadow-sm shadow-blue-500/25 -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}

              <div className="flex items-center gap-3 z-10">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`z-10 text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}

        {/* Quick Actions Header */}
        <div className="pt-4 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Quick Actions
        </div>

        <motion.button
          type="button"
          id="sidebar-quick-fuel"
          onClick={() => setActiveModal('log-fuel')}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
        >
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Fuel className="w-3.5 h-3.5" />
          </div>
          <span>Log Fill-up</span>
        </motion.button>

        <motion.button
          type="button"
          id="sidebar-quick-trip"
          onClick={() => setActiveModal('log-trip')}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span>Log Today's Odometer</span>
        </motion.button>

        <motion.button
          type="button"
          id="sidebar-quick-pretrip"
          onClick={() => setActiveModal('pre-trip-check')}
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
        >
          <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <span>Pre-drive Check</span>
        </motion.button>
      </div>

      {/* Footer / Settings Pin */}
      <div className="p-4 border-t border-black/5 dark:border-white/5">
        <motion.button
          type="button"
          id="sidebar-nav-settings"
          onClick={() => setActiveTab('settings')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
            activeTab === 'settings'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-neutral-950 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Vehicle Settings</span>
        </motion.button>
      </div>
    </aside>
  );
};
