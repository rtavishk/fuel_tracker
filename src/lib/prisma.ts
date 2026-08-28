import { PrismaClient } from '@prisma/client';

// Lazy Prisma Client singleton with connection resilience
declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

let prismaClient: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (process.env.NODE_ENV === 'production') {
    if (!prismaClient) {
      prismaClient = new PrismaClient({
        log: ['error', 'warn'],
      });
    }
    return prismaClient;
  }

  // Development environment: Reuse client across HMR / reload cycles
  if (!global.__prismaClient) {
    global.__prismaClient = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  return global.__prismaClient;
}

export const prisma = getPrismaClient();
