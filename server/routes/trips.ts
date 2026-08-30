import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, TripEntrySchema } from '../middleware/validation';
import { getPrismaClient } from '../prisma';

const router = Router();

router.use(authMiddleware);

// GET /api/trip-entries
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const vehicleId = req.query.vehicleId as string | undefined;
    const prisma = getPrismaClient();

    if (prisma) {
      const trips = await prisma.tripEntry.findMany({
        where: {
          userId,
          ...(vehicleId ? { vehicleId } : {}),
        },
        orderBy: { date: 'asc' },
      });

      const mappedTrips = trips.map((t) => ({
        id: t.id,
        date: t.date instanceof Date ? t.date.toISOString().split('T')[0] : String(t.date).split('T')[0],
        totalOdometer: t.totalCumulativeOdometer,
        totalCumulativeOdometer: t.totalCumulativeOdometer,
        category: t.category,
        notes: t.notes || undefined,
        createdAt: t.createdAt.toISOString(),
      }));

      return res.json({ trips: mappedTrips });
    }

    return res.json({ trips: [] });
  } catch (error) {
    console.error('List trips error:', error);
    return res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// POST /api/trip-entries
router.post('/', validateBody(TripEntrySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const prisma = getPrismaClient();
    const odo = req.body.totalCumulativeOdometer ?? req.body.totalOdometer ?? 0;

    if (prisma) {
      const trip = await prisma.tripEntry.create({
        data: {
          userId,
          vehicleId: req.body.vehicleId,
          date: new Date(req.body.date),
          totalCumulativeOdometer: odo,
          category: req.body.category || 'Commute',
          notes: req.body.notes || null,
        },
      });

      // Update vehicle's current cumulative odometer
      await prisma.vehicle.updateMany({
        where: { id: req.body.vehicleId, userId },
        data: {
          currentCumulativeOdometer: odo,
        },
      });

      const mapped = {
        id: trip.id,
        date: trip.date instanceof Date ? trip.date.toISOString().split('T')[0] : String(trip.date).split('T')[0],
        totalOdometer: trip.totalCumulativeOdometer,
        totalCumulativeOdometer: trip.totalCumulativeOdometer,
        category: trip.category,
        notes: trip.notes || undefined,
        createdAt: trip.createdAt.toISOString(),
      };

      return res.status(201).json({ trip: mapped });
    }

    return res.status(201).json({
      trip: {
        id: `trip_${Date.now()}`,
        userId,
        ...req.body,
        totalOdometer: odo,
        totalCumulativeOdometer: odo,
      },
    });
  } catch (error) {
    console.error('Create trip entry error:', error);
    return res.status(500).json({ error: 'Failed to save trip entry' });
  }
});

// DELETE /api/trip-entries/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const prisma = getPrismaClient();

    if (prisma) {
      await prisma.tripEntry.deleteMany({
        where: { id, userId },
      });
    }

    return res.json({ message: 'Trip entry deleted' });
  } catch (error) {
    console.error('Delete trip error:', error);
    return res.status(500).json({ error: 'Failed to delete trip' });
  }
});

export default router;
