import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface AnimatedTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  pillLayoutId?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
  pillLayoutId = 'animated-tab-pill',
  size = 'md',
}: AnimatedTabsProps<T>) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center gap-1 p-1 bg-[#121215] border border-zinc-800 rounded-xl backdrop-blur-md',
          className
        )
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            onClick={() => onChange(tab.id)}
            type="button"
            className={twMerge(
              clsx(
                'relative flex items-center justify-center gap-2 font-medium transition-colors whitespace-nowrap rounded-lg cursor-pointer focus:outline-none z-10',
                sizeClasses[size],
                isActive
                  ? 'text-emerald-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              )
            )}
          >
            {isActive && (
              <motion.div
                layoutId={pillLayoutId}
                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                className="absolute inset-0 bg-zinc-900 border border-emerald-500/30 rounded-lg shadow-sm -z-10"
              />
            )}
            {tab.icon && (
              <span className={isActive ? 'text-emerald-400' : 'text-zinc-500'}>
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 text-[10px] font-semibold font-mono rounded-full tracking-wider',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
