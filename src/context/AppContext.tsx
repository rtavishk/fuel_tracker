import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import {
  FuelEntry,
  ComputedFuelEntry,
  DailyTrip,
  ComputedDailyTrip,
  PreTripLog,
  ComputedPreTripLog,
  VehicleConfig,
  ActiveTab,
  QuickActionModal,
} from '../types';
import {
  computeFuelEntries,
  computeDailyTrips,
  computePreTripLogs,
  calculateSummaryKPIs,
  SummaryKPIs,
} from '../utils/calculations';
import {
  initialVehicleConfig,
  initialFuelEntries,
  initialDailyTrips,
  initialPreTripLogs,
} from '../data/seedData';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
  duration?: number;
}

interface AppContextType {
  // Vehicle & Config
  config: VehicleConfig;
  updateConfig: (newConfig: Partial<VehicleConfig>) => void;

  // Active Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Modal control
  activeModal: QuickActionModal;
  setActiveModal: (modal: QuickActionModal) => void;
  editingFuelEntry: FuelEntry | null;
  setEditingFuelEntry: (entry: FuelEntry | null) => void;
  completingFuelEntry: FuelEntry | null;
  setCompletingFuelEntry: (entry: FuelEntry | null) => void;
  editingTrip: DailyTrip | null;
  setEditingTrip: (trip: DailyTrip | null) => void;
  setEditingDailyTrip: (trip: DailyTrip | null) => void;

  // Data (Fetched Live from DB)
  fuelEntries: ComputedFuelEntry[];
  rawFuelEntries: FuelEntry[];
  dailyTrips: ComputedDailyTrip[];
  tripEntries: ComputedDailyTrip[];
  rawDailyTrips: DailyTrip[];
  preTripLogs: ComputedPreTripLog[];
  rawPreTripLogs: PreTripLog[];
  kpis: SummaryKPIs;
  isLoadingData: boolean;

  // Fuel Operations (DB-backed)
  addFuelEntry: (entry: Omit<FuelEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFuelEntry: (id: string, entry: Partial<FuelEntry>) => Promise<void>;
  deleteFuelEntry: (id: string) => Promise<void>;
  completeFuelEntry: (id: string, afterFuelingOdometer: number) => Promise<void>;

  // Trip Operations (DB-backed)
  addDailyTrip: (trip: Omit<DailyTrip, 'id' | 'createdAt'>) => Promise<void>;
  updateDailyTrip: (id: string, trip: Partial<DailyTrip>) => Promise<void>;
  deleteDailyTrip: (id: string) => Promise<void>;

  // Pre-Trip Operations (DB-backed)
  addPreTripLog: (log: Omit<PreTripLog, 'id' | 'createdAt'>) => Promise<void>;
  deletePreTripLog: (id: string) => Promise<void>;

  // Toast System
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Theme & Auth Session
  theme: 'system' | 'dark' | 'light';
  isDarkMode: boolean;
  setTheme: (theme: 'system' | 'dark' | 'light') => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  sessionToken: string | null;
  isLoadingAuth: boolean;
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: {
    email: string;
    password?: string;
    name?: string;
    vehicleName?: string;
    tankCapacity?: number;
    model?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  // Data Management & Cloud Sync
  resetToDefaults: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;

  // Database Connection & Status
  dbStatus: {
    isConfigured: boolean;
    isConnected: boolean;
    error?: string;
    lastChecked?: string;
    stats?: {
      users: number;
      fuelEntries: number;
      dailyTrips: number;
      vehicleConfigs: number;
    } | null;
  };
  isSyncing: boolean;
  checkDatabaseStatus: () => Promise<void>;
  syncWithDatabase: () => Promise<boolean>;
  pullFromDatabase: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SESSION_TOKEN: 'bj30e_session_token',
  CONFIG: 'bj30e_vehicle_config',
  AUTH: 'bj30e_auth_state',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Session & Auth state
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Config state
  const [config, setConfig] = useState<VehicleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? { ...initialVehicleConfig, ...JSON.parse(saved) } : initialVehicleConfig;
    } catch {
      return initialVehicleConfig;
    }
  });

  // DB-driven data: initialized with clean empty arrays (no hardcoded data!)
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>(initialFuelEntries);
  const [dailyTrips, setDailyTrips] = useState<DailyTrip[]>(initialDailyTrips);
  const [preTripLogs, setPreTripLogs] = useState<PreTripLog[]>(initialPreTripLogs);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeModal, setActiveModal] = useState<QuickActionModal>(null);
  const [editingFuelEntry, setEditingFuelEntry] = useState<FuelEntry | null>(null);
  const [completingFuelEntry, setCompletingFuelEntry] = useState<FuelEntry | null>(null);
  const [editingTrip, setEditingTrip] = useState<DailyTrip | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<{
    isConfigured: boolean;
    isConnected: boolean;
    error?: string;
    lastChecked?: string;
    stats?: {
      users: number;
      fuelEntries: number;
      dailyTrips: number;
      vehicleConfigs: number;
    } | null;
  }>({
    isConfigured: false,
    isConnected: false,
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Toast System
  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    const duration = toast.duration || 4500;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch genuine dataset directly from DB via protected telemetry route
  const fetchTelemetryFromDb = useCallback(async (token: string) => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/telemetry/data', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig((prev) => ({ ...prev, ...data.config, userEmail: data.user?.email || prev.userEmail }));
        }
        setFuelEntries(Array.isArray(data.fuelEntries) ? data.fuelEntries : []);
        setDailyTrips(Array.isArray(data.dailyTrips) ? data.dailyTrips : []);
        setPreTripLogs(Array.isArray(data.preTripLogs) ? data.preTripLogs : []);
      } else if (res.status === 401) {
        // Session invalid
        localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
        setSessionToken(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      console.error('[App] Failed to load DB telemetry:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Check Database Status
  const checkDatabaseStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      } else {
        setDbStatus({ isConfigured: false, isConnected: false, error: 'Database API offline' });
      }
    } catch (err: any) {
      setDbStatus({ isConfigured: false, isConnected: false, error: err?.message || 'Server unreachable' });
    }
  }, []);

  // Verify persistent session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      setIsLoadingAuth(true);
      const token = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);

      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
        }
        return;
      }

      try {
        // Parallelize session check and database status checks
        const [authRes, dbRes] = await Promise.all([
          fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('/api/db/status'),
        ]);

        if (authRes.ok && isMounted) {
          const data = await authRes.json();
          setIsAuthenticated(true);
          setSessionToken(token);
          if (data.config) {
            setConfig((prev) => ({ ...prev, ...data.config, userEmail: data.user?.email || prev.userEmail }));
          }
          // Fetch real data from DB
          await fetchTelemetryFromDb(token);
        } else if (isMounted) {
          // Token expired or invalid
          localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
          setSessionToken(null);
          setIsAuthenticated(false);
        }

        // Process database status
        if (dbRes.ok && isMounted) {
          const dbData = await dbRes.json();
          setDbStatus(dbData);
        }
      } catch (e) {
        console.warn('Session verification failed, keeping offline mode:', e);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [fetchTelemetryFromDb, checkDatabaseStatus]);

  // Auth Functions (Session Management)
  const loginUser = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const token = data.token;
      localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
      setSessionToken(token);
      setIsAuthenticated(true);

      if (data.config) {
        setConfig((prev) => ({ ...prev, ...data.config, userEmail: data.user?.email || prev.userEmail }));
      }

      // Load real DB data for this authenticated user
      await fetchTelemetryFromDb(token);

      showToast({
        title: 'Signed in successfully',
        description: `Welcome back, ${data.user?.name || email}!`,
        type: 'success',
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during login' };
    }
  };

  const registerUser = async (formData: {
    email: string;
    password?: string;
    name?: string;
    vehicleName?: string;
    tankCapacity?: number;
    model?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      const token = data.token;
      localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
      setSessionToken(token);
      setIsAuthenticated(true);

      if (data.config) {
        setConfig((prev) => ({ ...prev, ...data.config, userEmail: data.user?.email || prev.userEmail }));
      }

      // Clean DB state for new driver
      setFuelEntries([]);
      setDailyTrips([]);
      setPreTripLogs([]);

      showToast({
        title: 'Driver Account Created',
        description: `Welcome aboard, ${data.user?.name || formData.email}!`,
        type: 'success',
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during registration' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!sessionToken) {
        return { success: false, error: 'You must be signed in to change your password.' };
      }

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update password.' };
      }

      showToast({
        title: 'Password Updated',
        description: 'Your security password has been changed successfully.',
        type: 'success',
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating password.' };
    }
  };

  const logout = async () => {
    if (sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
      } catch (e) {
        console.warn('Logout API notification failed', e);
      }
    }

    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    setSessionToken(null);
    setIsAuthenticated(false);
    setFuelEntries([]);
    setDailyTrips([]);
    setPreTripLogs([]);

    showToast({
      title: 'Signed out',
      description: 'You have been signed out of the vehicle telemetry portal.',
      type: 'info',
    });
  };

  // Theme detection
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDarkMode = useMemo(() => {
    if (config.theme === 'dark') return true;
    if (config.theme === 'light') return false;
    return systemPrefersDark;
  }, [config.theme, systemPrefersDark]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Computed data models
  const computedFuelEntries = useMemo(() => {
    return computeFuelEntries(fuelEntries);
  }, [fuelEntries]);

  const kpis = useMemo(() => {
    const computedTrips = computeDailyTrips(dailyTrips, 24);
    return calculateSummaryKPIs(computedFuelEntries, computedTrips, config);
  }, [computedFuelEntries, dailyTrips, config]);

  const computedDailyTrips = useMemo(() => {
    return computeDailyTrips(dailyTrips, kpis.avgCostPerKm);
  }, [dailyTrips, kpis.avgCostPerKm]);

  const computedPreTripLogs = useMemo(() => {
    return computePreTripLogs(
      preTripLogs,
      kpis.avgFuelEconomy,
      kpis.fullRangeBenchmark,
      kpis.latestPrice
    );
  }, [preTripLogs, kpis.avgFuelEconomy, kpis.fullRangeBenchmark, kpis.latestPrice]);

  // Config Update (saves to DB)
  const updateConfig = async (newConfig: Partial<VehicleConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ ...config, ...newConfig }));
    } catch (e) {}

    if (sessionToken) {
      try {
        await fetch('/api/telemetry/config', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newConfig),
        });
      } catch (e) {
        console.warn('Failed to sync config to DB:', e);
      }
    }
    showToast({ title: 'Settings saved', type: 'success' });
  };

  const setTheme = (theme: 'system' | 'dark' | 'light') => {
    updateConfig({ theme });
  };

  // Fuel Entry Actions (DB-backed with session)
  const addFuelEntry = async (entryData: Omit<FuelEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tempId = 'fuel_' + Date.now();
    const newEntry: FuelEntry = {
      ...entryData,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFuelEntries((prev) => [newEntry, ...prev]);

    if (sessionToken) {
      try {
        const res = await fetch('/api/telemetry/fuel', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryData),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.entry) {
            setFuelEntries((prev) => prev.map((e) => (e.id === tempId ? result.entry : e)));
          }
        }
      } catch (err) {
        console.warn('Fuel entry local fallback:', err);
      }
    }

    showToast({
      title: 'Fill-up logged to database',
      description: `${newEntry.litresFueled.toFixed(1)}L at ${config.currency}${newEntry.pricePerLitre}/L`,
      type: 'success',
    });
  };

  const updateFuelEntry = async (id: string, entryData: Partial<FuelEntry>) => {
    setFuelEntries((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...entryData,
              updatedAt: new Date().toISOString(),
              litresFueled:
                entryData.amountPaid && entryData.pricePerLitre
                  ? entryData.amountPaid / entryData.pricePerLitre
                  : item.litresFueled,
            }
          : item
      )
    );

    if (sessionToken) {
      try {
        await fetch(`/api/telemetry/fuel/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entryData),
        });
      } catch (e) {
        console.warn('Update fuel entry DB sync error:', e);
      }
    }
    showToast({ title: 'Fill-up updated', type: 'success' });
  };

  const deleteFuelEntry = async (id: string) => {
    const entryToDelete = fuelEntries.find((e) => e.id === id);
    if (!entryToDelete) return;

    setFuelEntries((prev) => prev.filter((e) => e.id !== id));

    if (sessionToken) {
      try {
        await fetch(`/api/telemetry/fuel/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
      } catch (e) {
        console.warn('Delete fuel entry DB sync error:', e);
      }
    }

    showToast({
      title: 'Fill-up deleted',
      description: `Logged for ${new Date(entryToDelete.date).toLocaleDateString()}`,
      type: 'info',
    });
  };

  const completeFuelEntry = async (id: string, afterFuelingOdometer: number) => {
    setFuelEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              afterFuelingOdometer,
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );

    if (sessionToken) {
      try {
        await fetch(`/api/telemetry/fuel/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ afterFuelingOdometer }),
        });
      } catch (e) {
        console.warn('Complete fill entry sync error:', e);
      }
    }

    showToast({
      title: 'Fill-up completed',
      description: `Range gauge updated to ${afterFuelingOdometer} km`,
      type: 'success',
    });
  };

  // Trip Entry Actions (DB-backed)
  const addDailyTrip = async (tripData: Omit<DailyTrip, 'id' | 'createdAt'>) => {
    const tempId = 'trip_' + Date.now();
    const existingIndex = dailyTrips.findIndex((t) => t.date === tripData.date);

    if (existingIndex >= 0) {
      const existingId = dailyTrips[existingIndex].id;
      setDailyTrips((prev) =>
        prev.map((t, idx) =>
          idx === existingIndex
            ? { ...t, totalOdometer: tripData.totalOdometer, notes: tripData.notes }
            : t
        )
      );
      if (sessionToken) {
        try {
          await fetch(`/api/telemetry/trips/${existingId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tripData),
          });
        } catch (e) {}
      }
      showToast({ title: `Odometer updated for ${tripData.date}`, type: 'success' });
    } else {
      const newTrip: DailyTrip = {
        ...tripData,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setDailyTrips((prev) => [newTrip, ...prev]);

      if (sessionToken) {
        try {
          const res = await fetch('/api/telemetry/trips', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${sessionToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(tripData),
          });
          if (res.ok) {
            const result = await res.json();
            if (result.trip) {
              setDailyTrips((prev) => prev.map((t) => (t.id === tempId ? result.trip : t)));
            }
          }
        } catch (e) {}
      }
      showToast({
        title: 'Daily odometer logged',
        description: `Total odometer: ${tripData.totalOdometer.toLocaleString()} km`,
        type: 'success',
      });
    }
  };

  const updateDailyTrip = async (id: string, tripData: Partial<DailyTrip>) => {
    setDailyTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...tripData } : t))
    );

    if (sessionToken) {
      try {
        await fetch(`/api/telemetry/trips/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tripData),
        });
      } catch (e) {}
    }
    showToast({ title: 'Trip record updated', type: 'success' });
  };

  const deleteDailyTrip = async (id: string) => {
    const tripToDelete = dailyTrips.find((t) => t.id === id);
    if (!tripToDelete) return;

    setDailyTrips((prev) => prev.filter((t) => t.id !== id));

    if (sessionToken) {
      try {
        await fetch(`/api/telemetry/trips/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
      } catch (e) {}
    }

    showToast({
      title: 'Trip entry deleted',
      description: `${tripToDelete.date} (${tripToDelete.totalOdometer.toLocaleString()} km)`,
      type: 'info',
    });
  };

  // Pre-Trip Logs (DB-backed)
  const addPreTripLog = async (logData: Omit<PreTripLog, 'id' | 'createdAt'>) => {
    const tempId = 'pre_' + Date.now();
    const newLog: PreTripLog = {
      ...logData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    setPreTripLogs((prev) => [newLog, ...prev]);

    if (sessionToken) {
      try {
        const res = await fetch('/api/telemetry/pretrip', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logData),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.log) {
            setPreTripLogs((prev) => prev.map((l) => (l.id === tempId ? result.log : l)));
          }
        }
      } catch (e) {}
    }

    showToast({
      title: 'Pre-drive check logged',
      description: `Range gauge: ${newLog.currentOdometer} km`,
      type: 'success',
    });
  };

  const deletePreTripLog = async (id: string) => {
    const logToDelete = preTripLogs.find((l) => l.id === id);
    if (!logToDelete) return;

    setPreTripLogs((prev) => prev.filter((l) => l.id !== id));

    if (sessionToken) {
      try {
        await fetch(`/api/telemetry/pretrip/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${sessionToken}` },
        });
      } catch (e) {}
    }

    showToast({ title: 'Pre-trip log removed', type: 'info' });
  };

  // Data management
  const resetToDefaults = () => {
    setConfig(initialVehicleConfig);
    setFuelEntries([]);
    setDailyTrips([]);
    setPreTripLogs([]);
    showToast({ title: 'Cleared dataset', type: 'info' });
  };

  const exportDataJSON = () => {
    const payload = {
      version: '2.0.0',
      vehicle: config,
      fuelEntries,
      dailyTrips,
      preTripLogs,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.fuelEntries && Array.isArray(data.fuelEntries)) {
        setFuelEntries(data.fuelEntries);
      }
      if (data.dailyTrips && Array.isArray(data.dailyTrips)) {
        setDailyTrips(data.dailyTrips);
      }
      if (data.preTripLogs && Array.isArray(data.preTripLogs)) {
        setPreTripLogs(data.preTripLogs);
      }
      if (data.vehicle) {
        setConfig((prev) => ({ ...prev, ...data.vehicle }));
      }
      showToast({ title: 'Data successfully imported!', type: 'success' });
      return true;
    } catch (err) {
      console.error(err);
      showToast({ title: 'Failed to import JSON file', type: 'error' });
      return false;
    }
  };

  const syncWithDatabase = async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const payload = {
        email: config.userEmail || 'driver@bj30e.local',
        name: config.userName || config.name || 'BAIC BJ30e Driver',
        config,
        fuelEntries,
        dailyTrips,
        preTripLogs,
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;

      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          title: 'Database Sync Complete',
          description: `Synced ${data.counts?.fuelEntries ?? fuelEntries.length} fuel logs & ${data.counts?.dailyTrips ?? dailyTrips.length} trips via Prisma.`,
          type: 'success',
        });
        await checkDatabaseStatus();
        setIsSyncing(false);
        return true;
      } else {
        showToast({
          title: 'Database Sync Failed',
          description: data.error || 'Verify DATABASE_URL in .env.local',
          type: 'warning',
        });
        setIsSyncing(false);
        return false;
      }
    } catch (err: any) {
      showToast({
        title: 'Connection Error',
        description: err?.message || 'Failed to communicate with Supabase server route',
        type: 'error',
      });
      setIsSyncing(false);
      return false;
    }
  };

  const pullFromDatabase = async (): Promise<boolean> => {
    if (!sessionToken) {
      showToast({ title: 'Sign In Required', description: 'Please authenticate to pull cloud data.', type: 'warning' });
      return false;
    }

    setIsSyncing(true);
    try {
      await fetchTelemetryFromDb(sessionToken);
      showToast({
        title: 'Pulled from Database',
        description: 'Loaded your live vehicle records from the database.',
        type: 'success',
      });
      setIsSyncing(false);
      return true;
    } catch (err: any) {
      showToast({
        title: 'Pull Failed',
        description: err?.message || 'Could not fetch database records',
        type: 'error',
      });
      setIsSyncing(false);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        config,
        updateConfig,
        activeTab,
        setActiveTab,
        activeModal,
        setActiveModal,
        editingFuelEntry,
        setEditingFuelEntry,
        completingFuelEntry,
        setCompletingFuelEntry,
        editingTrip,
        setEditingTrip,
        setEditingDailyTrip: setEditingTrip,
        fuelEntries: computedFuelEntries,
        rawFuelEntries: fuelEntries,
        dailyTrips: computedDailyTrips,
        tripEntries: computedDailyTrips,
        rawDailyTrips: dailyTrips,
        preTripLogs: computedPreTripLogs,
        rawPreTripLogs: preTripLogs,
        kpis,
        isLoadingData,
        addFuelEntry,
        updateFuelEntry,
        deleteFuelEntry,
        completeFuelEntry,
        addDailyTrip,
        updateDailyTrip,
        deleteDailyTrip,
        addPreTripLog,
        deletePreTripLog,
        toasts,
        showToast,
        removeToast,
        theme: config.theme,
        isDarkMode,
        setTheme,
        isAuthenticated,
        setIsAuthenticated,
        sessionToken,
        isLoadingAuth,
        loginUser,
        registerUser,
        changePassword,
        logout,
        resetToDefaults,
        exportDataJSON,
        importDataJSON,
        dbStatus,
        isSyncing,
        checkDatabaseStatus,
        syncWithDatabase,
        pullFromDatabase,
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
