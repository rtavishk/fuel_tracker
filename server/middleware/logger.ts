import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  const path = req.originalUrl || req.url;

  // Intercept response finish
  res.on('finish', () => {
    const duration = performance.now() - start;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    logger.http(req.method, path, res.statusCode, duration, {
      ip: Array.isArray(ip) ? ip[0] : ip,
      userAgent: typeof userAgent === 'string' ? userAgent.substring(0, 100) : 'unknown',
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
    });
  });

  next();
}
