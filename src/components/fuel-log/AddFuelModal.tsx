import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { FuelEntry } from '../../types';
import { Fuel, Info, Calendar, Clock, Gauge } from 'lucide-react';

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: FuelEntry | null;
}

export const AddFuelModal: React.FC<AddFuelModalProps> = ({
  isOpen,
  onClose,
  entryToEdit,
}) => {
  const {
    addFuelEntry,
    updateFuelEntry,
    vehicleConfig,
    fuelStats,
    fullRangeBenchmark,
    currentFuelPrice,
  } = useApp();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [amountPaid, setAmountPaid] = useState<string>('4500');
  const [pricePerLitre, setPricePerLitre] = useState<string>(
    currentFuelPrice ? currentFuelPrice.toString() : '106.5'
  );
  const [currentOdometer, setCurrentOdometer] = useState<string>('85');
  const [afterFuelingOdometer, setAfterFuelingOdometer] = useState<string>('680');
  const [isPendingGauge, setIsPendingGauge] = useState<boolean>(false);
  const [fuelStation, setFuelStation] = useState('Shell Expressway Central');
  const [notes, setNotes] = useState('');
  const [isFullTank, setIsFullTank] = useState(true);

  // Populate form if editing
  useEffect(() => {
    if (entryToEdit) {
      setDate(entryToEdit.date);
      setTime(entryToEdit.time || '12:00');
      setAmountPaid(entryToEdit.amountPaid.toString());
      setPricePerLitre(entryToEdit.pricePerLitre.toString());
      setCurrentOdometer(entryToEdit.currentOdometer.toString());
      if (
        entryToEdit.afterFuelingOdometer !== undefined &&
        entryToEdit.afterFuelingOdometer !== null
      ) {
        setAfterFuelingOdometer(entryToEdit.afterFuelingOdometer.toString());
        setIsPendingGauge(false);
      } else {
        setAfterFuelingOdometer('');
        setIsPendingGauge(true);
      }
      setFuelStation(entryToEdit.fuelStation || '');
      setNotes(entryToEdit.notes || '');
      setIsFullTank(entryToEdit.isFullTank ?? true);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setPricePerLitre(currentFuelPrice ? currentFuelPrice.toString() : '106.5');
      setAfterFuelingOdometer(fullRangeBenchmark.toString());
      setIsPendingGauge(false);
    }
  }, [entryToEdit, isOpen, currentFuelPrice, fullRangeBenchmark]);

  // Live computed previews
  const numAmount = parseFloat(amountPaid) || 0;
  const numPrice = parseFloat(pricePerLitre) || 0;
  const numCurrentOdo = parseFloat(currentOdometer) || 0;
  const numAfterOdo = isPendingGauge ? null : parseFloat(afterFuelingOdometer);

  const previewLitres = numPrice > 0 ? numAmount / numPrice : 0;
  const previewEstimatedRange = previewLitres * (fuelStats.avgEconomy || 14.5);
  const previewEstimatedAfterOdo = numCurrentOdo + previewEstimatedRange;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || numPrice <= 0) return;

    const payload = {
      date,
      time,
      amountPaid: numAmount,
      pricePerLitre: numPrice,
      currentOdometer: numCurrentOdo,
      afterFuelingOdometer: isPendingGauge || numAfterOdo === null ? null : numAfterOdo,
      fuelStation: fuelStation.trim() || undefined,
      notes: notes.trim() || undefined,
      isFullTank,
    };

    if (entryToEdit) {
      updateFuelEntry(entryToEdit.id, payload);
    } else {
      addFuelEntry(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'Edit Fuel Entry' : 'Log Refueling Fill-up'}
      subtitle="Odometer figures logged here are your car's remaining-range gauge (Distance-to-Empty)."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Domain notice pill */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-emerald-300">Distance-to-Empty Gauge:</strong> Log the remaining km
            reading before fueling (e.g. 70–100 km) and the gauge after fueling (jumps to ~
            {fullRangeBenchmark} km).
          </p>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Fill-up Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Time (optional)</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Financials: Amount Paid & Price per Litre */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Amount Paid ({vehicleConfig.currency})
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="1"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="4500"
                required
                className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Price / Litre ({vehicleConfig.currency}/{vehicleConfig.volumeUnit})
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min="0.1"
              value={pricePerLitre}
              onChange={(e) => setPricePerLitre(e.target.value)}
              placeholder="105.5"
              required
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Quick Amount Steppers */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold shrink-0 font-mono">
            Quick:
          </span>
          {[1000, 2000, 3500, 4500, 5000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmountPaid(amt.toString())}
              className={`px-2 py-1 rounded-lg border text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                amountPaid === amt.toString()
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                  : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {vehicleConfig.currency} {amt.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Litres Fueled Auto-Computation Highlight */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181b]/80 border border-zinc-800 text-xs">
          <span className="text-zinc-400">Calculated Litres Fueled:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {previewLitres.toFixed(2)} {vehicleConfig.volumeUnit}
          </span>
        </div>

        {/* Range Gauge Fields: Current & After Refueling */}
        <div className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-400" />
              Distance-to-Empty (Range Gauge)
            </span>
            <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer font-mono">
              <input
                type="checkbox"
                checked={isPendingGauge}
                onChange={(e) => setIsPendingGauge(e.target.checked)}
                className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 bg-zinc-900"
              />
              <span>After-gauge is pending</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Before Fueling ({vehicleConfig.distanceUnit})
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(e.target.value)}
                placeholder="85"
                required
                className="w-full px-3 py-2 bg-[#121215] border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-zinc-400">
                  After Fueling ({vehicleConfig.distanceUnit})
                </label>
                {!isPendingGauge && (
                  <button
                    type="button"
                    onClick={() => setAfterFuelingOdometer(fullRangeBenchmark.toString())}
                    className="text-[10px] text-emerald-400 hover:underline font-mono"
                  >
                    Full (~{fullRangeBenchmark})
                  </button>
                )}
              </div>
              <input
                type="number"
                inputMode="decimal"
                disabled={isPendingGauge}
                value={isPendingGauge ? '' : afterFuelingOdometer}
                onChange={(e) => setAfterFuelingOdometer(e.target.value)}
                placeholder={isPendingGauge ? 'Pending observation' : `${fullRangeBenchmark}`}
                className="w-full px-3 py-2 bg-[#121215] border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Real-time calculated forecast comparison */}
          {previewLitres > 0 && (
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Forecast Range Added:</span>
              <span className="font-mono text-teal-300 font-semibold">
                +{previewEstimatedRange.toFixed(0)} {vehicleConfig.distanceUnit} (Est. Gauge:{' '}
                {previewEstimatedAfterOdo.toFixed(0)} {vehicleConfig.distanceUnit})
              </span>
            </div>
          )}
        </div>

        {/* Station & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Fuel Station / Brand
            </label>
            <input
              type="text"
              value={fuelStation}
              onChange={(e) => setFuelStation(e.target.value)}
              placeholder="e.g. Shell Expressway"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Notes (AC, tire pressure, highway)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. City commuting, AC full"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            {entryToEdit ? 'Save Changes' : 'Save Fill-up Log'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
