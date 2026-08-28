import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AnimatedTabs, TabItem } from '../ui/AnimatedTabs';
import { CalculatorSubTab } from '../../types';
import {
  Fuel,
  DollarSign,
  Gauge,
  Plus,
  Trash2,
  Info,
} from 'lucide-react';
import { motion } from 'motion/react';

export const Calculator: React.FC = () => {
  const {
    calculatorTab,
    setCalculatorTab,
    vehicleConfig,
    fuelStats,
    fullRangeBenchmark,
    currentFuelPrice,
    setIsFuelPriceModalOpen,
    computedPreTripEntries,
    addPreTripEntry,
    deletePreTripEntry,
  } = useApp();

  // Tab 1: How far will this money take me?
  const [tab1CurrentOdo, setTab1CurrentOdo] = useState<string>('95');
  const [tab1Money, setTab1Money] = useState<string>('3500');
  const [tab1Price, setTab1Price] = useState<string>(
    currentFuelPrice ? currentFuelPrice.toString() : '106.5'
  );

  // Tab 2: How much do I need to full-tank from here?
  const [tab2CurrentOdo, setTab2CurrentOdo] = useState<string>('120');
  const [tab2Price, setTab2Price] = useState<string>(
    currentFuelPrice ? currentFuelPrice.toString() : '106.5'
  );

  // Tab 3: Pre-trip log form state
  const [ptDate, setPtDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [ptCurrentOdo, setPtCurrentOdo] = useState<string>('420');
  const [ptPurpose, setPtPurpose] = useState<string>('Highway roadtrip commute');

  // Calculations for Tab 1 (§6.3.1)
  const numTab1Current = parseFloat(tab1CurrentOdo) || 0;
  const numTab1Money = parseFloat(tab1Money) || 0;
  const numTab1Price = parseFloat(tab1Price) || 106.5;

  const tab1LitresGot = numTab1Price > 0 ? numTab1Money / numTab1Price : 0;
  const tab1EstDistance = tab1LitresGot * (fuelStats.avgEconomy || 14.5);
  const tab1EstOdoAfter = numTab1Current + tab1EstDistance;

  // Calculations for Tab 2 (§6.3.2)
  const numTab2Current = parseFloat(tab2CurrentOdo) || 0;
  const numTab2Price = parseFloat(tab2Price) || 106.5;

  const tab2KmNeeded = Math.max(0, fullRangeBenchmark - numTab2Current);
  const tab2MoneyNeeded = tab2KmNeeded * (fuelStats.avgCostPerKm || 7.3);
  const tab2LitresNeeded = numTab2Price > 0 ? tab2MoneyNeeded / numTab2Price : 0;

  // Tab 3 Add Pre-Trip Log
  const handleAddPreTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const odo = parseFloat(ptCurrentOdo);
    if (isNaN(odo) || odo < 0) return;

    addPreTripEntry({
      date: new Date(ptDate).toISOString(),
      currentOdometer: odo,
      tripPurpose: ptPurpose.trim() || 'Daily transit',
    });
    setPtCurrentOdo('');
    setPtPurpose('');
  };

  const tabs: TabItem<CalculatorSubTab>[] = [
    {
      id: 'how-far',
      label: 'Budget Distance Planner',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      id: 'full-tank',
      label: 'Full-Tank Cost Estimator',
      icon: <Fuel className="w-4 h-4" />,
    },
    {
      id: 'pretrip-log',
      label: 'Pre-Trip Live Log',
      icon: <Gauge className="w-4 h-4" />,
      badge: computedPreTripEntries.length,
    },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Title & Tabs Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Fuel Calculators & Forecasts
            </h2>
            <Badge variant="emerald" size="sm">
              Live Avg: {fuelStats.avgEconomy.toFixed(1)} km/L
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Real-time budget forecasting and pre-drive fuel reserve telemetry.
          </p>
        </div>

        {/* Animated Sub-tabs Selector */}
        <div className="overflow-x-auto pb-1 max-w-full">
          <AnimatedTabs
            tabs={tabs}
            activeTab={calculatorTab}
            onChange={setCalculatorTab}
            pillLayoutId="calculator-sub-tabs"
            size="sm"
          />
        </div>
      </div>

      {/* TAB 1: How far will this money take me? */}
      {calculatorTab === 'how-far' && (
        <motion.div
          key="tab-how-far"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Inputs Column */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 sm:p-6 border-zinc-800 bg-[#121215]/90 shadow-xl" glow="emerald">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-800">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">How Far Will This Money Take Me?</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">Forward Distance Forecast</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Range Gauge */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Current Odometer (Range Gauge)</span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {numTab1Current} {vehicleConfig.distanceUnit}
                    </span>
                  </label>
                  <div className="relative">
                    <Gauge className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={tab1CurrentOdo}
                      onChange={(e) => setTab1CurrentOdo(e.target.value)}
                      placeholder="e.g. 95"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  {/* Quick Gauge Range Pills */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold shrink-0 font-mono">
                      Gauge:
                    </span>
                    {[50, 85, 120, 200, 350].map((gauge) => (
                      <button
                        key={gauge}
                        type="button"
                        onClick={() => setTab1CurrentOdo(gauge.toString())}
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                          tab1CurrentOdo === gauge.toString()
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {gauge} {vehicleConfig.distanceUnit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Money to Spend */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Money to Spend ({vehicleConfig.currency})
                  </label>
                  <div className="relative">
                    <span className="text-xs font-bold text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2">
                      {vehicleConfig.currency}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="50"
                      value={tab1Money}
                      onChange={(e) => setTab1Money(e.target.value)}
                      placeholder="3500"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  {/* Quick Money Steppers */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold shrink-0 font-mono">
                      Amount:
                    </span>
                    {[1000, 2000, 3500, 4500, 5000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTab1Money(amt.toString())}
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                          tab1Money === amt.toString()
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {vehicleConfig.currency} {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price per Litre */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Price / Litre Today</span>
                    <button
                      type="button"
                      onClick={() => setIsFuelPriceModalOpen(true)}
                      className="text-[10px] text-emerald-400 hover:underline font-mono"
                    >
                      Update Rate
                    </button>
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={tab1Price}
                    onChange={(e) => setTab1Price(e.target.value)}
                    placeholder="106.5"
                    className="w-full px-3.5 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Outputs Column */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 border-zinc-800 bg-[#121215]/90 shadow-xl" glow="teal">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Computed Outputs & Telemetry
                </span>
                <Badge variant="emerald" size="xs">
                  Avg Economy: {fuelStats.avgEconomy.toFixed(2)} km/L
                </Badge>
              </div>

              {/* Major Output Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Litres You'll Get */}
                <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 flex flex-col justify-between">
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase font-mono">
                    Litres You'll Get
                  </span>
                  <div className="my-2 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {tab1LitresGot.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-400 ml-1">{vehicleConfig.volumeUnit}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {vehicleConfig.currency} {numTab1Money.toLocaleString()} ÷ {numTab1Price}
                  </span>
                </div>

                {/* Estimated Distance */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
                  <span className="text-[11px] text-emerald-300 font-semibold uppercase font-mono">
                    Estimated Distance
                  </span>
                  <div className="my-2 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                      +{Math.round(tab1EstDistance)}
                    </span>
                    <span className="text-xs text-emerald-300 ml-1">
                      {vehicleConfig.distanceUnit}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-200/70 font-mono">
                    {tab1LitresGot.toFixed(1)} L × {fuelStats.avgEconomy.toFixed(1)} km/L
                  </span>
                </div>

                {/* Estimated Odometer After */}
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex flex-col justify-between">
                  <span className="text-[11px] text-teal-300 font-semibold uppercase font-mono">
                    Est. Gauge After Refuel
                  </span>
                  <div className="my-2 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-teal-300">
                      {Math.round(tab1EstOdoAfter)}
                    </span>
                    <span className="text-xs text-teal-400 ml-1">{vehicleConfig.distanceUnit}</span>
                  </div>
                  <span className="text-[10px] text-teal-200/70 font-mono">
                    {numTab1Current} + {Math.round(tab1EstDistance)} {vehicleConfig.distanceUnit}
                  </span>
                </div>
              </div>

              {/* Visual Range Progression Bar */}
              <div className="mt-6 p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Distance-to-Empty Expansion</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {Math.round(tab1EstOdoAfter)} / {fullRangeBenchmark} {vehicleConfig.distanceUnit}{' '}
                    Full Tank
                  </span>
                </div>

                <div className="h-3.5 w-full bg-zinc-900 rounded-full overflow-hidden flex relative">
                  {/* Current base range */}
                  <div
                    style={{
                      width: `${Math.min(100, (numTab1Current / fullRangeBenchmark) * 100)}%`,
                    }}
                    className="bg-teal-600 h-full transition-all duration-500"
                    title={`Current Range: ${numTab1Current} km`}
                  />
                  {/* Added distance from money */}
                  <div
                    style={{
                      width: `${Math.min(
                        100 - (numTab1Current / fullRangeBenchmark) * 100,
                        (tab1EstDistance / fullRangeBenchmark) * 100
                      )}%`,
                    }}
                    className="bg-emerald-400 h-full transition-all duration-500"
                    title={`Added Distance: +${Math.round(tab1EstDistance)} km`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    Current: {numTab1Current} km
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Refueled: +{Math.round(tab1EstDistance)} km
                  </span>
                  <span>Full: ~{fullRangeBenchmark} km</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* TAB 2: How much do I need to full-tank from here? */}
      {calculatorTab === 'full-tank' && (
        <motion.div
          key="tab-full-tank"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 border-zinc-800 bg-[#121215]/90 shadow-xl" glow="teal">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-800">
                <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Full-Tank Cost Estimator</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">Top-Up Target Calculations</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Current Odometer */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Current Odometer (Range Gauge)</span>
                    <span className="text-[11px] font-mono text-teal-400 font-bold">
                      {numTab2Current} {vehicleConfig.distanceUnit}
                    </span>
                  </label>
                  <div className="relative">
                    <Gauge className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={tab2CurrentOdo}
                      onChange={(e) => setTab2CurrentOdo(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  {/* Quick Gauge Range Pills */}
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold shrink-0 font-mono">
                      Gauge:
                    </span>
                    {[30, 60, 90, 150, 250].map((gauge) => (
                      <button
                        key={gauge}
                        type="button"
                        onClick={() => setTab2CurrentOdo(gauge.toString())}
                        className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                          tab2CurrentOdo === gauge.toString()
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                            : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {gauge} {vehicleConfig.distanceUnit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price per Litre */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>Price / Litre Today ({vehicleConfig.currency}/{vehicleConfig.volumeUnit})</span>
                    <button
                      type="button"
                      onClick={() => setIsFuelPriceModalOpen(true)}
                      className="text-[10px] text-teal-400 hover:underline font-mono"
                    >
                      Update Rate
                    </button>
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={tab2Price}
                    onChange={(e) => setTab2Price(e.target.value)}
                    placeholder="106.5"
                    className="w-full px-3.5 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Benchmark Callout */}
                <div className="p-3 rounded-xl bg-[#09090b] border border-zinc-800 text-xs space-y-1 text-zinc-300 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Full-Range Benchmark:</span>
                    <span className="font-bold text-white">
                      {fullRangeBenchmark} {vehicleConfig.distanceUnit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Live Avg Cost/Km:</span>
                    <span className="font-bold text-emerald-400">
                      {vehicleConfig.currency} {fuelStats.avgCostPerKm.toFixed(2)}/km
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-6 border-zinc-800 bg-[#121215]/90 shadow-xl" glow="emerald">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Refuel Requirement To Full Tank
                </span>
                <Badge variant="emerald" size="xs">
                  Target: {fullRangeBenchmark} {vehicleConfig.distanceUnit}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Km Needed */}
                <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 flex flex-col justify-between">
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase font-mono">
                    Km Gap Needed
                  </span>
                  <div className="my-2 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {tab2KmNeeded}
                    </span>
                    <span className="text-xs text-zinc-400 ml-1">{vehicleConfig.distanceUnit}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    max({fullRangeBenchmark} - {numTab2Current}, 0)
                  </span>
                </div>

                {/* Money Needed */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
                  <span className="text-[11px] text-emerald-300 font-semibold uppercase font-mono">
                    Money Needed
                  </span>
                  <div className="my-2 font-mono">
                    <span className="text-xs text-emerald-400 font-bold mr-1">
                      {vehicleConfig.currency}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                      {Math.round(tab2MoneyNeeded).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-200/70 font-mono">
                    {tab2KmNeeded} km × {vehicleConfig.currency} {fuelStats.avgCostPerKm.toFixed(2)}/km
                  </span>
                </div>

                {/* Approx Litres Needed */}
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex flex-col justify-between">
                  <span className="text-[11px] text-teal-300 font-semibold uppercase font-mono">
                    Litres Needed (approx)
                  </span>
                  <div className="my-2 font-mono">
                    <span className="text-2xl sm:text-3xl font-black text-teal-300">
                      {tab2LitresNeeded.toFixed(1)}
                    </span>
                    <span className="text-xs text-teal-400 ml-1">{vehicleConfig.volumeUnit}</span>
                  </div>
                  <span className="text-[10px] text-teal-200/70 font-mono">
                    {vehicleConfig.currency} {Math.round(tab2MoneyNeeded)} ÷ {numTab2Price}
                  </span>
                </div>
              </div>

              {/* Exact Formula Note */}
              <div className="mt-6 p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Calculated using verified formula rule:{' '}
                  <code className="text-emerald-300 font-mono">
                    moneyNeeded = kmNeeded × avgCostPerKm
                  </code>
                  . Accurate budget forecasting based on your vehicle's observed real-world efficiency.
                </p>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* TAB 3: Pre-Trip Log (Running Table before every drive) */}
      {calculatorTab === 'pretrip-log' && (
        <motion.div
          key="tab-pretrip-log"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Add New Pre-Trip Entry Form Card */}
          <Card className="p-6 border-zinc-800 bg-[#121215]/90 shadow-xl" glow="emerald">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Pre-Trip Telemetry Logger</h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Log remaining range gauge before starting your drive
                  </p>
                </div>
              </div>
              <Badge variant="emerald" size="xs">
                Active Telemetry
              </Badge>
            </div>

            <form onSubmit={handleAddPreTrip} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={ptDate}
                  onChange={(e) => setPtDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Current Odometer (Range Gauge)
                </label>
                <input
                  type="number"
                  value={ptCurrentOdo}
                  onChange={(e) => setPtCurrentOdo(e.target.value)}
                  placeholder="e.g. 520"
                  required
                  className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Trip Purpose / Notes
                </label>
                <input
                  type="text"
                  value={ptPurpose}
                  onChange={(e) => setPtPurpose(e.target.value)}
                  placeholder="e.g. Morning commute, Client visit"
                  className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Log Pre-Trip</span>
                </button>
              </div>
            </form>
          </Card>

          {/* Running Pre-trip Log Table */}
          <Card className="p-0 border-zinc-800 bg-[#121215]/90 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Pre-Trip Telemetry History</h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  Computed columns: Litres Left, Litres Needed For Full Tank, Estimated Price of Petrol
                </p>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#09090b] text-zinc-400 border-b border-zinc-800 font-semibold uppercase tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Range Gauge</th>
                    <th className="py-3 px-4">Est. Litres Left</th>
                    <th className="py-3 px-4">Litres Needed for Full Tank</th>
                    <th className="py-3 px-4">Est. Petrol Cost for Full</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 font-medium text-zinc-200">
                  {computedPreTripEntries.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {new Date(item.date).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-teal-300">
                        {item.currentOdometer} {vehicleConfig.distanceUnit}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {item.estimatedLitresLeft.toFixed(2)} {vehicleConfig.volumeUnit}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-teal-300">
                        {item.estimatedLitresNeededForFullTank.toFixed(2)}{' '}
                        {vehicleConfig.volumeUnit}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {vehicleConfig.currency}{' '}
                        {Math.round(item.estimatedPriceOfPetrol).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-400">
                        {item.tripPurpose || 'Pre-trip check'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => deletePreTripEntry(item.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-zinc-800">
              {computedPreTripEntries.map((item) => (
                <div key={item.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-white">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {item.tripPurpose || 'Pre-trip check'}
                      </p>
                    </div>
                    <span className="font-mono text-teal-300 font-bold text-sm">
                      {item.currentOdometer} km range
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#09090b] border border-zinc-800 grid grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Litres Left</span>
                      <span className="text-emerald-400 font-bold">
                        {item.estimatedLitresLeft.toFixed(1)} L
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Needed Full</span>
                      <span className="text-teal-300 font-bold">
                        {item.estimatedLitresNeededForFullTank.toFixed(1)} L
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Cost to Full</span>
                      <span className="text-white font-bold">
                        {vehicleConfig.currency} {Math.round(item.estimatedPriceOfPetrol)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => deletePreTripEntry(item.id)}
                      className="p-1 text-zinc-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
