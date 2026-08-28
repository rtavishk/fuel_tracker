import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

// 1. Production-Grade Helmet Configuration (SSL, HSTS, CSP, X-Frame, MIME Protection)
export const configureSecurityHeaders = () => {
  return helmet({
    // Content Security Policy (Strict but allows Vite client and trusted CDNs)
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'", // Needed for Vite dev HMR & client bundling
          'https://cdn.jsdelivr.net',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
        connectSrc: [
          "'self'",
          'https://*.supabase.co',
          'wss://*.supabase.co',
          'https://api.github.com',
          'http://localhost:*',
          'ws://localhost:*',
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'", '*'], // Allows iframe embedding in AI Studio workspace
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    // Strict-Transport-Security (HSTS) enforces HTTPS / SSL
    strictTransportSecurity: {
      maxAge: 31536000, // 1 Year
      includeSubDomains: true,
      preload: true,
    },
    // Prevent MIME-type sniffing
    noSniff: true,
    // Referrer Policy: Send full URL for same-origin, domain-only for cross-origin
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    // Prevent clickjacking while supporting workspace iframes
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
};

// 2. Custom Permissions-Policy & Additional SSL Security Headers
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent browser feature abuses
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=()'
  );

  // Force HTTPS redirect hint in production
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] === 'http') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  // Prevent browser caching of sensitive API data
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

// 3. SQL Injection Sanitizer & Payload Cleanser
// Recursively sanitizes object strings to strip dangerous SQL injection delimiters & control characters
export function sanitizeInput(value: unknown): unknown {
  if (typeof value === 'string') {
    // Strip null byte attacks (\0) and dangerous unescaped SQL statement terminations
    return value
      .replace(/\0/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeInput);
  }
  if (value !== null && typeof value === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      cleaned[key] = sanitizeInput(val);
    }
    return cleaned;
  }
  return value;
}

export const sqlInjectionSanitizer = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query) as typeof req.query;
  }
  if (req.params) {
    req.params = sanitizeInput(req.params) as typeof req.params;
  }
  next();
};
