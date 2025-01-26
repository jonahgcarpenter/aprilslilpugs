// Import required dependencies
const jwt = require('jsonwebtoken');
const Breeder = require('../models/breederModel');

// Authentication middleware
// Verifies JWT token and attaches breeder information to request
const auth = async (req, res, next) => {
  try {
    // Extract authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        error: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
    }

    // Handle both "Bearer token" and raw token formats
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader;

    try {
      // Verify and decode the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Token expiration check (5 minutes warning)
      const timeToExpire = decoded.exp - (Date.now() / 1000);
      if (timeToExpire <= 300) { // 5 minutes in seconds
        // Set header to warn client about impending token expiration
        res.set('X-Token-Expiring', 'true');
      }

      // Find breeder in database using decoded token ID
      const breeder = await Breeder.findById(decoded.id);
      if (!breeder) {
        return res.status(401).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Attach breeder info to request for use in route handlers
      req.breeder = breeder;
      req.breederId = breeder._id;
      next();
    } catch (jwtError) {
      // Handle expired token specifically
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Session expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw jwtError;
    }
  } catch (error) {
    // Generic authentication error handler
    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = auth;