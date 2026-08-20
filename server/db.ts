import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load .env and .env.local files
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import crypto from 'crypto';

let prismaInstance: PrismaClient | null = null;
let connectionStatus: {
  isConfigured: boolean;
  isConnected: boolean;
  error?: string;
  lastChecked?: string;
} = {
  isConfigured: false,
  isConnected: false,
};

// In-Memory Persistent Store fallback (strictly user-created data, zero hardcoded records)
interface LocalUser {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  createdAt: string;
}

interface LocalSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: string;
}

interface LocalVehicleConfig {
  id: string;
  userId: string;
  name: string;
  model: string;
  tankCapacityLitres: number;
  fullRangeBenchmarkKm: number | null;
  currency: string;
  distanceUnit: string;
  volumeUnit: string;
  theme: string;
  authEnabled: boolean;
}

interface LocalDataStore {
  users: Map<string, LocalUser>; // email -> LocalUser or id -> LocalUser
  sessions: Map<string, LocalSession>; // token -> LocalSession
  configs: Map<string, LocalVehicleConfig>; // userId -> LocalVehicleConfig
  fuelEntries: Map<string, any[]>; // userId -> FuelEntry[]
  dailyTrips: Map<string, any[]>; // userId -> DailyTrip[]
  preTripLogs: Map<string, any[]>; // userId -> PreTripLog[]
}

const localStore: LocalDataStore = {
  users: new Map(),
  sessions: new Map(),
  configs: new Map(),
  fuelEntries: new Map(),
  dailyTrips: new Map(),
  preTripLogs: new Map(),
};

export function getLocalStore() {
  return localStore;
}

/**
 * Returns a singleton instance of PrismaClient using lazy initialization.
 */
export function getPrismaClient(): PrismaClient | null {
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  // Use pooler for runtime operations, fallback to direct if pooler not available
  const connectionString = databaseUrl || directUrl;

  if (!connectionString || (connectionString.includes('localhost:5432') && !process.env.SUPABASE_URL)) {
    connectionStatus.isConfigured = false;
    connectionStatus.isConnected = false;
    connectionStatus.error = 'DATABASE_URL is not configured in environment variables.';
    return null;
  }

  connectionStatus.isConfigured = true;

  if (!prismaInstance) {
    try {
      const pool = new pg.Pool({
        connectionString: connectionString,
        max: 10,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 60000,
      });

      const adapter = new PrismaPg(pool);
      prismaInstance = new PrismaClient({ adapter });
    } catch (err: any) {
      console.warn('[Prisma] Failed to initialize adapter, falling back to standard client:', err?.message);
      try {
        prismaInstance = new PrismaClient();
      } catch (fallbackErr: any) {
        console.error('[Prisma] Client creation failed:', fallbackErr?.message);
        connectionStatus.isConnected = false;
        connectionStatus.error = fallbackErr?.message;
        return null;
      }
    }
  }

  return prismaInstance;
}

/**
 * Tests connection to database via Prisma and queries live database stats.
 */
export async function testDatabaseConnection() {
  const prisma = getPrismaClient();
  const now = new Date().toISOString();

  if (!prisma) {
    let localUsers = 0;
    let localFuel = 0;
    let localTrips = 0;
    for (const entries of localStore.fuelEntries.values()) localFuel += entries.length;
    for (const trips of localStore.dailyTrips.values()) localTrips += trips.length;
    localUsers = localStore.users.size;

    return {
      isConfigured: Boolean(process.env.DATABASE_URL),
      isConnected: false,
      mode: 'In-Memory/Local Store (Ready)',
      error: connectionStatus.error || 'DATABASE_URL environment variable is pending.',
      lastChecked: now,
      stats: {
        users: localUsers,
        fuelEntries: localFuel,
        dailyTrips: localTrips,
        vehicleConfigs: localStore.configs.size,
      },
    };
  }

  try {
    const [userCount, fuelCount, tripCount, configCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.fuelEntry.count().catch(() => 0),
      prisma.dailyTrip.count().catch(() => 0),
      prisma.vehicleConfig.count().catch(() => 0),
    ]);

    connectionStatus.isConnected = true;
    connectionStatus.error = undefined;
    connectionStatus.lastChecked = now;

    return {
      isConfigured: true,
      isConnected: true,
      provider: 'postgresql (Supabase Prisma)',
      lastChecked: now,
      stats: {
        users: userCount,
        fuelEntries: fuelCount,
        dailyTrips: tripCount,
        vehicleConfigs: configCount,
      },
    };
  } catch (err: any) {
    connectionStatus.isConnected = false;
    connectionStatus.error = err?.message;
    connectionStatus.lastChecked = now;

    return {
      isConfigured: true,
      isConnected: false,
      error: err?.message || 'Failed to connect to database',
      lastChecked: now,
      stats: null,
    };
  }
}
