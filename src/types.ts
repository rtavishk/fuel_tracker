import { z } from 'zod';

export interface FuelEntry {
  id: string;
  date: string; // ISO string
  amountPaid: number; // in configured currency e.g. Rs
  pricePerLitre: number; // Rs/L
  litresFueled: number; // = amountPaid / pricePerLitre (stored for integrity)
  currentOdometer: number; // Car's remaining-range / DTE gauge BEFORE fueling (e.g., 95 km)
  afterFuelingOdometer: number | null; // Car's remaining-range / DTE gauge AFTER fueling (e.g., 670 km)
  gasStation?: string;
  station?: string; // alias for gasStation
  initialRangeGauge?: number; // alias for currentOdometer
  postFillRangeGauge?: number | null; // alias for afterFuelingOdometer
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComputedFuelEntry extends FuelEntry {
  distanceThisFill: number | null; // afterFuelingOdometer - currentOdometer
  fuelEconomy: number | null; // distanceThisFill / litresFueled (km/L)
  costPerKm: number | null; // amountPaid / distanceThisFill (Rs/km)
  estimatedRangeThisFill: number | null; // litresFueled * runningAverageEconomySoFar
  estimatedAfterFuelingOdometer: number | null; // currentOdometer + estimatedRangeThisFill
  forecastDelta: number | null; // afterFuelingOdometer - estimatedAfterFuelingOdometer
  isPending: boolean;
}

export interface DailyTrip {
  id: string;
  date: string; // YYYY-MM-DD
  totalOdometer: number; // Real cumulative vehicle odometer (e.g. 14,280 km)
  notes?: string;
  createdAt: string;
}

export interface ComputedDailyTrip extends DailyTrip {
  kmDrivenToday: number; // totalOdometer - previous logged day's totalOdometer
  sevenDayRollingAvg: number; // 7-entry rolling average of kmDrivenToday
  estimatedFuelCostToday: number; // kmDrivenToday * avgCostPerKm
}

export interface PreTripLog {
  id: string;
  date: string; // ISO string
  currentOdometer: number; // Range/DTE gauge reading before starting drive
  notes?: string;
  createdAt: string;
}

export interface ComputedPreTripLog extends PreTripLog {
  estimatedLitresLeft: number; // currentOdometer / avgEconomy
  estimatedLitresNeededForFullTank: number; // max(fullRangeBenchmark - currentOdometer, 0) / avgEconomy
  estimatedPriceOfPetrol: number; // estimatedLitresNeededForFullTank * latestPriceToday
}

export interface VehicleConfig {
  id: string;
  name: string;
  make?: string;
  model: string;
  year?: number;
  powertrain?: 'HEV' | 'PHEV' | 'MHEV' | 'EREV' | 'BEV' | 'ICE' | string;
  tankCapacityLitres: number;
  fullRangeBenchmarkKm: number | null; // manual override; if null, derive from avg(afterFuelingOdometer)
  currency: string; // e.g. "Rs", "$", "AED", "€", "£"
  distanceUnit: string; // "km" or "mi"
  volumeUnit: string; // "L" or "gal"
  theme: 'system' | 'dark' | 'light';
  authEnabled: boolean;
  userEmail: string;
  userName?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  driverRole?: string;
  vehicleModel?: string;
  avatarUrl?: string;
  joinedDate?: string;
  isLoggedIn: boolean;
}

export type ActiveTab = 'dashboard' | 'fuel-log' | 'trips' | 'calculator' | 'settings';

export type QuickActionModal = 'log-fuel' | 'log-trip' | 'pre-trip-check' | 'complete-fill' | 'auth' | 'driver-profile' | null;

// Zod validation schemas
export const FuelEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amountPaid: z.number().positive('Amount paid must be greater than 0'),
  pricePerLitre: z.number().positive('Price per litre must be greater than 0'),
  currentOdometer: z.number().nonnegative('Current range gauge must be 0 or greater'),
  afterFuelingOdometer: z.number().nullable().optional(),
  gasStation: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
  if (data.afterFuelingOdometer !== null && data.afterFuelingOdometer !== undefined) {
    return data.afterFuelingOdometer > data.currentOdometer;
  }
  return true;
}, {
  message: 'After-fueling range gauge must be higher than pre-fueling range gauge',
  path: ['afterFuelingOdometer']
});

export const DailyTripSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  totalOdometer: z.number().positive('Total vehicle odometer must be positive'),
  notes: z.string().optional(),
});

export const PreTripSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  currentOdometer: z.number().nonnegative('Range gauge must be non-negative'),
  notes: z.string().optional(),
});

export const VehicleConfigSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required'),
  tankCapacityLitres: z.number().min(10).max(200),
  fullRangeBenchmarkKm: z.number().positive().nullable().optional(),
  currency: z.string().min(1).max(5),
  theme: z.enum(['system', 'dark', 'light']),
  authEnabled: z.boolean(),
  userEmail: z.string().email(),
});
