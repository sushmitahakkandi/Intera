const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mahaveer-secret-key-12345';
const User = require('../models/User/User.model');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(417).json({ error: 'Access denied. No token provided.' });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;

    if (req.user && !req.user.email) {
      const dbUser = await User.findById(req.user.id);
      if (dbUser) {
        req.user.email = dbUser.email;
        req.user.name = dbUser.name;
      }
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Soft auth middleware — tries to decode JWT if present, but allows
 * the request through even without a valid token (req.user = null).
 * Used for AI routes that work for both logged-in users and guests.
 */
const softAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        
        if (req.user && !req.user.email) {
          const dbUser = await User.findById(req.user.id);
          if (dbUser) {
            req.user.email = dbUser.email;
            req.user.name = dbUser.name;
          }
        }
      } catch (_) {
        // Invalid/expired token — treat as guest
        req.user = null;
      }
    } else {
      req.user = null;
    }
  } catch (_) {
    req.user = null;
  }
  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
};

module.exports = {
  authMiddleware,
  softAuthMiddleware,
  adminMiddleware
};
