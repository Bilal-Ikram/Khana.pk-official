const jwt = require('jsonwebtoken');
require('dotenv').config();

// Required authentication middleware - blocks if no valid token
const requireAuth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Standardize the user ID format
    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId || decoded._id // Handle all possible ID formats
    };
    
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional authentication - doesn't block if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') ||
                  req.cookies?.token ||
                  req.query?.token;
    
    if (!token) {
      // No token provided, continue without user context
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Standardize the user ID format (consistent with requireAuth)
      req.user = {
        ...decoded,
        id: decoded.id || decoded.userId || decoded._id
      };
      req.isAuthenticated = true;
      
      console.log('Optional auth: User authenticated', {
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });
      
    } catch (jwtError) {
      // Invalid token, continue without user context
      console.log('Optional auth: Invalid token provided', {
        error: jwtError.message,
        timestamp: new Date().toISOString()
      });
      
      req.user = null;
      req.isAuthenticated = false;
    }
    
    next();
    
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Don't block the request, just continue without auth
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

// FIXED: Use consistent exports - choose ONE of these patterns:

// Option 1: Named exports (RECOMMENDED)
module.exports = {
  requireAuth,
  optionalAuth
};
