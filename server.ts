import dotenv from 'dotenv';
// Load environment variables from .env.local first, then fall back to .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import next from 'next';
import {
  configureSecurityHeaders,
  customSecurityHeaders,
  sqlInjectionSanitizer,
} from './server/middleware/security';
import { apiRateLimiter } from './server/middleware/rateLimit';
import { requestLogger } from './server/middleware/logger';
import { logger } from './server/utils/logger';
import authRoutes from './server/routes/auth';
import vehicleRoutes from './server/routes/vehicles';
import fuelRoutes from './server/routes/fuel';
import tripRoutes from './server/routes/trips';
import maintenanceRoutes from './server/routes/maintenance';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Next.js / Vercel style Request Logger
  app.use(requestLogger);

  // 2. SSL & Security Headers (Helmet, CSP, HSTS, X-Content-Type)
  app.use(configureSecurityHeaders());
  app.use(customSecurityHeaders);

  // 2. CORS configuration
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // 3. Request Body Parsers (with size restrictions to avoid payload attacks)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // 4. SQL Injection Sanitizer Middleware
  app.use(sqlInjectionSanitizer);

  // 5. Global API Rate Limiter
  app.use('/api', apiRateLimiter);

  // 6. System Health & Security Status Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      security: {
        ssl_protection: 'Strict-Transport-Security (HSTS) Active',
        sql_injection_defense: 'Prisma Parameterized Queries & Sanitizer Active',
        rate_limiting: 'Active',
        csp: 'Content-Security-Policy Active',
      },
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // 7. Mount Core API Route Controllers
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/fuel-entries', fuelRoutes);
  app.use('/api/trip-entries', tripRoutes);
  app.use('/api/maintenance', maintenanceRoutes);

  // 8. Global Error Handler (Prevents stack trace leaks)
  app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error(`API Error on ${req.method} ${req.originalUrl}: ${err.message}`, err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    });
  });

  // 9. Next.js Frontend Integration
  const dev = process.env.NODE_ENV !== 'production';
  const nextApp = next({ dev });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  app.all('*', (req, res) => {
    return handle(req, res);
  });

  // 10. Start Server
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`▲ Next.js / Fullstack Server running on http://0.0.0.0:${PORT} (ready for Vercel/Node deployment)`);
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
