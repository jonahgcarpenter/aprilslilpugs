const Breeder = require('../models/breederModel')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')

/**
 * Breeder Management and Authentication Controller
 * Handles breeder CRUD operations and authentication
 */

// Retrieves all breeders with password data excluded for security
const getBreeders = async (req, res) => {
  try {
    const breeders = await Breeder.find({})
      .select('-password')  // Exclude password
      .sort({createdAt: -1})
    res.status(200).json(breeders)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code })
  }
}

// Fetches a single breeder's information securely (excludes password)
const getBreeder = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'Invalid ID format'})
    }

    const breeder = await Breeder.findById(id).select('-password')  // Exclude password
    if (!breeder) {
      return res.status(404).json({error: 'Breeder not found'})
    }

    res.status(200).json(breeder)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code })
  }
}

// Updates breeder information including profile picture handling
// Ensures proper file path construction for profile images
const updateBreeder = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    if (req.file) {
      // Fix the URL path to avoid duplication
      const filename = path.basename(req.file.path);
      updateData.profilePicture = `/uploads/breeder-profiles/${filename}`;
    }
    
    const breeder = await Breeder.findOneAndUpdate(
      { _id: req.params.id },
      updateData,
      { new: true }
    );
    
    res.status(200).json(breeder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Authenticates a breeder with email and password
 * Includes:
 * - Input validation
 * - Email format verification
 * - Secure password comparison
 * - JWT token generation with expiration
 * - Error handling with generic messages for security
 */
const loginBreeder = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        status: 'error',
        message: 'Password is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Find breeder by email
    const breeder = await Breeder.findOne({ email });
    
    // Generic message for security
    const invalidCredentialsMessage = 'Invalid email or password';

    if (!breeder) {
      return res.status(401).json({
        status: 'error',
        message: invalidCredentialsMessage
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      String(password),
      String(breeder.password)
    );
    
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: invalidCredentialsMessage
      });
    }

    // Create token with explicit expiration
    const expiresIn = '1h'; // Configure as needed
    const token = jwt.sign(
      { 
        id: breeder._id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
      },
      process.env.JWT_SECRET
    );

    // Send success response with expiration
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: {
        id: breeder._id,
        email: breeder.email,
        firstName: breeder.firstName,
        lastName: breeder.lastName
      },
      token,
      expiresIn
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
};

module.exports = {
  getBreeders,
  getBreeder,
  updateBreeder,
  loginBreeder
}