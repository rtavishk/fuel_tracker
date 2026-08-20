import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelEntry } from '../../types';
import {
  CheckCircle2,
  Gauge,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface FuelCompletionModalProps {
  entry: FuelEntry;
  onSuccess: () => void;
  onCancel: () => void;
}

export const FuelCompletionModal: React.FC<FuelCompletionModalProps> = ({
  entry,
  onSuccess,
  onCancel,
}) => {
  const { completeFuelEntry, config, kpis } = useApp();

  const safeEconomy = kpis.avgFuelEconomy > 0 ? kpis.avgFuelEconomy : 13.5;
  const estRange = entry.litresFueled * safeEconomy;
  const recommendedGauge = Math.round(entry.currentOdometer + estRange);

  const [afterFuelingOdometer, setAfterFuelingOdometer] = useState<string>(
    recommendedGauge.toString()
  );
  const [error, setError] = useState<string>('');

  const parsedAfter = parseFloat(afterFuelingOdometer) || 0;
  const distanceAdded = parsedAfter - entry.currentOdometer;
  const economy = entry.litresFueled > 0 && distanceAdded > 0 ? distanceAdded / entry.litresFueled : null;
  const costPerKm = distanceAdded > 0 ? entry.amountPaid / distanceAdded : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAfter <= entry.currentOdometer) {
      setError(`Post-fueling range (${parsedAfter} km) must be higher than pre-fueling (${entry.currentOdometer} km)`);
      return;
    }

    completeFuelEntry(entry.id, parsedAfter);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Context Banner */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <div className="flex items-center justify-between font-bold">
          <span>Pending Range Gauge Reading</span>
          <span>{entry.litresFueled.toFixed(2)} L pumped</span>
        </div>
        <p className="opacity-90">
          Logged on <strong>{new Date(entry.date).toLocaleDateString()}</strong> for{' '}
          <strong>{config.currency}{entry.amountPaid.toLocaleString()}</strong>. Pre-fueling cluster gauge was{' '}
          <strong>{entry.currentOdometer} km</strong>.
        </p>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
            Cluster Range Gauge Reading After Fill ({config.distanceUnit})
          </label>
          <button
            type="button"
            onClick={() => setAfterFuelingOdometer(recommendedGauge.toString())}
            className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            Auto est. {recommendedGauge} km
          </button>
        </div>

        <div className="relative">
          <input
            type="number"
            id="completion-after-odo"
            step="any"
            autoFocus
            value={afterFuelingOdometer}
            onChange={(e) => {
              setAfterFuelingOdometer(e.target.value);
              setError('');
            }}
            placeholder="e.g. 660"
            className="w-full px-4 py-3 text-lg font-bold rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}

        {/* Quick estimate buttons */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[11px] text-neutral-400 mr-1">Suggestions:</span>
          {[600, 640, 660, 680, 700].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setAfterFuelingOdometer(val.toString());
                setError('');
              }}
              className="px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold transition-all active:scale-95"
            >
              {val} km
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Calculation Gauge */}
      {parsedAfter > entry.currentOdometer && (
        <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-900/70 border border-black/5 dark:border-white/5 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Added Driving Distance:</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              +{distanceAdded} {config.distanceUnit}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Computed Fuel Economy:</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {economy?.toFixed(2)} km/L
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
            <span className="text-neutral-500 dark:text-neutral-400">Effective Driving Cost:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {config.currency}{costPerKm?.toFixed(2)} / km
            </span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="pt-2 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          id="completion-submit-btn"
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Final Reading</span>
        </button>
      </div>
    </form>
  );
};
