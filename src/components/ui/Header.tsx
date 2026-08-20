import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Settings, Plus, Zap, Moon, Sun, User, Sparkles } from 'lucide-react';
import { AnimatedBadge } from '../animated/AnimatedBadge';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  onQuickAction?: () => void;
  quickActionLabel?: string;
  quickActionIcon?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  badge,
  onQuickAction,
  quickActionLabel = 'Add Entry',
  quickActionIcon,
}) => {
  const { config, setActiveTab, activeTab, isDarkMode, setTheme, theme, setActiveModal, isAuthenticated } = useApp();

  return (
    <header className="w-full pt-4 sm:pt-6 pb-3 px-4 sm:px-8 shrink-0 max-w-7xl mx-auto">
      {/* Top Utility / Identity Bar */}
      <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-3">
        {/* Liquid Glass Category / Vehicle Tag */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-neutral-900 dark:text-white text-[11px] font-bold tracking-tight">
            <Zap className="w-3 h-3 fill-current" />
            <span>{config.name}</span>
            <span className="opacity-40">·</span>
            <span className="font-semibold uppercase text-[10px]">{config.powertrain || 'HEV'}</span>
          </div>

          {badge && (
            <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 text-[10px] font-semibold border border-black/5 dark:border-white/5">
              {badge}
            </span>
          )}
        </div>

        {/* Right utility buttons: Driver Avatar & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Driver Auth / Profile Circle/Pill Button */}
          <motion.button
            type="button"
            id="header-driver-profile-btn"
            onClick={() => setActiveModal(isAuthenticated ? 'driver-profile' : 'auth')}
            whileTap={{ scale: 0.94 }}
            className="flex items-center gap-2 p-1 sm:px-3 sm:py-1 rounded-full bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-black/[0.08] dark:border-white/[0.12] text-neutral-900 dark:text-white text-xs font-semibold shadow-xs transition-all cursor-pointer backdrop-blur-xl"
            title={isAuthenticated ? 'View Driver Profile & Stats' : 'Open Driver Portal'}
          >
            <div className="w-7 h-7 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center text-xs font-black shadow-xs shrink-0">
              {config.userName ? config.userName.charAt(0).toUpperCase() : (config.userEmail ? config.userEmail.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />)}
            </div>
            <span className="hidden sm:inline-block truncate max-w-[120px] font-bold">
              {config.userName || (config.userEmail ? config.userEmail.split('@')[0] : 'Profile')}
            </span>
            {isAuthenticated && (
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white ring-2 ring-white dark:ring-black" />
            )}
          </motion.button>

          {/* Mobile Quick Action */}
          <div className="flex sm:hidden items-center">
            {onQuickAction && (
              <motion.button
                type="button"
                id="mobile-header-quick-action-btn"
                onClick={onQuickAction}
                whileTap={{ scale: 0.92 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold shadow-sm transition-all cursor-pointer border border-white/10 dark:border-black/10"
              >
                {quickActionIcon || <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                <span>{quickActionLabel}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Main Page Title Header - iOS 26 Large Title */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-3"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {onQuickAction && (
          <motion.button
            type="button"
            id="desktop-header-action-btn"
            onClick={onQuickAction}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold shadow-md transition-all cursor-pointer shrink-0 border border-white/10 dark:border-black/10"
          >
            {quickActionIcon || <Plus className="w-4 h-4 stroke-[2.5]" />}
            <span>{quickActionLabel}</span>
          </motion.button>
        )}
      </motion.div>
    </header>
  );
};


