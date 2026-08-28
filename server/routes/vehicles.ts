import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { validateBody, VehicleSchema } from '../middleware/validation';
import { getPrismaClient } from '../prisma';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Apply auth middleware to all vehicle routes
router.use(authMiddleware);

// GET /api/vehicles - List all vehicles for authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    if (prisma) {
      const vehicles = await prisma.vehicle.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ vehicles });
    }

    return res.json({ vehicles: [] });
  } catch (error) {
    console.error('List vehicles error:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// POST /api/vehicles - Create a new vehicle
router.post('/', validateBody(VehicleSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    if (prisma) {
      const newVehicle = await prisma.vehicle.create({
        data: {
          userId,
          name: req.body.name,
          make: req.body.make,
          model: req.body.model,
          year: req.body.year,
          licensePlate: req.body.licensePlate || null,
          tankCapacityLitres: req.body.tankCapacityLitres,
          fullRangeBenchmarkKm: req.body.fullRangeBenchmarkKm,
          currentCumulativeOdometer: req.body.currentCumulativeOdometer || 0,
          fuelType: req.body.fuelType || 'Petrol (95)',
          isPrimary: req.body.isPrimary ?? false,
        },
      });
      return res.status(201).json({ vehicle: newVehicle });
    }

    return res.status(201).json({
      vehicle: {
        id: uuidv4(),
        userId,
        ...req.body,
      },
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    return res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// PUT /api/vehicles/:id - Update an existing vehicle
router.put('/:id', validateBody(VehicleSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const prisma = getPrismaClient();

    if (prisma) {
      const updated = await prisma.vehicle.updateMany({
        where: { id, userId },
        data: {
          name: req.body.name,
          make: req.body.make,
          model: req.body.model,
          year: req.body.year,
          licensePlate: req.body.licensePlate || null,
          tankCapacityLitres: req.body.tankCapacityLitres,
          fullRangeBenchmarkKm: req.body.fullRangeBenchmarkKm,
          currentCumulativeOdometer: req.body.currentCumulativeOdometer,
          fuelType: req.body.fuelType,
          isPrimary: req.body.isPrimary,
        },
      });

      if (updated.count === 0) {
        return res.status(404).json({ error: 'Vehicle not found or unauthorized' });
      }

      return res.json({ message: 'Vehicle updated successfully' });
    }

    return res.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// DELETE /api/vehicles/:id - Delete a vehicle
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const prisma = getPrismaClient();

    if (prisma) {
      await prisma.vehicle.deleteMany({
        where: { id, userId },
      });
    }

    return res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
