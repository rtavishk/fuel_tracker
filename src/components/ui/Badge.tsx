import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'teal' | 'lime' | 'amber' | 'orange' | 'rose' | 'cyan' | 'slate' | 'indigo';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  dot = false,
  className,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono',
    teal: 'bg-teal-500/10 text-teal-300 border-teal-500/30 font-mono',
    lime: 'bg-lime-500/10 text-lime-400 border-lime-500/30 font-mono',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
    slate: 'bg-zinc-900/90 text-zinc-300 border-zinc-800',
  };

  const dotColors = {
    emerald: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
    teal: 'bg-teal-400 shadow-[0_0_6px_#2dd4bf]',
    lime: 'bg-lime-400 shadow-[0_0_6px_#a3e635]',
    orange: 'bg-orange-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    cyan: 'bg-cyan-400',
    indigo: 'bg-indigo-400',
    slate: 'bg-zinc-400',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-2 py-0.5 font-medium',
    sm: 'text-xs px-2.5 py-1 font-semibold',
    md: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full border tracking-wide whitespace-nowrap',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])} />}
      {children}
    </span>
  );
};
