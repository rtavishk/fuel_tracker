import {
  FuelEntry,
  ComputedFuelEntry,
  TripEntry,
  ComputedTripEntry,
  PreTripEntry,
  ComputedPreTripEntry,
  MaintenanceScheduleItem,
  MaintenanceStatusItem,
  VehicleConfig,
} from '../types';

/**
 * Computes all derived metrics for Fuel Log entries according to §6.1.
 * Chronological running average of economy across all prior completed entries.
 */
export function computeFuelEntries(
  entries: FuelEntry[],
  fallbackBenchmarkEconomy = 14.5
): ComputedFuelEntry[] {
  // Sort chronologically ascending for calculation
  const sorted = [...entries].sort((a, b) => {
    const timeA = new Date(a.date + (a.time ? `T${a.time}` : 'T00:00:00')).getTime();
    const timeB = new Date(b.date + (b.time ? `T${b.time}` : 'T00:00:00')).getTime();
    return timeA - timeB;
  });

  const completedEconomies: number[] = [];
  const computedList: ComputedFuelEntry[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const litresFueled =
      entry.litresFueled || (entry.pricePerLitre > 0 ? entry.amountPaid / entry.pricePerLitre : 0);

    const isPending =
      entry.afterFuelingOdometer === undefined ||
      entry.afterFuelingOdometer === null ||
      isNaN(entry.afterFuelingOdometer) ||
      entry.afterFuelingOdometer <= 0;

    // Running average economy so far (prior completed entries)
    const runningAvg =
      completedEconomies.length > 0
        ? completedEconomies.reduce((sum, val) => sum + val, 0) / completedEconomies.length
        : fallbackBenchmarkEconomy;

    // Forecast metrics
    const estimatedRangeThisFill = litresFueled * runningAvg;
    const estimatedAfterFuelingOdometer = entry.currentOdometer + estimatedRangeThisFill;

    let distanceThisFill: number | undefined;
    let fuelEconomy: number | undefined;
    let costPerKm: number | undefined;
    let forecastDelta: number | undefined;
    let efficiencyDriftPercentage: number | undefined;

    if (!isPending && entry.afterFuelingOdometer !== undefined && entry.afterFuelingOdometer !== null) {
      distanceThisFill = entry.afterFuelingOdometer - entry.currentOdometer;
      if (litresFueled > 0 && distanceThisFill > 0) {
        fuelEconomy = distanceThisFill / litresFueled;
        completedEconomies.push(fuelEconomy);
      }
      if (distanceThisFill > 0) {
        costPerKm = entry.amountPaid / distanceThisFill;
      }
      forecastDelta = entry.afterFuelingOdometer - estimatedAfterFuelingOdometer;
      if (runningAvg > 0 && fuelEconomy !== undefined) {
        efficiencyDriftPercentage = ((fuelEconomy - runningAvg) / runningAvg) * 100;
      }
    }

    computedList.push({
      ...entry,
      litresFueled,
      isPending,
      distanceThisFill,
      fuelEconomy,
      costPerKm,
      runningAverageEconomySoFar: runningAvg,
      estimatedRangeThisFill,
      estimatedAfterFuelingOdometer,
      forecastDelta,
      efficiencyDriftPercentage,
    });
  }

  // Return sorted descending (newest first) for UI display
  return computedList.sort((a, b) => {
    const timeA = new Date(a.date + (a.time ? `T${a.time}` : 'T00:00:00')).getTime();
    const timeB = new Date(b.date + (b.time ? `T${b.time}` : 'T00:00:00')).getTime();
    return timeB - timeA;
  });
}

/**
 * Calculates overall aggregated fuel statistics.
 */
export function getAggregatedFuelStats(
  computedEntries: ComputedFuelEntry[],
  fallbackPrice = 106.5,
  targetEfficiency = 14.5
) {
  const completed = computedEntries.filter(
    (e) => !e.isPending && e.fuelEconomy !== undefined && e.fuelEconomy > 0
  );

  const totalSpend = computedEntries.reduce((sum, e) => sum + e.amountPaid, 0);
  const totalLitres = computedEntries.reduce((sum, e) => sum + e.litresFueled, 0);
  const totalDistance = completed.reduce((sum, e) => sum + (e.distanceThisFill || 0), 0);

  const completedCount = completed.length;
  const pendingCount = computedEntries.filter((e) => e.isPending).length;

  const avgEconomy =
    completed.length > 0
      ? completed.reduce((sum, e) => sum + (e.fuelEconomy || 0), 0) / completed.length
      : 0;

  const avgCostPerKm =
    totalDistance > 0
      ? completed.reduce((sum, e) => sum + e.amountPaid, 0) / totalDistance
      : 0;

  const latestPrice =
    computedEntries.length > 0 && computedEntries[0].pricePerLitre > 0
      ? computedEntries[0].pricePerLitre
      : 0;

  // Best & worst economy
  const bestEconomy =
    completed.length > 0
      ? Math.max(...completed.map((e) => e.fuelEconomy || 0))
      : 0;

  const worstEconomy =
    completed.length > 0
      ? Math.min(...completed.map((e) => e.fuelEconomy || 0))
      : 0;

  return {
    totalSpend,
    totalLitres,
    totalDistance,
    avgEconomy,
    avgCostPerKm,
    latestPrice,
    bestEconomy,
    worstEconomy,
    completedCount: completed.length,
    pendingCount: computedEntries.length - completed.length,
  };
}

/**
 * Computes Daily Trip Log entries according to §6.2.
 * Uses cumulative total odometer; calculates kmDrivenToday = odo(today) - odo(previous logged day).
 * Calculates 7-day rolling average over the last 7 *logged* days.
 */
export function computeTripEntries(
  trips: TripEntry[],
  liveAvgCostPerKm: number
): ComputedTripEntry[] {
  // Sort chronologically ascending
  const sorted = [...trips].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const computedAsc: ComputedTripEntry[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    let kmDrivenToday = 0;
    let isFirstEntry = false;

    if (i === 0) {
      isFirstEntry = true;
      kmDrivenToday = 0;
    } else {
      const prev = sorted[i - 1];
      kmDrivenToday = Math.max(0, current.totalOdometer - prev.totalOdometer);
    }

    // 7-day rolling average over last 7 logged days (including this day, excluding initial 0-diff first entry if multiple)
    const windowStart = Math.max(0, i - 6);
    const windowEntries = [];
    for (let w = windowStart; w <= i; w++) {
      if (w > 0) {
        const diff = Math.max(0, sorted[w].totalOdometer - sorted[w - 1].totalOdometer);
        windowEntries.push(diff);
      }
    }

    const sevenDayRollingAvg =
      windowEntries.length > 0
        ? windowEntries.reduce((sum, v) => sum + v, 0) / windowEntries.length
        : kmDrivenToday;

    const estimatedFuelCostToday = kmDrivenToday * liveAvgCostPerKm;

    computedAsc.push({
      ...current,
      kmDrivenToday,
      sevenDayRollingAvg,
      estimatedFuelCostToday,
      isFirstEntry,
    });
  }

  // Return sorted descending (newest date first)
  return computedAsc.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Computes Pre-trip entries according to §6.3.3.
 */
export function computePreTripEntries(
  preTrips: PreTripEntry[],
  avgEconomy: number,
  fullRangeBenchmark: number,
  priceToday: number
): ComputedPreTripEntry[] {
  const safeAvgEconomy = avgEconomy > 0 ? avgEconomy : 14.5;
  const safePrice = priceToday > 0 ? priceToday : 105;

  return preTrips
    .map((item) => {
      const estimatedLitresLeft = item.currentOdometer / safeAvgEconomy;
      const kmNeededForFull = Math.max(0, fullRangeBenchmark - item.currentOdometer);
      const estimatedLitresNeededForFullTank = kmNeededForFull / safeAvgEconomy;
      const estimatedPriceOfPetrol = estimatedLitresNeededForFullTank * safePrice;

      return {
        ...item,
        estimatedLitresLeft,
        estimatedLitresNeededForFullTank,
        estimatedPriceOfPetrol,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Computes engine maintenance status based on current cumulative total odometer.
 */
export function computeMaintenanceStatus(
  items: MaintenanceScheduleItem[],
  currentCumulativeOdometer: number
): MaintenanceStatusItem[] {
  return items.map((item) => {
    const kmSinceService = Math.max(0, currentCumulativeOdometer - item.lastServiceOdometer);
    const kmRemaining = item.intervalKm - kmSinceService;
    const progressPercent = Math.min(100, Math.max(0, (kmSinceService / item.intervalKm) * 100));

    let status: 'Good' | 'Due Soon' | 'Overdue' = 'Good';
    if (kmRemaining <= 0) {
      status = 'Overdue';
    } else if (kmRemaining <= item.intervalKm * 0.15 || kmRemaining <= 500) {
      status = 'Due Soon';
    }

    return {
      ...item,
      kmSinceService,
      kmRemaining,
      progressPercent,
      status,
    };
  });
}

/**
 * Computes full-tank benchmark value based on vehicle config override or completed fuel entries.
 */
export function getFullRangeBenchmark(
  vehicleConfig: VehicleConfig,
  fuelEntries: FuelEntry[]
): number {
  if (vehicleConfig.fullRangeBenchmarkKm && vehicleConfig.fullRangeBenchmarkKm > 0) {
    return vehicleConfig.fullRangeBenchmarkKm;
  }

  const validAfters = fuelEntries
    .map((e) => e.afterFuelingOdometer)
    .filter((v): v is number => v !== undefined && v !== null && v > 0);

  if (validAfters.length > 0) {
    return Math.round(validAfters.reduce((sum, v) => sum + v, 0) / validAfters.length);
  }

  return 680; // Default sensible vehicle range benchmark
}
