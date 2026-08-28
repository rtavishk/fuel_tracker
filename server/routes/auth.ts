import { Router, Response } from 'express';
import { validateBody, RegisterSchema, LoginSchema } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimit';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { getPrismaClient } from '../prisma';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (url && key && !url.includes('YOUR_PROJECT_REF')) {
    return createClient(url, key);
  }
  return null;
}

// POST /api/auth/register
router.post('/register', authRateLimiter, validateBody(RegisterSchema), async (req, res: Response) => {
  try {
    const { email, password, name, vehicle } = req.body;
    const supabase = getSupabase();
    const prisma = getPrismaClient();

    let userId = uuidv4();
    let sessionToken = '';

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || '',
          },
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        // Handle email confirmation requirement
        if (error.message.includes('Email not confirmed')) {
          // Try to bypass by signing in immediately after signup
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!signInError && signInData.user) {
            userId = signInData.user.id;
            sessionToken = signInData.session?.access_token || '';
          } else {
            return res.status(400).json({ 
              error: 'Email confirmation required. Please check your email inbox for the confirmation link, or disable email confirmation in Supabase project settings for development.' 
            });
          }
        } else {
          return res.status(400).json({ error: error.message });
        }
      }

      if (data.user) {
        userId = data.user.id;
        sessionToken = data.session?.access_token || '';
      }
    }

    // Sync with Prisma Database if database is connected
    if (prisma) {
      try {
        await prisma.profile.upsert({
          where: { email },
          create: {
            id: userId,
            email,
            fullName: name || '',
            currencySymbol: vehicle?.currency || 'Rs.',
            distanceUnit: vehicle?.distanceUnit || 'km',
            volumeUnit: vehicle?.volumeUnit || 'L',
          },
          update: {
            fullName: name || '',
          },
        });

        if (vehicle) {
          await prisma.vehicle.create({
            data: {
              userId,
              name: vehicle.name || `${vehicle.make} ${vehicle.model}`,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              licensePlate: vehicle.licensePlate || null,
              tankCapacityLitres: vehicle.tankCapacityLitres || 47,
              fullRangeBenchmarkKm: vehicle.fullRangeBenchmarkKm || 680,
              fuelType: vehicle.fuelType || 'Petrol (95)',
              isPrimary: true,
            },
          });
        }
      } catch (dbErr) {
        console.warn('Prisma sync skipped during registration:', dbErr);
      }
    }

    return res.status(201).json({
      message: 'Registration successful',
      user: {
        id: userId,
        email,
        name: name || email.split('@')[0],
      },
      token: sessionToken || userId,
    });
  } catch (err: unknown) {
    console.error('Registration Error:', err);
    return res.status(500).json({ error: 'Internal registration server error' });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, validateBody(LoginSchema), async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    const supabase = getSupabase();
    const prisma = getPrismaClient();

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: error.message });
      }

      return res.json({
        message: 'Login successful',
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
        },
        token: data.session?.access_token,
      });
    }

    // Direct database or fallback authentication
    let userProfile = null;
    if (prisma) {
      try {
        userProfile = await prisma.profile.findUnique({
          where: { email },
        });
      } catch {
        // Fallback
      }
    }

    const userId = userProfile ? userProfile.id : uuidv4();

    return res.json({
      message: 'Login successful',
      user: {
        id: userId,
        email,
        name: userProfile?.fullName || email.split('@')[0],
      },
      token: userId,
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Internal login server error' });
  }
});

// GET /api/auth/me (Protected Profile Check)
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const prisma = getPrismaClient();

    let profile = null;
    if (prisma) {
      try {
        profile = await prisma.profile.findUnique({
          where: { id: user.id },
          include: {
            vehicles: true,
          },
        });
      } catch {
        // Ignored
      }
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: profile?.fullName || user.email.split('@')[0],
        currencySymbol: profile?.currencySymbol || 'Rs.',
        distanceUnit: profile?.distanceUnit || 'km',
        volumeUnit: profile?.volumeUnit || 'L',
        vehicles: profile?.vehicles || [],
      },
    });
  } catch (err) {
    console.error('Get Profile Error:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

export default router;
