import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Header } from '../ui/Header';
import { ModalDialog } from '../ui/ModalDialog';
import { FuelEntryDetailModal } from '../fuel/FuelEntryDetailModal';
import {
  Fuel,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Gauge,
  Search,
  ArrowUpDown,
  Download,
  LayoutGrid,
  List,
  CalendarDays,
  Sparkles,
  ArrowRight,
  X,
  MapPin,
} from 'lucide-react';
import { ComputedFuelEntry } from '../../types';
import { AnimatedNumber } from '../animated/AnimatedNumber';
import { AnimatedBadge } from '../animated/AnimatedBadge';
import { AnimatedCard } from '../animated/AnimatedCard';

type FilterType = 'all' | 'completed' | 'pending' | 'high-economy' | 'full-tank';
type SortType = 'date-desc' | 'date-asc' | 'economy-desc' | 'economy-asc' | 'volume-desc' | 'cost-desc';
type ViewMode = 'cards' | 'grouped' | 'table';

interface MonthlyGroupData {
  entries: ComputedFuelEntry[];
  totalSpend: number;
  totalLitres: number;
}

export const FuelLogView: React.FC = () => {
  const {
    fuelEntries,
    deleteFuelEntry,
    config,
    kpis,
    setActiveModal,
    setEditingFuelEntry,
    setCompletingFuelEntry,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [inspectedEntry, setInspectedEntry] = useState<ComputedFuelEntry | null>(null);

  // Available vendor stations list
  const availableStations = useMemo(() => {
    const defaultStations = ['Shell', 'Total', 'ENGEN', 'Indian Oil'];
    const loggedStations = fuelEntries
      .map((e) => e.station?.trim())
      .filter((s): s is string => Boolean(s && s.length > 0));
    const combined = Array.from(new Set([...defaultStations, ...loggedStations]));
    return combined;
  }, [fuelEntries]);

  // Filter and sort logic
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...fuelEntries];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((entry) => {
        const dateMatch = entry.date.includes(q);
        const stationMatch = entry.station?.toLowerCase().includes(q);
        const notesMatch = entry.notes?.toLowerCase().includes(q);
        const amountMatch = entry.amountPaid.toString().includes(q);
        return dateMatch || stationMatch || notesMatch || amountMatch;
      });
    }

    // Station filter
    if (selectedStation !== 'all') {
      result = result.filter((e) => {
        if (!e.station) return false;
        return e.station.toLowerCase().includes(selectedStation.toLowerCase());
      });
    }

    // Filter type
    if (filterType === 'completed') {
      result = result.filter((e) => !e.isPending);
    } else if (filterType === 'pending') {
      result = result.filter((e) => e.isPending);
    } else if (filterType === 'high-economy') {
      result = result.filter((e) => e.fuelEconomy !== null && e.fuelEconomy >= 13.0);
    } else if (filterType === 'full-tank') {
      result = result.filter((e) => e.litresFueled >= 35);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortType) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'economy-desc':
          return (b.fuelEconomy || 0) - (a.fuelEconomy || 0);
        case 'economy-asc':
          return (a.fuelEconomy || 999) - (b.fuelEconomy || 999);
        case 'volume-desc':
          return b.litresFueled - a.litresFueled;
        case 'cost-desc':
          return b.amountPaid - a.amountPaid;
        default:
          return 0;
      }
    });

    return result;
  }, [fuelEntries, searchQuery, selectedStation, filterType, sortType]);

  // Grouped by month
  const monthlyGroups = useMemo(() => {
    const groups: Record<string, MonthlyGroupData> = {};

    filteredAndSortedEntries.forEach((entry) => {
      const d = new Date(entry.date);
      const key = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
      if (!groups[key]) {
        groups[key] = { entries: [], totalSpend: 0, totalLitres: 0 };
      }
      groups[key].entries.push(entry);
      groups[key].totalSpend += entry.amountPaid;
      groups[key].totalLitres += entry.litresFueled;
    });

    return groups;
  }, [filteredAndSortedEntries]);

  // High-level totals
  const totalFuelCost = fuelEntries.reduce((s, e) => s + e.amountPaid, 0);
  const totalLitres = fuelEntries.reduce((s, e) => s + e.litresFueled, 0);
  const pendingCount = fuelEntries.filter((e) => e.isPending).length;
  const completedCount = fuelEntries.length - pendingCount;
  const avgCostPerLitre = totalLitres > 0 ? totalFuelCost / totalLitres : 0;

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Amount Paid',
      'Price Per Litre',
      'Litres Fueled',
      'Pre-Fuel Range Gauge',
      'Post-Fuel Range Gauge',
      'Calculated Economy (km/L)',
      'Cost Per Km',
      'Station',
      'Notes',
    ];

    const rows = fuelEntries.map((e) => [
      e.date,
      e.amountPaid,
      e.pricePerLitre,
      e.litresFueled.toFixed(2),
      e.initialRangeGauge,
      e.postFillRangeGauge || '',
      e.fuelEconomy ? e.fuelEconomy.toFixed(2) : '',
      e.costPerKm ? e.costPerKm.toFixed(2) : '',
      `"${(e.station || '').replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bj30e_fuel_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ title: 'Fuel logs exported to CSV', type: 'success' });
  };

  const getEconomyBadge = (economy: number | null, isPending: boolean) => {
    if (isPending || economy === null) {
      return (
        <AnimatedBadge variant="amber" pulseDot={true} icon={<Clock className="w-3 h-3" />}>
          Pending
        </AnimatedBadge>
      );
    }

    if (economy >= 13.5) {
      return (
        <AnimatedBadge variant="emerald" pulseDot={true} icon={<Sparkles className="w-3 h-3" />}>
          {economy.toFixed(2)} km/L (High)
        </AnimatedBadge>
      );
    }

    if (economy >= 11.5) {
      return (
        <AnimatedBadge variant="blue" icon={<CheckCircle2 className="w-3 h-3" />}>
          {economy.toFixed(2)} km/L
        </AnimatedBadge>
      );
    }

    return (
      <AnimatedBadge variant="neutral">
        {economy.toFixed(2)} km/L
      </AnimatedBadge>
    );
  };

  return (
    <div className="w-full pb-24 sm:pb-12 safe-pb">
      {/* Page Header */}
      <Header
        title="Fuel Log & Efficiency"
        subtitle="Detailed history of refuels, station receipts, range gauge leaps & km/L economy"
        onQuickAction={() => {
          setEditingFuelEntry(null);
          setActiveModal('log-fuel');
        }}
        quickActionLabel="Log Fill-up"
        quickActionIcon={<Plus className="w-4 h-4" />}
      />

      <div className="px-4 sm:px-8 space-y-5 max-w-5xl mx-auto">
        {/* Top Metric Cards Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AnimatedCard delay={0.05} className="p-4 rounded-3xl liquid-card">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Total Spend</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block mt-0.5">
              <AnimatedNumber value={totalFuelCost} prefix={config.currency} />
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Avg {config.currency}{avgCostPerLitre.toFixed(1)}/{config.volumeUnit}
            </span>
          </AnimatedCard>

          <AnimatedCard delay={0.1} className="p-4 rounded-3xl liquid-card">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Total Litres</span>
            <span className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 block mt-0.5">
              <AnimatedNumber value={totalLitres} decimals={1} /> <span className="text-sm font-normal">{config.volumeUnit}</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {fuelEntries.length} fill-up{fuelEntries.length !== 1 ? 's' : ''} logged
            </span>
          </AnimatedCard>

          <AnimatedCard delay={0.15} className="p-4 rounded-3xl liquid-card">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Avg Economy</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
              {kpis.avgFuelEconomy > 0 ? <AnimatedNumber value={kpis.avgFuelEconomy} decimals={2} /> : '—'}{' '}
              <span className="text-sm font-normal">km/L</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block truncate">
              {config.name} · {config.powertrain || 'HEV'}
            </span>
          </AnimatedCard>

          <AnimatedCard delay={0.2} className="p-4 rounded-3xl liquid-card">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Driving Cost</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white block mt-0.5">
              {kpis.avgCostPerKm > 0 ? (
                <AnimatedNumber value={kpis.avgCostPerKm} decimals={2} prefix={config.currency} />
              ) : (
                '—'
              )}{' '}
              <span className="text-sm font-normal">/km</span>
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {completedCount} calculated
            </span>
          </AnimatedCard>
        </div>

        {/* Pending Fill-ups Actionable Alert Banner */}
        <AnimatePresence>
          {pendingCount > 0 && (
            <AnimatedCard
              id="pending-fillups-alert"
              className="p-4 sm:p-5 rounded-3xl liquid-card bg-amber-500/10 dark:bg-amber-500/15 border-amber-400/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {pendingCount} Refuel Record{pendingCount !== 1 ? 's' : ''} Awaiting Final Range Gauge
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
                    Record the post-fueling range cluster reading to compute exact km/L efficiency.
                  </p>
                </div>
              </div>

              <motion.button
                type="button"
                id="complete-first-pending-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  const firstPending = fuelEntries.find((e) => e.isPending);
                  if (firstPending) {
                    setCompletingFuelEntry(firstPending);
                    setActiveModal('complete-fill');
                  }
                }}
                className="px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-900/10 transition-all inline-flex items-center gap-1.5 shrink-0 border border-amber-400/30 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Latest Pending</span>
              </motion.button>
            </AnimatedCard>
          )}
        </AnimatePresence>

        {/* Controls Bar: Search, Filters, Sort & View Mode */}
        <div className="p-3.5 sm:p-4 rounded-3xl liquid-card space-y-3">
          {/* Top Row: Search & View Modes */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="fuel-search-input"
                placeholder="Search station, date, amount or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-2xl liquid-glass text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right Controls: Sort & View Toggle & CSV */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  id="fuel-sort-select"
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value as SortType)}
                  className="pl-3 pr-8 py-2 rounded-2xl liquid-glass text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="economy-desc">Highest km/L</option>
                  <option value="economy-asc">Lowest km/L</option>
                  <option value="volume-desc">Largest Volume (L)</option>
                  <option value="cost-desc">Highest Cost</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View Switcher */}
              <div className="flex items-center p-1 rounded-2xl liquid-glass">
                <button
                  type="button"
                  title="Card View"
                  id="view-mode-cards"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-xl transition-all ${
                    viewMode === 'cards'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Monthly Grouped View"
                  id="view-mode-grouped"
                  onClick={() => setViewMode('grouped')}
                  className={`p-1.5 rounded-xl transition-all ${
                    viewMode === 'grouped'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Table View"
                  id="view-mode-table"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-xl transition-all ${
                    viewMode === 'table'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* CSV Export */}
              <motion.button
                type="button"
                id="fuel-export-csv-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                title="Export fuel logs to CSV spreadsheet"
                className="p-2 rounded-2xl liquid-glass text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-colors shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Filter Chips Row with Layout Animation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-medium mr-1 shrink-0">Status:</span>
            {[
              { id: 'all', label: `All (${fuelEntries.length})` },
              { id: 'completed', label: `Calculated (${completedCount})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'high-economy', label: 'High Economy (≥13 km/L)' },
              { id: 'full-tank', label: 'Full Tanks (≥35L)' },
            ].map((tab) => {
              const isSelected = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  id={`filter-chip-${tab.id}`}
                  onClick={() => setFilterType(tab.id as FilterType)}
                  className={`relative px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'text-white'
                      : 'liquid-glass text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="filter-chip-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl shadow-xs"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Gas Station / Vendor Filter Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs pt-1 border-t border-black/5 dark:border-white/5">
            <span className="text-slate-400 font-medium mr-1 shrink-0 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-500" />
              <span>Vendor:</span>
            </span>
            <button
              type="button"
              id="filter-vendor-all"
              onClick={() => setSelectedStation('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedStation === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'liquid-glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Vendors
            </button>
            {availableStations.map((st) => {
              const isSelected = selectedStation === st;
              return (
                <button
                  key={st}
                  type="button"
                  id={`filter-vendor-${st.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setSelectedStation(isSelected ? 'all' : st)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-400/40'
                      : 'liquid-glass text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredAndSortedEntries.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Fuel className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-neutral-900 dark:text-white">
              No matching fuel entries found
            </h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              {searchQuery || filterType !== 'all'
                ? 'Try clearing your search query or filter tags to see all entries.'
                : 'Tap "Log Fill-up" to record your first fuel receipt and range cluster reading.'}
            </p>
            {(searchQuery || filterType !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="mt-4 px-4 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Card Feed View */
          <div className="space-y-3.5">
            <AnimatePresence>
              {filteredAndSortedEntries.map((entry) => (
                <FuelCard
                  key={entry.id}
                  entry={entry}
                  config={config}
                  onInspect={() => setInspectedEntry(entry)}
                  onEdit={() => {
                    setEditingFuelEntry(entry);
                    setActiveModal('log-fuel');
                  }}
                  onComplete={() => {
                    setCompletingFuelEntry(entry);
                    setActiveModal('complete-fill');
                  }}
                  onDelete={() => {
                    if (confirm('Delete this fuel record?')) {
                      deleteFuelEntry(entry.id);
                    }
                  }}
                  badge={getEconomyBadge(entry.fuelEconomy, entry.isPending)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : viewMode === 'grouped' ? (
          /* Monthly Grouped View */
          <div className="space-y-6">
            {Object.entries(monthlyGroups).map(([monthYear, group]: [string, MonthlyGroupData]) => {
              const ecoEntries = group.entries.filter((e) => e.fuelEconomy !== null);
              const avgMonthEco =
                ecoEntries.length > 0
                  ? ecoEntries.reduce((s, e) => s + (e.fuelEconomy || 0), 0) / ecoEntries.length
                  : null;

              return (
                <div key={monthYear} className="space-y-3">
                  {/* Group Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {monthYear}
                      </h3>
                      <span className="text-xs text-neutral-400">
                        ({group.entries.length} fill-up{group.entries.length !== 1 ? 's' : ''})
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-3 font-medium">
                      <span>
                        Spend: <strong>{config.currency}{Math.round(group.totalSpend).toLocaleString()}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Volume: <strong>{group.totalLitres.toFixed(1)} {config.volumeUnit}</strong>
                      </span>
                      {avgMonthEco !== null && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {avgMonthEco.toFixed(2)} km/L
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Group Cards */}
                  <div className="space-y-3">
                    <AnimatePresence>
                      {group.entries.map((entry) => (
                        <FuelCard
                          key={entry.id}
                          entry={entry}
                          config={config}
                          onInspect={() => setInspectedEntry(entry)}
                          onEdit={() => {
                            setEditingFuelEntry(entry);
                            setActiveModal('log-fuel');
                          }}
                          onComplete={() => {
                            setCompletingFuelEntry(entry);
                            setActiveModal('complete-fill');
                          }}
                          onDelete={() => {
                            if (confirm('Delete this fuel record?')) {
                              deleteFuelEntry(entry.id);
                            }
                          }}
                          badge={getEconomyBadge(entry.fuelEconomy, entry.isPending)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Compact Table View */
          <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#1c1c1e] border border-black/5 dark:border-white/10 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-400 font-semibold border-b border-black/5 dark:border-white/5">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Vendor / Station</th>
                    <th className="py-3 px-4">Volume ({config.volumeUnit})</th>
                    <th className="py-3 px-4">Rate ({config.currency}/L)</th>
                    <th className="py-3 px-4">Total Paid</th>
                    <th className="py-3 px-4">Range Gauge Delta</th>
                    <th className="py-3 px-4">Fuel Economy</th>
                    <th className="py-3 px-4">Cost / Km</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                  {filteredAndSortedEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => setInspectedEntry(entry)}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                        {entry.station || '—'}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {entry.litresFueled.toFixed(2)} L
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {config.currency}{entry.pricePerLitre}
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                        {config.currency}{entry.amountPaid.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-neutral-500">{entry.initialRangeGauge} km</span>
                        <span className="text-blue-500 mx-1">➔</span>
                        <span className="font-bold">
                          {entry.postFillRangeGauge ? `${entry.postFillRangeGauge} km` : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {entry.fuelEconomy !== null ? (
                          <span className="font-black text-emerald-600 dark:text-emerald-400">
                            {entry.fuelEconomy.toFixed(2)} km/L
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {entry.costPerKm ? `${config.currency}${entry.costPerKm.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {entry.isPending && (
                            <button
                              type="button"
                              onClick={() => {
                                setCompletingFuelEntry(entry);
                                setActiveModal('complete-fill');
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFuelEntry(entry);
                              setActiveModal('log-fuel');
                            }}
                            className="p-1 rounded-lg text-neutral-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Fuel Record Inspection Modal */}
      <ModalDialog
        isOpen={inspectedEntry !== null}
        onClose={() => setInspectedEntry(null)}
        title="Fueling Telemetry & Receipt"
        subtitle="Full hybrid telemetry, volume metrics & cluster range delta analysis"
        maxWidth="lg"
      >
        {inspectedEntry && (
          <FuelEntryDetailModal
            entry={inspectedEntry}
            onClose={() => setInspectedEntry(null)}
            onEdit={() => {
              const target = inspectedEntry;
              setInspectedEntry(null);
              setEditingFuelEntry(target);
              setActiveModal('log-fuel');
            }}
            onComplete={() => {
              const target = inspectedEntry;
              setInspectedEntry(null);
              setCompletingFuelEntry(target);
              setActiveModal('complete-fill');
            }}
          />
        )}
      </ModalDialog>
    </div>
  );
};

// Refactored FuelCard Subcomponent
interface FuelCardProps {
  entry: ComputedFuelEntry;
  config: any;
  onInspect: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
  badge: React.ReactNode;
}

const FuelCard: React.FC<FuelCardProps> = ({
  entry,
  config,
  onInspect,
  onEdit,
  onComplete,
  onDelete,
  badge,
}) => {
  const formattedDate = new Date(entry.date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(entry.date).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <AnimatedCard
      id={`fuel-card-${entry.id}`}
      onClick={onInspect}
      className={`p-4 sm:p-5 rounded-3xl transition-all cursor-pointer ${
        entry.isPending
          ? 'liquid-card bg-amber-500/[0.07] dark:bg-amber-500/[0.12] border-amber-400/40 hover:border-amber-400/70 shadow-lg shadow-amber-500/5'
          : 'liquid-card hover:border-sky-400/50'
      }`}
    >
      {/* Card Header: Station / Date & Amount */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Station / Fuel Icon */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              entry.isPending
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-400/30'
                : 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-400/25'
            }`}
          >
            <Fuel className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {entry.station || 'Fuel Station Refuel'}
              </span>
              {badge}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="font-medium">{formattedDate}</span>
              <span>•</span>
              <span>{formattedTime}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {entry.litresFueled.toFixed(2)} {config.volumeUnit} @ {config.currency}{entry.pricePerLitre}/L
              </span>
            </div>
          </div>
        </div>

        {/* Right Spend & Cost */}
        <div className="text-right shrink-0">
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            <AnimatedNumber value={entry.amountPaid} prefix={config.currency} />
          </div>
          {entry.costPerKm ? (
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              {config.currency}{entry.costPerKm.toFixed(2)} / km
            </div>
          ) : (
            <div className="text-[11px] font-semibold text-amber-500">Gauge pending</div>
          )}
        </div>
      </div>

      {/* Visual Range Delta Progression Bar */}
      <div className="mt-4 p-3 rounded-2xl liquid-glass flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">Pre-Fuel Gauge:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {entry.initialRangeGauge} {config.distanceUnit}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ArrowRight className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">Post-Fuel Gauge:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {entry.postFillRangeGauge ? `${entry.postFillRangeGauge} ${config.distanceUnit}` : '—'}
          </span>
          {entry.distanceThisFill && (
            <span className="text-xs font-black text-sky-600 dark:text-sky-400 ml-1">
              (+{entry.distanceThisFill} km)
            </span>
          )}
        </div>
      </div>

      {/* Notes preview if any */}
      {entry.notes && (
        <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 italic bg-black/[0.03] dark:bg-white/[0.05] px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5">
          "{entry.notes}"
        </div>
      )}

      {/* Footer Controls & Details Prompt */}
      <div
        className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onInspect}
          className="text-slate-500 hover:text-sky-600 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Telemetry Breakdown</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {entry.isPending && (
            <motion.button
              type="button"
              id={`complete-btn-${entry.id}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm border border-amber-300/30 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Record Final Gauge</span>
            </motion.button>
          )}

          <motion.button
            type="button"
            id={`edit-fuel-${entry.id}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            title="Edit fill-up record"
            className="p-2 rounded-xl liquid-glass text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            type="button"
            id={`delete-fuel-${entry.id}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            title="Delete fill-up record"
            className="p-2 rounded-xl liquid-glass hover:bg-red-500/15 hover:border-red-500/30 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </AnimatedCard>
  );
};
