const jwt = require('jsonwebtoken');
const Breeder = require('../models/breederModel');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authentication required. Please log in.'
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded.id) {
        return res.status(401).json({
          error: 'Invalid session. Please log in again.'
        });
      }

      const breeder = await Breeder.findById(decoded.id);
      if (!breeder) {
        return res.status(401).json({
          error: 'Account not found. Please log in again.'
        });
      }

      req.breeder = breeder;
      req.breederId = breeder._id;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Session expired. Please log in again.'
        });
      }
      throw jwtError;
    }
  } catch (error) {
    res.status(401).json({ 
      error: 'Authentication failed. Please log in again.' 
    });
  }
};

module.exports = auth;