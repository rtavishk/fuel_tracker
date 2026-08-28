import {
  VehicleConfig,
  FuelEntry,
  TripEntry,
  PreTripEntry,
  MaintenanceScheduleItem,
  User,
  FuelPriceRecord,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// Default Clean State for Real User Accounts (No Hardcoded Fake Records)
export const createDefaultVehicle = (partial?: Partial<VehicleConfig>): VehicleConfig => ({
  id: partial?.id || uuidv4(),
  name: partial?.name || (partial?.make && partial?.model ? `${partial.make} ${partial.model}` : 'My Vehicle'),
  make: partial?.make || 'Toyota',
  model: partial?.model || 'Corolla',
  year: partial?.year || 2024,
  licensePlate: partial?.licensePlate || '',
  tankCapacityLitres: partial?.tankCapacityLitres || 50,
  fullRangeBenchmarkKm: partial?.fullRangeBenchmarkKm || 650,
  currentCumulativeOdometer: partial?.currentCumulativeOdometer || 0,
  fuelType: partial?.fuelType || 'Petrol (95)',
  currency: partial?.currency || 'Rs.',
  distanceUnit: partial?.distanceUnit || 'km',
  volumeUnit: partial?.volumeUnit || 'L',
  targetEfficiency: partial?.targetEfficiency || 14.5,
  currentFuelPrice: partial?.currentFuelPrice || 106.5,
  createdAt: new Date().toISOString(),
});

export const initialUser: User = {
  id: '',
  email: '',
  name: '',
  avatar: 'speedometer',
  createdAt: new Date().toISOString(),
  isDemoUser: false,
  targetEfficiency: 14.5,
  preferredCurrency: 'Rs.',
};

export const initialVehiclesList: VehicleConfig[] = [
  createDefaultVehicle(),
];

export const initialVehicleConfig: VehicleConfig = initialVehiclesList[0];

// Dynamic empty arrays for real authenticated user logs
export const initialFuelEntries: FuelEntry[] = [];
export const initialTripEntries: TripEntry[] = [];
export const initialPreTripEntries: PreTripEntry[] = [];

export const initialFuelPriceHistory: FuelPriceRecord[] = [
  {
    id: 'prc_base',
    date: new Date().toISOString().split('T')[0],
    price: 106.5,
    fuelType: 'Petrol (95)',
    notes: 'Current standard fuel price',
    isCurrentActive: true,
  },
];

// Factory maintenance template items configured relative to the vehicle's odometer
export const createInitialMaintenanceSchedule = (currentOdo: number = 0): MaintenanceScheduleItem[] => [
  {
    id: uuidv4(),
    title: 'Engine Oil & Filter Replacement',
    category: 'Engine',
    intervalKm: 5000,
    intervalMonths: 6,
    lastServiceOdometer: currentOdo,
    lastServiceDate: new Date().toISOString().split('T')[0],
    estimatedCost: 8500,
    priority: 'High',
    notes: 'Full synthetic oil and genuine filter',
  },
  {
    id: uuidv4(),
    title: 'Tire Rotation & Pressure Inspection',
    category: 'Chassis',
    intervalKm: 8000,
    intervalMonths: 6,
    lastServiceOdometer: currentOdo,
    lastServiceDate: new Date().toISOString().split('T')[0],
    estimatedCost: 1800,
    priority: 'Medium',
    notes: 'Rotate tires and inspect tread depth',
  },
  {
    id: uuidv4(),
    title: 'Engine Air Filter Replacement',
    category: 'Filters',
    intervalKm: 15000,
    intervalMonths: 12,
    lastServiceOdometer: currentOdo,
    lastServiceDate: new Date().toISOString().split('T')[0],
    estimatedCost: 2800,
    priority: 'Medium',
    notes: 'Inspect and replace air intake element',
  },
  {
    id: uuidv4(),
    title: 'Spark Plugs Inspection / Replacement',
    category: 'Engine',
    intervalKm: 40000,
    intervalMonths: 36,
    lastServiceOdometer: currentOdo,
    lastServiceDate: new Date().toISOString().split('T')[0],
    estimatedCost: 12000,
    priority: 'High',
    notes: 'Laser Iridium long-life spark plugs',
  },
];

export const initialMaintenanceItems: MaintenanceScheduleItem[] = createInitialMaintenanceSchedule(0);

// Optional Sample Demo Data (Only populated if user explicitly clicks "Load Demo Data")
export const sampleDemoGarage: {
  vehicles: VehicleConfig[];
  fuelEntries: FuelEntry[];
  tripEntries: TripEntry[];
} = {
  vehicles: [
    {
      id: 'veh_demo_civic',
      name: 'Civic Turbo Touring',
      make: 'Honda',
      model: 'Civic 1.5T',
      year: 2023,
      licensePlate: 'ABC-7890',
      tankCapacityLitres: 47,
      fullRangeBenchmarkKm: 680,
      currentCumulativeOdometer: 42850,
      fuelType: 'Petrol (95)',
      currency: 'Rs.',
      distanceUnit: 'km',
      volumeUnit: 'L',
      targetEfficiency: 14.5,
      currentFuelPrice: 106.5,
      createdAt: '2026-01-15T08:00:00.000Z',
    },
  ],
  fuelEntries: [
    {
      id: 'fuel_demo_01',
      date: '2026-08-09',
      time: '19:40',
      amountPaid: 4680,
      pricePerLitre: 106.0,
      litresFueled: 44.15,
      currentOdometer: 72,
      afterFuelingOdometer: 685,
      fuelStation: 'Expressway Shell',
      notes: 'Full tank fill-up before highway road trip',
      isFullTank: true,
      createdAt: '2026-08-09T19:40:00.000Z',
    },
    {
      id: 'fuel_demo_02',
      date: '2026-08-21',
      time: '12:10',
      amountPaid: 4600,
      pricePerLitre: 106.5,
      litresFueled: 43.19,
      currentOdometer: 88,
      afterFuelingOdometer: 678,
      fuelStation: 'Expressway Shell',
      notes: 'Smooth idle, tire pressures set to 33 psi',
      isFullTank: true,
      createdAt: '2026-08-21T12:10:00.000Z',
    },
    {
      id: 'fuel_demo_03',
      date: '2026-08-23',
      time: '08:30',
      amountPaid: 2000,
      pricePerLitre: 106.5,
      litresFueled: 18.77,
      currentOdometer: 95,
      afterFuelingOdometer: null,
      fuelStation: 'TotalEnergies Uptown',
      notes: 'Quick partial top-up (pending after-gauge)',
      isFullTank: false,
      createdAt: '2026-08-23T08:30:00.000Z',
    },
  ],
  tripEntries: [
    {
      id: 'trip_demo_01',
      date: '2026-08-20',
      totalOdometer: 42715,
      category: 'Work',
      notes: 'Site inspection commute',
      createdAt: '2026-08-20T20:30:00.000Z',
    },
    {
      id: 'trip_demo_02',
      date: '2026-08-21',
      totalOdometer: 42780,
      category: 'Highway',
      notes: 'Expressway transit',
      createdAt: '2026-08-21T18:00:00.000Z',
    },
    {
      id: 'trip_demo_03',
      date: '2026-08-22',
      totalOdometer: 42850,
      category: 'Errand',
      notes: 'Suburban errands & car wash',
      createdAt: '2026-08-22T21:10:00.000Z',
    },
  ],
};
