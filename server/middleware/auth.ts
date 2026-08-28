import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Extend Express Request to include authenticated user object
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

let serverSupabase: ReturnType<typeof createClient> | null = null;

function getServerSupabase() {
  if (serverSupabase) return serverSupabase;
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key && !url.includes('YOUR_PROJECT_REF')) {
    serverSupabase = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return serverSupabase;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies['sb-access-token']) {
      token = req.cookies['sb-access-token'];
    }

    // If no token is provided:
    if (!token) {
      // Allow fallback guest driver when Supabase credentials are not configured yet, or guest header is supplied
      if (req.headers['x-guest-user-id']) {
        req.user = {
          id: String(req.headers['x-guest-user-id']),
          email: String(req.headers['x-guest-user-email'] || 'driver@fueltracker.app'),
        };
        return next();
      }

      return res.status(401).json({
        error: 'Unauthorized: Missing or invalid authentication token',
        status: 401,
      });
    }

    const supabase = getServerSupabase();
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({
          error: 'Unauthorized: Invalid authentication session',
          details: error?.message,
        });
      }

      req.user = {
        id: user.id,
        email: user.email || '',
        role: user.role,
      };
      return next();
    }

    // Fallback token extraction for mock / self-contained token formats
    try {
      // Base64 decoded fallback payload check
      const payload = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64').toString());
      if (payload && (payload.sub || payload.id)) {
        req.user = {
          id: payload.sub || payload.id,
          email: payload.email || 'user@example.com',
        };
        return next();
      }
    } catch {
      // Token wasn't a standard JWT
    }

    // Fallback: accept token as direct user ID if alphanumeric UUID
    if (/^[a-zA-Z0-9_-]{8,64}$/.test(token)) {
      req.user = {
        id: token,
        email: 'driver@fueltracker.app',
      };
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized: Session invalid' });
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ error: 'Internal Authentication Error' });
  }
};
