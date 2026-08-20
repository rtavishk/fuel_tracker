import { FuelEntry, DailyTrip, PreTripLog, VehicleConfig } from '../types';

export const initialVehicleConfig: VehicleConfig = {
  id: 'singleton',
  name: 'Primary Hybrid',
  make: 'Hybrid / EV',
  model: 'Dual-Motor Hybrid (HEV/PHEV)',
  powertrain: 'HEV',
  tankCapacityLitres: 50,
  fullRangeBenchmarkKm: null,
  currency: 'Rs',
  distanceUnit: 'km',
  volumeUnit: 'L',
  theme: 'system',
  authEnabled: true,
  userEmail: '',
};

// Pure DB-driven data: No hardcoded entries
export const initialFuelEntries: FuelEntry[] = [];
export const initialDailyTrips: DailyTrip[] = [];
export const initialPreTripLogs: PreTripLog[] = [];
