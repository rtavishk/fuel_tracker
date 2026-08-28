import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  Calendar,
  Trash2,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const FuelPriceModal: React.FC = () => {
  const {
    currentFuelPrice,
    updateFuelPrice,
    fuelPriceHistory,
    deleteFuelPriceRecord,
    vehicleConfig,
    isFuelPriceModalOpen,
    setIsFuelPriceModalOpen,
  } = useApp();

  const [priceInput, setPriceInput] = useState<string>(currentFuelPrice.toString());
  const [effectiveDate, setEffectiveDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    setPriceInput(currentFuelPrice.toString());
  }, [currentFuelPrice, isFuelPriceModalOpen]);

  const handleUpdatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(priceInput);
    if (isNaN(numPrice) || numPrice <= 0) return;

    updateFuelPrice(numPrice, notes.trim() || undefined, effectiveDate);
    setSuccessMsg(`Active fuel price updated to ${vehicleConfig.currency} ${numPrice.toFixed(2)} / ${vehicleConfig.volumeUnit}`);
    setNotes('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleQuickAdjust = (delta: number) => {
    const current = parseFloat(priceInput) || currentFuelPrice;
    const updated = Math.max(0.1, Math.round((current + delta) * 100) / 100);
    setPriceInput(updated.toString());
  };

  return (
    <Modal
      isOpen={isFuelPriceModalOpen}
      onClose={() => setIsFuelPriceModalOpen(false)}
      title="Dynamic Fuel Price Engine"
      subtitle={`Configure active fuel rate for ${vehicleConfig.make} ${vehicleConfig.model} and track monthly revisions.`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Domain Explanation Banner */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-emerald-300">Rate Configuration:</strong> Fuel prices
            fluctuate over time. Setting the active price here updates all predictive
            calculators, pre-trip budget estimates, and defaults new refueling logs to this rate.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Update Active Price Form */}
        <form onSubmit={handleUpdatePrice} className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Fuel className="w-4 h-4 text-emerald-400" />
              Set Current Active Rate
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold font-mono text-emerald-400">
              Active: {vehicleConfig.currency} {currentFuelPrice.toFixed(2)} / {vehicleConfig.volumeUnit}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                New Price ({vehicleConfig.currency} per {vehicleConfig.volumeUnit})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="106.5"
                  required
                  className="w-full px-3 py-2 bg-[#121215] border border-zinc-800 rounded-xl text-base font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Stepper Buttons */}
              <div className="flex items-center gap-1.5 mt-2">
                {[-1, -0.5, +0.5, +1, +5].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleQuickAdjust(step)}
                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[10px] font-mono cursor-pointer transition-colors"
                  >
                    {step > 0 ? `+${step.toFixed(1)}` : step.toFixed(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Effective Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#121215] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Revision note (e.g. Rate revision)"
                  className="w-full px-3 py-1.5 bg-[#121215] border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Apply New Fuel Rate
            </button>
          </div>
        </form>

        {/* Historical Monthly Price Revision Log */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2.5 flex items-center justify-between font-mono">
            <span>Price Revision History</span>
            <span className="text-[11px] font-normal text-zinc-400 font-sans">
              {fuelPriceHistory.length} recorded {fuelPriceHistory.length === 1 ? 'rate' : 'rates'}
            </span>
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {fuelPriceHistory.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 text-center text-xs text-zinc-500">
                No historical revisions logged yet.
              </div>
            ) : (
              fuelPriceHistory.map((item, idx) => {
                const prevItem = fuelPriceHistory[idx + 1];
                const diff = prevItem ? item.price - prevItem.price : 0;
                const isCurrent = item.price === currentFuelPrice;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-[#09090b] border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          diff > 0
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                            : diff < 0
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {diff > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : diff < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <Fuel className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {vehicleConfig.currency} {item.price.toFixed(2)} / {vehicleConfig.volumeUnit}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-black font-extrabold text-[9px] uppercase font-mono">
                              Active
                            </span>
                          )}
                          {diff !== 0 && (
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                diff > 0 ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span>{item.date}</span>
                          {item.notes && <span>• {item.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteFuelPriceRecord(item.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
