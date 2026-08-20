import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getPrismaClient, getLocalStore } from '../db.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Ensure all auth responses are JSON
authRouter.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

const SESSION_DURATION_DAYS = 30;

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Register Driver Profile & Vehicle
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, vehicleName, tankCapacity, model } = req.body;

    console.log('[Auth] Registration attempt:', {
      email: email ? email.substring(0, 3) + '***@***' : 'missing',
      name,
      vehicleName,
      model,
      tankCapacity,
      hasPassword: !!password,
      passwordLength: password?.length || 0
    });

    if (!email || !email.includes('@')) {
      console.log('[Auth] Registration failed: Invalid email');
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    if (!password || password.length < 6) {
      console.log('[Auth] Registration failed: Invalid password length');
      return res.status(400).json({ error: 'Password is required and must be at least 6 characters.' });
    }

    // Always encrypt password using bcrypt (10 rounds)
    console.log('[Auth] Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('[Auth] Password hashed successfully');

    const prisma = getPrismaClient();
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    if (prisma) {
      try {
        // Check if user already exists
        console.log('[Auth] Checking if user exists:', cleanEmail);
        const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existing) {
          console.log('[Auth] Registration failed: User already exists');
          return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
        }

        // Create User + VehicleConfig + Session in transaction
        console.log('[Auth] Creating user with vehicle config...');
        const newUser = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: cleanName,
            passwordHash,
            vehicleConfigs: {
              create: {
                name: vehicleName || 'BAIC BJ30e',
                model: model || 'BJ30e Hybrid Dual-Motor',
                tankCapacityLitres: tankCapacity ? Number(tankCapacity) : 52,
                currency: 'Rs',
                distanceUnit: 'km',
                volumeUnit: 'L',
                theme: 'system',
                authEnabled: true,
              },
            },
            sessions: {
              create: {
                token,
                expiresAt,
              },
            },
          },
          include: {
            vehicleConfigs: true,
          },
        });

        console.log('[Auth] User created successfully:', {
          userId: newUser.id,
          email: newUser.email,
          name: newUser.name,
          vehicleConfigId: newUser.vehicleConfigs[0]?.id,
          vehicleName: newUser.vehicleConfigs[0]?.name
        });

        // Set session cookie
        res.cookie('session_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
        });

        return res.status(201).json({
          success: true,
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          },
          config: newUser.vehicleConfigs[0] || null,
        });
      } catch (prismaErr: any) {
        console.warn('[Prisma Register] Error creating user:', prismaErr?.message);
        console.error('[Prisma Register] Full error:', prismaErr);
        return res.status(500).json({ error: 'Database registration error. Please try again.' });
      }
    } else {
      // No database available
      console.error('[Auth] Registration failed: Database not configured');
      return res.status(500).json({ error: 'Database not configured. Please contact support.' });
    }
  } catch (err: any) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ error: err?.message || 'Failed to register account' });
  }
});

/**
 * Sign In Driver
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log('[Auth] Login attempt:', {
      email: email ? email.substring(0, 3) + '***@***' : 'missing',
      hasPassword: !!password,
      passwordLength: password?.length || 0
    });

    if (!email) {
      console.log('[Auth] Login failed: Email is required');
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const prisma = getPrismaClient();
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    if (prisma) {
      try {
        console.log('[Auth] Looking up user:', cleanEmail);
        const user = await prisma.user.findUnique({
          where: { email: cleanEmail },
          include: { vehicleConfigs: true },
        });

        if (!user) {
          console.log('[Auth] Login failed: User not found');
          return res.status(401).json({
            error: 'No account found with this email address. Please register first.',
          });
        }

        console.log('[Auth] User found:', {
          userId: user.id,
          email: user.email,
          name: user.name,
          hasPasswordHash: !!user.passwordHash,
          vehicleConfigsCount: user.vehicleConfigs.length
        });

        if (user.passwordHash) {
          if (!password) {
            console.log('[Auth] Login failed: Password required');
            return res.status(400).json({ error: 'Password is required to sign in.' });
          }
          console.log('[Auth] Comparing password...');
          const isMatch = await bcrypt.compare(password, user.passwordHash);
          if (!isMatch) {
            console.log('[Auth] Login failed: Password mismatch');
            return res.status(401).json({ error: 'Incorrect email or password.' });
          }
          console.log('[Auth] Password match successful');
        }

        // Create Session in Database
        console.log('[Auth] Creating session...');
        await prisma.session.create({
          data: {
            userId: user.id,
            token,
            expiresAt,
          },
        });
        console.log('[Auth] Session created successfully');

        res.cookie('session_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
        });

        return res.json({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          config: user.vehicleConfigs[0] || null,
        });
      } catch (prismaErr: any) {
        console.warn('[Prisma Login] Error querying user:', prismaErr?.message);
        console.error('[Prisma Login] Full error:', prismaErr);
        return res.status(500).json({ error: 'Database authentication error. Please try again.' });
      }
    } else {
      // No database available
      console.error('[Auth] Login failed: Database not configured');
      return res.status(500).json({ error: 'Database not configured. Please contact support.' });
    }
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: err?.message || 'Login failed' });
  }
});

/**
 * Get Current Authenticated User (Session Verification)
 */
authRouter.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const prisma = getPrismaClient();

    if (prisma) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            vehicleConfigs: true,
          },
        });

        if (dbUser) {
          return res.json({
            authenticated: true,
            user: {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
            },
            config: dbUser.vehicleConfigs[0] || null,
          });
        }
      } catch (err: any) {
        console.warn('[Auth /me] Prisma query fallback:', err?.message);
      }
    }

    const localStore = getLocalStore();
    const config = localStore.configs.get(user.id);

    return res.json({
      authenticated: true,
      user,
      config: config || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

/**
 * Sign Out / Revoke Session
 */
authRouter.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const token = req.sessionToken;
    if (token) {
      const prisma = getPrismaClient();
      if (prisma) {
        await prisma.session.delete({ where: { token } }).catch(() => {});
      }
      const localStore = getLocalStore();
      localStore.sessions.delete(token);
    }

    res.clearCookie('session_token');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to log out' });
  }
});

/**
 * Change Password for Authenticated Driver
 */
authRouter.post('/change-password', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const prisma = getPrismaClient();

    if (prisma) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser) {
          return res.status(404).json({ error: 'User account not found.' });
        }

        // If user already has a password, verify currentPassword
        if (dbUser.passwordHash) {
          if (!currentPassword) {
            return res.status(400).json({ error: 'Current password is required to set a new password.' });
          }
          const isMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
          if (!isMatch) {
            return res.status(401).json({ error: 'Current password does not match.' });
          }
        }

        // Hash the new password with bcrypt
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newPasswordHash },
        });

        return res.json({ success: true, message: 'Password changed successfully.' });
      } catch (err: any) {
        console.warn('[Change Password] Prisma query error:', err?.message);
      }
    }

    // Local fallback store
    const localStore = getLocalStore();
    const localUser = localStore.users.get(user.email) || localStore.users.get(user.id);

    if (!localUser) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (localUser.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, localUser.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password does not match.' });
      }
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    localUser.passwordHash = newPasswordHash;
    localStore.users.set(user.email, localUser);
    localStore.users.set(user.id, localUser);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err: any) {
    console.error('[Change Password Error]:', err);
    res.status(500).json({ error: err?.message || 'Failed to update password.' });
  }
});
