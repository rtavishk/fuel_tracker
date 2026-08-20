import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Fuel,
  Compass,
  Calculator,
  Settings,
  Zap,
  Plus,
  Moon,
  Sun,
  Flame,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import { MorphingDiscoveryBar, Category } from './MorphingDiscoveryBar';
import { AnimatedBadge } from '../animated/AnimatedBadge';
import { AnimatedNumber } from '../animated/AnimatedNumber';

export const DesktopNavBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    config,
    kpis,
    isDarkMode,
    setTheme,
    theme,
    setActiveModal,
    fuelEntries,
    tripEntries,
    setEditingFuelEntry,
    setCompletingFuelEntry,
    setEditingTrip,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    if (theme === 'system') setTheme(isDarkMode ? 'light' : 'dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  const categories: Category[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      activeColor: '#2563EB',
      activeTextColor: '#FFFFFF',
    },
    {
      id: 'fuel-log',
      label: 'Fuel Log',
      icon: <Fuel className="w-4 h-4" />,
      activeColor: '#D97706',
      activeTextColor: '#FFFFFF',
    },
    {
      id: 'trips',
      label: 'Trips',
      icon: <Compass className="w-4 h-4" />,
      activeColor: '#059669',
      activeTextColor: '#FFFFFF',
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: <Calculator className="w-4 h-4" />,
      activeColor: '#7C3AED',
      activeTextColor: '#FFFFFF',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      activeColor: isDarkMode ? '#27272A' : '#18181B',
      activeTextColor: '#FFFFFF',
    },
  ];

  // Quick search results
  const matchingFuel = searchQuery.trim()
    ? fuelEntries.filter((f) => {
        const q = searchQuery.toLowerCase();
        return (
          f.station?.toLowerCase().includes(q) ||
          f.notes?.toLowerCase().includes(q) ||
          f.date.includes(q) ||
          f.amountPaid.toString().includes(q)
        );
      }).slice(0, 4)
    : [];

  const matchingTrips = searchQuery.trim()
    ? tripEntries.filter((t) => {
        const q = searchQuery.toLowerCase();
        return (
          t.notes?.toLowerCase().includes(q) ||
          t.date.includes(q) ||
          t.kmDrivenToday?.toString().includes(q) ||
          t.totalOdometer?.toString().includes(q)
        );
      }).slice(0, 3)
    : [];

  const hasResults = matchingFuel.length > 0 || matchingTrips.length > 0;

  return (
    <header
      id="desktop-top-navbar"
      className="hidden sm:block sticky top-0 z-40 w-full bg-white/80 dark:bg-[#121214]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/10 select-none"
    >
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
        {/* Left: Vehicle Badge & Live Range */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-white">
                  {config.name}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  HEV DHT
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                Range: <strong className="text-neutral-800 dark:text-neutral-200"><AnimatedNumber value={kpis.latestRangeGauge} /> km</strong>
                <span className="text-neutral-400 dark:text-neutral-500 ml-1">({config.tankCapacityLitres}L)</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Center: Morphing Discovery Bar */}
        <div className="relative flex-1 flex justify-center max-w-2xl">
          <MorphingDiscoveryBar
            categories={categories}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as ActiveTab)}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            className="p-0"
          />

          {/* Live Search Floating Dropdown */}
          <AnimatePresence>
            {searchQuery.trim() !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-lg bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-3 z-50 text-xs"
              >
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/5 dark:border-white/5 text-neutral-400 font-semibold text-[11px]">
                  <span>Search results for "{searchQuery}"</span>
                  <span>{matchingFuel.length + matchingTrips.length} found</span>
                </div>

                {!hasResults ? (
                  <div className="py-6 text-center text-neutral-400">
                    No matching records found.
                  </div>
                ) : (
                  <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                    {matchingFuel.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-neutral-400 px-2 block mb-1">
                          Fuel Records
                        </span>
                        {matchingFuel.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('fuel-log');
                              setSearchQuery('');
                            }}
                            className="w-full p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center justify-between text-left transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Fuel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <div>
                                <p className="font-bold text-neutral-900 dark:text-white">
                                  {f.station || 'Fuel Fill-up'} · {config.currency}{f.amountPaid}
                                </p>
                                <p className="text-[11px] text-neutral-500">
                                  {f.date} · {f.litresFueled.toFixed(1)}L {f.fuelEconomy ? `· ${f.fuelEconomy.toFixed(1)} km/L` : ''}
                                </p>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        ))}
                      </div>
                    )}

                    {matchingTrips.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-neutral-400 px-2 block mb-1">
                          Trips / Odometer
                        </span>
                        {matchingTrips.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('trips');
                              setSearchQuery('');
                            }}
                            className="w-full p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 flex items-center justify-between text-left transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Compass className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <div>
                                <p className="font-bold text-neutral-900 dark:text-white">
                                  {t.notes || 'Trip Drive'} · {t.kmDrivenToday > 0 ? `+${t.kmDrivenToday} km` : `${t.totalOdometer} km`}
                                </p>
                                <p className="text-[11px] text-neutral-500">{t.date}</p>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Quick Action Buttons & Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <motion.button
            type="button"
            id="desktop-quick-fuel-btn"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveModal('log-fuel')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Fill-up</span>
          </motion.button>

          <motion.button
            type="button"
            id="desktop-theme-toggle-btn"
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200 flex items-center justify-center transition-colors relative overflow-hidden"
            title="Toggle color theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDarkMode ? 'dark' : 'light'}
                initial={{ y: -12, opacity: 0, rotate: -40 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 12, opacity: 0, rotate: 40 }}
                transition={{ duration: 0.18 }}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
