import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Undo2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div
      id="toast-container"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2 items-center"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className="pointer-events-auto w-full rounded-2xl shadow-xl border border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#202022]/95 backdrop-blur-xl p-3.5 flex items-center justify-between gap-3 text-sm text-neutral-900 dark:text-neutral-100"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {toast.type === 'success' && (
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-7 h-7 rounded-full bg-red-500/15 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 stroke-[2.2]" />
                </div>
              )}
              {toast.type === 'warning' && (
                <div className="w-7 h-7 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                </div>
              )}
              {(!toast.type || toast.type === 'info') && (
                <div className="w-7 h-7 rounded-full bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 stroke-[2.2]" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[13.5px] leading-tight truncate">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5 truncate">
                    {toast.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {toast.undoAction && (
                <button
                  type="button"
                  id={`toast-undo-${toast.id}`}
                  onClick={() => {
                    toast.undoAction?.();
                    removeToast(toast.id);
                  }}
                  className="px-2.5 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Undo2 className="w-3 h-3" />
                  Undo
                </button>
              )}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
