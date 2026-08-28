import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { VehicleConfig } from '../../types';
import { Gauge } from 'lucide-react';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose }) => {
  const { addVehicle, currentFuelPrice, user } = useApp();

  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<string>('2024');
  const [licensePlate, setLicensePlate] = useState('');
  const [tankCapacity, setTankCapacity] = useState<string>('50');
  const [fullRangeBenchmark, setFullRangeBenchmark] = useState<string>('700');
  const [startingOdometer, setStartingOdometer] = useState<string>('0');
  const [fuelType, setFuelType] = useState('Petrol (95)');
  const [currency, setCurrency] = useState(user?.preferredCurrency || 'Rs.');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [volumeUnit, setVolumeUnit] = useState<'L' | 'gal'>('L');
  const [targetEfficiency, setTargetEfficiency] = useState<string>(
    user?.targetEfficiency?.toString() || '14.5'
  );
  const [carFuelPrice, setCarFuelPrice] = useState<string>(currentFuelPrice.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim()) return;

    const newVehicle: Omit<VehicleConfig, 'id'> = {
      name: name.trim() || `${make.trim()} ${model.trim()}`,
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year) || new Date().getFullYear(),
      licensePlate: licensePlate.trim() || undefined,
      tankCapacityLitres: parseFloat(tankCapacity) || 50,
      fullRangeBenchmarkKm: parseFloat(fullRangeBenchmark) || 700,
      currentCumulativeOdometer: parseFloat(startingOdometer) || 0,
      fuelType,
      currency: currency.trim() || 'Rs.',
      distanceUnit,
      volumeUnit,
      targetEfficiency: parseFloat(targetEfficiency) || 14.5,
      currentFuelPrice: parseFloat(carFuelPrice) || currentFuelPrice,
    };

    addVehicle(newVehicle);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Vehicle to Garage"
      subtitle="Configure technical specs, fuel type, tank capacity, and distance units for any car."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Make, Model, Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Make / Brand</label>
            <input
              type="text"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="e.g. Toyota, BMW, Honda"
              required
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Model & Trim</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Civic, Corolla Altis"
              required
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Model Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2024"
              min="1970"
              max="2030"
              required
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Display Name & License Plate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Vehicle Nickname (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daily Commuter"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              License Plate (optional)
            </label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="e.g. ABC-1234"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Tank & Range Specs */}
        <div className="p-3.5 rounded-xl bg-[#09090b] border border-zinc-800 space-y-3">
          <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>Capacity & Distance Benchmarks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Tank Capacity ({volumeUnit})
              </label>
              <input
                type="number"
                step="any"
                value={tankCapacity}
                onChange={(e) => setTankCapacity(e.target.value)}
                placeholder="50"
                required
                className="w-full px-3 py-2 bg-[#121215] border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Full-Tank Range ({distanceUnit})
              </label>
              <input
                type="number"
                value={fullRangeBenchmark}
                onChange={(e) => setFullRangeBenchmark(e.target.value)}
                placeholder="700"
                required
                className="w-full px-3 py-2 bg-[#121215] border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Starting Odometer ({distanceUnit})
              </label>
              <input
                type="number"
                value={startingOdometer}
                onChange={(e) => setStartingOdometer(e.target.value)}
                placeholder="0"
                required
                className="w-full px-3 py-2 bg-[#121215] border border-zinc-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Units & Currency Preferences */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Distance Unit</label>
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value as 'km' | 'mi')}
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="km">Kilometers (km)</option>
              <option value="mi">Miles (mi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Volume Unit</label>
            <select
              value={volumeUnit}
              onChange={(e) => setVolumeUnit(e.target.value as 'L' | 'gal')}
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="L">Litres (L)</option>
              <option value="gal">Gallons (gal)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="Rs., $, €"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Target Efficiency
            </label>
            <input
              type="number"
              step="0.1"
              value={targetEfficiency}
              onChange={(e) => setTargetEfficiency(e.target.value)}
              placeholder="14.5"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Fuel Type & Default Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Fuel Type</label>
            <input
              type="text"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              placeholder="Petrol (95), Diesel, Premium Unleaded..."
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Active Fuel Price ({currency}/{volumeUnit})
            </label>
            <input
              type="number"
              step="any"
              value={carFuelPrice}
              onChange={(e) => setCarFuelPrice(e.target.value)}
              placeholder="106.5"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Add Car & Switch
          </button>
        </div>
      </form>
    </Modal>
  );
};
