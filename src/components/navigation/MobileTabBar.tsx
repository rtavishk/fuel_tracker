import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Fuel, Navigation, Calculator, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { ActiveTab } from '../../types';

export const MobileTabBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    fuelStats,
    computedMaintenance,
  } = useApp();

  const overdueCount = computedMaintenance.filter((m) => m.status === 'Overdue').length;
  const pendingFuelCount = fuelStats.pendingCount;

  const tabs: {
    id: ActiveTab;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
    badge?: number;
    badgeVariant?: 'emerald' | 'rose' | 'amber';
  }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: (isActive) => <LayoutDashboard className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5] text-emerald-400' : 'text-zinc-400'}`} />,
    },
    {
      id: 'fuel-log',
      label: 'Fuel Log',
      icon: (isActive) => <Fuel className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5] text-emerald-400' : 'text-zinc-400'}`} />,
      badge: pendingFuelCount > 0 ? pendingFuelCount : undefined,
      badgeVariant: 'amber',
    },
    {
      id: 'trips',
      label: 'Trips',
      icon: (isActive) => <Navigation className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5] text-emerald-400' : 'text-zinc-400'}`} />,
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: (isActive) => <Calculator className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5] text-emerald-400' : 'text-zinc-400'}`} />,
    },
    {
      id: 'settings',
      label: 'Garage',
      icon: (isActive) => <Settings className={`w-4.5 h-4.5 ${isActive ? 'stroke-[2.5] text-emerald-400' : 'text-zinc-400'}`} />,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeVariant: 'rose',
    },
  ];

  return (
    <div className="md:hidden fixed bottom-3 inset-x-0 z-40 px-3 pointer-events-none flex justify-center pb-[env(safe-area-inset-bottom)]">
      {/* Floating Island Navigation Dock */}
      <nav className="pointer-events-auto w-full max-w-sm bg-[#121215]/95 backdrop-blur-2xl border border-zinc-800 shadow-2xl shadow-black/80 rounded-2xl p-1.5 ring-1 ring-white/5">
        <div className="grid grid-cols-5 items-center justify-items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center w-full min-h-[46px] py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                  isActive ? 'text-emerald-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-tab-island-active"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 bg-emerald-500/15 rounded-xl border border-emerald-400/30 -z-10 shadow-sm shadow-emerald-500/20"
                  />
                )}
                <div className="relative flex items-center justify-center">
                  {tab.icon(isActive)}
                  
                  {/* Notification Badge */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-bold font-mono flex items-center justify-center text-white ${
                        tab.badgeVariant === 'rose'
                          ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                          : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}

                  {/* Active Indicator Dot */}
                  {isActive && (!tab.badge || tab.badge === 0) && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-full font-medium">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
