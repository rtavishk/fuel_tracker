import React from 'react';
import { useApp } from '../../context/AppContext';
import { ComputedFuelEntry } from '../../types';
import {
  Fuel,
  Gauge,
  DollarSign,
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Zap,
  ArrowRight,
  Receipt,
  FileText,
  Share2,
} from 'lucide-react';

interface FuelEntryDetailModalProps {
  entry: ComputedFuelEntry;
  onClose: () => void;
  onEdit: () => void;
  onComplete: () => void;
}

export const FuelEntryDetailModal: React.FC<FuelEntryDetailModalProps> = ({
  entry,
  onClose,
  onEdit,
  onComplete,
}) => {
  const { config, kpis, deleteFuelEntry, showToast } = useApp();

  const formattedDate = new Date(entry.date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(entry.date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate efficiency comparison
  const diffFromAvg = entry.fuelEconomy && kpis.avgFuelEconomy > 0
    ? ((entry.fuelEconomy - kpis.avgFuelEconomy) / kpis.avgFuelEconomy) * 100
    : null;

  // L/100km conversion
  const lPer100km = entry.fuelEconomy && entry.fuelEconomy > 0
    ? 100 / entry.fuelEconomy
    : null;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this fuel record? This action cannot be undone.')) {
      deleteFuelEntry(entry.id);
      onClose();
    }
  };

  const handleCopyReceipt = () => {
    const text = `⛽ BAIC BJ30e Fuel Record:
📅 ${formattedDate} (${formattedTime})
💵 Total Paid: ${config.currency} ${entry.amountPaid.toLocaleString()}
⛽ Volume: ${entry.litresFueled.toFixed(2)} ${config.volumeUnit} @ ${config.currency} ${entry.pricePerLitre}/L
📍 Station: ${entry.station || 'Unspecified'}
📈 Economy: ${entry.fuelEconomy ? `${entry.fuelEconomy.toFixed(2)} km/L (${config.currency} ${entry.costPerKm?.toFixed(2)}/km)` : 'Pending'}
🧭 Range Added: +${entry.distanceThisFill || 0} km (${entry.initialRangeGauge} km ➔ ${entry.postFillRangeGauge || '—'} km)`;

    navigator.clipboard.writeText(text);
    showToast({ title: 'Receipt summary copied to clipboard', type: 'success' });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Status */}
      <div
        className={`p-4 rounded-3xl flex items-center justify-between gap-3 ${
          entry.isPending
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              entry.isPending
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {entry.isPending ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">
              {entry.isPending ? 'Pending Final Gauge' : 'Completed Refuel Record'}
            </p>
            <p className="text-sm font-black">
              {formattedDate} · {formattedTime}
            </p>
          </div>
        </div>

        {entry.isPending && (
          <button
            type="button"
            onClick={onComplete}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            Complete Now
          </button>
        )}
      </div>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5">
          <span className="text-[11px] text-neutral-400 font-medium block">Total Paid</span>
          <span className="text-xl font-black text-neutral-900 dark:text-white block mt-0.5">
            {config.currency}{entry.amountPaid.toLocaleString()}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            {config.currency}{entry.pricePerLitre}/L
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5">
          <span className="text-[11px] text-neutral-400 font-medium block">Volume Pumped</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 block mt-0.5">
            {entry.litresFueled.toFixed(2)}{' '}
            <span className="text-xs font-normal text-neutral-500">{config.volumeUnit}</span>
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            ~{((entry.litresFueled / config.tankCapacityLitres) * 100).toFixed(0)}% of 52L tank
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5">
          <span className="text-[11px] text-neutral-400 font-medium block">Fuel Economy</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-baseline gap-1">
            {entry.fuelEconomy ? (
              <>
                <span>{entry.fuelEconomy.toFixed(2)}</span>
                <span className="text-xs font-normal text-neutral-500">km/L</span>
              </>
            ) : (
              <span className="text-sm font-medium text-neutral-400">Pending</span>
            )}
          </div>
          {diffFromAvg !== null && (
            <span
              className={`text-[11px] font-bold mt-0.5 block ${
                diffFromAvg >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {diffFromAvg >= 0 ? `+${diffFromAvg.toFixed(1)}%` : `${diffFromAvg.toFixed(1)}%`} vs average
            </span>
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5">
          <span className="text-[11px] text-neutral-400 font-medium block">Cost per Km</span>
          <span className="text-xl font-black text-neutral-900 dark:text-white block mt-0.5">
            {entry.costPerKm ? `${config.currency}${entry.costPerKm.toFixed(2)}` : '—'}
          </span>
          {lPer100km && (
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              {lPer100km.toFixed(1)} L / 100km
            </span>
          )}
        </div>
      </div>

      {/* Visual Range Gauge Progression */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-blue-500" />
            <span>Range Gauge Delta</span>
          </span>
          {entry.distanceThisFill && (
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
              +{entry.distanceThisFill} {config.distanceUnit} Added
            </span>
          )}
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 text-xs">
          <div className="text-center sm:text-left">
            <span className="text-[11px] text-neutral-400 block">Before Fill-up</span>
            <span className="text-base font-bold text-neutral-900 dark:text-white">
              {entry.initialRangeGauge} {config.distanceUnit}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center px-2">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1">
              +{entry.litresFueled.toFixed(1)}L pumped
            </span>
            <div className="w-full h-1.5 rounded-full bg-blue-500/20 relative flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-blue-500" />
              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute" />
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[11px] text-neutral-400 block">After Fill-up</span>
            <span className="text-base font-bold text-neutral-900 dark:text-white">
              {entry.postFillRangeGauge ? `${entry.postFillRangeGauge} ${config.distanceUnit}` : 'Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Station & Additional Details */}
      <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-800/40 border border-black/5 dark:border-white/10 space-y-2.5 text-xs">
        {entry.station && (
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>Fuel Station / Vendor</span>
            </span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {entry.station}
            </span>
          </div>
        )}

        {entry.notes && (
          <div className="pt-2 border-t border-black/5 dark:border-white/5">
            <span className="text-neutral-400 block mb-1 font-medium">Notes:</span>
            <p className="text-neutral-700 dark:text-neutral-300 italic bg-white dark:bg-neutral-900/60 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
              "{entry.notes}"
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleDelete}
          className="p-2.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyReceipt}
            className="px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copy Receipt</span>
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all inline-flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
