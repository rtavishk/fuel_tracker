import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Fuel,
  Cloud,
  RefreshCw,
  ChevronDown,
  Plus,
  Car,
} from 'lucide-react';
import { AddVehicleModal } from '../garage/AddVehicleModal';
import { UserAvatar } from '../common/UserAvatar';

export const Header: React.FC = () => {
  const {
    vehicles,
    activeVehicleId,
    vehicleConfig,
    switchVehicle,
    currentFuelPrice,
    activeTab,
    iCloudSyncEnabled,
    isSyncing,
    lastSyncedAt,
    triggerManualSync,
    user,
    setIsProfileModalOpen,
    setIsFuelPriceModalOpen,
  } = useApp();

  const [isVehicleMenuOpen, setIsVehicleMenuOpen] = useState(false);
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsVehicleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Telemetry Dashboard';
      case 'fuel-log':
        return 'Fuel Log & Stats';
      case 'trips':
        return 'Daily Trip Log';
      case 'calculator':
        return 'Predictive Fuel Calculator';
      case 'settings':
        return 'Vehicle & System Settings';
      default:
        return 'Fuel Tracker';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80 max-w-full overflow-x-hidden">
        {/* Left: Module title & active vehicle switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20 shrink-0">
            <Fuel className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight font-sans truncate">
                {getTitle()}
              </h1>

              {/* Dynamic Vehicle Switcher Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsVehicleMenuOpen(!isVehicleMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121215] border border-zinc-800 hover:border-emerald-500/40 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm shadow-black/40"
                >
                  <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="max-w-[100px] sm:max-w-[180px] truncate">
                    {vehicleConfig.year} {vehicleConfig.make} {vehicleConfig.model}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isVehicleMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isVehicleMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-[#121215] border border-zinc-800 shadow-2xl p-1.5 z-50 space-y-1 backdrop-blur-2xl">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 font-mono">
                      Garage Vehicles
                    </div>

                    {vehicles.map((v) => {
                      const isCurrent = v.id === activeVehicleId;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            switchVehicle(v.id);
                            setIsVehicleMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30'
                              : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                          }`}
                        >
                          <div className="truncate">
                            <p className="truncate font-semibold">{v.name || `${v.make} ${v.model}`}</p>
                            <p className="text-[10px] text-zinc-400 font-mono">
                              {v.fuelType} • ~{v.fullRangeBenchmarkKm} {v.distanceUnit} range
                            </p>
                          </div>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ml-2 shadow-[0_0_8px_#34d399]" />
                          )}
                        </button>
                      );
                    })}

                    <div className="pt-1 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsVehicleMenuOpen(false);
                          setIsAddCarOpen(true);
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Vehicle to Garage</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10.5px] text-zinc-400 font-mono hidden md:block">
              Tank: {vehicleConfig.tankCapacityLitres}{vehicleConfig.volumeUnit} • Range: ~
              {vehicleConfig.fullRangeBenchmarkKm} {vehicleConfig.distanceUnit} • Target:{' '}
              {vehicleConfig.targetEfficiency || 14.5} {vehicleConfig.distanceUnit}/{vehicleConfig.volumeUnit}
            </p>
          </div>
        </div>

        {/* Right: Dynamic Fuel Price, Cloud Sync & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Fuel Price Pill */}
          <button
            type="button"
            onClick={() => setIsFuelPriceModalOpen(true)}
            title="Click to update monthly fuel rate"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#121215] border border-zinc-800 hover:border-emerald-500/40 text-xs font-mono font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer shadow-sm shadow-black/40"
          >
            <Fuel className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] sm:text-xs">
              {vehicleConfig.currency} {currentFuelPrice.toFixed(2)}
              <span className="text-[10px] text-zinc-400 font-normal">/{vehicleConfig.volumeUnit}</span>
            </span>
          </button>

          {/* iCloud / Postgres Sync Status Pill */}
          <button
            type="button"
            onClick={triggerManualSync}
            title={
              iCloudSyncEnabled
                ? `Database Synced ${lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Just now'}`
                : 'Sync Paused'
            }
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121215] border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
          >
            <Cloud
              className={`w-3.5 h-3.5 ${
                iCloudSyncEnabled ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            />
            <span className="hidden lg:inline font-mono text-[11px]">
              {isSyncing ? 'Syncing...' : iCloudSyncEnabled ? 'Postgres' : 'Local'}
            </span>
            <RefreshCw
              className={`w-3 h-3 text-zinc-400 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`}
            />
          </button>

          {/* User Profile Avatar Trigger */}
          {user && (
            <button
              type="button"
              id="header-profile-btn"
              onClick={() => setIsProfileModalOpen(true)}
              title="Driver Profile & Settings (Change Password & Avatar)"
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-[#121215] border border-zinc-800 hover:border-emerald-500/40 hover:bg-emerald-500/10 text-zinc-200 transition-all cursor-pointer shadow-sm shadow-black/40"
            >
              <UserAvatar
                user={user}
                size="sm"
                showStatus={true}
                isOnline={true}
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-white max-w-[110px] truncate leading-tight">
                  {user.name}
                </span>
                <span className="text-[9.5px] font-mono text-emerald-400 leading-tight">
                  {user.driverTier || 'Driver'}
                </span>
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Add Vehicle Modal */}
      <AddVehicleModal isOpen={isAddCarOpen} onClose={() => setIsAddCarOpen(false)} />
    </>
  );
};
