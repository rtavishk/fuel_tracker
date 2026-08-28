import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  id,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id={id || 'modal-overlay'}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          />

          {/* Modal Content Box (Mobile Bottom Sheet / Desktop Centered Card) */}
          <motion.div
            initial={{ opacity: 0, y: '100%', scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '100%', scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`relative w-full ${maxWidthClasses[maxWidth]} bg-[#121215] border-t sm:border border-[#27272a] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 text-zinc-100 sm:my-auto max-h-[90vh] flex flex-col`}
          >
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center bg-[#151518]">
              <div className="w-12 h-1.5 rounded-full bg-zinc-700/80" />
            </div>

            {/* Sticky Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#27272a] bg-[#151518] shrink-0">
              <div className="pr-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">{title}</h3>
                {subtitle && (
                  <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center -mr-1.5 -mt-1 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 active:bg-zinc-700 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body with Momentum Scrolling */}
            <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain flex-1 touch-pan-y">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
