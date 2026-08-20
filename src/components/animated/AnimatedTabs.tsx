import React from 'react';
import { motion } from 'motion/react';

export interface TabOption<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface AnimatedTabsProps<T extends string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  layoutId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  tabClassName?: string;
  activePillClassName?: string;
}

export function AnimatedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  layoutId = 'animated-tab-pill',
  size = 'md',
  className = '',
  tabClassName = '',
  activePillClassName = '',
}: AnimatedTabsProps<T>) {
  const sizeClasses = {
    sm: 'p-0.5 text-xs rounded-xl',
    md: 'p-1 text-xs sm:text-sm rounded-xl',
    lg: 'p-1.5 text-sm sm:text-base rounded-2xl',
  }[size];

  const itemSizeClasses = {
    sm: 'px-2.5 py-1 rounded-[10px]',
    md: 'px-3.5 py-1.5 rounded-lg',
    lg: 'px-4 py-2 rounded-xl',
  }[size];

  return (
    <div
      className={`inline-flex items-center bg-black/[0.06] dark:bg-white/[0.12] p-1 rounded-xl shadow-inner ${sizeClasses} ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center justify-center gap-1.5 font-semibold transition-colors duration-150 z-10 select-none whitespace-nowrap cursor-pointer ${itemSizeClasses} ${
              isActive
                ? 'text-slate-950 dark:text-white font-bold'
                : 'text-slate-500 dark:text-[#8e8e93] hover:text-slate-900 dark:hover:text-white'
            } ${tabClassName}`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={`absolute inset-0 bg-white dark:bg-[#636366]/90 shadow-sm shadow-black/10 rounded-[inherit] -z-10 ${activePillClassName}`}
                transition={{
                  type: 'spring',
                  stiffness: 480,
                  damping: 34,
                }}
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-black/10 dark:bg-white/15 text-slate-600 dark:text-slate-300'
                }`}
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

