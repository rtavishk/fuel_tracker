import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelEntry } from '../../types';
import {
  Fuel,
  Calendar,
  DollarSign,
  Gauge,
  AlertCircle,
  Info,
  Sparkles,
  Check,
  MapPin,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface FuelEntryFormProps {
  initialData?: FuelEntry | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const COMMON_STATIONS = [
  'Shell',
  'Total',
  'ENGEN',
  'Indian Oil',
  'Ceypetco',
  'Sinopec',
  'Caltex',
  'Mobil',
];

export const FuelEntryForm: React.FC<FuelEntryFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const { addFuelEntry, updateFuelEntry, config, kpis } = useApp();

  const [date, setDate] = useState<string>(() => {
    if (initialData?.date) {
      return new Date(initialData.date).toISOString().slice(0, 16);
    }
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });

  const [amountPaid, setAmountPaid] = useState<string>(
    initialData ? initialData.amountPaid.toString() : ''
  );
  const [pricePerLitre, setPricePerLitre] = useState<string>(
    initialData
      ? initialData.pricePerLitre.toString()
      : kpis.latestPrice
      ? kpis.latestPrice.toString()
      : '318'
  );
  const [currentOdometer, setCurrentOdometer] = useState<string>(
    initialData ? initialData.currentOdometer.toString() : ''
  );
  const [afterFuelingOdometer, setAfterFuelingOdometer] = useState<string>(
    initialData?.afterFuelingOdometer ? initialData.afterFuelingOdometer.toString() : ''
  );
  const [gasStation, setGasStation] = useState<string>(initialData?.gasStation || '');
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time calculations
  const parsedAmount = parseFloat(amountPaid) || 0;
  const parsedPrice = parseFloat(pricePerLitre) || 0;
  const parsedCurrent = parseFloat(currentOdometer) || 0;
  const parsedAfter = afterFuelingOdometer ? parseFloat(afterFuelingOdometer) : null;

  const liveLitres = parsedPrice > 0 ? parsedAmount / parsedPrice : 0;
  const safeEconomy = kpis.avgFuelEconomy > 0 ? kpis.avgFuelEconomy : 13.5;
  const liveEstRange = liveLitres > 0 ? liveLitres * safeEconomy : 0;
  const liveEstAfterGauge = parsedCurrent > 0 ? Math.round(parsedCurrent + liveEstRange) : 0;

  const liveDistance = parsedAfter !== null && parsedAfter > parsedCurrent ? parsedAfter - parsedCurrent : null;
  const liveEconomy = liveDistance !== null && liveLitres > 0 ? liveDistance / liveLitres : null;
  const liveCostPerKm = liveDistance !== null && liveDistance > 0 ? parsedAmount / liveDistance : null;

  // Preset amount buttons
  const applyQuickAmount = (val: number) => {
    setAmountPaid(val.toString());
    setErrors((prev) => ({ ...prev, amountPaid: '' }));
  };

  const applyFullTankAmount = () => {
    if (parsedPrice > 0) {
      const fullLitres = Math.max(10, config.tankCapacityLitres - (parsedCurrent / safeEconomy));
      const fullCost = Math.round(fullLitres * parsedPrice);
      setAmountPaid(fullCost.toString());
      setErrors((prev) => ({ ...prev, amountPaid: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!date) newErrors.date = 'Date and time are required';
    if (parsedAmount <= 0 || isNaN(parsedAmount)) newErrors.amountPaid = 'Enter valid total amount paid';
    if (parsedPrice <= 0 || isNaN(parsedPrice)) newErrors.pricePerLitre = 'Enter price per litre';
    if (parsedCurrent < 0 || currentOdometer === '') newErrors.currentOdometer = 'Enter range gauge before fueling';

    if (parsedAfter !== null && parsedAfter <= parsedCurrent) {
      newErrors.afterFuelingOdometer = `After-fueling range (${parsedAfter} km) must be higher than before (${parsedCurrent} km)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      date: new Date(date).toISOString(),
      amountPaid: parsedAmount,
      pricePerLitre: parsedPrice,
      litresFueled: liveLitres,
      currentOdometer: parsedCurrent,
      afterFuelingOdometer: parsedAfter,
      gasStation: gasStation.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (initialData) {
      updateFuelEntry(initialData.id, payload);
    } else {
      addFuelEntry(payload);
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Informative Guidance Banner */}
      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200 text-xs flex gap-2.5 items-start">
        <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <span className="font-semibold">BAIC BJ30e Instrument Cluster:</span> Log the vehicle's <em>Remaining Range / DTE</em> gauge reading before fueling and post-fueling.
        </div>
      </div>

      {/* Date & Time */}
      <div>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
          Date & Time
        </label>
        <input
          type="datetime-local"
          id="fuel-form-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
      </div>

      {/* Amount Paid & Quick Presets */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Total Amount Paid ({config.currency})
          </label>
          {parsedPrice > 0 && (
            <span className="text-[11px] text-neutral-400">
              {liveLitres > 0 ? `~${liveLitres.toFixed(2)} ${config.volumeUnit} pumped` : ''}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type="number"
            id="fuel-form-amount"
            step="any"
            placeholder="e.g. 12000"
            value={amountPaid}
            onChange={(e) => {
              setAmountPaid(e.target.value);
              setErrors((prev) => ({ ...prev, amountPaid: '' }));
            }}
            className="w-full px-4 py-3 text-base sm:text-lg font-bold rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {errors.amountPaid && <p className="text-xs text-red-500 mt-1">{errors.amountPaid}</p>}

        {/* Quick Amount Chips */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[11px] text-neutral-400 mr-1">Quick:</span>
          {[3000, 5000, 10000, 15000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => applyQuickAmount(amt)}
              className="px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold transition-all active:scale-95"
            >
              +{amt.toLocaleString()}
            </button>
          ))}
          <button
            type="button"
            onClick={applyFullTankAmount}
            className="px-2.5 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-bold transition-all active:scale-95"
          >
            Full Tank Est.
          </button>
        </div>
      </div>

      {/* Price per Litre */}
      <div>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
          Price / Litre ({config.currency}/{config.volumeUnit})
        </label>
        <input
          type="number"
          id="fuel-form-price"
          step="any"
          placeholder="e.g. 318"
          value={pricePerLitre}
          onChange={(e) => {
            setPricePerLitre(e.target.value);
            setErrors((prev) => ({ ...prev, pricePerLitre: '' }));
          }}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.pricePerLitre && <p className="text-xs text-red-500 mt-1">{errors.pricePerLitre}</p>}
      </div>

      {/* Range Before & Range After */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
            Range Before Fueling ({config.distanceUnit})
            <span className="text-[11px] font-normal text-neutral-400 block">DTE gauge reading</span>
          </label>
          <input
            type="number"
            id="fuel-form-current-odo"
            placeholder="e.g. 85"
            value={currentOdometer}
            onChange={(e) => {
              setCurrentOdometer(e.target.value);
              setErrors((prev) => ({ ...prev, currentOdometer: '' }));
            }}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.currentOdometer && (
            <p className="text-xs text-red-500 mt-1">{errors.currentOdometer}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300">
              Range After Fueling ({config.distanceUnit})
              <span className="text-[11px] font-normal text-neutral-400 block">Optional now, log later</span>
            </label>
            {liveEstAfterGauge > 0 && !afterFuelingOdometer && (
              <button
                type="button"
                onClick={() => setAfterFuelingOdometer(liveEstAfterGauge.toString())}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Use ~{liveEstAfterGauge}
              </button>
            )}
          </div>
          <input
            type="number"
            id="fuel-form-after-odo"
            placeholder="e.g. 675"
            value={afterFuelingOdometer}
            onChange={(e) => {
              setAfterFuelingOdometer(e.target.value);
              setErrors((prev) => ({ ...prev, afterFuelingOdometer: '' }));
            }}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.afterFuelingOdometer && (
            <p className="text-xs text-red-500 mt-1">{errors.afterFuelingOdometer}</p>
          )}
        </div>
      </div>

      {/* Dynamic Real-time Calculation Insights Preview */}
      {liveLitres > 0 && (
        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Pumped Fuel Volume:</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {liveLitres.toFixed(2)} {config.volumeUnit}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">Estimated Range Added:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              +{liveEstRange.toFixed(0)} {config.distanceUnit}
            </span>
          </div>

          {liveDistance !== null && (
            <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 font-semibold">
              <span className="text-neutral-500 dark:text-neutral-400">Computed Efficiency:</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {liveEconomy?.toFixed(2)} km/L ({config.currency}{liveCostPerKm?.toFixed(2)}/km)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Gas Station / Vendor Selector & Presets */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Gas Station / Vendor
          </label>
          <span className="text-[11px] text-neutral-400">Select vendor or type station name</span>
        </div>
        <input
          type="text"
          id="fuel-form-station"
          placeholder="e.g. Shell, Total, ENGEN, Indian Oil..."
          value={gasStation}
          onChange={(e) => setGasStation(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
        />
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {COMMON_STATIONS.map((station) => {
              const isSelected = gasStation === station;
              return (
                <button
                  key={station}
                  type="button"
                  onClick={() => setGasStation(station)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                      : 'bg-neutral-100 dark:bg-neutral-800/90 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-black/5 dark:border-white/5'
                  }`}
                >
                  {station}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
          Notes / Trip Remarks (Optional)
        </label>
        <input
          type="text"
          id="fuel-form-notes"
          placeholder="e.g. Highway expressway run / full top-up"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-black/5 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
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
          id="fuel-form-submit-btn"
          className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
        >
          {initialData ? 'Save Changes' : 'Save Fill-up'}
        </button>
      </div>
    </form>
  );
};
