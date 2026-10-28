const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  const config = {
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    passOnStoreError: false,
    message: { success: false, message: message || 'Too many requests. Please try again later.' }
  };

  // Uses the default in-memory store bundled with express-rate-limit.
  return rateLimit(config);
};

const isDev = process.env.NODE_ENV !== 'production';

const publicLimiter = createRateLimiter(15 * 60 * 1000, isDev ? 5000 : 100, 'Too many public requests.');
const authLimiter = createRateLimiter(15 * 60 * 1000, isDev ? 10000 : 200, 'Too many auth requests.');
const adminLimiter = createRateLimiter(15 * 60 * 1000, isDev ? 5000 : 1000, 'Too many admin requests.');

module.exports = { publicLimiter, authLimiter, adminLimiter, createRateLimiter };
