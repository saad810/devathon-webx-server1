const rateLimit = require("express-rate-limit");

const createRateLimiter = ({ windowMs, max, message, keyGenerator }) => {
  return rateLimit({
    windowMs, // Time window in milliseconds
    max, // Maximum number of requests per windowMs
    message, // Custom message returned when rate limit is exceeded
    keyGenerator, // Function to generate unique keys for rate limiting (e.g., based on user ID instead of IP)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next, options) => {
      res.status(429).json({
        error: true,
        message:
          options.message || "Too many requests. Please try again later.",
        retryAfter: Math.ceil(options.windowMs / 1000) + "seconds", // Time in seconds until retry
      });
    },
  });
};

module.exports = createRateLimiter;
