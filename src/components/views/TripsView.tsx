import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Header } from '../ui/Header';
import {
  Compass,
  Plus,
  Trash2,
  Edit2,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AnimatedNumber } from '../animated/AnimatedNumber';
import { AnimatedCard } from '../animated/AnimatedCard';

export const TripsView: React.FC = () => {
  const {
    dailyTrips,
    deleteDailyTrip,
    config,
    kpis,
    setActiveModal,
    setEditingDailyTrip,
    isDarkMode,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = dailyTrips.filter((t) => {
    const q = searchQuery.toLowerCase();
    return t.date.includes(q) || t.notes?.toLowerCase().includes(q);
  });

  const chartData = [...dailyTrips]
    .slice(0, 14)
    .reverse()
    .map((t) => ({
      date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      kmDriven: Math.round(t.kmDrivenToday),
      rollingAvg: Math.round(t.sevenDayRollingAvg),
    }));

  const chartThemeColors = {
    grid: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.06)',
    text: isDarkMode ? '#94a3b8' : '#64748b',
    tooltipBg: isDarkMode ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
    tooltipBorder: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)',
  };

  const totalKmDrivenInLog = dailyTrips.reduce((acc, t) => acc + t.kmDrivenToday, 0);

  return (
    <div className="w-full pb-24 sm:pb-12 safe-pb">
      <Header
        title="Trip & Odometer Logs"
        subtitle="Cumulative odometer logs, calculated daily mileage & rolling averages"
        onQuickAction={() => {
          setEditingDailyTrip(null);
          setActiveModal('log-trip');
        }}
        quickActionLabel="Log Odometer"
        quickActionIcon={<Plus className="w-4 h-4" />}
      />

      <div className="px-4 sm:px-8 space-y-5 max-w-5xl mx-auto">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AnimatedCard delay={0.05} className="p-4 rounded-3xl liquid-card">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Daily Rolling Average</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                <AnimatedNumber value={kpis.avgDailyKm} />
              </span>
              <span className="text-xs text-slate-500 font-medium">{config.distanceUnit} / day</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Based on 7-entry rolling window</span>
          </AnimatedCard>

          <AnimatedCard delay={0.1} className="p-4 rounded-3xl liquid-card">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Projected Refuel Countdown</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                ~<AnimatedNumber value={kpis.projectedDaysToEmpty} />
              </span>
              <span className="text-xs text-slate-500 font-medium">days until empty</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Current tank has {kpis.latestRangeGauge} {config.distanceUnit} range left
            </span>
          </AnimatedCard>

          <AnimatedCard delay={0.15} className="p-4 rounded-3xl liquid-card">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Logged Daily Distance</span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                <AnimatedNumber value={totalKmDrivenInLog} />
              </span>
              <span className="text-xs text-slate-500 font-medium">{config.distanceUnit}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">Across {dailyTrips.length} daily logs</span>
          </AnimatedCard>
        </div>

        {/* 14-day Chart */}
        {dailyTrips.length > 1 && (
          <AnimatedCard delay={0.2} className="p-5 rounded-3xl liquid-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daily Driven Distance (Last 14 Days)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated from consecutive cumulative odometer entries
                </p>
              </div>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartThemeColors.grid} vertical={false} />
                  <XAxis dataKey="date" stroke={chartThemeColors.text} fontSize={11} tickLine={false} />
                  <YAxis stroke={chartThemeColors.text} fontSize={11} tickLine={false} unit=" km" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartThemeColors.tooltipBg,
                      borderColor: chartThemeColors.tooltipBorder,
                      borderRadius: 16,
                      fontSize: 12,
                      backdropFilter: 'blur(16px)',
                    }}
                  />
                  <Bar dataKey="kmDriven" name="Daily km" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="trip-search-input"
            placeholder="Search trips by date or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* List of Trip Records */}
        {filteredTrips.length === 0 ? (
          <div className="p-12 text-center rounded-3xl liquid-card">
            <Compass className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No daily trips recorded
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tap "Log Odometer" each day to track daily driven distance and fuel spend.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filteredTrips.map((trip) => (
                <AnimatedCard
                  key={trip.id}
                  id={`trip-card-${trip.id}`}
                  className="p-4 rounded-3xl liquid-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/20">
                      <Compass className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {new Date(trip.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Odo: {trip.totalOdometer.toLocaleString()} km
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>
                          Est. Cost: <strong className="text-slate-800 dark:text-slate-200">{config.currency}{Math.round(trip.estimatedFuelCostToday)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Rolling Avg: <strong>{trip.sevenDayRollingAvg.toFixed(1)} km/d</strong>
                        </span>
                      </div>

                      {trip.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
                          "{trip.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Daily Metric and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
                        +{Math.round(trip.kmDrivenToday)} {config.distanceUnit}
                      </span>
                      <span className="text-[11px] text-slate-400 block">Driven today</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setEditingDailyTrip(trip);
                          setActiveModal('log-trip');
                        }}
                        className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Edit trip"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (confirm('Delete this odometer reading?')) {
                            deleteDailyTrip(trip.id);
                          }
                        }}
                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
