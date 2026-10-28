const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyAccessToken = async (req, res, next) => {
  try {
    let token = req.headers?.authorization?.split(' ')[1];
    if (!token) token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.', expired: true });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers?.authorization?.split(' ')[1];
    if (!token) token = req.cookies?.accessToken;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (e) {}
  next();
};

module.exports = { verifyAccessToken, optionalAuth };
