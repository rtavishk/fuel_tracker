import { FuelEntry, ComputedFuelEntry, DailyTrip, ComputedDailyTrip, PreTripLog, ComputedPreTripLog, VehicleConfig } from '../types';

export function computeFuelEntries(
  entries: FuelEntry[],
  defaultEconomyFallback = 0 // fallback if no prior history
): ComputedFuelEntry[] {
  // Sort chronologically ascending to compute running averages
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningCompletedDist = 0;
  let runningCompletedLitres = 0;
  const computedList: ComputedFuelEntry[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const litresFueled = entry.litresFueled || (entry.pricePerLitre > 0 ? entry.amountPaid / entry.pricePerLitre : 0);
    const hasAfter = entry.afterFuelingOdometer !== null && entry.afterFuelingOdometer !== undefined && entry.afterFuelingOdometer > 0;
    
    // Running average fuel economy from all prior completed entries
    const runningAvgEconomy = runningCompletedLitres > 0
      ? runningCompletedDist / runningCompletedLitres
      : 0;

    const estimatedRangeThisFill = litresFueled > 0 && runningAvgEconomy > 0 ? litresFueled * runningAvgEconomy : 0;
    const estimatedAfterFuelingOdometer = entry.currentOdometer + estimatedRangeThisFill;

    let distanceThisFill: number | null = null;
    let fuelEconomy: number | null = null;
    let costPerKm: number | null = null;
    let forecastDelta: number | null = null;

    if (hasAfter && entry.afterFuelingOdometer !== null) {
      distanceThisFill = entry.afterFuelingOdometer - entry.currentOdometer;
      fuelEconomy = litresFueled > 0 ? distanceThisFill / litresFueled : null;
      costPerKm = distanceThisFill > 0 ? entry.amountPaid / distanceThisFill : null;
      forecastDelta = entry.afterFuelingOdometer - estimatedAfterFuelingOdometer;

      // Update running tally for subsequent entries
      if (distanceThisFill > 0 && litresFueled > 0) {
        runningCompletedDist += distanceThisFill;
        runningCompletedLitres += litresFueled;
      }
    }

    computedList.push({
      ...entry,
      station: entry.gasStation || entry.station,
      initialRangeGauge: entry.currentOdometer,
      postFillRangeGauge: entry.afterFuelingOdometer,
      litresFueled,
      distanceThisFill,
      fuelEconomy,
      costPerKm,
      estimatedRangeThisFill,
      estimatedAfterFuelingOdometer,
      forecastDelta,
      isPending: !hasAfter,
    });
  }

  // Return sorted descending (most recent first) for UI display
  return computedList.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function computeDailyTrips(
  trips: DailyTrip[],
  avgCostPerKm: number
): ComputedDailyTrip[] {
  // Sort chronologically ascending
  const sorted = [...trips].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const computedList: ComputedDailyTrip[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = i > 0 ? sorted[i - 1] : null;

    let kmDrivenToday = 0;
    if (previous) {
      kmDrivenToday = Math.max(0, current.totalOdometer - previous.totalOdometer);
    }

    // 7-logged-entry rolling average
    const startIdx = Math.max(0, i - 6);
    const window = [];
    for (let w = startIdx; w <= i; w++) {
      if (w === 0 && !previous) {
        // first entry has 0 km
        window.push(0);
      } else {
        const prevW = w > 0 ? sorted[w - 1] : null;
        const kmW = prevW ? Math.max(0, sorted[w].totalOdometer - prevW.totalOdometer) : 0;
        window.push(kmW);
      }
    }
    const nonZeroWindow = window.filter((_, idx) => startIdx + idx > 0);
    const sevenDayRollingAvg = nonZeroWindow.length > 0
      ? nonZeroWindow.reduce((acc, v) => acc + v, 0) / nonZeroWindow.length
      : kmDrivenToday;

    const estimatedFuelCostToday = kmDrivenToday * avgCostPerKm;

    computedList.push({
      ...current,
      kmDrivenToday,
      sevenDayRollingAvg,
      estimatedFuelCostToday,
    });
  }

  // Return descending (most recent first)
  return computedList.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function computePreTripLogs(
  logs: PreTripLog[],
  avgEconomy: number,
  fullRangeBenchmark: number,
  latestPrice: number
): ComputedPreTripLog[] {
  const safeEconomy = avgEconomy > 0 ? avgEconomy : 0;
  return logs.map((log) => {
    const estimatedLitresLeft = safeEconomy > 0 ? log.currentOdometer / safeEconomy : 0;
    const kmNeeded = Math.max(0, fullRangeBenchmark - log.currentOdometer);
    const estimatedLitresNeededForFullTank = safeEconomy > 0 ? kmNeeded / safeEconomy : 0;
    const estimatedPriceOfPetrol = estimatedLitresNeededForFullTank * latestPrice;

    return {
      ...log,
      estimatedLitresLeft,
      estimatedLitresNeededForFullTank,
      estimatedPriceOfPetrol,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export interface SummaryKPIs {
  totalSpent: number;
  totalLitres: number;
  totalDistance: number;
  fillCount: number;
  completedFillCount: number;
  avgFuelEconomy: number;
  avgPricePerLitre: number;
  avgCostPerKm: number;
  fullRangeBenchmark: number;
  latestPrice: number;
  latestRangeGauge: number;
  economyTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  economyTrendPercent: number;
  avgDailyKm: number;
  projectedDaysToEmpty: number;
}

export function calculateSummaryKPIs(
  fuelEntries: ComputedFuelEntry[],
  tripEntries: ComputedDailyTrip[],
  config: VehicleConfig
): SummaryKPIs {
  let totalSpent = 0;
  let totalLitres = 0;
  let totalDistance = 0;
  let totalCostDistance = 0;
  let totalCostAmount = 0;
  const completedEntries = fuelEntries.filter((e) => !e.isPending && e.distanceThisFill !== null && e.distanceThisFill > 0);

  fuelEntries.forEach((entry) => {
    totalSpent += entry.amountPaid;
    totalLitres += entry.litresFueled;
  });

  completedEntries.forEach((entry) => {
    if (entry.distanceThisFill) {
      totalDistance += entry.distanceThisFill;
      totalCostDistance += entry.distanceThisFill;
      totalCostAmount += entry.amountPaid;
    }
  });

  const fillCount = fuelEntries.length;
  const completedFillCount = completedEntries.length;
  const avgFuelEconomy = totalLitres > 0 && totalDistance > 0 ? totalDistance / totalLitres : 0;
  const avgPricePerLitre = totalLitres > 0 ? totalSpent / totalLitres : 0;
  const avgCostPerKm = totalCostDistance > 0 ? totalCostAmount / totalCostDistance : 0;

  // Derived full-range benchmark
  const afterFuelingValues = fuelEntries
    .map((e) => e.afterFuelingOdometer)
    .filter((v): v is number => v !== null && v > 0);
  
  const derivedBenchmark = afterFuelingValues.length > 0
    ? afterFuelingValues.reduce((a, b) => a + b, 0) / afterFuelingValues.length
    : 0;

  const fullRangeBenchmark = config.fullRangeBenchmarkKm ?? derivedBenchmark;

  const latestEntry = fuelEntries[0];
  const latestPrice = latestEntry?.pricePerLitre || 0;
  const latestRangeGauge = latestEntry?.afterFuelingOdometer || latestEntry?.currentOdometer || 0;

  // Trend determination: Compare last 3 completed vs all-time average (needs >= 4 entries)
  let economyTrend: 'improving' | 'declining' | 'stable' | 'insufficient_data' = 'insufficient_data';
  let economyTrendPercent = 0;

  if (completedEntries.length >= 4) {
    const recent3 = completedEntries.slice(0, 3);
    const recent3Avg = recent3.reduce((acc, curr) => acc + (curr.fuelEconomy || 0), 0) / 3;
    const diff = recent3Avg - avgFuelEconomy;
    economyTrendPercent = (diff / avgFuelEconomy) * 100;

    if (economyTrendPercent > 2.5) {
      economyTrend = 'improving';
    } else if (economyTrendPercent < -2.5) {
      economyTrend = 'declining';
    } else {
      economyTrend = 'stable';
    }
  }

  // Avg daily km from trips
  const validTrips = tripEntries.filter((t) => t.kmDrivenToday > 0);
  const avgDailyKm = validTrips.length > 0
    ? validTrips.reduce((acc, t) => acc + t.kmDrivenToday, 0) / validTrips.length
    : 0;

  const projectedDaysToEmpty = avgDailyKm > 0 ? Math.round(latestRangeGauge / avgDailyKm) : 0;

  return {
    totalSpent,
    totalLitres,
    totalDistance,
    fillCount,
    completedFillCount,
    avgFuelEconomy,
    avgPricePerLitre,
    avgCostPerKm,
    fullRangeBenchmark,
    latestPrice,
    latestRangeGauge,
    economyTrend,
    economyTrendPercent,
    avgDailyKm,
    projectedDaysToEmpty,
  };
}
