import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Header } from '../ui/Header';
import {
  Car,
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  RefreshCw,
  Info,
  FileSpreadsheet,
  User,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  Database,
  Cloud,
  CloudOff,
  CheckCircle2,
  AlertCircle,
  Server,
  ArrowUpRight,
} from 'lucide-react';
import { AnimatedCard } from '../animated/AnimatedCard';

export const SettingsView: React.FC = () => {
  const {
    config,
    updateConfig,
    rawFuelEntries,
    resetToDefaults,
    exportDataJSON,
    importDataJSON,
    showToast,
    setActiveModal,
    logout,
    isAuthenticated,
    dbStatus,
    isSyncing,
    syncWithDatabase,
    pullFromDatabase,
    checkDatabaseStatus,
  } = useApp();

  const [name, setName] = useState(config.name);
  const [make, setMake] = useState(config.make || 'Toyota / Universal');
  const [model, setModel] = useState(config.model || 'Dual-Motor Hybrid (HEV)');
  const [powertrain, setPowertrain] = useState(config.powertrain || 'HEV');
  const [tankCapacity, setTankCapacity] = useState(config.tankCapacityLitres.toString());
  const [fullBenchmark, setFullBenchmark] = useState(
    config.fullRangeBenchmarkKm ? config.fullRangeBenchmarkKm.toString() : ''
  );
  const [currency, setCurrency] = useState(config.currency);
  const [distanceUnit, setDistanceUnit] = useState(config.distanceUnit || 'km');
  const [volumeUnit, setVolumeUnit] = useState(config.volumeUnit || 'L');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset list for quick 1-click configuration of any vehicle
  const vehiclePresets = [
    {
      name: 'Toyota RAV4 / Prius Hybrid',
      make: 'Toyota',
      model: '2.5L Dynamic Force THS-II (HEV)',
      powertrain: 'HEV',
      tank: 55,
      benchmark: 900,
    },
    {
      name: 'Honda CR-V / Accord e:HEV',
      make: 'Honda',
      model: '2.0L i-MMD Dual Motor e:HEV',
      powertrain: 'HEV',
      tank: 53,
      benchmark: 850,
    },
    {
      name: 'BYD Song Plus / Seal DM-i',
      make: 'BYD',
      model: 'DM-i Super Hybrid (PHEV)',
      powertrain: 'PHEV',
      tank: 60,
      benchmark: 1100,
    },
    {
      name: 'Hyundai Tucson / Santa Fe Hybrid',
      make: 'Hyundai',
      model: '1.6T Smartstream TMED Hybrid',
      powertrain: 'HEV',
      tank: 52,
      benchmark: 820,
    },
    {
      name: 'BAIC BJ30e DHT Hybrid',
      make: 'BAIC',
      model: 'Magic Core 1.5T DHT Dual-Motor (4WD)',
      powertrain: 'HEV',
      tank: 52,
      benchmark: 680,
    },
    {
      name: 'Ford Maverick / Escape Hybrid',
      make: 'Ford',
      model: '2.5L Atkinson PowerSplit (HEV)',
      powertrain: 'HEV',
      tank: 52,
      benchmark: 800,
    },
    {
      name: 'Lexus NX 350h / RX 500h',
      make: 'Lexus',
      model: 'Lexus Self-Charging Hybrid Drive',
      powertrain: 'HEV',
      tank: 55,
      benchmark: 920,
    },
    {
      name: 'Kia Niro Hybrid / PHEV',
      make: 'Kia',
      model: '1.6L GDI Dual-Clutch Hybrid',
      powertrain: 'HEV',
      tank: 42,
      benchmark: 840,
    },
  ];

  const applyPreset = (preset: typeof vehiclePresets[0]) => {
    setName(preset.name);
    setMake(preset.make);
    setModel(preset.model);
    setPowertrain(preset.powertrain);
    setTankCapacity(preset.tank.toString());
    setFullBenchmark(preset.benchmark.toString());

    updateConfig({
      name: preset.name,
      make: preset.make,
      model: preset.model,
      powertrain: preset.powertrain,
      tankCapacityLitres: preset.tank,
      fullRangeBenchmarkKm: preset.benchmark,
    });

    showToast({
      title: 'Vehicle Profile Applied',
      description: `Configured specs for ${preset.name}`,
      type: 'success',
    });
  };

  const handleSaveVehicleConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTank = parseFloat(tankCapacity) || 50;
    const parsedBench = fullBenchmark ? parseFloat(fullBenchmark) : null;

    updateConfig({
      name: name.trim() || 'My Hybrid Vehicle',
      make: make.trim() || 'Universal',
      model: model.trim() || 'Dual-Motor Hybrid',
      powertrain,
      tankCapacityLitres: parsedTank,
      fullRangeBenchmarkKm: parsedBench,
      currency: currency.trim() || 'Rs',
      distanceUnit,
      volumeUnit,
    });
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hybrid_telemetry_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ title: 'Backup JSON downloaded', type: 'success' });
  };

  const handleDownloadCSV = () => {
    // Generate CSV for fuel entries
    const headers = ['Date', 'Amount Paid', 'Price / Litre', 'Litres Fueled', 'Initial Range Gauge', 'After Fueling Range Gauge', 'Station', 'Notes'];
    const rows = rawFuelEntries.map((e) => [
      e.date,
      e.amountPaid,
      e.pricePerLitre,
      e.litresFueled,
      e.currentOdometer,
      e.afterFuelingOdometer || '',
      `"${(e.gasStation || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hybrid_telemetry_fuel_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ title: 'CSV fuel log exported', type: 'success' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataJSON(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full pb-24 sm:pb-12 safe-pb">
      <Header
        title="Settings & Vehicle Profile"
        subtitle="Manage tank specs, currency preference, themes, and data backups"
      />

      <div className="px-4 sm:px-8 space-y-6 max-w-4xl mx-auto">
        {/* Driver Account & Telemetry Cloud Card */}
        <AnimatedCard delay={0.03} className="p-5 sm:p-6 rounded-3xl liquid-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-md shrink-0 border border-black/5 dark:border-white/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Driver Profile & Telemetry
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold border border-slate-400/20 uppercase tracking-wide">
                    Telemetry Mode
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {config.userEmail
                    ? `Authenticated as ${config.userEmail}`
                    : 'Currently operating in Local / Offline Driver Profile'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <motion.button
                type="button"
                id="settings-open-profile-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveModal('driver-profile')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-md shadow-slate-950/10 dark:shadow-white/10 border border-slate-700/50 dark:border-white/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>View Driver Profile</span>
              </motion.button>

              <motion.button
                type="button"
                id="settings-signout-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={logout}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl liquid-glass hover:bg-red-500/10 hover:border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold border border-slate-300/50 dark:border-white/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </motion.button>
            </div>
          </div>
        </AnimatedCard>

        {/* Vehicle Configuration Card */}
        <AnimatedCard delay={0.05} className="p-5 sm:p-6 rounded-3xl liquid-card space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-400/25">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Vehicle Specifications & Powertrain
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calibrate telemetry benchmarks, fuel tank volume, and powertrain for any vehicle
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-extrabold border border-sky-400/20 uppercase">
              {config.powertrain || 'HEV'}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quick Load Vehicle Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {vehiclePresets.map((preset) => (
                <motion.button
                  key={preset.name}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => applyPreset(preset)}
                  className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    name === preset.name
                      ? 'bg-sky-500/15 border-sky-500/50 text-sky-600 dark:text-sky-300 font-bold'
                      : 'liquid-glass border-slate-300/40 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-400/50'
                  }`}
                >
                  <p className="text-xs font-bold truncate">{preset.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">{preset.powertrain} · {preset.tank}L</p>
                </motion.button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveVehicleConfig} className="space-y-4 pt-2 border-t border-slate-200/50 dark:border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Vehicle Name / Nickname
                </label>
                <input
                  type="text"
                  id="settings-vehicle-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My RAV4 Hybrid"
                  className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Make / Manufacturer
                </label>
                <input
                  type="text"
                  id="settings-vehicle-make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Toyota / Honda / BYD / BAIC"
                  className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Powertrain Architecture
                </label>
                <select
                  id="settings-vehicle-powertrain"
                  value={powertrain}
                  onChange={(e) => setPowertrain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="HEV">HEV (Self-Charging Full Hybrid)</option>
                  <option value="PHEV">PHEV (Plug-in Hybrid EV)</option>
                  <option value="MHEV">MHEV (Mild Hybrid 48V)</option>
                  <option value="EREV">EREV (Extended Range EV)</option>
                  <option value="BEV">BEV (Battery Electric)</option>
                  <option value="ICE">ICE (Petrol / Diesel Engine)</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Engine & Transmission Model
                </label>
                <input
                  type="text"
                  id="settings-vehicle-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. 2.5L Dynamic Force THS-II / 1.5T DHT Hybrid"
                  className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Fuel Tank Capacity ({volumeUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="settings-tank-capacity"
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Usable fuel reservoir capacity for DTE calibration
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Full Tank Range Benchmark ({distanceUnit})
                </label>
                <input
                  type="number"
                  id="settings-full-benchmark"
                  placeholder="Auto (derived from logs)"
                  value={fullBenchmark}
                  onChange={(e) => setFullBenchmark(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Leave blank to auto-calculate from completed full tanks
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  id="settings-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="Rs, $, €, £, AED"
                  className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Distance Unit
                </label>
                <select
                  id="settings-distance-unit"
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value as 'km' | 'mi')}
                  className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="mi">Miles (mi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Fuel Volume Unit
                </label>
                <select
                  id="settings-volume-unit"
                  value={volumeUnit}
                  onChange={(e) => setVolumeUnit(e.target.value as 'L' | 'gal')}
                  className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="L">Litres (L)</option>
                  <option value="gal">Gallons (gal)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <motion.button
                type="submit"
                id="settings-save-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-500/25 transition-all cursor-pointer border border-sky-400/30"
              >
                Save Vehicle Profile
              </motion.button>
            </div>
          </form>
        </AnimatedCard>

        {/* Appearance Theme Selector */}
        <AnimatedCard delay={0.1} className="p-5 sm:p-6 rounded-3xl liquid-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-400/25">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Appearance & Theme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose light, dark, or follow system appearance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <motion.button
              type="button"
              id="theme-btn-system"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateConfig({ theme: 'system' })}
              className={`p-3.5 rounded-2xl text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                config.theme === 'system'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-sm'
                  : 'liquid-glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-5 h-5" />
              <span className="text-xs">System Auto</span>
            </motion.button>

            <motion.button
              type="button"
              id="theme-btn-light"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateConfig({ theme: 'light' })}
              className={`p-3.5 rounded-2xl text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                config.theme === 'light'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-sm'
                  : 'liquid-glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-5 h-5" />
              <span className="text-xs">Light</span>
            </motion.button>

            <motion.button
              type="button"
              id="theme-btn-dark"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateConfig({ theme: 'dark' })}
              className={`p-3.5 rounded-2xl text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                config.theme === 'dark'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold shadow-sm'
                  : 'liquid-glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-5 h-5" />
              <span className="text-xs">Dark</span>
            </motion.button>
          </div>
        </AnimatedCard>

        {/* Supabase & Prisma Cloud Database Sync Card */}
        <AnimatedCard delay={0.12} className="p-5 sm:p-6 rounded-3xl liquid-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                dbStatus.isConnected
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-400/25'
                  : 'bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-white border-slate-300/40 dark:border-white/15'
              }`}>
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Supabase PostgreSQL & Prisma
                  </h3>
                  {dbStatus.isConnected ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-400/30 uppercase tracking-wide flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-400/30 uppercase tracking-wide flex items-center gap-1">
                      <CloudOff className="w-2.5 h-2.5" />
                      Local Storage (Ready)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prisma ORM keeps the Supabase cloud schema and vehicle telemetry synced
                </p>
              </div>
            </div>

            <motion.button
              type="button"
              id="refresh-db-status-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => checkDatabaseStatus()}
              className="px-3.5 py-1.5 rounded-xl liquid-glass text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 border border-slate-300/50 dark:border-white/15 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Check Status</span>
            </motion.button>
          </div>

          {/* Status & Stats Details */}
          {dbStatus.isConnected && dbStatus.stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl liquid-glass border border-emerald-400/20">
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Fuel Records</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{dbStatus.stats.fuelEntries}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Daily Trips</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{dbStatus.stats.dailyTrips}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Vehicles</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{dbStatus.stats.vehicleConfigs}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Drivers</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{dbStatus.stats.users}</p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl liquid-glass border border-slate-300/40 dark:border-white/10 space-y-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  To persist records to your Supabase PostgreSQL instance, add <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white font-mono text-[11px]">DATABASE_URL</code> to your environment variables or <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white font-mono text-[11px]">.env.local</code>.
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <motion.button
              type="button"
              id="sync-to-supabase-btn"
              disabled={isSyncing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => syncWithDatabase()}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSyncing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
              <span>Sync Local Data to Supabase</span>
            </motion.button>

            <motion.button
              type="button"
              id="pull-from-supabase-btn"
              disabled={isSyncing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => pullFromDatabase()}
              className="p-3.5 rounded-2xl liquid-glass hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-900 dark:text-white text-xs font-bold border border-slate-300/50 dark:border-white/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSyncing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Restore Data from Supabase</span>
            </motion.button>
          </div>
        </AnimatedCard>

        {/* Data Backup & Export / Import */}
        <AnimatedCard delay={0.15} className="p-5 sm:p-6 rounded-3xl liquid-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/25">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Data Management & Portability
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Backup, export to CSV spreadsheet, or import previous records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <motion.button
              type="button"
              id="settings-export-json"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadJSON}
              className="p-4 rounded-2xl liquid-glass hover:border-emerald-500/40 flex items-center gap-3 text-left transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/20">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Download JSON Backup
                </p>
                <p className="text-[11px] text-slate-400">
                  Full dataset including trips & pre-trip checks
                </p>
              </div>
            </motion.button>

            <motion.button
              type="button"
              id="settings-export-csv"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadCSV}
              className="p-4 rounded-2xl liquid-glass hover:border-sky-500/40 flex items-center gap-3 text-left transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-400/20">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Export Fuel Logs to CSV
                </p>
                <p className="text-[11px] text-slate-400">
                  Open in Excel, Numbers, or Google Sheets
                </p>
              </div>
            </motion.button>

            <motion.label
              htmlFor="settings-import-file"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-2xl liquid-glass hover:border-purple-500/40 flex items-center gap-3 text-left transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-400/20">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Restore from JSON File
                </p>
                <p className="text-[11px] text-slate-400">
                  Upload a previously saved JSON backup
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                id="settings-import-file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </motion.label>

            <motion.button
              type="button"
              id="settings-reset-data"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (confirm('Restore baseline sample telemetry dataset? This will replace current custom entries.')) {
                  resetToDefaults();
                }
              }}
              className="p-4 rounded-2xl liquid-glass hover:bg-red-500/10 hover:border-red-500/30 flex items-center gap-3 text-left transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-400/20">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Reset Sample Data
                </p>
                <p className="text-[11px] text-slate-400">
                  Reload authentic baseline hybrid telemetry records
                </p>
              </div>
            </motion.button>
          </div>
        </AnimatedCard>

        {/* Dynamic Vehicle Information Card */}
        <AnimatedCard delay={0.2} className="p-5 rounded-3xl liquid-card text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Info className="w-4 h-4 text-sky-500" />
            <span>Telemetry Architecture: {config.name} ({config.powertrain || 'HEV'})</span>
          </div>
          <p>
            Operating with a {config.tankCapacityLitres}{config.volumeUnit} fuel reservoir and calibrated for {config.fullRangeBenchmarkKm ? `${config.fullRangeBenchmarkKm} ${config.distanceUnit}` : 'dynamic range derivation'}.
            The telemetry algorithm dynamically calculates real-world distance-to-empty (DTE), rolling fuel efficiency in {config.distanceUnit}/{config.volumeUnit}, and cost per unit distance in {config.currency}/{config.distanceUnit}.
          </p>
        </AnimatedCard>
      </div>
    </div>
  );
};
