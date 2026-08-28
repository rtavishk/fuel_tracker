import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AddTripModal } from './AddTripModal';
import { TripEntry, ComputedTripEntry } from '../../types';
import {
  Navigation,
  Plus,
  Gauge,
  DollarSign,
  Activity,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Bar,
  ComposedChart,
} from 'recharts';

export const DailyTrips: React.FC = () => {
  const {
    computedTripEntries,
    vehicleConfig,
    fuelStats,
    deleteTripEntry,
    isAddTripModalOpen,
    setIsAddTripModalOpen,
  } = useApp();

  const [tripToEdit, setTripToEdit] = useState<TripEntry | null>(null);

  const handleOpenAdd = () => {
    setTripToEdit(null);
    setIsAddTripModalOpen(true);
  };

  const handleEdit = (trip: ComputedTripEntry) => {
    setTripToEdit(trip);
    setIsAddTripModalOpen(true);
  };

  // Aggregated Stats
  const latestOdo =
    computedTripEntries.length > 0
      ? computedTripEntries[0].totalOdometer
      : vehicleConfig.currentCumulativeOdometer;

  const latest7DayAvg =
    computedTripEntries.length > 0 ? computedTripEntries[0].sevenDayRollingAvg : 0;

  const totalKmRecorded = computedTripEntries.reduce(
    (sum, t) => sum + (t.kmDrivenToday || 0),
    0
  );

  const totalTripFuelCost = computedTripEntries.reduce(
    (sum, t) => sum + (t.estimatedFuelCostToday || 0),
    0
  );

  // Chart data (chronological ascending for last 10 entries)
  const chartData = [...computedTripEntries]
    .reverse()
    .slice(-12)
    .map((t) => ({
      date: t.date.slice(5),
      kmDriven: t.kmDrivenToday,
      rollingAvg: Math.round(t.sevenDayRollingAvg),
      cost: Math.round(t.estimatedFuelCostToday),
    }));

  const categoryVariants: Record<string, 'emerald' | 'teal' | 'lime' | 'amber' | 'indigo' | 'slate'> = {
    Commute: 'emerald',
    Highway: 'teal',
    City: 'lime',
    Business: 'indigo',
    Roadtrip: 'teal',
    Errand: 'slate',
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Daily Trip Log
            </h2>
            <Badge variant="teal" size="sm" dot>
              {computedTripEntries.length} Days Logged
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Tracks vehicle cumulative total odometer, daily distance driven, 7-day rolling average & live cost.
          </p>
        </div>

        <button
          id="btn-add-trip"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 hover:from-teal-300 hover:to-emerald-300 text-black text-xs font-bold shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Day's Odometer</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Cumulative Odometer */}
        <Card className="p-4 bg-[#121215]/90 border-zinc-800" glow="emerald">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
              Current Car Odometer
            </span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {latestOdo.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-sans">
              {vehicleConfig.distanceUnit}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Real cumulative vehicle mileage</p>
        </Card>

        {/* 7-Day Rolling Average */}
        <Card className="p-4 bg-[#121215]/90 border-zinc-800" glow="teal">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 font-mono">
              7-Day Rolling Average
            </span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {latest7DayAvg.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-teal-300 font-sans">
              {vehicleConfig.distanceUnit}/day
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Average over last 7 logged entries</p>
        </Card>

        {/* Total Tracked Km */}
        <Card className="p-4 bg-[#121215]/90 border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-lime-400 font-mono">
              Total Logged Distance
            </span>
            <Navigation className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {totalKmRecorded.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-zinc-400 font-sans">
              {vehicleConfig.distanceUnit}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Across all logged trip days</p>
        </Card>

        {/* Est Fuel Cost */}
        <Card className="p-4 bg-[#121215]/90 border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono">
              Est. Trip Fuel Cost
            </span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xs font-bold text-zinc-400">{vehicleConfig.currency}</span>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {Math.round(totalTripFuelCost).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Based on {vehicleConfig.currency} {fuelStats.avgCostPerKm.toFixed(2)}/km live avg
          </p>
        </Card>
      </div>

      {/* Chart: Daily Distance & 7-Day Rolling Trend */}
      {chartData.length > 1 && (
        <Card className="p-5 border-zinc-800 bg-[#121215]/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Distance & 7-Day Rolling Trend</h3>
              <p className="text-xs text-zinc-400">
                Bars represent daily kilometers driven; line represents the 7-day rolling average.
              </p>
            </div>
            <Badge variant="teal" size="xs">
              Trend Analysis
            </Badge>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  dataKey="kmDriven"
                  name="Km Driven Today"
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Line
                  type="monotone"
                  dataKey="rollingAvg"
                  name="7-Day Rolling Avg (km)"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  dot={{ fill: '#34d399', r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Trip Log Table */}
      <Card className="p-0 border-zinc-800 bg-[#121215]/90 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Daily Trip Entries</h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Guarded for sporadic or skipped days with live fuel cost estimation
            </p>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09090b] text-zinc-400 border-b border-zinc-800 font-semibold uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Cumulative Odometer</th>
                <th className="py-3 px-4">Distance Driven</th>
                <th className="py-3 px-4">7-Day Rolling Avg</th>
                <th className="py-3 px-4">Est. Fuel Cost</th>
                <th className="py-3 px-4">Category & Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-medium text-zinc-200">
              {computedTripEntries.map((trip) => (
                <tr key={trip.id} className="hover:bg-zinc-900/40 transition-colors group">
                  {/* Date */}
                  <td className="py-3.5 px-4 font-semibold text-white">{trip.date}</td>

                  {/* Cumulative Odometer */}
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-100">
                    {trip.totalOdometer.toLocaleString()} {vehicleConfig.distanceUnit}
                  </td>

                  {/* Distance Driven */}
                  <td className="py-3.5 px-4 font-mono">
                    {trip.isFirstEntry ? (
                      <span className="text-zinc-500 italic">Baseline entry</span>
                    ) : (
                      <span className="font-bold text-emerald-400">
                        +{trip.kmDrivenToday} {vehicleConfig.distanceUnit}
                      </span>
                    )}
                  </td>

                  {/* 7-Day Rolling Avg */}
                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-teal-300 font-semibold">
                      {trip.sevenDayRollingAvg.toFixed(1)} {vehicleConfig.distanceUnit}/day
                    </span>
                  </td>

                  {/* Est Fuel Cost */}
                  <td className="py-3.5 px-4 font-mono">
                    {trip.isFirstEntry ? (
                      <span className="text-zinc-500">—</span>
                    ) : (
                      <span className="text-amber-400 font-bold">
                        {vehicleConfig.currency} {trip.estimatedFuelCostToday.toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Category & Notes */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={categoryVariants[trip.category || 'Commute'] || 'slate'}
                        size="xs"
                      >
                        {trip.category || 'Commute'}
                      </Badge>
                      {trip.notes && (
                        <span className="text-[11px] text-zinc-400 truncate max-w-[160px]">
                          {trip.notes}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleEdit(trip)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTripEntry(trip.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-zinc-800">
          {computedTripEntries.map((trip) => (
            <div key={trip.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-sm text-white">{trip.date}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={categoryVariants[trip.category || 'Commute'] || 'slate'}
                      size="xs"
                    >
                      {trip.category || 'Commute'}
                    </Badge>
                    {trip.notes && (
                      <span className="text-xs text-zinc-400 truncate max-w-[140px]">
                        {trip.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right font-mono">
                  {trip.isFirstEntry ? (
                    <span className="text-xs text-zinc-400 italic">Baseline</span>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-emerald-400">
                        +{trip.kmDrivenToday} {vehicleConfig.distanceUnit}
                      </div>
                      <div className="text-[11px] text-amber-300">
                        {vehicleConfig.currency} {trip.estimatedFuelCostToday.toFixed(0)} est.
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#09090b] border border-zinc-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Total Odo</span>
                  <span className="text-zinc-200 font-bold">
                    {trip.totalOdometer.toLocaleString()} {vehicleConfig.distanceUnit}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block uppercase">7-Day Rolling</span>
                  <span className="text-teal-300 font-bold">
                    {trip.sevenDayRollingAvg.toFixed(1)} {vehicleConfig.distanceUnit}/day
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleEdit(trip)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteTripEntry(trip.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <AddTripModal
        isOpen={isAddTripModalOpen}
        onClose={() => {
          setIsAddTripModalOpen(false);
          setTripToEdit(null);
        }}
        tripToEdit={tripToEdit}
      />
    </div>
  );
};
