import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('YOUR_SUPABASE_PASSWORD') || connectionString.includes('YOUR_PROJECT_REF')) {
    return null;
  }

  if (!prismaInstance) {
    try {
      const pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      const adapter = new PrismaPg(pool);
      prismaInstance = new PrismaClient({
        adapter,
        log: ['error', 'warn'],
      });
    } catch (err) {
      console.warn('Could not initialize PrismaClient with adapter:', err);
      return null;
    }
  }
  return prismaInstance;
}

export const prisma = getPrismaClient();
