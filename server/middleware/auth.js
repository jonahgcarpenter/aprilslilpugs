const jwt = require('jsonwebtoken');
const Breeder = require('../models/breederModel');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        error: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is near expiration (5 minutes)
      const timeToExpire = decoded.exp - (Date.now() / 1000);
      if (timeToExpire <= 300) { // 5 minutes in seconds
        res.set('X-Token-Expiring', 'true');
      }

      const breeder = await Breeder.findById(decoded.id);
      if (!breeder) {
        return res.status(401).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      req.breeder = breeder;
      req.breederId = breeder._id;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Session expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      throw jwtError;
    }
  } catch (error) {
    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = auth;