import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'emerald' | 'teal' | 'lime' | 'amber' | 'cyan' | 'rose' | 'indigo' | 'orange';
  hoverEffect?: boolean;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = 'none',
  hoverEffect = false,
  id,
  ...props
}) => {
  const glowStyles = {
    none: '',
    emerald: 'border-emerald-500/35 shadow-[0_0_25px_-6px_rgba(16,185,129,0.18)]',
    teal: 'border-teal-500/35 shadow-[0_0_25px_-6px_rgba(20,184,166,0.18)]',
    lime: 'border-lime-500/35 shadow-[0_0_25px_-6px_rgba(132,204,22,0.18)]',
    amber: 'border-amber-500/35 shadow-[0_0_25px_-6px_rgba(245,158,11,0.18)]',
    orange: 'border-orange-500/35 shadow-[0_0_25px_-6px_rgba(249,115,22,0.2)]',
    cyan: 'border-cyan-500/35 shadow-[0_0_25px_-6px_rgba(6,182,212,0.18)]',
    rose: 'border-rose-500/35 shadow-[0_0_25px_-6px_rgba(244,63,94,0.18)]',
    indigo: 'border-indigo-500/35 shadow-[0_0_25px_-6px_rgba(99,102,241,0.18)]',
  };

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={hoverEffect ? { y: -2, transition: { duration: 0.15 } } : undefined}
      className={twMerge(
        clsx(
          'relative rounded-2xl border border-zinc-800 bg-[#121215]/90 backdrop-blur-xl p-5 shadow-xl text-zinc-100 overflow-hidden',
          glowStyles[glow],
          className
        )
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};
