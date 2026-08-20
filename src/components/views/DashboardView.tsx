import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Header } from '../ui/Header';
import {
  Fuel,
  Compass,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  AlertCircle,
  Gauge,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AnimatedNumber } from '../animated/AnimatedNumber';
import { AnimatedTabs } from '../animated/AnimatedTabs';
import { AnimatedCard } from '../animated/AnimatedCard';
import { AnimatedProgressBar } from '../animated/AnimatedProgressBar';
import { AnimatedBadge } from '../animated/AnimatedBadge';

type ChartTab = 'economy' | 'distance' | 'cost' | 'dailyKm';

export const DashboardView: React.FC = () => {
  const {
    fuelEntries,
    dailyTrips,
    kpis,
    config,
    setActiveModal,
    setCompletingFuelEntry,
    isDarkMode,
  } = useApp();

  const [activeChartTab, setActiveChartTab] = useState<ChartTab>('economy');

  const pendingEntry = fuelEntries.find((e) => e.isPending);

  // Prepare chart datasets
  const chronologicalFuel = [...fuelEntries]
    .filter((e) => !e.isPending)
    .reverse()
    .map((e, index) => ({
      fillNumber: `#${index + 1}`,
      date: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      fuelEconomy: e.fuelEconomy ? Number(e.fuelEconomy.toFixed(2)) : null,
      distanceThisFill: e.distanceThisFill,
      pricePerLitre: e.pricePerLitre,
      costPerKm: e.costPerKm ? Number(e.costPerKm.toFixed(2)) : null,
      litresFueled: Number(e.litresFueled.toFixed(1)),
      amountPaid: e.amountPaid,
    }));

  const chronologicalTrips = [...dailyTrips]
    .slice(0, 30)
    .reverse()
    .map((t) => ({
      date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      kmDrivenToday: Math.round(t.kmDrivenToday),
      sevenDayRollingAvg: Number(t.sevenDayRollingAvg.toFixed(1)),
      estimatedFuelCostToday: Math.round(t.estimatedFuelCostToday),
    }));

  const renderTrendBadge = () => {
    if (displayKpis.economyTrend === 'insufficient_data') {
      return (
        <AnimatedBadge variant="neutral" icon={<HelpCircle className="w-3.5 h-3.5" />}>
          Needs ≥4 fills for trend
        </AnimatedBadge>
      );
    }
    if (displayKpis.economyTrend === 'improving') {
      return (
        <AnimatedBadge variant="emerald" pulseDot={true} icon={<TrendingUp className="w-3.5 h-3.5" />}>
          Improving (+{displayKpis.economyTrendPercent.toFixed(1)}% vs avg)
        </AnimatedBadge>
      );
    }
    if (displayKpis.economyTrend === 'declining') {
      return (
        <AnimatedBadge variant="red" icon={<TrendingDown className="w-3.5 h-3.5" />}>
          Declining ({displayKpis.economyTrendPercent.toFixed(1)}% vs avg)
        </AnimatedBadge>
      );
    }
    return (
      <AnimatedBadge variant="blue" icon={<Minus className="w-3.5 h-3.5" />}>
        Stable ({displayKpis.economyTrendPercent > 0 ? '+' : ''}{displayKpis.economyTrendPercent.toFixed(1)}%)
      </AnimatedBadge>
    );
  };

  const chartThemeColors = {
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.06)',
    text: isDarkMode ? '#94a3b8' : '#64748b',
    tooltipBg: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
    tooltipBorder: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)',
  };

  const remainingPercent = kpis.fullRangeBenchmark > 0 && kpis.latestRangeGauge > 0
    ? Math.min(100, Math.max(5, (kpis.latestRangeGauge / kpis.fullRangeBenchmark) * 100))
    : 0;

  const hasData = fuelEntries.some(e => !e.isPending && e.distanceThisFill !== null) || dailyTrips.some(t => t.kmDrivenToday > 0);

  // Reset KPIs to 0 when no data exists
  const displayKpis = hasData ? kpis : {
    ...kpis,
    latestRangeGauge: 0,
    avgFuelEconomy: 0,
    avgCostPerKm: 0,
    avgDailyKm: 0,
    fullRangeBenchmark: 0,
    projectedDaysToEmpty: 0,
  };

  return (
    <div className="w-full pb-24 sm:pb-12 safe-pb">
      <Header
        title="Dashboard"
        subtitle={`Overview and real-time efficiency metrics for your ${config.name}`}
        onQuickAction={() => setActiveModal('log-fuel')}
        quickActionLabel="Log Fill-up"
        quickActionIcon={<Fuel className="w-3.5 h-3.5" />}
      />

      <div className="px-4 sm:px-8 space-y-6 max-w-6xl mx-auto">
        {/* Pending Fill-up Alert Banner */}
        <AnimatePresence>
          {pendingEntry && (
            <AnimatedCard
              id="dashboard-pending-banner"
              className="p-4 rounded-3xl liquid-card bg-amber-500/10 dark:bg-amber-500/15 border-amber-400/40 dark:border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pending Fill-up Entry
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {new Date(pendingEntry.date).toLocaleDateString()} · {pendingEntry.litresFueled.toFixed(1)}L fueled. Log final range gauge to compute economy.
                  </p>
                </div>
              </div>
              <motion.button
                type="button"
                id="dashboard-complete-fill-btn"
                onClick={() => {
                  setCompletingFuelEntry(pendingEntry);
                  setActiveModal('complete-fill');
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/25 shrink-0 border border-amber-300/30 cursor-pointer"
              >
                Complete Reading
              </motion.button>
            </AnimatedCard>
          )}
        </AnimatePresence>

        {/* Quick Action Pills Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <motion.button
            type="button"
            id="dash-quick-log-fuel"
            onClick={() => setActiveModal('log-fuel')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="p-3.5 sm:p-4 rounded-3xl liquid-card hover:border-slate-400/40 dark:hover:border-white/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-slate-400/15 dark:border-white/10">
              <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Log Fill-up
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
              Record refuel & price
            </p>
          </motion.button>

          <motion.button
            type="button"
            id="dash-quick-log-trip"
            onClick={() => setActiveModal('log-trip')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="p-3.5 sm:p-4 rounded-3xl liquid-card hover:border-slate-400/40 dark:hover:border-white/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-slate-400/15 dark:border-white/10">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Log Odometer
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
              Cumulative total km
            </p>
          </motion.button>

          <motion.button
            type="button"
            id="dash-quick-pretrip"
            onClick={() => setActiveModal('pre-trip-check')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="p-3.5 sm:p-4 rounded-3xl liquid-card hover:border-slate-400/40 dark:hover:border-white/20 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform border border-slate-400/15 dark:border-white/10">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Pre-Drive Check
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
              Range & cost to full
            </p>
          </motion.button>
        </div>

        {/* Hero Range & Key Stats Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Hero Card: Current Tank & Range Gauge */}
          <AnimatedCard
            id="hero-range-card"
            className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/20 dark:border-white/10"
          >
            {/* Liquid Specular Light Sheen */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
            <div className="absolute -right-8 -top-8 w-52 h-52 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl text-xs font-semibold tracking-wide border border-white/15 shadow-xs text-white">
                  <Gauge className="w-3.5 h-3.5 text-white/90" />
                  <span>Remaining Range Gauge</span>
                </div>
                {hasData && renderTrendBadge()}
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                {hasData ? (
                  <>
                    <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm text-white">
                      <AnimatedNumber value={displayKpis.latestRangeGauge} />
                    </span>
                    <span className="text-xl font-medium text-white/70">
                      {config.distanceUnit}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm text-white/50">
                    --
                  </span>
                )}
              </div>
              <p className="text-xs text-white/75 mt-1 font-normal">
                {hasData 
                  ? `Distance-to-Empty estimated on current tank (~${displayKpis.projectedDaysToEmpty} days based on daily avg ${Math.round(displayKpis.avgDailyKm)} km)`
                  : 'Log your first fuel entry to see range estimates'
                }
              </p>
            </div>

            {/* Gauge benchmark visual bar with animated progress */}
            {hasData && (
              <div className="mt-6 pt-4 border-t border-white/15 relative z-10">
                <div className="flex items-center justify-between text-xs text-white/90 mb-2 font-medium">
                  <span>Current: {displayKpis.latestRangeGauge} km</span>
                  <span>Full Tank Benchmark: {Math.round(displayKpis.fullRangeBenchmark)} km</span>
                </div>
                <AnimatedProgressBar
                  value={remainingPercent}
                  height="h-2.5"
                  colorClassName="bg-white"
                  backgroundClassName="bg-white/15"
                />
              </div>
            )}
          </AnimatedCard>

          {/* Quick Metrics Column */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <AnimatedCard
              delay={0.05}
              className="p-4 rounded-3xl liquid-card flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Avg Fuel Economy</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/20">
                  Hybrid HEV
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {hasData ? (
                    <>
                      <AnimatedNumber value={displayKpis.avgFuelEconomy} decimals={2} />{' '}
                      <span className="text-xs font-normal text-slate-500">km/L</span>
                    </>
                  ) : (
                    <span className="text-slate-400">--</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {hasData ? `Across ${displayKpis.completedFillCount} completed full tanks` : 'Log fuel entries to see economy'}
                </p>
              </div>
            </AnimatedCard>

            <AnimatedCard
              delay={0.1}
              className="p-4 rounded-3xl liquid-card flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Average Cost per Km</span>
                <span className="text-xs text-slate-400">Operating Cost</span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {hasData ? (
                    <>
                      <AnimatedNumber value={displayKpis.avgCostPerKm} decimals={2} prefix={config.currency} />{' '}
                      <span className="text-xs font-normal text-slate-500">/km</span>
                    </>
                  ) : (
                    <span className="text-slate-400">--</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Latest fuel price: {config.currency}{kpis.latestPrice}/L
                </p>
              </div>
            </AnimatedCard>
          </div>
        </div>

        {/* Secondary KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AnimatedCard delay={0.15} className="p-4 rounded-3xl liquid-card">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Spent</span>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              <AnimatedNumber value={kpis.totalSpent} prefix={config.currency} />
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">{kpis.fillCount} refuels logged</span>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="p-4 rounded-3xl liquid-card">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Fuel Volume</span>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              <AnimatedNumber value={kpis.totalLitres} decimals={1} />{' '}
              <span className="text-xs font-normal text-slate-500">{config.volumeUnit}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">Avg {config.currency}{kpis.avgPricePerLitre.toFixed(1)}/L</span>
          </AnimatedCard>

          <AnimatedCard delay={0.25} className="p-4 rounded-3xl liquid-card">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Tracked Distance</span>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              <AnimatedNumber value={kpis.totalDistance} />{' '}
              <span className="text-xs font-normal text-slate-500">{config.distanceUnit}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">On full tank cycles</span>
          </AnimatedCard>

          <AnimatedCard delay={0.3} className="p-4 rounded-3xl liquid-card">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Daily Average Drive</span>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {hasData ? (
                <>
                  <AnimatedNumber value={displayKpis.avgDailyKm} />{' '}
                  <span className="text-xs font-normal text-slate-500">{config.distanceUnit}/day</span>
                </>
              ) : (
                <span className="text-slate-400">--</span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">{hasData ? 'From trip odometer logs' : 'Log trips to see daily average'}</span>
          </AnimatedCard>
        </div>

        {/* Interactive Unified Charts Section */}
        <AnimatedCard delay={0.35} className="p-5 sm:p-6 rounded-3xl liquid-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Historical Analytics & Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive time-series telemetry pulling from both Fuel and Trip logs
              </p>
            </div>

            {/* Segmented Control for Chart Selection */}
            <AnimatedTabs
              tabs={[
                { id: 'economy', label: 'Fuel Economy' },
                { id: 'distance', label: 'Fill-up Distance' },
                { id: 'cost', label: 'Cost / Km' },
                { id: 'dailyKm', label: 'Daily Km' },
              ]}
              activeTab={activeChartTab}
              onChange={(tab) => setActiveChartTab(tab)}
              layoutId="dashboard-chart-tab"
              size="sm"
            />
          </div>

          {/* Chart Display Area */}
          <div className="h-64 sm:h-72 w-full pt-2">
            {activeChartTab === 'economy' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chronologicalFuel}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartThemeColors.grid} vertical={false} />
                  <XAxis dataKey="date" stroke={chartThemeColors.text} fontSize={12} tickLine={false} />
                  <YAxis
                    stroke={chartThemeColors.text}
                    fontSize={12}
                    tickLine={false}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    unit=" km/L"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartThemeColors.tooltipBg,
                      borderColor: chartThemeColors.tooltipBorder,
                      borderRadius: 16,
                      fontSize: 12,
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fuelEconomy"
                    name="Economy (km/L)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'distance' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chronologicalFuel}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartThemeColors.grid} vertical={false} />
                  <XAxis dataKey="date" stroke={chartThemeColors.text} fontSize={12} tickLine={false} />
                  <YAxis stroke={chartThemeColors.text} fontSize={12} tickLine={false} unit=" km" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartThemeColors.tooltipBg,
                      borderColor: chartThemeColors.tooltipBorder,
                      borderRadius: 16,
                      fontSize: 12,
                      backdropFilter: 'blur(16px)',
                    }}
                  />
                  <Bar
                    dataKey="distanceThisFill"
                    name="Distance Added (km)"
                    fill={isDarkMode ? '#cbd5e1' : '#334155'}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'cost' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chronologicalFuel}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartThemeColors.grid} vertical={false} />
                  <XAxis dataKey="date" stroke={chartThemeColors.text} fontSize={12} tickLine={false} />
                  <YAxis
                    stroke={chartThemeColors.text}
                    fontSize={12}
                    tickLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    unit={` ${config.currency}/km`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartThemeColors.tooltipBg,
                      borderColor: chartThemeColors.tooltipBorder,
                      borderRadius: 16,
                      fontSize: 12,
                      backdropFilter: 'blur(16px)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="costPerKm"
                    name={`Cost (${config.currency}/km)`}
                    stroke={isDarkMode ? '#f8fafc' : '#0f172a'}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: isDarkMode ? '#f8fafc' : '#0f172a', strokeWidth: 2, stroke: isDarkMode ? '#090d15' : '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'dailyKm' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chronologicalTrips}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartThemeColors.grid} vertical={false} />
                  <XAxis dataKey="date" stroke={chartThemeColors.text} fontSize={12} tickLine={false} />
                  <YAxis stroke={chartThemeColors.text} fontSize={12} tickLine={false} unit=" km" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartThemeColors.tooltipBg,
                      borderColor: chartThemeColors.tooltipBorder,
                      borderRadius: 16,
                      fontSize: 12,
                      backdropFilter: 'blur(16px)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="kmDrivenToday"
                    name="Daily km"
                    stroke={isDarkMode ? '#ffffff' : '#0f172a'}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: isDarkMode ? '#ffffff' : '#0f172a' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sevenDayRollingAvg"
                    name="7-Entry Rolling Avg"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

