const rateLimit = require("express-rate-limit");

// Creates reusable rate-limiting middleware with configurable options to help protect API endpoints
function createRateLimitMiddleware(options) {
  const limiter = rateLimit({
    windowMs: options.windowMs || 60 * 1000, // 1 minute by default
    max: options.max || 100, // 100 requests within the configured time window by default
    message: options.message || "Too many requests, please try again later."
  });

  // Returns the configured middleware for use in Express routes
  return limiter;
}

module.exports = createRateLimitMiddleware;
