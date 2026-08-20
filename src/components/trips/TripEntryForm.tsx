import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyTrip } from '../../types';
import { Compass, Calendar, Gauge, AlertCircle, Info, Sparkles } from 'lucide-react';

interface TripEntryFormProps {
  initialData?: DailyTrip | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TripEntryForm: React.FC<TripEntryFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { addDailyTrip, updateDailyTrip, rawDailyTrips, config, kpis } = useApp();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>(initialData?.date || todayStr);

  // Find latest recorded total odometer to give smart suggestion
  const sortedTrips = [...rawDailyTrips].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const previousTrip = sortedTrips[0];
  const previousTotalOdo = previousTrip?.totalOdometer || 14800;

  const [totalOdometer, setTotalOdometer] = useState<string>(
    initialData ? initialData.totalOdometer.toString() : ''
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const parsedTotal = parseFloat(totalOdometer) || 0;
  const kmDrivenEst = previousTotalOdo && parsedTotal > previousTotalOdo
    ? parsedTotal - previousTotalOdo
    : null;
  const costEst = kmDrivenEst ? kmDrivenEst * kpis.avgCostPerKm : null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!date) err.date = 'Date is required';
    if (parsedTotal <= 0 || totalOdometer === '') err.totalOdometer = 'Enter vehicle total cumulative odometer';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (initialData) {
      updateDailyTrip(initialData.id, {
        date,
        totalOdometer: parsedTotal,
        notes: notes.trim() || undefined,
      });
    } else {
      addDailyTrip({
        date,
        totalOdometer: parsedTotal,
        notes: notes.trim() || undefined,
      });
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Domain notice */}
      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs flex gap-2.5 items-start">
        <Info className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <div>
          <span className="font-semibold">Cumulative Total Odometer:</span> This is the vehicle's real lifetime odometer (e.g. 14,830 km) shown on your BJ30e instrument cluster.
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
          Date
        </label>
        <input
          type="date"
          id="trip-form-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
      </div>

      {/* Total Cumulative Odometer */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Total Vehicle Odometer ({config.distanceUnit})
          </label>
          {previousTrip && !initialData && (
            <span className="text-[11px] text-neutral-400">
              Last: {previousTrip.totalOdometer.toLocaleString()} km ({previousTrip.date})
            </span>
          )}
        </div>
        <input
          type="number"
          id="trip-form-total-odo"
          step="any"
          placeholder={`e.g. ${(previousTotalOdo + 35).toLocaleString()}`}
          value={totalOdometer}
          onChange={(e) => setTotalOdometer(e.target.value)}
          className="w-full px-4 py-3 text-lg font-bold rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {errors.totalOdometer && (
          <p className="text-xs text-red-500 mt-1">{errors.totalOdometer}</p>
        )}
      </div>

      {/* Realtime calculated day's distance */}
      {kmDrivenEst !== null && kmDrivenEst > 0 && (
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs space-y-1">
          <div className="flex items-center justify-between font-medium">
            <span className="text-neutral-500">Calculated Distance Driven:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              +{kmDrivenEst} {config.distanceUnit}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">Est. Fuel Cost (@ {config.currency}{kpis.avgCostPerKm.toFixed(2)}/km):</span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              ~{config.currency}{costEst?.toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
          Notes / Trip Purpose (Optional)
        </label>
        <input
          type="text"
          id="trip-form-notes"
          placeholder="e.g. Highway run to office / weekend trip"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Buttons */}
      <div className="pt-3 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          id="trip-form-submit-btn"
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all"
        >
          {initialData ? 'Save Changes' : 'Log Odometer'}
        </button>
      </div>
    </form>
  );
};
