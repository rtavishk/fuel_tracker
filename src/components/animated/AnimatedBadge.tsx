import React from 'react';
import { motion } from 'motion/react';

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'purple' | 'red' | 'neutral';
  pulseDot?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  variant = 'blue',
  pulseDot = false,
  className = '',
  icon,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-400/30 backdrop-blur-md shadow-xs shadow-emerald-500/10',
    blue: 'bg-sky-500/15 dark:bg-sky-400/20 text-sky-700 dark:text-sky-300 border-sky-500/30 dark:border-sky-400/30 backdrop-blur-md shadow-xs shadow-sky-500/10',
    amber: 'bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/30 backdrop-blur-md shadow-xs shadow-amber-500/10',
    purple: 'bg-violet-500/15 dark:bg-violet-400/20 text-violet-700 dark:text-violet-300 border-violet-500/30 dark:border-violet-400/30 backdrop-blur-md shadow-xs shadow-violet-500/10',
    red: 'bg-rose-500/15 dark:bg-rose-400/20 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-400/30 backdrop-blur-md shadow-xs shadow-rose-500/10',
    neutral: 'bg-slate-500/15 dark:bg-slate-400/15 text-slate-700 dark:text-slate-300 border-slate-400/30 dark:border-white/15 backdrop-blur-md',
  }[variant];

  const dotStyles = {
    emerald: 'bg-emerald-500 dark:bg-emerald-400',
    blue: 'bg-sky-500 dark:bg-sky-400',
    amber: 'bg-amber-500 dark:bg-amber-400',
    purple: 'bg-violet-500 dark:bg-violet-400',
    red: 'bg-rose-500 dark:bg-rose-400',
    neutral: 'bg-slate-400',
  }[variant];

  return (
    <motion.span
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${variantStyles} ${className}`}
    >
      {pulseDot && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles}`}
          />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles}`} />
        </span>
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.span>
  );
};
