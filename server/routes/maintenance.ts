import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, MaintenanceSchema } from '../middleware/validation';
import { getPrismaClient } from '../prisma';

const router = Router();

router.use(authMiddleware);

// GET /api/maintenance
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const vehicleId = req.query.vehicleId as string | undefined;
    const prisma = getPrismaClient();

    if (prisma) {
      const items = await prisma.maintenanceSchedule.findMany({
        where: {
          userId,
          ...(vehicleId ? { vehicleId } : {}),
        },
        orderBy: { priority: 'desc' },
      });
      return res.json({ items });
    }

    return res.json({ items: [] });
  } catch (error) {
    console.error('List maintenance error:', error);
    return res.status(500).json({ error: 'Failed to fetch maintenance items' });
  }
});

// POST /api/maintenance
router.post('/', validateBody(MaintenanceSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    if (prisma) {
      const item = await prisma.maintenanceSchedule.create({
        data: {
          userId,
          vehicleId: req.body.vehicleId,
          title: req.body.title,
          category: req.body.category,
          intervalKm: req.body.intervalKm,
          intervalMonths: req.body.intervalMonths || null,
          lastServiceOdometer: req.body.lastServiceOdometer || 0,
          lastServiceDate: new Date(req.body.lastServiceDate),
          estimatedCost: req.body.estimatedCost || null,
          priority: req.body.priority || 'Medium',
          notes: req.body.notes || null,
        },
      });
      return res.status(201).json({ item });
    }

    return res.status(201).json({
      item: {
        id: `maint_${Date.now()}`,
        userId,
        ...req.body,
      },
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    return res.status(500).json({ error: 'Failed to save maintenance item' });
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const prisma = getPrismaClient();

    if (prisma) {
      await prisma.maintenanceSchedule.deleteMany({
        where: { id, userId },
      });
    }

    return res.json({ message: 'Maintenance item removed' });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    return res.status(500).json({ error: 'Failed to delete maintenance item' });
  }
});

export default router;
