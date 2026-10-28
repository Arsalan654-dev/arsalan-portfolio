const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = field ? `Duplicate value for ${field}.` : 'Duplicate key error.';
    return res.status(400).json({ success: false, message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}.` });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.', expired: true });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error.';

  res.status(status).json({ success: false, message });
};

module.exports = errorMiddleware;
