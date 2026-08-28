import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { TripEntry } from '../../types';
import { Calendar, Info } from 'lucide-react';

interface AddTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripToEdit?: TripEntry | null;
}

export const AddTripModal: React.FC<AddTripModalProps> = ({
  isOpen,
  onClose,
  tripToEdit,
}) => {
  const { addTripEntry, updateTripEntry, vehicleConfig, fuelStats, computedTripEntries } = useApp();

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalOdometer, setTotalOdometer] = useState<string>(() =>
    (vehicleConfig.currentCumulativeOdometer + 45).toString()
  );
  const [category, setCategory] = useState<TripEntry['category']>('Commute');
  const [notes, setNotes] = useState('');

  // Get previous latest odometer for preview
  const latestOdo =
    computedTripEntries.length > 0
      ? computedTripEntries[0].totalOdometer
      : vehicleConfig.currentCumulativeOdometer;

  useEffect(() => {
    if (tripToEdit) {
      setDate(tripToEdit.date);
      setTotalOdometer(tripToEdit.totalOdometer.toString());
      setCategory(tripToEdit.category || 'Commute');
      setNotes(tripToEdit.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setTotalOdometer((latestOdo + 50).toString());
    }
  }, [tripToEdit, isOpen, latestOdo]);

  const numOdo = parseFloat(totalOdometer) || 0;
  const previewDiff = Math.max(0, numOdo - latestOdo);
  const previewCost = previewDiff * (fuelStats.avgCostPerKm || 7.3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numOdo <= 0) return;

    if (tripToEdit) {
      updateTripEntry(tripToEdit.id, {
        date,
        totalOdometer: numOdo,
        category,
        notes: notes.trim() || undefined,
      });
    } else {
      addTripEntry({
        date,
        totalOdometer: numOdo,
        category,
        notes: notes.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tripToEdit ? 'Edit Daily Trip Entry' : 'Log Daily Trip (Cumulative Odometer)'}
      subtitle="Enter the car's real cumulative odometer at the end of the day or trip."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/25 text-teal-200 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-teal-300">Cumulative Odometer:</strong> Enter the car's actual dashboard mileage (e.g.{' '}
            {latestOdo.toLocaleString()} km). Daily distance is calculated from the previous entry.
          </p>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Trip Date</label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
            />
          </div>
        </div>

        {/* Cumulative Odometer */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-zinc-300">
              End-of-Day Cumulative Odometer ({vehicleConfig.distanceUnit})
            </label>
            <span className="text-[10px] text-zinc-400 font-mono">
              Prev: {latestOdo.toLocaleString()} km
            </span>
          </div>
          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={totalOdometer}
            onChange={(e) => setTotalOdometer(e.target.value)}
            placeholder="145250"
            required
            className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-base font-bold text-teal-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
          />
        </div>

        {/* Live calculated distance highlight */}
        {previewDiff > 0 && (
          <div className="p-3 rounded-xl bg-[#18181b]/80 border border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Calculated Distance Today:</span>
            <div className="text-right">
              <span className="text-emerald-400 font-bold text-sm">
                +{previewDiff} {vehicleConfig.distanceUnit}
              </span>
              <span className="text-[10px] text-amber-300 block">
                ≈ {vehicleConfig.currency} {previewCost.toFixed(0)} fuel cost
              </span>
            </div>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Trip Purpose</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Commute', 'Highway', 'City', 'Business', 'Roadtrip', 'Errand'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-semibold'
                    : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Notes / Route Description
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Office return via ring road, heavy traffic"
            className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Actions */}
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
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 hover:from-teal-300 hover:to-emerald-300 text-black text-xs font-bold shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            {tripToEdit ? 'Save Changes' : 'Save Daily Odometer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
