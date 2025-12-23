/**
 * Error Handling Middleware
 * Centralized error handling
 */

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  // Set default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Only log server errors (5xx) as errors, client errors (4xx) are expected
  if (statusCode >= 500) {
    // Server error - log as error
    console.error('Error:', {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      statusCode,
      path: req.path,
      method: req.method
    });
  } else {
    // Client error (4xx) - expected behavior, log at debug level only in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️  Client error (${statusCode}): ${message} - ${req.method} ${req.path}`);
    }
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`
    }
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};

