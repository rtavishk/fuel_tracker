import { Router, Response, NextFunction } from 'express';
import { getPrismaClient, getLocalStore } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const telemetryRouter = Router();

// Apply authMiddleware to all telemetry routes
telemetryRouter.use(authMiddleware);

// Ensure all telemetry responses are JSON (after auth)
telemetryRouter.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

/**
 * 1. Fetch Complete Live Telemetry Data from DB for Authenticated User
 * Returns ONLY genuine database records (Empty array if new user)
 */
telemetryRouter.get('/data', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const prisma = getPrismaClient();

  if (prisma) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          vehicleConfigs: true,
          fuelEntries: { orderBy: { date: 'desc' } },
          dailyTrips: { orderBy: { date: 'desc' } },
          preTripLogs: { orderBy: { date: 'desc' } },
        },
      });

      if (user) {
        return res.json({
          user: { id: user.id, email: user.email, name: user.name },
          config: user.vehicleConfigs[0] || null,
          fuelEntries: user.fuelEntries.map((f) => ({
            ...f,
            date: f.date.toISOString(),
            createdAt: f.createdAt.toISOString(),
            updatedAt: f.updatedAt.toISOString(),
          })),
          dailyTrips: user.dailyTrips.map((t) => ({
            ...t,
            date: typeof t.date === 'string' ? t.date : t.date.toISOString().split('T')[0],
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
          })),
          preTripLogs: user.preTripLogs.map((p) => ({
            ...p,
            date: p.date.toISOString(),
            createdAt: p.createdAt.toISOString(),
          })),
        });
      }
    } catch (err: any) {
      console.warn('[Telemetry /data] Prisma fallback:', err?.message);
    }
  }

  // Fallback to local store
  const localStore = getLocalStore();
  const config = localStore.configs.get(userId) || null;
  const fuelEntries = localStore.fuelEntries.get(userId) || [];
  const dailyTrips = localStore.dailyTrips.get(userId) || [];
  const preTripLogs = localStore.preTripLogs.get(userId) || [];

  return res.json({
    user: req.user,
    config,
    fuelEntries,
    dailyTrips,
    preTripLogs,
  });
});

/**
 * 2. Fuel Log CRUD
 */
telemetryRouter.post('/fuel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      id,
      date,
      amountPaid,
      pricePerLitre,
      litresFueled,
      currentOdometer,
      afterFuelingOdometer,
      gasStation,
      station,
      notes,
    } = req.body;

    const prisma = getPrismaClient();
    const entryId = id || 'fuel_' + Date.now();
    const entryDate = date ? new Date(date) : new Date();

    if (prisma) {
      try {
        let userConfig = await prisma.vehicleConfig.findFirst({ where: { userId } });
        if (!userConfig) {
          userConfig = await prisma.vehicleConfig.create({
            data: { userId, name: 'BAIC BJ30e' },
          });
        }

        const saved = await prisma.fuelEntry.create({
          data: {
            id: entryId,
            userId,
            vehicleConfigId: userConfig.id,
            date: entryDate,
            amountPaid: Number(amountPaid) || 0,
            pricePerLitre: Number(pricePerLitre) || 0,
            litresFueled: Number(litresFueled) || 0,
            currentOdometer: Number(currentOdometer) || 0,
            afterFuelingOdometer: afterFuelingOdometer !== null && afterFuelingOdometer !== undefined ? Number(afterFuelingOdometer) : null,
            gasStation: gasStation || station || null,
            notes: notes || null,
          },
        });

        return res.status(201).json({
          success: true,
          entry: {
            ...saved,
            date: saved.date.toISOString(),
            createdAt: saved.createdAt.toISOString(),
            updatedAt: saved.updatedAt.toISOString(),
          },
        });
      } catch (prismaErr: any) {
        console.warn('[Telemetry POST fuel] Prisma fallback:', prismaErr?.message);
      }
    }

    // Local fallback
    const localStore = getLocalStore();
    const entries = localStore.fuelEntries.get(userId) || [];
    const newEntry = {
      id: entryId,
      date: entryDate.toISOString(),
      amountPaid: Number(amountPaid) || 0,
      pricePerLitre: Number(pricePerLitre) || 0,
      litresFueled: Number(litresFueled) || 0,
      currentOdometer: Number(currentOdometer) || 0,
      afterFuelingOdometer: afterFuelingOdometer !== null && afterFuelingOdometer !== undefined ? Number(afterFuelingOdometer) : null,
      gasStation: gasStation || station || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    entries.unshift(newEntry);
    localStore.fuelEntries.set(userId, entries);

    return res.status(201).json({ success: true, entry: newEntry });
  } catch (err: any) {
    console.error('[Telemetry POST fuel Error]:', err);
    res.status(500).json({ error: err?.message || 'Failed to save fuel entry' });
  }
});

telemetryRouter.put('/fuel/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        const updated = await prisma.fuelEntry.update({
          where: { id },
          data: {
            ...(updateData.date && { date: new Date(updateData.date) }),
            ...(updateData.amountPaid !== undefined && { amountPaid: Number(updateData.amountPaid) }),
            ...(updateData.pricePerLitre !== undefined && { pricePerLitre: Number(updateData.pricePerLitre) }),
            ...(updateData.litresFueled !== undefined && { litresFueled: Number(updateData.litresFueled) }),
            ...(updateData.currentOdometer !== undefined && { currentOdometer: Number(updateData.currentOdometer) }),
            ...(updateData.afterFuelingOdometer !== undefined && {
              afterFuelingOdometer: updateData.afterFuelingOdometer !== null ? Number(updateData.afterFuelingOdometer) : null,
            }),
            ...(updateData.gasStation !== undefined && { gasStation: updateData.gasStation || null }),
            ...(updateData.station !== undefined && { gasStation: updateData.station || null }),
            ...(updateData.notes !== undefined && { notes: updateData.notes || null }),
          },
        });

        return res.json({
          success: true,
          entry: {
            ...updated,
            date: updated.date.toISOString(),
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          },
        });
      } catch (prismaErr: any) {
        console.warn('[Telemetry PUT fuel] Prisma fallback:', prismaErr?.message);
      }
    }

    // Local fallback
    const localStore = getLocalStore();
    const entries = localStore.fuelEntries.get(userId) || [];
    const index = entries.findIndex((e) => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updateData, updatedAt: new Date().toISOString() };
      localStore.fuelEntries.set(userId, entries);
      return res.json({ success: true, entry: entries[index] });
    }

    res.status(404).json({ error: 'Fuel entry not found' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update fuel entry' });
  }
});

telemetryRouter.delete('/fuel/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        await prisma.fuelEntry.delete({ where: { id } });
        return res.json({ success: true, message: 'Deleted successfully' });
      } catch (prismaErr: any) {
        console.warn('[Telemetry DELETE fuel] Prisma fallback:', prismaErr?.message);
      }
    }

    const localStore = getLocalStore();
    const entries = localStore.fuelEntries.get(userId) || [];
    localStore.fuelEntries.set(userId, entries.filter((e) => e.id !== id));

    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete fuel entry' });
  }
});

/**
 * 3. Daily Trips CRUD
 */
telemetryRouter.post('/trips', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id, date, totalOdometer, notes } = req.body;

    const prisma = getPrismaClient();
    const tripId = id || 'trip_' + Date.now();
    const tripDate = date ? new Date(date) : new Date();

    if (prisma) {
      try {
        let userConfig = await prisma.vehicleConfig.findFirst({ where: { userId } });
        if (!userConfig) {
          userConfig = await prisma.vehicleConfig.create({
            data: { userId, name: 'BAIC BJ30e' },
          });
        }

        const saved = await prisma.dailyTrip.create({
          data: {
            id: tripId,
            userId,
            vehicleConfigId: userConfig.id,
            date: tripDate,
            totalOdometer: Number(totalOdometer) || 0,
            notes: notes || null,
          },
        });

        return res.status(201).json({
          success: true,
          trip: {
            ...saved,
            date: saved.date.toISOString().split('T')[0],
            createdAt: saved.createdAt.toISOString(),
            updatedAt: saved.updatedAt.toISOString(),
          },
        });
      } catch (prismaErr: any) {
        console.warn('[Telemetry POST trip] Prisma fallback:', prismaErr?.message);
      }
    }

    const localStore = getLocalStore();
    const trips = localStore.dailyTrips.get(userId) || [];
    const newTrip = {
      id: tripId,
      date: typeof date === 'string' ? date : tripDate.toISOString().split('T')[0],
      totalOdometer: Number(totalOdometer) || 0,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    trips.unshift(newTrip);
    localStore.dailyTrips.set(userId, trips);

    return res.status(201).json({ success: true, trip: newTrip });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save daily trip' });
  }
});

telemetryRouter.put('/trips/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { date, totalOdometer, notes } = req.body;

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        const updated = await prisma.dailyTrip.update({
          where: { id },
          data: {
            ...(date && { date: new Date(date) }),
            ...(totalOdometer !== undefined && { totalOdometer: Number(totalOdometer) }),
            ...(notes !== undefined && { notes: notes || null }),
          },
        });

        return res.json({
          success: true,
          trip: {
            ...updated,
            date: updated.date.toISOString().split('T')[0],
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          },
        });
      } catch (prismaErr: any) {
        console.warn('[Telemetry PUT trip] Prisma fallback:', prismaErr?.message);
      }
    }

    const localStore = getLocalStore();
    const trips = localStore.dailyTrips.get(userId) || [];
    const index = trips.findIndex((t) => t.id === id);
    if (index !== -1) {
      trips[index] = {
        ...trips[index],
        ...(date && { date }),
        ...(totalOdometer !== undefined && { totalOdometer: Number(totalOdometer) }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date().toISOString(),
      };
      localStore.dailyTrips.set(userId, trips);
      return res.json({ success: true, trip: trips[index] });
    }

    res.status(404).json({ error: 'Daily trip not found' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update trip' });
  }
});

telemetryRouter.delete('/trips/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        await prisma.dailyTrip.delete({ where: { id } });
        return res.json({ success: true, message: 'Trip deleted' });
      } catch (prismaErr: any) {
        console.warn('[Telemetry DELETE trip] Prisma fallback:', prismaErr?.message);
      }
    }

    const localStore = getLocalStore();
    const trips = localStore.dailyTrips.get(userId) || [];
    localStore.dailyTrips.set(userId, trips.filter((t) => t.id !== id));

    return res.json({ success: true, message: 'Trip deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete trip' });
  }
});

/**
 * 4. Pre-Trip Logs CRUD
 */
telemetryRouter.post('/pretrip', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id, date, currentOdometer, notes } = req.body;

    const prisma = getPrismaClient();
    const logId = id || 'pre_' + Date.now();
    const logDate = date ? new Date(date) : new Date();

    if (prisma) {
      try {
        let userConfig = await prisma.vehicleConfig.findFirst({ where: { userId } });
        if (!userConfig) {
          userConfig = await prisma.vehicleConfig.create({
            data: { userId, name: 'BAIC BJ30e' },
          });
        }

        const saved = await prisma.preTripLog.create({
          data: {
            id: logId,
            userId,
            vehicleConfigId: userConfig.id,
            date: logDate,
            currentOdometer: Number(currentOdometer) || 0,
            notes: notes || null,
          },
        });

        return res.status(201).json({
          success: true,
          log: {
            ...saved,
            date: saved.date.toISOString(),
            createdAt: saved.createdAt.toISOString(),
          },
        });
      } catch (prismaErr: any) {
        console.warn('[Telemetry POST pretrip] Prisma fallback:', prismaErr?.message);
      }
    }

    const localStore = getLocalStore();
    const logs = localStore.preTripLogs.get(userId) || [];
    const newLog = {
      id: logId,
      date: logDate.toISOString(),
      currentOdometer: Number(currentOdometer) || 0,
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStore.preTripLogs.set(userId, logs);

    return res.status(201).json({ success: true, log: newLog });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save pre-trip log' });
  }
});

telemetryRouter.delete('/pretrip/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        await prisma.preTripLog.delete({ where: { id } });
        return res.json({ success: true, message: 'Pre-trip log deleted' });
      } catch (prismaErr: any) {
        console.warn('[Telemetry DELETE pretrip] Prisma fallback:', prismaErr?.message);
      }
    }

    const localStore = getLocalStore();
    const logs = localStore.preTripLogs.get(userId) || [];
    localStore.preTripLogs.set(userId, logs.filter((l) => l.id !== id));

    return res.json({ success: true, message: 'Pre-trip log deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete pre-trip log' });
  }
});

/**
 * 5. Vehicle Config Update
 */
telemetryRouter.put('/config', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const configData = req.body;

    const prisma = getPrismaClient();
    if (prisma) {
      try {
        const existing = await prisma.vehicleConfig.findFirst({ where: { userId } });
        let saved;
        if (existing) {
          saved = await prisma.vehicleConfig.update({
            where: { id: existing.id },
            data: {
              ...(configData.name && { name: configData.name }),
              ...(configData.model && { model: configData.model }),
              ...(configData.tankCapacityLitres !== undefined && { tankCapacityLitres: Number(configData.tankCapacityLitres) }),
              ...(configData.fullRangeBenchmarkKm !== undefined && {
                fullRangeBenchmarkKm: configData.fullRangeBenchmarkKm ? Number(configData.fullRangeBenchmarkKm) : null,
              }),
              ...(configData.currency && { currency: configData.currency }),
              ...(configData.distanceUnit && { distanceUnit: configData.distanceUnit }),
              ...(configData.volumeUnit && { volumeUnit: configData.volumeUnit }),
              ...(configData.theme && { theme: configData.theme }),
              ...(configData.authEnabled !== undefined && { authEnabled: Boolean(configData.authEnabled) }),
            },
          });
        } else {
          saved = await prisma.vehicleConfig.create({
            data: {
              userId,
              name: configData.name || 'BAIC BJ30e',
              model: configData.model || 'BJ30e Hybrid Dual-Motor',
              tankCapacityLitres: Number(configData.tankCapacityLitres) || 52,
              currency: configData.currency || 'Rs',
              distanceUnit: configData.distanceUnit || 'km',
              volumeUnit: configData.volumeUnit || 'L',
              theme: configData.theme || 'system',
              authEnabled: Boolean(configData.authEnabled),
            },
          });
        }

        return res.json({ success: true, config: saved });
      } catch (prismaErr: any) {
        console.warn('[Telemetry PUT config] Prisma fallback:', prismaErr?.message);
      }
    }

    const localStore = getLocalStore();
    const current = localStore.configs.get(userId) || {
      id: 'cfg_' + Date.now(),
      userId,
      name: 'BAIC BJ30e',
      model: 'BJ30e Hybrid Dual-Motor',
      tankCapacityLitres: 52,
      fullRangeBenchmarkKm: null,
      currency: 'Rs',
      distanceUnit: 'km',
      volumeUnit: 'L',
      theme: 'system',
      authEnabled: true,
    };

    const updated = { ...current, ...configData };
    localStore.configs.set(userId, updated);

    return res.json({ success: true, config: updated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update vehicle config' });
  }
});
