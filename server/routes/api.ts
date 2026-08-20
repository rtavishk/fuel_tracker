import express, { Router, Request, Response, NextFunction } from 'express';
import { getPrismaClient, testDatabaseConnection } from '../db.js';
import { GoogleGenAI } from '@google/genai';

export const apiRouter = Router();

// Ensure all API responses are JSON
apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// 1. Database Connection Status
apiRouter.get('/db/status', async (req: Request, res: Response) => {
  try {
    const status = await testDatabaseConnection();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({
      isConfigured: Boolean(process.env.DATABASE_URL),
      isConnected: false,
      error: err?.message,
    });
  }
});

// 2. Full State Pull (Pull remote data from Supabase)
apiRouter.get('/db/pull', async (req: Request, res: Response) => {
  const prisma = getPrismaClient();
  if (!prisma) {
    return res.status(503).json({ error: 'Supabase database is not connected.' });
  }

  const email = (req.query.email as string) || 'driver@bj30e.local';

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        vehicleConfigs: true,
        fuelEntries: { orderBy: { date: 'desc' } },
        dailyTrips: { orderBy: { date: 'desc' } },
        preTripLogs: { orderBy: { date: 'desc' } },
      },
    });

    if (!user) {
      return res.json({ found: false, data: null });
    }

    res.json({
      found: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        config: user.vehicleConfigs[0] || null,
        fuelEntries: user.fuelEntries,
        dailyTrips: user.dailyTrips,
        preTripLogs: user.preTripLogs,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// 3. Full State Push / Sync with Supabase via Prisma
apiRouter.post('/db/sync', async (req: Request, res: Response) => {
  const prisma = getPrismaClient();
  if (!prisma) {
    return res.status(503).json({
      success: false,
      error: 'DATABASE_URL is not configured or Supabase is unreachable.',
    });
  }

  try {
    const { email, name, config, fuelEntries, dailyTrips, preTripLogs } = req.body;
    const userEmail = email || 'driver@bj30e.local';
    const userName = name || 'BAIC BJ30e Driver';

    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: userName },
      create: { email: userEmail, name: userName },
    });

    // 2. Upsert Vehicle Config
    let savedConfig = null;
    if (config) {
      const existingConfig = await prisma.vehicleConfig.findFirst({
        where: { userId: user.id },
      });

      if (existingConfig) {
        savedConfig = await prisma.vehicleConfig.update({
          where: { id: existingConfig.id },
          data: {
            name: config.name || 'BAIC BJ30e',
            model: config.model || 'BJ30e Hybrid Dual-Motor',
            tankCapacityLitres: Number(config.tankCapacityLitres) || 52,
            fullRangeBenchmarkKm: config.fullRangeBenchmarkKm ? Number(config.fullRangeBenchmarkKm) : null,
            currency: config.currency || 'Rs',
            distanceUnit: config.distanceUnit || 'km',
            volumeUnit: config.volumeUnit || 'L',
            theme: config.theme || 'system',
            authEnabled: Boolean(config.authEnabled),
          },
        });
      } else {
        savedConfig = await prisma.vehicleConfig.create({
          data: {
            userId: user.id,
            name: config.name || 'BAIC BJ30e',
            model: config.model || 'BJ30e Hybrid Dual-Motor',
            tankCapacityLitres: Number(config.tankCapacityLitres) || 52,
            fullRangeBenchmarkKm: config.fullRangeBenchmarkKm ? Number(config.fullRangeBenchmarkKm) : null,
            currency: config.currency || 'Rs',
            distanceUnit: config.distanceUnit || 'km',
            volumeUnit: config.volumeUnit || 'L',
            theme: config.theme || 'system',
            authEnabled: Boolean(config.authEnabled),
          },
        });
      }
    }

    const configId = savedConfig?.id;

    // 3. Upsert Fuel Entries
    let syncedFuelCount = 0;
    if (Array.isArray(fuelEntries) && configId) {
      for (const entry of fuelEntries) {
        await prisma.fuelEntry.upsert({
          where: { id: entry.id },
          update: {
            date: new Date(entry.date),
            amountPaid: Number(entry.amountPaid),
            pricePerLitre: Number(entry.pricePerLitre),
            litresFueled: Number(entry.litresFueled),
            currentOdometer: Number(entry.currentOdometer),
            afterFuelingOdometer: entry.afterFuelingOdometer !== null && entry.afterFuelingOdometer !== undefined ? Number(entry.afterFuelingOdometer) : null,
            gasStation: entry.gasStation || null,
            notes: entry.notes || null,
          },
          create: {
            id: entry.id,
            userId: user.id,
            vehicleConfigId: configId,
            date: new Date(entry.date),
            amountPaid: Number(entry.amountPaid),
            pricePerLitre: Number(entry.pricePerLitre),
            litresFueled: Number(entry.litresFueled),
            currentOdometer: Number(entry.currentOdometer),
            afterFuelingOdometer: entry.afterFuelingOdometer !== null && entry.afterFuelingOdometer !== undefined ? Number(entry.afterFuelingOdometer) : null,
            gasStation: entry.gasStation || null,
            notes: entry.notes || null,
          },
        });
        syncedFuelCount++;
      }
    }

    // 4. Upsert Daily Trips
    let syncedTripCount = 0;
    if (Array.isArray(dailyTrips) && configId) {
      for (const trip of dailyTrips) {
        const tripDate = new Date(trip.date);
        await prisma.dailyTrip.upsert({
          where: { id: trip.id },
          update: {
            date: tripDate,
            totalOdometer: Number(trip.totalOdometer),
            notes: trip.notes || null,
          },
          create: {
            id: trip.id,
            userId: user.id,
            vehicleConfigId: configId,
            date: tripDate,
            totalOdometer: Number(trip.totalOdometer),
            notes: trip.notes || null,
          },
        });
        syncedTripCount++;
      }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        fuelEntries: syncedFuelCount,
        dailyTrips: syncedTripCount,
      },
    });
  } catch (err: any) {
    console.error('[Supabase/Prisma] Sync error:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

// 4. Server-Side Gemini AI Audit Proxy
apiRouter.post('/ai/audit', async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY is not configured in server environment.',
    });
  }

  try {
    const { prompt } = req.body;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt || 'Analyze fuel telemetry efficiency.',
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});
