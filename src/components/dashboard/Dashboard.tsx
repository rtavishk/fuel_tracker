import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GaugeMeter } from '../ui/GaugeMeter';
import {
  Fuel,
  Navigation,
  DollarSign,
  Gauge,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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

  // Calculate total distance driven by summing all negative changes (odometer decreases)
  const totalDistanceDriven = computedTripEntries.reduce((sum, trip, index) => {
    if (index === 0) return sum;
    const prevOdo = computedTripEntries[index - 1].totalOdometer;
    const change = trip.totalOdometer - prevOdo;
    // Only add negative changes (driving) as positive distance
    return change < 0 ? sum + Math.abs(change) : sum;
  }, 0);

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
            <span className="font-mono font-bold text-zinc-200 whitespace-nowrap">
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
              <span className="text-xs font-semibold text-emerald-400 font-sans whitespace-nowrap">
                {vehicleConfig.distanceUnit}/{vehicleConfig.volumeUnit}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Best:{' '}
              <span className="font-mono text-emerald-300 font-bold whitespace-nowrap">
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
              <span className="text-xs font-semibold text-amber-400 font-sans whitespace-nowrap">
                {vehicleConfig.currency}/{vehicleConfig.distanceUnit}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Across completed fill-ups</p>
          </Card>

          {/* Latest Trip/Current Reading */}
          <Card className="p-4 bg-[#121215]/90 border-zinc-800" glow="teal">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 font-mono">
                Current Reading
              </span>
              <Navigation className="w-4 h-4 text-teal-400" />
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {computedTripEntries.length > 0
                  ? computedTripEntries[computedTripEntries.length - 1].totalOdometer.toLocaleString()
                  : cumulativeOdometer.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-teal-400 font-sans">
                {vehicleConfig.distanceUnit}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {computedTripEntries.length > 0
                ? `Latest: ${computedTripEntries[computedTripEntries.length - 1].date}`
                : 'No trip entries yet'}
            </p>
          </Card>

          {/* Total Distance Driven */}
          <Card className="p-4 bg-[#121215]/90 border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-lime-400 font-mono">
                Total Distance Driven
              </span>
              <Navigation className="w-4 h-4 text-lime-400" />
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {totalDistanceDriven.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-zinc-400 font-sans">
                {vehicleConfig.distanceUnit}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Sum of all odometer decreases</p>
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
            <p className="text-[11px] text-zinc-400 mt-1 font-mono whitespace-nowrap">
              {fuelStats.totalLitres.toFixed(0)} {vehicleConfig.volumeUnit} pumped
            </p>
          </Card>
        </div>
      </div>

      {/* Odometer Trend Chart */}
      <Card className="p-5 border-zinc-800 bg-[#121215]/90">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Odometer Trend</h3>
            <p className="text-xs text-zinc-400">
              Track your {vehicleConfig.odometerType === 'fuelRange' ? 'fuel range' : 'cumulative mileage'} over time
            </p>
          </div>
          <Badge variant="emerald" size="xs">
            Last 20 entries
          </Badge>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={computedTripEntries.slice(-20)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date" 
              stroke="#666" 
              fontSize={10}
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis 
              stroke="#666" 
              fontSize={10}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#121215', border: '1px solid #333', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#10b981' }}
              formatter={(value: number, name: string, props: any) => {
                const date = props.payload?.date || '';
                return [
                  <div>
                    <div className="font-bold">{value.toLocaleString()} {vehicleConfig.distanceUnit}</div>
                    <div className="text-xs text-zinc-400">{date}</div>
                  </div>
                ];
              }}
            />
            <Line 
              type="monotone" 
              dataKey="totalOdometer" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
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
