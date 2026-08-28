import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { MaintenanceScheduleItem } from '../../types';
import { Wrench } from 'lucide-react';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: MaintenanceScheduleItem | null;
}

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const {
    addMaintenanceItem,
    updateMaintenanceItem,
    vehicleConfig,
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintenanceScheduleItem['category']>('Engine');
  const [intervalKm, setIntervalKm] = useState('5000');
  const [intervalMonths, setIntervalMonths] = useState('6');
  const [lastServiceOdometer, setLastServiceOdometer] = useState(() =>
    vehicleConfig.currentCumulativeOdometer.toString()
  );
  const [lastServiceDate, setLastServiceDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [estimatedCost, setEstimatedCost] = useState('5000');
  const [priority, setPriority] = useState<MaintenanceScheduleItem['priority']>('High');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setCategory(itemToEdit.category);
      setIntervalKm(itemToEdit.intervalKm.toString());
      setIntervalMonths(itemToEdit.intervalMonths?.toString() || '6');
      setLastServiceOdometer(itemToEdit.lastServiceOdometer.toString());
      setLastServiceDate(itemToEdit.lastServiceDate);
      setEstimatedCost(itemToEdit.estimatedCost?.toString() || '0');
      setPriority(itemToEdit.priority);
      setNotes(itemToEdit.notes || '');
    } else {
      setTitle('');
      setIntervalKm('5000');
      setLastServiceOdometer(vehicleConfig.currentCumulativeOdometer.toString());
    }
  }, [itemToEdit, isOpen, vehicleConfig.currentCumulativeOdometer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numInterval = parseInt(intervalKm, 10) || 5000;
    const numLastOdo = parseFloat(lastServiceOdometer) || 0;
    const numCost = parseFloat(estimatedCost) || 0;

    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      category,
      intervalKm: numInterval,
      intervalMonths: parseInt(intervalMonths, 10) || undefined,
      lastServiceOdometer: numLastOdo,
      lastServiceDate,
      estimatedCost: numCost > 0 ? numCost : undefined,
      priority,
      notes: notes.trim() || undefined,
    };

    if (itemToEdit) {
      updateMaintenanceItem(itemToEdit.id, payload);
    } else {
      addMaintenanceItem(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? 'Edit Maintenance Task' : 'Add Maintenance Schedule'}
      subtitle="Schedule routine engine, fluids, filters, and safety service intervals."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Service Title / Component
          </label>
          <div className="relative">
            <Wrench className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Engine Oil & Filter (0W-20)"
              required
              className="w-full pl-9 pr-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Engine">Engine</option>
              <option value="Fluids">Fluids & Transmission</option>
              <option value="Filters">Filters</option>
              <option value="Chassis">Chassis & Tires</option>
              <option value="Electrical">Electrical</option>
              <option value="Safety">Safety & Brakes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="High">High (Crucial)</option>
              <option value="Medium">Medium (Routine)</option>
              <option value="Low">Low (Recommended)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Interval ({vehicleConfig.distanceUnit})
            </label>
            <input
              type="number"
              value={intervalKm}
              onChange={(e) => setIntervalKm(e.target.value)}
              placeholder="5000"
              required
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Interval (Months)
            </label>
            <input
              type="number"
              value={intervalMonths}
              onChange={(e) => setIntervalMonths(e.target.value)}
              placeholder="6"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Last Serviced At (Odometer)
            </label>
            <input
              type="number"
              value={lastServiceOdometer}
              onChange={(e) => setLastServiceOdometer(e.target.value)}
              placeholder="38500"
              required
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Last Serviced Date
            </label>
            <input
              type="date"
              value={lastServiceDate}
              onChange={(e) => setLastServiceDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Est. Service Cost ({vehicleConfig.currency})
            </label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="5000"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Notes (Part #, Brand)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. OEM Genuine Filter"
              className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

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
            {itemToEdit ? 'Save Schedule' : 'Add Maintenance Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
