import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AddFuelModal } from './AddFuelModal';
import { FuelEntry, ComputedFuelEntry } from '../../types';
import {
  Fuel,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Gauge,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const FuelLog: React.FC = () => {
  const {
    computedFuelEntries,
    fuelStats,
    vehicleConfig,
    deleteFuelEntry,
    updateFuelEntry,
    fullRangeBenchmark,
    isAddFuelModalOpen,
    setIsAddFuelModalOpen,
  } = useApp();

  const [entryToEdit, setEntryToEdit] = useState<FuelEntry | null>(null);
  const [quickFillId, setQuickFillId] = useState<string | null>(null);
  const [quickAfterValue, setQuickAfterValue] = useState<string>('');

  const hasNoData = computedFuelEntries.length === 0;

  const handleOpenAdd = () => {
    setEntryToEdit(null);
    setIsAddFuelModalOpen(true);
  };

  const handleEdit = (entry: ComputedFuelEntry) => {
    setEntryToEdit(entry);
    setIsAddFuelModalOpen(true);
  };

  const handleSaveQuickAfter = (id: string) => {
    const val = parseFloat(quickAfterValue);
    if (!isNaN(val) && val > 0) {
      updateFuelEntry(id, { afterFuelingOdometer: val });
      setQuickFillId(null);
      setQuickAfterValue('');
    }
  };

  if (hasNoData) {
    return (
      <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto">
        {/* Top Action Header & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
                Fuel Log & Telemetry
              </h2>
              <Badge variant="emerald" size="sm" dot>
                0 Records
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Start tracking your fuel economy by logging your first fill-up.
            </p>
          </div>

          <button
            id="btn-add-fillup"
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log First Fill-up</span>
          </button>
        </div>

        {/* Empty State */}
        <Card className="p-8 bg-[#121215]/90 border-zinc-800 text-center">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Fuel className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">No Fuel Records Yet</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Start tracking your vehicle's fuel economy and costs by logging your first fill-up. 
                This will help you understand your driving patterns and optimize fuel efficiency.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Log First Fill-up
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Top Action Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Fuel Log & Telemetry
            </h2>
            <Badge variant="emerald" size="sm" dot>
              {computedFuelEntries.length} Records
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Tracking distance-to-empty gauge jumps, derived economy (km/L), and cost per kilometer.
          </p>
        </div>

        <button
          id="btn-add-fillup"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log New Fill-up</span>
        </button>
      </div>

      {/* Domain Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#121215]/90 border border-zinc-800 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
          <Gauge className="w-5 h-5" />
        </div>
        <div className="text-xs text-zinc-300 space-y-1">
          <p className="font-semibold text-white">
            Distance-To-Empty Gauge Tracking
          </p>
          <p className="text-zinc-400 leading-relaxed">
            The figures recorded here represent the car's <strong>remaining-range / distance-to-empty gauge</strong>.
            The gauge drops while driving and jumps back up after fueling (typically clustering around ~
            {fullRangeBenchmark} {vehicleConfig.distanceUnit} on a full tank).
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Average Economy */}
        <Card className="p-4 bg-[#121215]/90 border-zinc-800" glow="emerald">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">Avg Fuel Economy</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {fuelStats.completedCount > 0 ? fuelStats.avgEconomy.toFixed(2) : '—'}
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-sans whitespace-nowrap">
              {vehicleConfig.distanceUnit}/{vehicleConfig.volumeUnit}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {fuelStats.completedCount > 0 ? (
              <>
                Best:{' '}
                <span className="font-mono text-emerald-300 font-bold whitespace-nowrap">
                  {fuelStats.bestEconomy.toFixed(1)} {vehicleConfig.distanceUnit}/{vehicleConfig.volumeUnit}
                </span>
              </>
            ) : (
              'No data yet'
            )}
          </p>
        </Card>

        {/* Avg Cost Per Km */}
        <Card className="p-4 bg-[#121215]/90 border-zinc-800" glow="amber">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 font-mono">Avg Cost / Km</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {fuelStats.completedCount > 0 ? fuelStats.avgCostPerKm.toFixed(2) : '—'}
            </span>
            <span className="text-xs font-semibold text-amber-400 font-sans whitespace-nowrap">
              {vehicleConfig.currency}/{vehicleConfig.distanceUnit}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {fuelStats.completedCount > 0 ? 'Live derived from completed fill-ups' : 'No data yet'}
          </p>
        </Card>

        {/* Total Spend */}
        <Card className="p-4 bg-[#121215]/90 border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 font-mono">Total Fuel Spend</span>
            <Fuel className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-xs font-bold text-zinc-400">{vehicleConfig.currency}</span>
            <span className="text-2xl sm:text-3xl font-black text-white">
              {fuelStats.completedCount > 0 ? fuelStats.totalSpend.toLocaleString() : '0'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Total Litres:{' '}
            <span className="text-teal-300 font-bold whitespace-nowrap">
              {fuelStats.totalLitres.toFixed(1)} {vehicleConfig.volumeUnit}
            </span>
          </p>
        </Card>

        {/* Latest Fuel Price */}
        <Card className="p-4 bg-[#121215]/90 border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-lime-400 font-mono">Latest Pump Price</span>
            <Gauge className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {fuelStats.completedCount > 0 ? fuelStats.latestPrice.toFixed(1) : '—'}
            </span>
            <span className="text-xs font-semibold text-lime-400 font-sans whitespace-nowrap">
              {vehicleConfig.currency}/{vehicleConfig.volumeUnit}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            {fuelStats.completedCount} completed, {fuelStats.pendingCount} pending
          </p>
        </Card>
      </div>

      {/* Fill-ups List / Table */}
      <Card className="p-0 border-zinc-800 bg-[#121215]/90 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Refueling History & Derived Stats</h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Includes forecast vs actual range gauge variance
            </p>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09090b] text-zinc-400 border-b border-zinc-800 font-semibold uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Date & Station</th>
                <th className="py-3 px-4">Amount & Price</th>
                <th className="py-3 px-4">Litres</th>
                <th className="py-3 px-4">Range Gauge (Before → After)</th>
                <th className="py-3 px-4">Distance Added</th>
                <th className="py-3 px-4">Economy (km/L)</th>
                <th className="py-3 px-4">Cost/km</th>
                <th className="py-3 px-4">Forecast Variance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-medium text-zinc-200">
              {computedFuelEntries.map((entry) => {
                const hasVariance = entry.forecastDelta !== undefined;
                const isPositiveDelta = (entry.forecastDelta || 0) >= 0;

                return (
                  <tr
                    key={entry.id}
                    className="hover:bg-zinc-900/40 transition-colors group"
                  >
                    {/* Date & Station */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{entry.date}</div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                        {entry.fuelStation || 'Station not logged'}
                      </div>
                    </td>

                    {/* Amount & Price */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-emerald-400 font-bold">
                        {vehicleConfig.currency} {entry.amountPaid.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-zinc-400 whitespace-nowrap">
                        @{entry.pricePerLitre.toFixed(2)}/{vehicleConfig.volumeUnit}
                      </div>
                    </td>

                    {/* Litres Pumped */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-white">{entry.litresFueled.toFixed(2)}</span>{' '}
                      <span className="text-zinc-400 whitespace-nowrap">{vehicleConfig.volumeUnit}</span>
                    </td>

                    {/* Gauge Reading (Before → After) */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400">{entry.currentOdometer}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-600" />
                        {entry.isPending ? (
                          quickFillId === entry.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                autoFocus
                                placeholder="After km"
                                value={quickAfterValue}
                                onChange={(e) => setQuickAfterValue(e.target.value)}
                                className="w-16 px-1.5 py-0.5 text-xs bg-zinc-900 border border-emerald-500 rounded text-white font-mono"
                              />
                              <button
                                onClick={() => handleSaveQuickAfter(entry.id)}
                                className="p-1 rounded bg-emerald-500 text-black font-bold cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setQuickFillId(entry.id);
                                setQuickAfterValue('');
                              }}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
                            >
                              <Clock className="w-2.5 h-2.5" />
                              <span>Pending</span>
                            </button>
                          )
                        ) : (
                          <span className="font-bold text-emerald-400">{entry.afterFuelingOdometer}</span>
                        )}
                        <span className="text-[10px] text-zinc-400">{vehicleConfig.distanceUnit}</span>
                      </div>
                    </td>

                    {/* Distance Added */}
                    <td className="py-3.5 px-4 font-mono">
                      {entry.isPending ? (
                        <span className="text-zinc-400 italic text-[11px]">Pending</span>
                      ) : (
                        <span className="text-white font-semibold">
                          +{entry.distanceThisFill} {vehicleConfig.distanceUnit}
                        </span>
                      )}
                    </td>

                    {/* Economy (km/L) */}
                    <td className="py-3.5 px-4 font-mono">
                      {entry.isPending ? (
                        <span className="text-zinc-400 italic text-[11px]">Pending</span>
                      ) : (
                        <div>
                          <span className="text-sm font-black text-emerald-400">
                            {entry.fuelEconomy?.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-1 whitespace-nowrap">
                            {vehicleConfig.distanceUnit}/{vehicleConfig.volumeUnit}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Cost Per Km */}
                    <td className="py-3.5 px-4 font-mono">
                      {entry.isPending ? (
                        <span className="text-zinc-400 italic text-[11px]">Pending</span>
                      ) : (
                        <span className="text-amber-400 font-semibold">
                          {vehicleConfig.currency} {entry.costPerKm?.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Forecast Variance */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {entry.isPending || !hasVariance ? (
                        <span className="text-zinc-400 italic">—</span>
                      ) : (
                        <div
                          className={`flex items-center gap-1 font-semibold ${
                            isPositiveDelta ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositiveDelta ? (
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-rose-400" />
                          )}
                          <span>
                            {isPositiveDelta ? '+' : ''}
                            {entry.forecastDelta} {vehicleConfig.distanceUnit}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Action Controls */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(entry)}
                          title="Edit Refuel Entry"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteFuelEntry(entry.id)}
                          title="Delete Refuel Entry"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Feed View */}
        <div className="lg:hidden divide-y divide-zinc-800">
          {computedFuelEntries.map((entry) => (
            <div key={entry.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{entry.date}</span>
                    <Badge variant={entry.isPending ? 'amber' : 'emerald'} size="xs">
                      {entry.isPending ? 'Pending' : 'Completed'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 whitespace-nowrap">{entry.fuelStation || entry.pricePerLitre ? `@ ${entry.pricePerLitre.toFixed(2)}/${vehicleConfig.volumeUnit}` : 'Station not logged'}</p>
                </div>
                <div className="text-right font-mono">
                  <div className="font-black text-emerald-400 text-sm">
                    {vehicleConfig.currency} {entry.amountPaid.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-zinc-400 whitespace-nowrap">
                    {entry.litresFueled.toFixed(1)} {vehicleConfig.volumeUnit}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#09090b] border border-zinc-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Economy</span>
                  <span className="text-xs font-bold text-white whitespace-nowrap">
                    {entry.fuelEconomy ? `${entry.fuelEconomy.toFixed(1)} ${vehicleConfig.distanceUnit}/${vehicleConfig.volumeUnit}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Cost/km</span>
                  <span className="text-xs font-bold text-amber-400 whitespace-nowrap">
                    {entry.costPerKm ? `${vehicleConfig.currency || 'Rs.'} ${entry.costPerKm.toFixed(2)}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Distance Added</span>
                  <span className="text-xs font-bold text-teal-400 whitespace-nowrap">
                    {entry.distanceThisFill && entry.distanceThisFill > 0 ? `+${entry.distanceThisFill} ${vehicleConfig.distanceUnit}` : '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                  <span>Gauge: {entry.currentOdometer} {vehicleConfig.distanceUnit}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-600" />
                  <span className="text-white font-bold">{entry.afterFuelingOdometer || 'Pending'} {vehicleConfig.distanceUnit}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteFuelEntry(entry.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add / Edit Refuel Modal */}
      <AddFuelModal
        isOpen={isAddFuelModalOpen}
        onClose={() => {
          setIsAddFuelModalOpen(false);
          setEntryToEdit(null);
        }}
        entryToEdit={entryToEdit}
      />
    </div>
  );
};
