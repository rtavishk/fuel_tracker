import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GaugeMeter } from '../ui/GaugeMeter';
import {
  Fuel,
  Navigation,
  DollarSign,
  Activity,
  Gauge,
  Sparkles,
  ArrowRight,
  Wrench,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    vehicleConfig,
    fuelStats,
    computedFuelEntries,
    computedTripEntries,
    computedPreTripEntries,
    computedMaintenance,
    setActiveTab,
    fullRangeBenchmark,
  } = useApp();

  // Current distance-to-empty reading from latest pre-trip, fuel entry, or estimate
  const currentRangeGauge =
    computedPreTripEntries.length > 0
      ? computedPreTripEntries[0].currentOdometer
      : computedFuelEntries.length > 0 && computedFuelEntries[0].afterFuelingOdometer
      ? computedFuelEntries[0].afterFuelingOdometer
      : null; // Return null instead of hardcoded 340

  // Real cumulative vehicle odometer from trip log
  const cumulativeOdometer =
    computedTripEntries.length > 0
      ? computedTripEntries[0].totalOdometer
      : vehicleConfig.currentCumulativeOdometer;

  // 7-day rolling daily average
  const sevenDayDailyAvg =
    computedTripEntries.length > 0 ? computedTripEntries[0].sevenDayRollingAvg : 0;

  // Maintenance summary
  const overdueItems = computedMaintenance.filter((m) => m.status === 'Overdue');
  const dueSoonItems = computedMaintenance.filter((m) => m.status === 'Due Soon');

  // Chart 1: Fuel Economy Trend (chronological ascending)
  const economyTrendData = [...computedFuelEntries]
    .filter((e) => !e.isPending && e.fuelEconomy !== undefined)
    .reverse()
    .map((e) => ({
      date: e.date.slice(5),
      economy: parseFloat(e.fuelEconomy?.toFixed(2) || '0'),
      runningAvg: parseFloat(e.runningAverageEconomySoFar.toFixed(2)),
      costPerKm: parseFloat(e.costPerKm?.toFixed(2) || '0'),
    }));

  // Chart 2: Daily Distance & Cost Trend (last 10 trips)
  const tripTrendData = [...computedTripEntries]
    .reverse()
    .slice(-10)
    .map((t) => ({
      date: t.date.slice(5),
      km: t.kmDrivenToday,
      cost: Math.round(t.estimatedFuelCostToday),
    }));

  // Check if user has any data
  const hasNoData = computedFuelEntries.length === 0 && computedTripEntries.length === 0 && computedPreTripEntries.length === 0;

  if (hasNoData) {
    return (
      <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto">
        <Card className="p-8 bg-[#121215]/90 border-zinc-800 text-center">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Gauge className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Welcome to Your Garage</h2>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Start tracking your vehicle's fuel economy and mileage by logging your first fill-up or trip entry.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('fuel-log')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <Fuel className="w-4 h-4" />
                Log First Fill-up
              </button>
              <button
                onClick={() => setActiveTab('trips')}
                className="px-6 py-3 rounded-xl bg-[#121215]/90 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-zinc-200 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                Log First Trip
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Top Banner: Vehicle Status HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Distance-To-Empty Visual Gauge */}
        <Card
          className="lg:col-span-4 flex flex-col items-center justify-between p-6 bg-[#121215]/90 border-zinc-800 relative overflow-hidden"
          glow="emerald"
        >
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Live Fuel Range HUD
            </span>
            <Badge variant="emerald" size="xs" dot>
              Active Telemetry
            </Badge>
          </div>

          {/* Interactive Gauge */}
          <div className="my-2">
            {currentRangeGauge !== null ? (
              <GaugeMeter
                currentRangeKm={currentRangeGauge}
                benchmarkFullKm={fullRangeBenchmark}
                unit={vehicleConfig.distanceUnit}
                subLabel="Distance-to-Empty"
                size={230}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-32 h-32 rounded-full bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mb-3">
                  <Fuel className="w-12 h-12 text-zinc-500" />
                </div>
                <p className="text-sm text-zinc-400">No fuel data yet</p>
                <p className="text-xs text-zinc-500 mt-1">Log your first fill-up to see range</p>
              </div>
            )}
          </div>

          <div className="w-full pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Tank Capacity:</span>
            <span className="font-mono font-bold text-zinc-200">
              {vehicleConfig.tankCapacityLitres} {vehicleConfig.volumeUnit} (~{fullRangeBenchmark}{' '}
              {vehicleConfig.distanceUnit} full)
            </span>
          </div>
        </Card>

        {/* Right: Primary Telemetry KPIs Grid (Agndex Style) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Average Economy */}
          <Card className="p-4 bg-[#121215]/90 border-zinc-800" glow="emerald">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                Avg Fuel Economy
              </span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {fuelStats.avgEconomy.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-emerald-400 font-sans">
                {vehicleConfig.distanceUnit}/{vehicleConfig.volumeUnit}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Best:{' '}
              <span className="font-mono text-emerald-300 font-bold">
                {fuelStats.bestEconomy.toFixed(1)} {vehicleConfig.distanceUnit}/{vehicleConfig.volumeUnit}
              </span>
            </p>
          </Card>

          {/* Avg Cost Per Km */}
          <Card className="p-4 bg-[#121215]/90 border-zinc-800" glow="amber">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono">
                Cost Per Km
              </span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {fuelStats.avgCostPerKm.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-amber-400 font-sans">
                {vehicleConfig.currency}/{vehicleConfig.distanceUnit}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Across completed fill-ups</p>
          </Card>

          {/* Cumulative Total Odometer */}
          <Card className="p-4 bg-[#121215]/90 border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 font-mono">
                Total Car Odometer
              </span>
              <Gauge className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {cumulativeOdometer.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-zinc-400 font-sans">
                {vehicleConfig.distanceUnit}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Cumulative vehicle telemetry</p>
          </Card>

          {/* 7-Day Rolling Average */}
          <Card className="p-4 bg-[#121215]/90 border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                7-Day Daily Avg
              </span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {sevenDayDailyAvg.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-emerald-300 font-sans">
                {vehicleConfig.distanceUnit}/day
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Last 7 logged trip days</p>
          </Card>

          {/* Total Gas Spend */}
          <Card className="p-4 bg-[#121215]/90 border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-lime-400 font-mono">
                Total Gas Spend
              </span>
              <Fuel className="w-4 h-4 text-lime-400" />
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-xs font-bold text-zinc-400">{vehicleConfig.currency}</span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {fuelStats.totalSpend.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 font-mono">
              {fuelStats.totalLitres.toFixed(0)} {vehicleConfig.volumeUnit} pumped
            </p>
          </Card>

          {/* Maintenance Status Quick View */}
          <Card
            className={`p-4 border-zinc-800 cursor-pointer ${
              overdueItems.length > 0
                ? 'bg-rose-950/20 border-rose-500/30'
                : dueSoonItems.length > 0
                ? 'bg-amber-950/20 border-amber-500/30'
                : 'bg-[#121215]/90'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
                Engine Health
              </span>
              <Wrench
                className={`w-4 h-4 ${
                  overdueItems.length > 0
                    ? 'text-rose-400'
                    : dueSoonItems.length > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              />
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span
                className={`text-2xl sm:text-3xl font-black ${
                  overdueItems.length > 0
                    ? 'text-rose-400'
                    : dueSoonItems.length > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {overdueItems.length > 0
                  ? `${overdueItems.length} Overdue`
                  : dueSoonItems.length > 0
                  ? `${dueSoonItems.length} Due Soon`
                  : 'All Good'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <span>View schedule & checklist</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </p>
          </Card>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fuel Economy Trend */}
        <Card className="p-5 border-zinc-800 bg-[#121215]/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Fuel Economy Trend (km/L)</h3>
              <p className="text-xs text-zinc-400">
                Refuel economy compared against chronological running average
              </p>
            </div>
            <Badge variant="emerald" size="xs">
              Efficiency Telemetry
            </Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={economyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="economyFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121215',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f4f4f5',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="economy"
                  name="Fuel Economy (km/L)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#economyFill)"
                />
                <Line
                  type="monotone"
                  dataKey="runningAvg"
                  name="Running Average"
                  stroke="#a3e635"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Mileage & Cost Trend */}
        <Card className="p-5 border-zinc-800 bg-[#121215]/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Distance Driven</h3>
              <p className="text-xs text-zinc-400">
                Logged daily distance (km) and estimated fuel cost
              </p>
            </div>
            <Badge variant="teal" size="xs">
              Trip Telemetry
            </Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121215',
                    borderColor: '#27272a',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f4f4f5',
                  }}
                />
                <Bar
                  dataKey="km"
                  name={`Driven (${vehicleConfig.distanceUnit})`}
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Engine Maintenance Schedule Highlights */}
      <Card className="p-5 border-zinc-800 bg-[#121215]/90">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-400" />
              Engine & Component Maintenance Schedules
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tracked against cumulative vehicle odometer ({cumulativeOdometer.toLocaleString()}{' '}
              {vehicleConfig.distanceUnit})
            </p>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-mono"
          >
            <span>Manage All Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {computedMaintenance.slice(0, 6).map((item) => {
            const isOverdue = item.status === 'Overdue';
            const isDueSoon = item.status === 'Due Soon';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isOverdue
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : isDueSoon
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-[#18181b]/80 border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-white line-clamp-1">{item.title}</span>
                  <Badge
                    variant={isOverdue ? 'rose' : isDueSoon ? 'amber' : 'emerald'}
                    size="xs"
                    dot={isOverdue || isDueSoon}
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 my-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Remaining:</span>
                    <span
                      className={`font-bold ${
                        isOverdue
                          ? 'text-rose-400'
                          : isDueSoon
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {item.kmRemaining <= 0
                        ? `${Math.abs(item.kmRemaining)} km OVERDUE`
                        : `${item.kmRemaining} km left`}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverdue
                          ? 'bg-rose-500'
                          : isDueSoon
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, item.progressPercent)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800 font-mono">
                  <span>Every {item.intervalKm.toLocaleString()} km</span>
                  <span>Last: {item.lastServiceOdometer.toLocaleString()} km</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('fuel-log')}
          className="p-4 rounded-2xl bg-[#121215]/90 border border-zinc-800 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Log Fill-up</p>
              <p className="text-xs text-zinc-400">Record gas purchase & range jump</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
        </button>

        <button
          onClick={() => setActiveTab('trips')}
          className="p-4 rounded-2xl bg-[#121215]/90 border border-zinc-800 hover:border-teal-500/50 flex items-center justify-between text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Log Daily Trip</p>
              <p className="text-xs text-zinc-400">Enter cumulative odometer reading</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-teal-400 transition-colors" />
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className="p-4 rounded-2xl bg-[#121215]/90 border border-zinc-800 hover:border-lime-500/50 flex items-center justify-between text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-lime-500/10 text-lime-400 group-hover:scale-110 transition-transform">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Fuel Calculators</p>
              <p className="text-xs text-zinc-400">Budget distance & pre-trip logger</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-lime-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};
