import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Fuel,
  Navigation,
  Calculator,
  Settings,
  LogOut,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ActiveTab } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    computedMaintenance,
    logout,
    user,
    setIsProfileModalOpen,
  } = useApp();

  const overdueCount = computedMaintenance.filter(
    (m) => m.status === 'Overdue' || m.status === 'Due Soon'
  ).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'fuel-log',
      label: 'Fuel Log & Stats',
      icon: <Fuel className="w-5 h-5" />,
    },
    {
      id: 'trips',
      label: 'Daily Trip Log',
      icon: <Navigation className="w-5 h-5" />,
    },
    {
      id: 'calculator',
      label: 'Fuel Calculator',
      icon: <Calculator className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/80 bg-[#09090b] shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/80 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 text-black font-black shadow-lg shadow-emerald-500/25">
          <Gauge className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white font-sans">Fuel Pulse</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/15 text-emerald-300 rounded border border-emerald-500/30 uppercase font-mono">
              HUD
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">Telemetry & Mileage HUD</p>
        </div>
      </div>

      {/* Primary Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400/90 font-mono">
          Telemetry & Logs
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-300 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-zinc-900/90 border border-emerald-500/30 rounded-xl shadow-sm shadow-emerald-950/30 -z-10"
                />
              )}
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-emerald-400' : 'text-zinc-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold font-mono rounded-full bg-zinc-900 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Maintenance Alert Callout if any */}
        {overdueCount > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">
                {overdueCount} Service {overdueCount === 1 ? 'Alert' : 'Alerts'}
              </p>
              <p className="text-[11px] text-amber-200/80 mt-0.5 leading-snug">
                Check maintenance in Settings or Dashboard.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Pinned Settings & User Card */}
      <div className="p-3 border-t border-zinc-800/80 space-y-1.5 bg-[#09090b]">
        {/* Settings Tab Button */}
        <button
          id="sidebar-nav-settings"
          onClick={() => setActiveTab('settings')}
          className={`relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'text-emerald-300 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          {activeTab === 'settings' && (
            <motion.div
              layoutId="sidebar-active-indicator"
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              className="absolute inset-0 bg-zinc-900/90 border border-emerald-500/30 rounded-xl shadow-sm -z-10"
            />
          )}
          <div className="flex items-center gap-3">
            <span className={activeTab === 'settings' ? 'text-emerald-400' : 'text-zinc-400'}>
              <Settings className="w-5 h-5" />
            </span>
            <span>Settings & Garage</span>
          </div>
          {overdueCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        {/* User Mini Profile */}
        {user && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#121215] border border-zinc-800 text-xs text-zinc-300">
            <button
              type="button"
              id="sidebar-profile-btn"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 truncate text-left hover:opacity-90 transition-opacity cursor-pointer flex-1 min-w-0"
              title="Driver Profile & Settings (Change Password & Avatar)"
            >
              <UserAvatar
                user={user}
                size="sm"
                showStatus={true}
                isOnline={true}
              />
              <div className="truncate">
                <p className="font-semibold text-zinc-200 truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-emerald-400 font-mono truncate leading-tight">
                  {user.driverTier || 'Driver'} • Settings
                </p>
              </div>
            </button>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
