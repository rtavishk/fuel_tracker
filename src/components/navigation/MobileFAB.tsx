import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  X,
  Fuel,
  Navigation,
  DollarSign,
  Calculator,
} from 'lucide-react';

export const MobileFAB: React.FC = () => {
  const {
    setIsAddFuelModalOpen,
    setIsAddTripModalOpen,
    setIsFuelPriceModalOpen,
    setActiveTab,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAction = (cb: () => void) => {
    setIsOpen(false);
    cb();
  };

  return (
    <div className="md:hidden">
      {/* Dimmed backdrop when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity"
          />
        )}
      </AnimatePresence>

      {/* Floating Action Container */}
      <div className="fixed bottom-[4.75rem] right-4 z-40 flex flex-col items-end gap-2.5">
        {/* Action Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="flex flex-col items-end gap-2.5 mb-1"
            >
              {/* Action 1: Log Fuel */}
              <button
                type="button"
                onClick={() => handleAction(() => setIsAddFuelModalOpen(true))}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl text-white hover:border-emerald-500/50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-zinc-200">Log Gas Fill-up</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Fuel className="w-4 h-4" />
                </div>
              </button>

              {/* Action 2: Log Daily Trip Odometer */}
              <button
                type="button"
                onClick={() => handleAction(() => setIsAddTripModalOpen(true))}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl text-white hover:border-teal-500/50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-zinc-200">Log Day's Odometer</span>
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Navigation className="w-4 h-4" />
                </div>
              </button>

              {/* Action 3: Quick Update Fuel Rate */}
              <button
                type="button"
                onClick={() => handleAction(() => setIsFuelPriceModalOpen(true))}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl text-white hover:border-emerald-500/50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-zinc-200">Update Fuel Rate</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-4 h-4" />
                </div>
              </button>

              {/* Action 4: Open Predictive Calculator */}
              <button
                type="button"
                onClick={() => handleAction(() => setActiveTab('calculator'))}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl text-white hover:border-lime-500/50 active:scale-95 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-zinc-200">Fuel Distance Calculator</span>
                <div className="w-8 h-8 rounded-xl bg-lime-500/15 border border-lime-500/30 flex items-center justify-center text-lime-400 group-hover:scale-110 transition-transform">
                  <Calculator className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Trigger Button */}
        <motion.button
          type="button"
          id="mobile-fab-trigger"
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close actions menu' : 'Open quick actions menu'}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all cursor-pointer ${
            isOpen
              ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-black/80'
              : 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 text-black shadow-emerald-500/30 border border-emerald-300/40 ring-2 ring-emerald-500/20 font-bold'
          }`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          >
            {isOpen ? <X className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 stroke-[2.8]" />}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};
