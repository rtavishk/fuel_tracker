import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Gauge, AlertCircle, Info, Sparkles, Fuel } from 'lucide-react';

interface PreTripFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const PreTripForm: React.FC<PreTripFormProps> = ({ onSuccess, onCancel }) => {
  const { addPreTripLog, kpis, config } = useApp();

  const [currentOdometer, setCurrentOdometer] = useState<string>(
    kpis.latestRangeGauge > 0 ? kpis.latestRangeGauge.toString() : ''
  );
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const parsedCurrent = parseFloat(currentOdometer) || 0;
  const safeEconomy = kpis.avgFuelEconomy > 0 ? kpis.avgFuelEconomy : 0;
  const estimatedLitresLeft = safeEconomy > 0 ? parsedCurrent / safeEconomy : 0;
  const kmNeeded = Math.max(0, kpis.fullRangeBenchmark - parsedCurrent);
  const estimatedLitresNeededForFullTank = safeEconomy > 0 ? kmNeeded / safeEconomy : 0;
  const estimatedPriceOfPetrol = estimatedLitresNeededForFullTank * kpis.latestPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedCurrent < 0 || currentOdometer === '') {
      setError('Enter valid range gauge reading');
      return;
    }

    addPreTripLog({
      date: new Date().toISOString(),
      currentOdometer: parsedCurrent,
      notes: notes.trim() || undefined,
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200 text-xs flex gap-2.5 items-start">
        <Info className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
        <div>
          <span className="font-semibold">Pre-Trip Check:</span> Log your car's range gauge right before setting off. It automatically calculates remaining fuel volume and estimated cost to top off.
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
          Current Range Gauge ({config.distanceUnit})
        </label>
        <input
          type="number"
          id="pretrip-current-odo"
          step="any"
          autoFocus
          placeholder="e.g. 405"
          value={currentOdometer}
          onChange={(e) => {
            setCurrentOdometer(e.target.value);
            setError('');
          }}
          className="w-full px-4 py-3 text-lg font-bold rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/10 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Computed Live Insight Grid */}
      {parsedCurrent >= 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <span className="text-[11px] text-neutral-500 block">Estimated Fuel Left</span>
            <span className="text-base font-bold text-neutral-900 dark:text-white">
              ~{estimatedLitresLeft.toFixed(1)} {config.volumeUnit}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <span className="text-[11px] text-neutral-500 block">Litres to Full Tank</span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
              ~{estimatedLitresNeededForFullTank.toFixed(1)} {config.volumeUnit}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <span className="text-[11px] text-neutral-500 block">Est. Cost to Full Tank</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {config.currency}{Math.round(estimatedPriceOfPetrol).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
          Drive Destination / Notes (Optional)
        </label>
        <input
          type="text"
          id="pretrip-notes"
          placeholder="e.g. Expressway trip to Kandy"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

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
          id="pretrip-submit-btn"
          className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-purple-500/25 transition-all"
        >
          Save Pre-Trip Check
        </button>
      </div>
    </form>
  );
};
