import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AddVehicleModal } from '../garage/AddVehicleModal';
import { UserAvatar } from '../common/UserAvatar';
import {
  Settings as SettingsIcon,
  Car,
  Fuel,
  Cloud,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  Download,
  ShieldCheck,
  RefreshCw,
  Info,
  DollarSign,
  TrendingUp,
  User,
  Key,
  Shield,
  Layers,
  Flame,
  Zap,
  Gauge,
  LogOut,
  RotateCcw,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    vehicles,
    activeVehicleId,
    vehicleConfig,
    switchVehicle,
    updateVehicleConfig,
    deleteVehicle,
    currentFuelPrice,
    fuelPriceHistory,
    updateFuelPrice,
    setIsFuelPriceModalOpen,
    setIsProfileModalOpen,
    iCloudSyncEnabled,
    setICloudSyncEnabled,
    isSyncing,
    lastSyncedAt,
    triggerManualSync,
    clearVehicleData,
    resetToDemoData,
    user,
    fuelEntries,
    tripEntries,
    preTripEntries,
  } = useApp();

  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Active Vehicle Form states
  const [name, setName] = useState(vehicleConfig.name);
  const [make, setMake] = useState(vehicleConfig.make);
  const [model, setModel] = useState(vehicleConfig.model);
  const [year, setYear] = useState(vehicleConfig.year.toString());
  const [licensePlate, setLicensePlate] = useState(vehicleConfig.licensePlate || '');
  const [tankCapacity, setTankCapacity] = useState(vehicleConfig.tankCapacityLitres.toString());
  const [fullRangeBenchmark, setFullRangeBenchmark] = useState(
    vehicleConfig.fullRangeBenchmarkKm.toString()
  );
  const [cumulativeOdo, setCumulativeOdo] = useState(
    vehicleConfig.currentCumulativeOdometer.toString()
  );
  const [currency, setCurrency] = useState(vehicleConfig.currency);
  const [distanceUnit, setDistanceUnit] = useState(vehicleConfig.distanceUnit);
  const [volumeUnit, setVolumeUnit] = useState(vehicleConfig.volumeUnit);
  const [fuelType, setFuelType] = useState(vehicleConfig.fuelType);
  const [targetEfficiency, setTargetEfficiency] = useState(
    vehicleConfig.targetEfficiency?.toString() || '14.5'
  );
  const [odometerType, setOdometerType] = useState<'cumulative' | 'fuelRange'>(
    vehicleConfig.odometerType || 'cumulative'
  );

  // Synchronize local form when active vehicle changes
  useEffect(() => {
    setName(vehicleConfig.name);
    setMake(vehicleConfig.make);
    setModel(vehicleConfig.model);
    setYear(vehicleConfig.year.toString());
    setLicensePlate(vehicleConfig.licensePlate || '');
    setTankCapacity(vehicleConfig.tankCapacityLitres.toString());
    setFullRangeBenchmark(vehicleConfig.fullRangeBenchmarkKm.toString());
    setCumulativeOdo(vehicleConfig.currentCumulativeOdometer.toString());
    setCurrency(vehicleConfig.currency);
    setDistanceUnit(vehicleConfig.distanceUnit);
    setVolumeUnit(vehicleConfig.volumeUnit);
    setFuelType(vehicleConfig.fuelType);
    setTargetEfficiency(vehicleConfig.targetEfficiency?.toString() || '14.5');
    setOdometerType(vehicleConfig.odometerType || 'cumulative');
  }, [vehicleConfig, activeVehicleId]);

  const handleSaveVehicleConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateVehicleConfig({
      name,
      make,
      model,
      year: parseInt(year, 10) || 2024,
      licensePlate,
      tankCapacityLitres: parseFloat(tankCapacity) || 47,
      fullRangeBenchmarkKm: parseFloat(fullRangeBenchmark) || 680,
      currentCumulativeOdometer: parseFloat(cumulativeOdo) || 42850,
      currency,
      distanceUnit,
      volumeUnit,
      fuelType: fuelType as any,
      targetEfficiency: parseFloat(targetEfficiency) || 14.5,
      odometerType,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      user,
      vehicles,
      activeVehicleConfig: vehicleConfig,
      fuelPriceHistory,
      currentFuelPrice,
      fuelEntries,
      tripEntries,
      preTripEntries,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
              Vehicle & System Settings
            </h2>
            <Badge variant="orange" size="sm">
              Multi-Car Engine Active
            </Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your garage vehicles, monthly fuel price revisions, target efficiency calibrations, and engine schedules.
          </p>
        </div>

        {saveToast && (
          <div className="p-2.5 px-4 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-orange-400" />
            <span>Settings saved and synced!</span>
          </div>
        )}
      </div>

      {/* 1. Driver Profile & Avatar Hub Card */}
      <Card className="p-5 sm:p-6 border-cyan-500/25 bg-[#0a0f1d] shadow-xl shadow-cyan-950/20" glow="cyan">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-3.5">
            <UserAvatar
              user={user}
              size="lg"
              showStatus={true}
              isOnline={true}
              onClick={() => setIsProfileModalOpen(true)}
              className="cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {user?.name || 'Driver Profile'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {user?.driverTier || 'Pro'} Pilot
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1">
                Target Fuel Efficiency:{' '}
                <strong className="text-cyan-400 font-mono">
                  {user?.targetEfficiency || vehicleConfig.targetEfficiency || 14.5}{' '}
                  {vehicleConfig.distanceUnit}/{vehicleConfig.volumeUnit}
                </strong>{' '}
                • Currency:{' '}
                <strong className="text-white font-mono">{user?.preferredCurrency || vehicleConfig.currency}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Avatar & Password</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 2. Monthly Fuel Price Engine Card */}
      <Card className="p-6 border-[#222222] bg-[#0a0a0a] shadow-xl" glow="amber">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Dynamic Monthly Fuel Price</h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[10px] font-mono font-bold text-orange-400">
                  {vehicleConfig.currency} {currentFuelPrice.toFixed(2)} / {vehicleConfig.volumeUnit}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Fuel prices fluctuate monthly. All calculators and pre-trip estimations update automatically with the active rate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFuelPriceModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Update Rate & Price History</span>
            </button>
          </div>
        </div>

        {/* Quick Stepper Bar */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300 font-mono">
            <span className="text-neutral-400">Quick adjust:</span>
            <button
              type="button"
              onClick={() => updateFuelPrice(Math.max(0.1, currentFuelPrice - 1), 'Quick -1.0 adjust')}
              className="px-2.5 py-1 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] rounded-lg text-neutral-300 text-xs font-mono cursor-pointer"
            >
              -1.00
            </button>
            <button
              type="button"
              onClick={() => updateFuelPrice(Math.max(0.1, currentFuelPrice - 0.5), 'Quick -0.5 adjust')}
              className="px-2.5 py-1 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] rounded-lg text-neutral-300 text-xs font-mono cursor-pointer"
            >
              -0.50
            </button>
            <button
              type="button"
              onClick={() => updateFuelPrice(currentFuelPrice + 0.5, 'Quick +0.5 adjust')}
              className="px-2.5 py-1 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] rounded-lg text-neutral-300 text-xs font-mono cursor-pointer"
            >
              +0.50
            </button>
            <button
              type="button"
              onClick={() => updateFuelPrice(currentFuelPrice + 1.0, 'Quick +1.0 adjust')}
              className="px-2.5 py-1 bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] rounded-lg text-neutral-300 text-xs font-mono cursor-pointer"
            >
              +1.00
            </button>
          </div>

          <div className="text-[11px] text-neutral-400">
            {fuelPriceHistory.length} recorded monthly revisions in history.
          </div>
        </div>
      </Card>

      {/* 3. Multi-Vehicle Garage Management Card */}
      <Card className="p-6 border-[#222222] bg-[#0a0a0a] shadow-xl" glow="orange">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Garage & Vehicle Fleet ({vehicles.length} cars)</h3>
              <p className="text-[11px] text-neutral-400">
                Switch active car, add new vehicles, or customize technical specifications.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddCarOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Any Car</span>
          </button>
        </div>

        {/* Vehicles Selection Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {vehicles.map((v) => {
            const isCurrent = v.id === activeVehicleId;
            return (
              <div
                key={v.id}
                onClick={() => switchVehicle(v.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-orange-500/10 border-orange-500 shadow-md shadow-orange-500/10'
                    : 'bg-[#050505] border-[#222222] hover:border-[#333333]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white truncate">
                      {v.name || `${v.make} ${v.model}`}
                    </span>
                    {isCurrent ? (
                      <span className="px-1.5 py-0.5 rounded bg-orange-500 text-black font-extrabold text-[9px] uppercase font-mono">
                        Active
                      </span>
                    ) : (
                      vehicles.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete ${v.make} ${v.model} from garage?`)) {
                              deleteVehicle(v.id);
                            }
                          }}
                          className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    {v.year} • {v.fuelType}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#1f1f1f] flex items-center justify-between text-[10px] font-mono text-neutral-400">
                  <span>Tank: {v.tankCapacityLitres}{v.volumeUnit}</span>
                  <span>Range: ~{v.fullRangeBenchmarkKm}{v.distanceUnit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Vehicle Spec Editor Form */}
        <div className="pt-4 border-t border-[#1f1f1f]">
          <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider mb-3">
            Calibrate Active Vehicle ({vehicleConfig.make} {vehicleConfig.model})
          </h4>

          <form onSubmit={handleSaveVehicleConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Make / Brand</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Honda"
                  required
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Model & Trim</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Civic 1.5T"
                  required
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Model Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2023"
                  required
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Tank Capacity */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Tank Capacity ({volumeUnit})
                </label>
                <input
                  type="number"
                  step="any"
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(e.target.value)}
                  placeholder="47"
                  required
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Full Range Benchmark Override */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Full-Range Gauge Benchmark ({distanceUnit})
                </label>
                <input
                  type="number"
                  value={fullRangeBenchmark}
                  onChange={(e) => setFullRangeBenchmark(e.target.value)}
                  placeholder="680"
                  required
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs font-mono text-orange-400 font-bold focus:outline-none focus:border-orange-500"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Typical remaining-range gauge cluster after a 100% full fill-up
                </span>
              </div>

              {/* Cumulative Odometer Override */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Cumulative Real Odometer ({distanceUnit})
                </label>
                <input
                  type="number"
                  value={cumulativeOdo}
                  onChange={(e) => setCumulativeOdo(e.target.value)}
                  placeholder="42850"
                  required
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-orange-500"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Used for engine maintenance tracking
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="Rs."
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Fuel Type</label>
                <input
                  type="text"
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  placeholder="Petrol (95), Diesel..."
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Distance Unit
                </label>
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="mi">Miles (mi)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Volume Unit</label>
                <select
                  value={volumeUnit}
                  onChange={(e) => setVolumeUnit(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="L">Litres (L)</option>
                  <option value="gal">Gallons (gal)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Odometer Type</label>
                <select
                  value={odometerType}
                  onChange={(e) => setOdometerType(e.target.value as 'cumulative' | 'fuelRange')}
                  className="w-full px-3 py-2 bg-[#050505] border border-[#222222] rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="cumulative">Cumulative Mileage (e.g. 42,500 km)</option>
                  <option value="fuelRange">Fuel Range / Distance-to-Empty (e.g. 650 km)</option>
                </select>
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Choose how your vehicle displays odometer readings
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1f1f1f] flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                Save Vehicle Profile
              </button>
            </div>
          </form>
        </div>
      </Card>

      {/* 4. Cloud & iCloud Realtime Sync Card */}
      <Card className="p-6 border-[#222222] bg-[#0a0a0a] shadow-xl" glow="amber">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">iCloud & Multi-Device Cloud Sync</h3>
              <p className="text-[11px] text-neutral-400">
                Seamless real-time synchronization across iPhone, iPad, and Mac / Web
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={iCloudSyncEnabled}
              onChange={(e) => setICloudSyncEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#1a1a1a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
          </label>
        </div>

        <div className="space-y-3 text-xs text-neutral-300">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#050505] border border-[#222222]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span>
                Status:{' '}
                <strong className="text-white">
                  {iCloudSyncEnabled ? 'Real-Time Sync Active' : 'Offline / Local Only'}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={triggerManualSync}
              className="px-3 py-1 rounded-lg bg-[#1a1a1a] hover:bg-[#222222] text-xs font-semibold text-orange-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Telemetry logs and rate history are saved locally and synced seamlessly. Last synced at:{' '}
            <span className="font-mono text-neutral-200">
              {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Just now'}
            </span>
            .
          </p>
        </div>
      </Card>

      {/* 6. Data Management, Clean Slate & Backup */}
      <Card className="p-6 border-[#222222] bg-[#0a0a0a]">
        <h3 className="text-sm font-bold text-white mb-2">Data Management & Garage Actions</h3>
        <p className="text-xs text-neutral-400 mb-4">
          Export your complete database, clear logs to start fresh for a new car, or restore default demo data.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] hover:bg-[#222222] text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Backup (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Clear all fuel & trip logs for ${vehicleConfig.make} ${vehicleConfig.model} to start with a completely fresh slate?`)) {
                clearVehicleData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Logs for Fresh Start</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset garage & all vehicle logs to default multi-car demo data?')) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Demo Garage</span>
          </button>
        </div>
      </Card>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddCarOpen}
        onClose={() => setIsAddCarOpen(false)}
      />
    </div>
  );
};
