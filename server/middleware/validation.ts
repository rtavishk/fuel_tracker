import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// Middleware generator that validates and parses req.body with a Zod schema
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const issues = (err.issues || (err as any).errors || []).map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
          message: e.message,
        }));
        return res.status(400).json({
          error: 'Validation failed',
          issues,
        });
      }
      return res.status(400).json({ error: 'Invalid request payload' });
    }
  };
};

// Zod Schemas for API Endpoints

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  name: z.string().min(1, 'Name is required').max(100).optional(),
  vehicle: z
    .object({
      name: z.string().max(100).optional(),
      make: z.string().min(1).max(50),
      model: z.string().min(1).max(50),
      year: z.number().int().min(1900).max(2035),
      licensePlate: z.string().max(30).optional(),
      tankCapacityLitres: z.number().positive().max(500),
      fullRangeBenchmarkKm: z.number().positive().max(5000),
      fuelType: z.string().max(50).default('Petrol (95)'),
      distanceUnit: z.enum(['km', 'mi']).default('km'),
      volumeUnit: z.enum(['L', 'gal']).default('L'),
      currency: z.string().max(10).default('Rs.'),
    })
    .optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(1, 'Password is required'),
});

export const VehicleSchema = z.object({
  name: z.string().min(1).max(100),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(1900).max(2035),
  licensePlate: z.string().max(30).optional().nullable(),
  tankCapacityLitres: z.number().positive().max(500),
  fullRangeBenchmarkKm: z.number().positive().max(5000),
  currentCumulativeOdometer: z.number().nonnegative().default(0),
  fuelType: z.string().max(50).default('Petrol (95)'),
  isPrimary: z.boolean().default(true),
});

export const FuelEntrySchema = z.object({
  vehicleId: z.string().uuid().or(z.string().min(1)),
  date: z.string().min(10).max(10), // YYYY-MM-DD
  time: z.string().max(10).optional().nullable(),
  amountPaid: z.number().positive('Amount paid must be positive'),
  pricePerLitre: z.number().positive('Price per litre must be positive'),
  litresFueled: z.number().positive('Litres must be positive'),
  currentRangeGauge: z.number().nonnegative('Current range gauge must be non-negative'),
  afterFuelingRangeGauge: z.number().nonnegative().optional().nullable(),
  fuelStation: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  isFullTank: z.boolean().default(true),
});

export const TripEntrySchema = z.object({
  vehicleId: z.string().uuid().or(z.string().min(1)),
  date: z.string().min(10).max(10), // YYYY-MM-DD
  totalCumulativeOdometer: z.number().nonnegative('Odometer reading must be non-negative'),
  category: z.string().max(50).default('Commute'),
  notes: z.string().max(500).optional().nullable(),
});

export const MaintenanceSchema = z.object({
  vehicleId: z.string().uuid().or(z.string().min(1)),
  title: z.string().min(1).max(100),
  category: z.string().max(50),
  intervalKm: z.number().int().positive(),
  intervalMonths: z.number().int().positive().optional().nullable(),
  lastServiceOdometer: z.number().nonnegative().default(0),
  lastServiceDate: z.string().min(10).max(10),
  estimatedCost: z.number().nonnegative().optional().nullable(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  notes: z.string().max(500).optional().nullable(),
});
