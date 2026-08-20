import { Request, Response, NextFunction } from 'express';
import { getPrismaClient, getLocalStore } from '../db.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
  sessionToken?: string;
}

/**
 * Authentication Middleware
 * Validates session token from Authorization header or Cookie against the database
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    // 1. Check Authorization: Bearer <token> header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    // 2. Check x-session-token header
    if (!token && req.headers['x-session-token']) {
      token = req.headers['x-session-token'] as string;
    }

    // 3. Check cookies if cookie-parser is active
    if (!token && req.cookies && req.cookies.session_token) {
      token = req.cookies.session_token;
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized: No active session token provided',
        code: 'AUTH_REQUIRED',
      });
    }

    req.sessionToken = token;

    // Check with Prisma Database
    const prisma = getPrismaClient();
    if (prisma) {
      try {
        const session = await prisma.session.findUnique({
          where: { token },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        });

        if (session) {
          if (new Date() > new Date(session.expiresAt)) {
            // Session expired
            await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
            return res.status(401).json({
              error: 'Session expired. Please log in again.',
              code: 'SESSION_EXPIRED',
            });
          }

          req.user = session.user;
          return next();
        }
      } catch (err: any) {
        console.warn('[Auth Middleware] Database session query fallback:', err?.message);
      }
    }

    // Fallback to local store
    const localStore = getLocalStore();
    const localSession = localStore.sessions.get(token);

    if (localSession) {
      if (Date.now() > localSession.expiresAt) {
        localStore.sessions.delete(token);
        return res.status(401).json({
          error: 'Session expired. Please log in again.',
          code: 'SESSION_EXPIRED',
        });
      }

      const user = localStore.users.get(localSession.userId);
      if (user) {
        req.user = { id: user.id, email: user.email, name: user.name };
        return next();
      }
    }

    return res.status(401).json({
      error: 'Invalid or revoked session token',
      code: 'INVALID_SESSION',
    });
  } catch (error: any) {
    console.error('[Auth Middleware] Error:', error);
    return res.status(500).json({ error: 'Internal authentication error' });
  }
}
