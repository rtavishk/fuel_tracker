export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string; // preset id like 'speedometer', 'turbo', 'sports-car', etc.
  avatarUrl?: string; // custom image photo / data URI
  avatarColor?: string; // custom avatar theme color
  phone?: string;
  bio?: string;
  driverTier?: 'Standard' | 'Pro' | 'Eco Master' | 'Speedster' | 'Fleet Manager';
  createdAt: string;
  isDemoUser?: boolean;
  targetEfficiency?: number; // Custom target baseline economy in km/L or MPG
  preferredCurrency?: string;
}

export interface FuelPriceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  price: number;
  fuelType?: string;
  stationOrRegion?: string;
  notes?: string;
  isCurrentActive?: boolean;
}

export interface VehicleConfig {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  tankCapacityLitres: number;
  fullRangeBenchmarkKm: number; // e.g. 680 km (Distance-to-Empty when tank is full)
  currentCumulativeOdometer: number; // Cumulative real odometer in km (e.g. 42,500 km)
  fuelType: 'Petrol (95)' | 'Petrol (91)' | 'Diesel' | 'Premium Unleaded' | 'Octane 98' | 'E10 Regular' | 'Hybrid / Electric' | string;
  currency: string; // 'Rs.', '₹', '$', '€', '£', 'AED', 'CAD', etc.
  distanceUnit: 'km' | 'mi';
  volumeUnit: 'L' | 'gal';
  targetEfficiency?: number; // Baseline / Factory rating (e.g. 14.5 km/L)
  currentFuelPrice?: number; // Active price per unit
  priceHistory?: FuelPriceRecord[];
  odometerType?: 'cumulative' | 'fuelRange'; // 'cumulative' = real mileage, 'fuelRange' = distance-to-empty (like BJ30)
  createdAt?: string;
}

export interface FuelEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  amountPaid: number; // in currency (e.g. 4500)
  pricePerLitre: number; // in currency/L (e.g. 105.5)
  litresFueled: number; // Stored for integrity: amountPaid / pricePerLitre
  currentOdometer: number; // Distance-to-empty / Remaining-range gauge BEFORE fueling (e.g. 75 km)
  afterFuelingOdometer?: number | null; // Distance-to-empty / Remaining-range gauge AFTER fueling (e.g. 675 km)
  fuelStation?: string;
  notes?: string;
  isFullTank?: boolean;
  createdAt: string;
}

export interface ComputedFuelEntry extends FuelEntry {
  isPending: boolean; // True if afterFuelingOdometer is not yet provided
  distanceThisFill?: number; // afterFuelingOdometer - currentOdometer
  fuelEconomy?: number; // km/L = distanceThisFill / litresFueled
  costPerKm?: number; // Rs/km = amountPaid / distanceThisFill
  runningAverageEconomySoFar: number; // Chronological running average of completed entries
  estimatedRangeThisFill: number; // litresFueled * runningAverageEconomySoFar
  estimatedAfterFuelingOdometer: number; // currentOdometer + estimatedRangeThisFill
  forecastDelta?: number; // afterFuelingOdometer - estimatedAfterFuelingOdometer
  efficiencyDriftPercentage?: number; // percentage variance against running average
}

export interface TripEntry {
  id: string;
  date: string; // YYYY-MM-DD
  totalOdometer: number; // Can be cumulative real odometer OR fuel range (distance-to-empty) depending on vehicle config
  totalCumulativeOdometer?: number; // Database field name for cumulative odometer
  category?: 'Commute' | 'Highway' | 'City' | 'Business' | 'Roadtrip' | 'Errand' | 'Work' | 'Other';
  notes?: string;
  createdAt: string;
}

export interface ComputedTripEntry extends TripEntry {
  kmDrivenToday: number; // totalOdometer - totalOdometer(previous logged day)
  sevenDayRollingAvg: number; // average over last 7 logged entries
  estimatedFuelCostToday: number; // kmDrivenToday * avgCostPerKm
  isFirstEntry?: boolean;
}

export interface PreTripEntry {
  id: string;
  date: string; // ISO string with timestamp
  currentOdometer: number; // Remaining-range gauge reading (km)
  tripPurpose?: string;
  notes?: string;
  createdAt: string;
}

export interface ComputedPreTripEntry extends PreTripEntry {
  estimatedLitresLeft: number; // currentOdometer / avgEconomy
  estimatedLitresNeededForFullTank: number; // max(fullRangeBenchmark - currentOdometer, 0) / avgEconomy
  estimatedPriceOfPetrol: number; // estimatedLitresNeededForFullTank * priceToday
}

export interface MaintenanceScheduleItem {
  id: string;
  title: string;
  category: 'Engine' | 'Fluids' | 'Chassis' | 'Filters' | 'Electrical' | 'Safety';
  intervalKm: number; // e.g. 5000 km
  intervalMonths?: number; // e.g. 6 months
  lastServiceOdometer: number; // Cumulative total odometer at last service
  lastServiceDate: string;
  estimatedCost?: number;
  priority: 'High' | 'Medium' | 'Low';
  notes?: string;
}

export interface MaintenanceStatusItem extends MaintenanceScheduleItem {
  kmSinceService: number;
  kmRemaining: number;
  progressPercent: number; // 0 to 100+ %
  status: 'Good' | 'Due Soon' | 'Overdue';
}

export type ActiveTab = 'dashboard' | 'fuel-log' | 'trips' | 'calculator' | 'settings';
export type CalculatorSubTab = 'how-far' | 'full-tank' | 'pretrip-log';
