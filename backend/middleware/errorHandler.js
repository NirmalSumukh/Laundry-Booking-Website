// backend/middleware/errorHandler.js
// Centralized error handler

const errorHandler = (err, req, res, next) => {
  console.error('Error handler:', err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { errorHandler };
