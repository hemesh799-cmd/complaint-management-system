// Global Error Handling Middleware for Express
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.stack || err.message || err);

  // Default error status and message
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific PostgreSQL error codes
  if (err.code === '23505') {
    // Unique violation (e.g., duplicate email)
    statusCode = 400;
    message = 'A record with this information already exists (Duplicate key error).';
  } else if (err.code === '23503') {
    // Foreign key violation
    statusCode = 400;
    message = 'Referenced record does not exist in foreign table.';
  } else if (err.code === '22P02') {
    // Invalid text representation (e.g. invalid integer format)
    statusCode = 400;
    message = 'Invalid parameter format provided.';
  }

  res.status(statusCode).json({
    error: true,
    message: message,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
