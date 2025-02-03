const jwt = require('jsonwebtoken');
const Breeder = require('../models/breederModel');

const BREEDER_ID = "679fd1587f2c7fe4601d3f2e";

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    const token = authorization.split(' ')[1];
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    
    if (_id !== BREEDER_ID) {
      throw Error('Unauthorized');
    }

    const breeder = await Breeder.findById(BREEDER_ID);
    if (!breeder) {
      throw Error('Unauthorized');
    }

    req.breeder = breeder;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireAuth;
