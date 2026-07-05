const rateLimit = require("express-rate-limit");

function createRateLimitMiddleware(options) {
  // You can configure the rate limit dynamically using the options parameter
  const limiter = rateLimit({
    windowMs: options.windowMs || 60 * 1000, // 1 minute by default
    max: options.max || 100, // 100 requests per windowMs by default
    message: options.message || "Too many requests, please try again later."
  });

  return limiter;
}

module.exports = createRateLimitMiddleware;
