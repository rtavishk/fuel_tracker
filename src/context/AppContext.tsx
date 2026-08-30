import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  VehicleConfig,
  FuelPriceRecord,
  FuelEntry,
  ComputedFuelEntry,
  TripEntry,
  ComputedTripEntry,
  PreTripEntry,
  ComputedPreTripEntry,
  MaintenanceScheduleItem,
  MaintenanceStatusItem,
  ActiveTab,
  CalculatorSubTab,
} from '../types';
import {
  createDefaultVehicle,
  createInitialMaintenanceSchedule,
  initialFuelPriceHistory,
  sampleDemoGarage,
} from '../data/initialData';
import {
  computeFuelEntries,
  getAggregatedFuelStats,
  computeTripEntries,
  computePreTripEntries,
  computeMaintenanceStatus,
  getFullRangeBenchmark,
} from '../utils/calculations';
import { api } from '../lib/api';

interface AppContextType {
  // Auth State & User Profile
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string, id?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  enterGuestMode: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;

  // Modals Management
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isFuelPriceModalOpen: boolean;
  setIsFuelPriceModalOpen: (open: boolean) => void;
  isAddFuelModalOpen: boolean;
  setIsAddFuelModalOpen: (open: boolean) => void;
  isAddTripModalOpen: boolean;
  setIsAddTripModalOpen: (open: boolean) => void;

  // Active Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  calculatorTab: CalculatorSubTab;
  setCalculatorTab: (tab: CalculatorSubTab) => void;

  // Garage & Vehicle Configurations (Any car support)
  vehicles: VehicleConfig[];
  activeVehicleId: string;
  vehicleConfig: VehicleConfig;
  switchVehicle: (id: string) => void;
  addVehicle: (config: Omit<VehicleConfig, 'id'>) => string;
  updateVehicleConfig: (config: Partial<VehicleConfig>) => void;
  deleteVehicle: (id: string) => void;
  fullRangeBenchmark: number;

  // Dynamic Fuel Price Management
  currentFuelPrice: number;
  fuelPriceHistory: FuelPriceRecord[];
  updateFuelPrice: (price: number, notes?: string, date?: string) => void;
  deleteFuelPriceRecord: (id: string) => void;

  // Fuel Log & Stats
  fuelEntries: FuelEntry[];
  computedFuelEntries: ComputedFuelEntry[];
  fuelStats: ReturnType<typeof getAggregatedFuelStats>;
  addFuelEntry: (entry: Omit<FuelEntry, 'id' | 'createdAt' | 'litresFueled'>) => void;
  updateFuelEntry: (id: string, entry: Partial<FuelEntry>) => void;
  deleteFuelEntry: (id: string) => void;

  // Daily Trip Log
  tripEntries: TripEntry[];
  computedTripEntries: ComputedTripEntry[];
  addTripEntry: (entry: Omit<TripEntry, 'id' | 'createdAt'>) => void;
  updateTripEntry: (id: string, entry: Partial<TripEntry>) => void;
  deleteTripEntry: (id: string) => void;

  // Pre-Trip Log
  preTripEntries: PreTripEntry[];
  computedPreTripEntries: ComputedPreTripEntry[];
  addPreTripEntry: (entry: Omit<PreTripEntry, 'id' | 'createdAt'>) => void;
  deletePreTripEntry: (id: string) => void;

  // Maintenance Schedules
  maintenanceItems: MaintenanceScheduleItem[];
  computedMaintenance: MaintenanceStatusItem[];
  addMaintenanceItem: (item: Omit<MaintenanceScheduleItem, 'id'>) => void;
  updateMaintenanceItem: (id: string, item: Partial<MaintenanceScheduleItem>) => void;
  deleteMaintenanceItem: (id: string) => void;
  markMaintenanceServiced: (id: string, serviceOdometer: number) => void;

  // Cloud & Sync Status
  iCloudSyncEnabled: boolean;
  setICloudSyncEnabled: (enabled: boolean) => void;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  triggerManualSync: () => void;

  // Clear & Reset Data
  clearVehicleData: () => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'fuel_tracker_user',
  VEHICLES_LIST: 'fuel_tracker_vehicles_list',
  ACTIVE_VEHICLE_ID: 'fuel_tracker_active_vehicle_id',
  FUEL_PRICE_HISTORY: 'fuel_tracker_price_history',
  CURRENT_FUEL_PRICE: 'fuel_tracker_current_price',
  FUEL: 'fuel_tracker_fuel_entries',
  TRIPS: 'fuel_tracker_trips',
  PRETRIP: 'fuel_tracker_pretrip',
  MAINTENANCE: 'fuel_tracker_maintenance',
  ICLOUD_SYNC: 'fuel_tracker_icloud_sync',
};

const defaultVehicle = createDefaultVehicle();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User Authentication & Profile (Null by default for unauthenticated landing)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // 2. Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFuelPriceModalOpen, setIsFuelPriceModalOpen] = useState(false);
  const [isAddFuelModalOpen, setIsAddFuelModalOpen] = useState(false);
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);

  // 3. Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [calculatorTab, setCalculatorTab] = useState<CalculatorSubTab>('how-far');

  // 4. Vehicles & Garage Management
  const [vehicles, setVehicles] = useState<VehicleConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES_LIST);
      return saved ? JSON.parse(saved) : [defaultVehicle];
    } catch {
      return [defaultVehicle];
    }
  });

  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE_ID);
      return saved || defaultVehicle.id;
    } catch {
      return defaultVehicle.id;
    }
  });

  const activeVehicle = useMemo(() => {
    const found = vehicles.find((v) => v.id === activeVehicleId);
    return found || vehicles[0] || defaultVehicle;
  }, [vehicles, activeVehicleId]);

  // 5. Dynamic Fuel Price State & History
  const [fuelPriceHistory, setFuelPriceHistory] = useState<FuelPriceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FUEL_PRICE_HISTORY);
      return saved ? JSON.parse(saved) : initialFuelPriceHistory;
    } catch {
      return initialFuelPriceHistory;
    }
  });

  const [currentFuelPrice, setCurrentFuelPrice] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_FUEL_PRICE);
      if (saved) return parseFloat(saved);
      return activeVehicle.currentFuelPrice || 106.5;
    } catch {
      return 106.5;
    }
  });

  // 6. Clean Fuel Entries (Zero hardcoded records for real users)
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FUEL);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 7. Clean Trip Entries
  const [tripEntries, setTripEntries] = useState<TripEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 8. Pre-Trip Entries
  const [preTripEntries, setPreTripEntries] = useState<PreTripEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRETRIP);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 9. Maintenance Items
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
      return saved ? JSON.parse(saved) : createInitialMaintenanceSchedule(0);
    } catch {
      return createInitialMaintenanceSchedule(0);
    }
  });

  // 10. Sync State
  const [iCloudSyncEnabled, setICloudSyncEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ICLOUD_SYNC);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(new Date().toISOString());

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES_LIST, JSON.stringify(vehicles));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE_ID, activeVehicleId);
      localStorage.setItem(STORAGE_KEYS.FUEL_PRICE_HISTORY, JSON.stringify(fuelPriceHistory));
      localStorage.setItem(STORAGE_KEYS.CURRENT_FUEL_PRICE, currentFuelPrice.toString());
      localStorage.setItem(STORAGE_KEYS.FUEL, JSON.stringify(fuelEntries));
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(tripEntries));
      localStorage.setItem(STORAGE_KEYS.PRETRIP, JSON.stringify(preTripEntries));
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(maintenanceItems));
      localStorage.setItem(STORAGE_KEYS.ICLOUD_SYNC, JSON.stringify(iCloudSyncEnabled));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [
    vehicles,
    activeVehicleId,
    fuelPriceHistory,
    currentFuelPrice,
    fuelEntries,
    tripEntries,
    preTripEntries,
    maintenanceItems,
    iCloudSyncEnabled,
  ]);

  // 11. Load and synchronize live data from Database
  useEffect(() => {
    let isMounted = true;
    async function loadDbData() {
      if (!user) return;
      try {
        setIsSyncing(true);
        const dbVehicles = await api.getVehicles();
        if (isMounted && dbVehicles && dbVehicles.length > 0) {
          setVehicles(dbVehicles);
          const currentValid = dbVehicles.some((v) => v.id === activeVehicleId);
          const currentId = currentValid ? activeVehicleId : dbVehicles[0].id;
          if (!currentValid) {
            setActiveVehicleId(currentId);
          }

          // Set fuel price from the active vehicle's data
          const activeVehicleData = dbVehicles.find((v) => v.id === currentId);
          if (activeVehicleData && activeVehicleData.currentFuelPrice) {
            setCurrentFuelPrice(activeVehicleData.currentFuelPrice);
          }

          const [dbFuel, dbTrips, dbMaint] = await Promise.all([
            api.getFuelEntries(currentId),
            api.getTripEntries(currentId),
            api.getMaintenance(currentId),
          ]);

          if (isMounted) {
            if (dbFuel) setFuelEntries(dbFuel);
            if (dbTrips) setTripEntries(dbTrips);
            if (dbMaint && dbMaint.length > 0) setMaintenanceItems(dbMaint);
            setLastSyncedAt(new Date().toISOString());
          }
        }
      } catch (err) {
        console.warn('Initial DB sync fetch error:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    loadDbData();
    return () => {
      isMounted = false;
    };
  }, [user?.id, activeVehicleId]);

  // Derived Full Range Benchmark
  const fullRangeBenchmark = useMemo(() => {
    return getFullRangeBenchmark(activeVehicle, fuelEntries);
  }, [activeVehicle, fuelEntries]);

  // Effective Baseline Economy for fallback
  const effectiveBaselineEconomy = activeVehicle.targetEfficiency || user?.targetEfficiency || 14.5;

  // Computed Fuel Entries
  const computedFuelEntries = useMemo(() => {
    return computeFuelEntries(fuelEntries, effectiveBaselineEconomy);
  }, [fuelEntries, effectiveBaselineEconomy]);

  // Aggregated Fuel Stats
  const fuelStats = useMemo(() => {
    return getAggregatedFuelStats(computedFuelEntries, currentFuelPrice, effectiveBaselineEconomy);
  }, [computedFuelEntries, currentFuelPrice, effectiveBaselineEconomy]);

  // Computed Trip Entries
  const computedTripEntries = useMemo(() => {
    return computeTripEntries(tripEntries, fuelStats.avgCostPerKm);
  }, [tripEntries, fuelStats.avgCostPerKm]);

  // Update vehicle's current cumulative odometer from latest trip entry
  useEffect(() => {
    if (computedTripEntries.length > 0) {
      const highestOdo = Math.max(...computedTripEntries.map((t) => t.totalOdometer));
      if (highestOdo > activeVehicle.currentCumulativeOdometer) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === activeVehicleId ? { ...v, currentCumulativeOdometer: highestOdo } : v))
        );
      }
    }
  }, [computedTripEntries, activeVehicle.currentCumulativeOdometer, activeVehicleId]);

  // Computed Pre-Trip Entries
  const computedPreTripEntries = useMemo(() => {
    return computePreTripEntries(
      preTripEntries,
      fuelStats.avgEconomy,
      fullRangeBenchmark,
      currentFuelPrice
    );
  }, [preTripEntries, fuelStats.avgEconomy, fullRangeBenchmark, currentFuelPrice]);

  // Computed Maintenance Schedules
  const computedMaintenance = useMemo(() => {
    return computeMaintenanceStatus(maintenanceItems, activeVehicle.currentCumulativeOdometer);
  }, [maintenanceItems, activeVehicle.currentCumulativeOdometer]);

  // Realtime Cloud Sync
  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedAt(new Date().toISOString());
    }, 400);
  };

  // User Profile Methods
  const updateUserProfile = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    triggerManualSync();
  };

  const changePassword = async (
    _oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!newPass || newPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }
    triggerManualSync();
    return { success: true };
  };

  // Auth Methods
  const login = async (email: string, name?: string, id?: string): Promise<boolean> => {
    try {
      const newUser: User = {
        id: id || uuidv4(),
        email,
        name: name || email.split('@')[0] || 'Vehicle Driver',
        avatar: 'speedometer',
        targetEfficiency: 14.5,
        preferredCurrency: 'Rs.',
        createdAt: new Date().toISOString(),
        isDemoUser: false,
      };
      setUser(newUser);
      triggerManualSync();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password?: string): Promise<boolean> => {
    try {
      // Try to register via API first
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password: password || 'default_password',
          name 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          avatar: 'speedometer',
          targetEfficiency: 14.5,
          preferredCurrency: 'Rs.',
          createdAt: new Date().toISOString(),
          isDemoUser: false,
        };
        setUser(newUser);
        
        // Store token if provided
        if (data.token) {
          localStorage.setItem('fuel_tracker_token', data.token);
        }
        
        triggerManualSync();
        return true;
      }
    } catch (error) {
      console.warn('API registration failed, using local fallback:', error);
    }

    // Fallback to local state
    try {
      const newUser: User = {
        id: uuidv4(),
        email,
        name,
        avatar: 'speedometer',
        targetEfficiency: 14.5,
        preferredCurrency: 'Rs.',
        createdAt: new Date().toISOString(),
        isDemoUser: false,
      };
      setUser(newUser);
      triggerManualSync();
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('fuel_tracker_token');
  };

  const enterGuestMode = () => {
    const guestUser: User = {
      id: uuidv4(),
      email: 'guest@fueltracker.app',
      name: 'Guest Driver',
      avatar: 'speedometer',
      createdAt: new Date().toISOString(),
      isDemoUser: true,
      targetEfficiency: 14.5,
      preferredCurrency: 'Rs.',
    };
    setUser(guestUser);
    setFuelEntries([]);
    setTripEntries([]);
    setPreTripEntries([]);
    triggerManualSync();
  };

  // Garage & Vehicle Actions
  const switchVehicle = (id: string) => {
    setActiveVehicleId(id);
    const target = vehicles.find((v) => v.id === id);
    if (target && target.currentFuelPrice) {
      setCurrentFuelPrice(target.currentFuelPrice);
    }
    triggerManualSync();
  };

  const addVehicle = (config: Omit<VehicleConfig, 'id'>): string => {
    const newId = uuidv4();
    const newVehicle: VehicleConfig = {
      ...config,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setVehicles((prev) => [...prev, newVehicle]);
    setActiveVehicleId(newId);
    if (config.currentFuelPrice) {
      setCurrentFuelPrice(config.currentFuelPrice);
    }
    // Update maintenance schedules with initial service baseline
    setMaintenanceItems(createInitialMaintenanceSchedule(config.currentCumulativeOdometer || 0));
    triggerManualSync();
    return newId;
  };

  const updateVehicleConfig = (newConfig: Partial<VehicleConfig>) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === activeVehicleId) {
          return { ...v, ...newConfig };
        }
        return v;
      })
    );
    if (newConfig.currentFuelPrice !== undefined) {
      setCurrentFuelPrice(newConfig.currentFuelPrice);
    }
    
    // Persist to database
    api.updateVehicle(activeVehicleId, newConfig);
    
    triggerManualSync();
  };

  const deleteVehicle = (id: string) => {
    if (vehicles.length <= 1) return;
    const remaining = vehicles.filter((v) => v.id !== id);
    setVehicles(remaining);
    setActiveVehicleId(remaining[0].id);
    triggerManualSync();
  };

  // Fuel Price Actions
  const updateFuelPrice = (price: number, notes?: string, date?: string) => {
    const recordDate = date || new Date().toISOString().split('T')[0];
    const newRecord: FuelPriceRecord = {
      id: uuidv4(),
      date: recordDate,
      price,
      fuelType: activeVehicle.fuelType || 'Petrol (95)',
      notes: notes || 'Updated via price manager',
      isCurrentActive: true,
    };
    setFuelPriceHistory((prev) => [
      newRecord,
      ...prev.map((r) => ({ ...r, isCurrentActive: false })),
    ]);
    setCurrentFuelPrice(price);
    updateVehicleConfig({ currentFuelPrice: price });
    triggerManualSync();
  };

  const deleteFuelPriceRecord = (id: string) => {
    setFuelPriceHistory((prev) => prev.filter((p) => p.id !== id));
    triggerManualSync();
  };

  // Fuel Log Actions
  const addFuelEntry = (entryData: Omit<FuelEntry, 'id' | 'createdAt' | 'litresFueled'>) => {
    const calculatedLitres = parseFloat((entryData.amountPaid / entryData.pricePerLitre).toFixed(2));
    const newEntry: FuelEntry = {
      ...entryData,
      id: uuidv4(),
      litresFueled: calculatedLitres,
      createdAt: new Date().toISOString(),
    };
    setFuelEntries((prev) => [newEntry, ...prev]);

    // Update fuel price history if different
    if (entryData.pricePerLitre !== currentFuelPrice) {
      updateFuelPrice(
        entryData.pricePerLitre,
        `Recorded at ${entryData.fuelStation || 'Station'}`,
        entryData.date
      );
    }

    // Async server persistence call
    api.createFuelEntry({
      vehicleId: activeVehicleId,
      ...newEntry,
    });

    triggerManualSync();
  };

  const updateFuelEntry = (id: string, entryData: Partial<FuelEntry>) => {
    setFuelEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const updated = { ...entry, ...entryData };
        if (entryData.amountPaid && entryData.pricePerLitre) {
          updated.litresFueled = parseFloat(
            (entryData.amountPaid / entryData.pricePerLitre).toFixed(2)
          );
        }
        return updated;
      })
    );
    triggerManualSync();
  };

  const deleteFuelEntry = (id: string) => {
    setFuelEntries((prev) => prev.filter((entry) => entry.id !== id));
    api.deleteFuelEntry(id);
    triggerManualSync();
  };

  // Daily Trip Actions
  const addTripEntry = (entryData: Omit<TripEntry, 'id' | 'createdAt'>) => {
    const newEntry: TripEntry = {
      ...entryData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setTripEntries((prev) => {
      const filtered = prev.filter((t) => t.date !== entryData.date);
      return [...filtered, newEntry].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    if (entryData.totalOdometer > activeVehicle.currentCumulativeOdometer) {
      updateVehicleConfig({ currentCumulativeOdometer: entryData.totalOdometer });
    }

    api.createTripEntry({
      vehicleId: activeVehicleId,
      ...newEntry,
    });

    triggerManualSync();
  };

  const updateTripEntry = (id: string, entryData: Partial<TripEntry>) => {
    setTripEntries((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...entryData } : t)).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    );
    triggerManualSync();
  };

  const deleteTripEntry = (id: string) => {
    setTripEntries((prev) => prev.filter((t) => t.id !== id));
    api.deleteTripEntry(id);
    triggerManualSync();
  };

  // Pre-Trip Actions
  const addPreTripEntry = (entryData: Omit<PreTripEntry, 'id' | 'createdAt'>) => {
    const newEntry: PreTripEntry = {
      ...entryData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setPreTripEntries((prev) => [newEntry, ...prev]);
    triggerManualSync();
  };

  const deletePreTripEntry = (id: string) => {
    setPreTripEntries((prev) => prev.filter((pt) => pt.id !== id));
    triggerManualSync();
  };

  // Maintenance Actions
  const addMaintenanceItem = (itemData: Omit<MaintenanceScheduleItem, 'id'>) => {
    const newItem: MaintenanceScheduleItem = {
      ...itemData,
      id: uuidv4(),
    };
    setMaintenanceItems((prev) => [...prev, newItem]);
    triggerManualSync();
  };

  const updateMaintenanceItem = (id: string, itemData: Partial<MaintenanceScheduleItem>) => {
    setMaintenanceItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...itemData } : m))
    );
    triggerManualSync();
  };

  const deleteMaintenanceItem = (id: string) => {
    setMaintenanceItems((prev) => prev.filter((m) => m.id !== id));
    triggerManualSync();
  };

  const markMaintenanceServiced = (id: string, serviceOdometer: number) => {
    setMaintenanceItems((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          lastServiceOdometer: serviceOdometer,
          lastServiceDate: new Date().toISOString().split('T')[0],
        };
      })
    );
    triggerManualSync();
  };

  // Clear data for current car (to start completely fresh)
  const clearVehicleData = () => {
    setFuelEntries([]);
    setTripEntries([]);
    setPreTripEntries([]);
    triggerManualSync();
  };

  // Reset to sample demo garage
  const resetToDemoData = () => {
    setUser({
      id: 'usr_demo',
      email: 'demo@fueltracker.app',
      name: 'Demo Driver',
      avatar: 'speedometer',
      createdAt: new Date().toISOString(),
      isDemoUser: true,
      targetEfficiency: 14.5,
      preferredCurrency: 'Rs.',
    });
    setVehicles(sampleDemoGarage.vehicles);
    setActiveVehicleId(sampleDemoGarage.vehicles[0].id);
    setCurrentFuelPrice(106.5);
    setFuelPriceHistory(initialFuelPriceHistory);
    setFuelEntries(sampleDemoGarage.fuelEntries);
    setTripEntries(sampleDemoGarage.tripEntries);
    setPreTripEntries([]);
    setMaintenanceItems(createInitialMaintenanceSchedule(42850));
    triggerManualSync();
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!(user && user.email),
        login,
        register,
        logout,
        enterGuestMode,
        updateUserProfile,
        changePassword,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isFuelPriceModalOpen,
        setIsFuelPriceModalOpen,
        isAddFuelModalOpen,
        setIsAddFuelModalOpen,
        isAddTripModalOpen,
        setIsAddTripModalOpen,
        activeTab,
        setActiveTab,
        calculatorTab,
        setCalculatorTab,
        vehicles,
        activeVehicleId,
        vehicleConfig: activeVehicle,
        switchVehicle,
        addVehicle,
        updateVehicleConfig,
        deleteVehicle,
        fullRangeBenchmark,
        currentFuelPrice,
        fuelPriceHistory,
        updateFuelPrice,
        deleteFuelPriceRecord,
        fuelEntries,
        computedFuelEntries,
        fuelStats,
        addFuelEntry,
        updateFuelEntry,
        deleteFuelEntry,
        tripEntries,
        computedTripEntries,
        addTripEntry,
        updateTripEntry,
        deleteTripEntry,
        preTripEntries,
        computedPreTripEntries,
        addPreTripEntry,
        deletePreTripEntry,
        maintenanceItems,
        computedMaintenance,
        addMaintenanceItem,
        updateMaintenanceItem,
        deleteMaintenanceItem,
        markMaintenanceServiced,
        iCloudSyncEnabled,
        setICloudSyncEnabled,
        isSyncing,
        lastSyncedAt,
        triggerManualSync,
        clearVehicleData,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
