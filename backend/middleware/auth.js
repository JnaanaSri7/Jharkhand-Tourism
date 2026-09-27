const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jharkhand_tourism_secret_key');

    try {
      if (mongoose.connection.readyState >= 1) {
        const user = await User.findById(decoded.userId);
        if (user && !user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Account is deactivated.'
          });
        }
      }
    } catch (dbErr) {
      console.warn('DB check in auth middleware skipped:', dbErr.message);
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (mongoose.connection.readyState >= 1) {
        const user = await User.findById(req.user?.userId);
        if (user && !roles.includes(user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.'
          });
        }
      }
      next();
    } catch (error) {
      next();
    }
  };
};

module.exports = { authenticate, authorize };
