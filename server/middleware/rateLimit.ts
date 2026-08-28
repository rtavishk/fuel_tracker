import rateLimit from 'express-rate-limit';

// Rate Limiter for Authentication endpoints (prevent brute-force password guessing)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many authentication attempts from this IP, please try again in 15 minutes.',
    status: 429,
  },
});

// General API Rate Limiter (protect against spam and DoS)
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // Limit each IP to 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'API rate limit exceeded. Please slow down your requests.',
    status: 429,
  },
});
