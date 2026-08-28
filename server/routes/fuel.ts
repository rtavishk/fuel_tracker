import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, FuelEntrySchema } from '../middleware/validation';
import { getPrismaClient } from '../prisma';

const router = Router();

router.use(authMiddleware);

// GET /api/fuel-entries - List all fuel entries
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const vehicleId = req.query.vehicleId as string | undefined;
    const prisma = getPrismaClient();

    if (prisma) {
      const entries = await prisma.fuelEntry.findMany({
        where: {
          userId,
          ...(vehicleId ? { vehicleId } : {}),
        },
        orderBy: { date: 'desc' },
      });

      const mappedEntries = entries.map((e) => ({
        id: e.id,
        date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date).split('T')[0],
        time: e.time || undefined,
        amountPaid: e.amountPaid,
        pricePerLitre: e.pricePerLitre,
        litresFueled: e.litresFueled,
        currentOdometer: e.currentRangeGauge,
        afterFuelingOdometer: e.afterFuelingRangeGauge,
        fuelStation: e.fuelStation || undefined,
        notes: e.notes || undefined,
        isFullTank: e.isFullTank,
        createdAt: e.createdAt.toISOString(),
      }));

      return res.json({ entries: mappedEntries });
    }

    return res.json({ entries: [] });
  } catch (error) {
    console.error('List fuel entries error:', error);
    return res.status(500).json({ error: 'Failed to fetch fuel entries' });
  }
});

// POST /api/fuel-entries - Create fuel entry
router.post('/', validateBody(FuelEntrySchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const prisma = getPrismaClient();
    const currentRange = req.body.currentRangeGauge ?? req.body.currentOdometer ?? 0;
    const afterFuelingRange = req.body.afterFuelingRangeGauge ?? req.body.afterFuelingOdometer ?? null;

    if (prisma) {
      const entry = await prisma.fuelEntry.create({
        data: {
          userId,
          vehicleId: req.body.vehicleId,
          date: new Date(req.body.date),
          time: req.body.time || null,
          amountPaid: req.body.amountPaid,
          pricePerLitre: req.body.pricePerLitre,
          litresFueled: req.body.litresFueled,
          currentRangeGauge: currentRange,
          afterFuelingRangeGauge: afterFuelingRange,
          fuelStation: req.body.fuelStation || null,
          notes: req.body.notes || null,
          isFullTank: req.body.isFullTank ?? true,
        },
      });

      const mapped = {
        id: entry.id,
        date: entry.date instanceof Date ? entry.date.toISOString().split('T')[0] : String(entry.date).split('T')[0],
        time: entry.time || undefined,
        amountPaid: entry.amountPaid,
        pricePerLitre: entry.pricePerLitre,
        litresFueled: entry.litresFueled,
        currentOdometer: entry.currentRangeGauge,
        afterFuelingOdometer: entry.afterFuelingRangeGauge,
        fuelStation: entry.fuelStation || undefined,
        notes: entry.notes || undefined,
        isFullTank: entry.isFullTank,
        createdAt: entry.createdAt.toISOString(),
      };

      return res.status(201).json({ entry: mapped });
    }

    return res.status(201).json({
      entry: {
        id: `fuel_${Date.now()}`,
        userId,
        ...req.body,
        currentOdometer: currentRange,
        afterFuelingOdometer: afterFuelingRange,
      },
    });
  } catch (error) {
    console.error('Create fuel entry error:', error);
    return res.status(500).json({ error: 'Failed to save fuel entry' });
  }
});

// DELETE /api/fuel-entries/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const prisma = getPrismaClient();

    if (prisma) {
      await prisma.fuelEntry.deleteMany({
        where: { id, userId },
      });
    }

    return res.json({ message: 'Fuel entry removed' });
  } catch (error) {
    console.error('Delete fuel entry error:', error);
    return res.status(500).json({ error: 'Failed to delete fuel entry' });
  }
});

export default router;
