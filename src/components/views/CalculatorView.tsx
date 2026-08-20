import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Header } from '../ui/Header';
import {
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';
import { AnimatedNumber } from '../animated/AnimatedNumber';
import { AnimatedTabs } from '../animated/AnimatedTabs';
import { AnimatedCard } from '../animated/AnimatedCard';

export const CalculatorView: React.FC = () => {
  const { config, kpis, preTripLogs, deletePreTripLog, setActiveModal } = useApp();

  const [activeTool, setActiveTool] = useState<'budget' | 'fulltank' | 'pretrip'>('budget');

  // Tool 1: Budget -> Range
  const [budgetAmount, setBudgetAmount] = useState<string>('5000');
  const [customPrice, setCustomPrice] = useState<string>(kpis.latestPrice > 0 ? kpis.latestPrice.toString() : '');
  const [customEconomy, setCustomEconomy] = useState<string>(
    kpis.avgFuelEconomy > 0 ? kpis.avgFuelEconomy.toFixed(2) : ''
  );

  const parsedBudget = parseFloat(budgetAmount) || 0;
  const parsedPrice = parseFloat(customPrice) || kpis.latestPrice || 0;
  const parsedEconomy = parseFloat(customEconomy) || kpis.avgFuelEconomy || 0;

  const calculatedLitres = parsedPrice > 0 ? parsedBudget / parsedPrice : 0;
  const calculatedRange = calculatedLitres * parsedEconomy;
  const calculatedDays = kpis.avgDailyKm > 0 ? calculatedRange / kpis.avgDailyKm : 0;

  // Tool 2: Current Range -> Litres & Cost to Full Tank
  const [currentRangeGauge, setCurrentRangeGauge] = useState<string>(
    kpis.latestRangeGauge > 0 ? kpis.latestRangeGauge.toString() : ''
  );
  const [fullTankPrice, setFullTankPrice] = useState<string>(kpis.latestPrice > 0 ? kpis.latestPrice.toString() : '');
  const [fullTankEconomy, setFullTankEconomy] = useState<string>(
    kpis.avgFuelEconomy > 0 ? kpis.avgFuelEconomy.toFixed(2) : ''
  );
  
  const parsedCurrentGauge = parseFloat(currentRangeGauge) || 0;
  const parsedFullTankPrice = parseFloat(fullTankPrice) || kpis.latestPrice || 0;
  const parsedFullTankEconomy = parseFloat(fullTankEconomy) || kpis.avgFuelEconomy || 0;
  const safeTankCapacity = config.tankCapacityLitres;
  const safeBenchmark = kpis.fullRangeBenchmark;

  // Litres needed = Math.max(0, safeTankCapacity - (currentRangeGauge / parsedEconomy))
  const estLitresRemainingInTank = parsedFullTankEconomy > 0 ? Math.min(safeTankCapacity, parsedCurrentGauge / parsedFullTankEconomy) : 0;
  const estLitresToFull = Math.max(0, safeTankCapacity - estLitresRemainingInTank);
  const estCostToFull = estLitresToFull * parsedFullTankPrice;
  const kmToAdd = Math.max(0, safeBenchmark - parsedCurrentGauge);

  return (
    <div className="w-full pb-24 sm:pb-12 safe-pb">
      <Header
        title="Fuel Calculators"
        subtitle="Quick fuel estimation, budget forecasting & pre-trip range checks"
        onQuickAction={() => setActiveModal('pre-trip-check')}
        quickActionLabel="Pre-Trip Check"
        quickActionIcon={<Flame className="w-4 h-4" />}
      />

      <div className="px-4 sm:px-8 space-y-5 max-w-4xl mx-auto">
        {/* Animated Watermelon Segmented Tabs */}
        <AnimatedTabs
          tabs={[
            { id: 'budget', label: 'Money to Range' },
            { id: 'fulltank', label: 'Cost to Full Tank' },
            { id: 'pretrip', label: 'Pre-Trip Logs' },
          ]}
          activeTab={activeTool}
          onChange={(tab) => setActiveTool(tab as 'budget' | 'fulltank' | 'pretrip')}
          layoutId="calc-tool-tabs"
          size="md"
        />

        <AnimatePresence mode="wait">
          {/* TOOL 1: MONEY TO RANGE */}
          {activeTool === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <AnimatedCard className="p-5 sm:p-6 rounded-3xl liquid-card space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    How Far Will My Budget Take Me?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calculate estimated volume, drivable range, and days of commuting based on fuel expenditure.
                  </p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quick select:</span>
                  {[2000, 3000, 5000, 7500, 10000, 15000].map((amt) => (
                    <motion.button
                      key={amt}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBudgetAmount(amt.toString())}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        budgetAmount === amt.toString()
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm'
                          : 'liquid-glass text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {config.currency}{amt.toLocaleString()}
                    </motion.button>
                  ))}
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Budget Amount ({config.currency})
                    </label>
                    <input
                      type="number"
                      id="calc-budget-input"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Fuel Price ({config.currency}/L)
                    </label>
                    <input
                      type="number"
                      id="calc-price-input"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="Enter current fuel price"
                      className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Car Economy (km/L)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      id="calc-economy-input"
                      value={customEconomy}
                      onChange={(e) => setCustomEconomy(e.target.value)}
                      placeholder="Enter fuel economy"
                      className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Output Result Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white shadow-xl shadow-sky-500/20 space-y-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                      Estimated Drivable Range
                    </span>
                    <span className="text-xs text-white/80">
                      {parsedEconomy > 0 && parsedPrice > 0 
                        ? `@ ${parsedEconomy} km/L & ${config.currency}${parsedPrice}/L`
                        : 'Enter fuel price and economy'
                      }
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">
                      <AnimatedNumber value={calculatedRange} />
                    </span>
                    <span className="text-xl font-medium text-white/80">{config.distanceUnit}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/20 text-xs">
                    <div>
                      <span className="text-white/70 block">Volume Bought</span>
                      <span className="text-base font-bold text-white">
                        <AnimatedNumber value={calculatedLitres} decimals={2} /> {config.volumeUnit}
                      </span>
                    </div>

                    <div>
                      <span className="text-white/70 block">Commute Duration</span>
                      <span className="text-base font-bold text-white">
                        ~<AnimatedNumber value={calculatedDays} /> days
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-white/70 block">Cost / Km</span>
                      <span className="text-base font-bold text-white">
                        <AnimatedNumber value={parsedPrice / parsedEconomy} decimals={2} prefix={config.currency} />/km
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          )}

          {/* TOOL 2: COST TO FULL TANK */}
          {activeTool === 'fulltank' && (
            <motion.div
              key="fulltank"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <AnimatedCard className="p-5 sm:p-6 rounded-3xl liquid-card space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cost to Full Tank from Current Level
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Estimate the exact litres needed and total cost to top off the tank to capacity ({safeTankCapacity}L).
                  </p>
                </div>

                {/* Current Range Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Current Instrument Cluster Range Gauge ({config.distanceUnit})
                    </label>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {parsedCurrentGauge} km
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={safeBenchmark}
                    step="5"
                    value={parsedCurrentGauge}
                    onChange={(e) => setCurrentRangeGauge(e.target.value)}
                    className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-emerald-500 cursor-pointer"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      id="calc-fulltank-range-input"
                      value={currentRangeGauge}
                      onChange={(e) => setCurrentRangeGauge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Enter current km reading on dash"
                    />
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCurrentRangeGauge(kpis.latestRangeGauge.toString())}
                      className="px-3 py-2 rounded-xl liquid-glass text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      Use Latest ({kpis.latestRangeGauge} km)
                    </motion.button>
                  </div>
                </div>

                {/* Output Result Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl shadow-emerald-500/20 space-y-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                      Est. Cost to Fill Tank to {safeTankCapacity} Litres
                    </span>
                    <span className="text-xs text-white/80">
                      {parsedPrice > 0 
                        ? `Petrol Price: ${config.currency}${parsedPrice}/L`
                        : 'Enter fuel price'
                      }
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight">
                      <AnimatedNumber value={estCostToFull} prefix={config.currency} />
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/20 text-xs">
                    <div>
                      <span className="text-white/70 block">Litres Needed</span>
                      <span className="text-base font-bold text-white">
                        ~<AnimatedNumber value={estLitresToFull} decimals={1} /> {config.volumeUnit}
                      </span>
                    </div>

                    <div>
                      <span className="text-white/70 block">Remaining in Tank</span>
                      <span className="text-base font-bold text-white">
                        ~<AnimatedNumber value={estLitresRemainingInTank} decimals={1} /> {config.volumeUnit}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-white/70 block">Range Added</span>
                      <span className="text-base font-bold text-white">
                        +<AnimatedNumber value={kmToAdd} /> {config.distanceUnit}
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          )}

          {/* TOOL 3: PRE-TRIP LOGS & HISTORY */}
          {activeTool === 'pretrip' && (
            <motion.div
              key="pretrip"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Pre-Drive Inspection Logs
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Recorded range snapshots before hitting the road
                  </p>
                </div>
                <motion.button
                  type="button"
                  id="calc-new-pretrip-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal('pre-trip-check')}
                  className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 inline-flex items-center gap-1.5 cursor-pointer border border-purple-300/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Pre-Trip Check</span>
                </motion.button>
              </div>

              {preTripLogs.length === 0 ? (
                <div className="p-12 text-center rounded-3xl liquid-card">
                  <Flame className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No pre-trip logs yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Log your vehicle's range gauge before heading out to keep track of fuel reserves.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <AnimatePresence>
                    {preTripLogs.map((log) => {
                      const estL = kpis.avgFuelEconomy > 0 ? log.currentOdometer / kpis.avgFuelEconomy : 0;
                      const neededL = kpis.avgFuelEconomy > 0 ? Math.max(0, (kpis.fullRangeBenchmark - log.currentOdometer) / kpis.avgFuelEconomy) : 0;
                      const costFull = neededL * kpis.latestPrice;

                      return (
                        <AnimatedCard
                          key={log.id}
                          className="p-4 rounded-3xl liquid-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-400/25">
                              <Flame className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                  {new Date(log.date).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>Est. fuel: ~{estL.toFixed(1)}L</span>
                                <span>•</span>
                                <span>Full-tank cost: ~{config.currency}{Math.round(costFull)}</span>
                              </div>
                              {log.notes && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 bg-black/[0.02] dark:bg-white/[0.04] px-2.5 py-1 rounded-xl">
                                  "{log.notes}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <div className="text-left sm:text-right">
                              <span className="text-lg font-black text-purple-600 dark:text-purple-400 block">
                                {log.currentOdometer} {config.distanceUnit}
                              </span>
                              <span className="text-[11px] text-slate-400 block">Gauge Reading</span>
                            </div>

                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                if (confirm('Delete this pre-trip check?')) {
                                  deletePreTripLog(log.id);
                                }
                              }}
                              className="p-2 rounded-xl liquid-glass hover:bg-red-500/15 hover:border-red-500/30 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </AnimatedCard>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
