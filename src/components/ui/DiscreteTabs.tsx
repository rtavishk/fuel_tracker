import { useEffect, useState, type FC, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  icon: ReactNode;
  label: string;
  activeColor: string;
  badge?: number | string;
}

export interface DiscreteTabsProps {
  tabs: TabItem[];
  onTabChange?: (tabId: string) => void;
  defaultTab?: string;
  activeTab?: string;
  className?: string;
}

export const DiscreteTabs: FC<DiscreteTabsProps> = ({
  tabs,
  onTabChange,
  defaultTab,
  activeTab: controlledActiveTab,
  className,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(
    controlledActiveTab || defaultTab || tabs[0]?.id
  );
  const [shine, setShine] = useState<boolean>(false);

  const currentTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    if (onTabChange) onTabChange(tabId);
  };

  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setInternalActiveTab(controlledActiveTab);
    }
  }, [controlledActiveTab]);

  useEffect(() => {
    setShine(false);
    const timer = setTimeout(() => setShine(true), 400);
    return () => {
      clearTimeout(timer);
      setShine(false);
    };
  }, [currentTab]);

  return (
    <motion.div
      layout
      className={cn(
        'mx-auto flex w-fit items-center justify-center gap-1.5 sm:gap-2 overflow-hidden rounded-full p-1.5 bg-white/85 dark:bg-[#18181b]/85 backdrop-blur-xl border border-black/10 dark:border-white/15 shadow-2xl shadow-black/15 dark:shadow-black/60',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === currentTab;

        return (
          <button
            key={tab.id}
            id={`floating-tab-${tab.id}`}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabClick(tab.id);
              }
            }}
            className="relative focus:outline-none select-none"
          >
            <motion.div
              layout="position"
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 22,
                mass: 0.9,
              }}
              className="flex h-11 sm:h-12 w-full items-center justify-center"
            >
              <div
                className={cn(
                  'flex h-10 sm:h-11 cursor-pointer items-center justify-center rounded-full px-3 transition-all duration-300',
                  isActive
                    ? 'bg-neutral-100 dark:bg-zinc-800/90 shadow-xs border border-black/5 dark:border-white/10'
                    : 'bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                )}
                tabIndex={0}
              >
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className={cn(
                      'flex items-center justify-center transition-colors duration-300',
                      isActive
                        ? tab.activeColor
                        : 'text-neutral-500 dark:text-neutral-400'
                    )}
                  >
                    {tab.icon}
                  </motion.div>

                  {/* Badge count indicator */}
                  {tab.badge && !isActive && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </div>

                <motion.span
                  animate={{
                    width: isActive ? 'auto' : 0,
                    opacity: isActive ? 1 : 0,
                    marginLeft: isActive ? 6 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 240,
                    damping: 24,
                  }}
                  className={cn(
                    'relative overflow-hidden text-xs sm:text-sm font-bold whitespace-nowrap tracking-tight',
                    isActive ? tab.activeColor : 'text-black dark:text-white'
                  )}
                >
                  {tab.label}

                  {tab.badge && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black inline-block align-middle">
                      {tab.badge}
                    </span>
                  )}

                  <AnimatePresence>
                    {isActive && shine && (
                      <motion.span
                        initial={{ left: '-120%' }}
                        animate={{ left: '120%' }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.6,
                          ease: 'easeInOut',
                        }}
                        className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-white/70 dark:via-white/20 to-transparent pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </motion.span>
              </div>
            </motion.div>
          </button>
        );
      })}
    </motion.div>
  );
};
