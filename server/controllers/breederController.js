const Breeder = require('../models/breederModel')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')

// get all breeders
const getBreeders = async (req, res) => {
  try {
    const breeders = await Breeder.find({}).sort({createdAt: -1})
    res.status(200).json(breeders)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code })
  }
}

// get a single breeder
const getBreeder = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'Invalid ID format'})
    }

    const breeder = await Breeder.findById(id)
    if (!breeder) {
      return res.status(404).json({error: 'Breeder not found'})
    }

    res.status(200).json(breeder)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code })
  }
}

// create new breeder
const createBreeder = async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, location } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const breeder = await Breeder.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      location
    });

    res.status(200).json({
      id: breeder._id,
      email: breeder.email,
      firstName: breeder.firstName,
      lastName: breeder.lastName
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a breeder
const deleteBreeder = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'Invalid ID, Breeder not found'})
  }

  const breeder = await Breeder.findOneAndDelete({_id: id})

  if (!breeder) {
    return res.status(404).json({error: 'Breeder not found'})
  }

  res.status(200).json({message: 'Breeder deleted'})
}

// update a breeder
const updateBreeder = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    if (req.file) {
      // Fix the URL path to avoid duplication
      const filename = path.basename(req.file.path);
      updateData.profilePicture = `/uploads/breeder-profiles/${filename}`;
      // or alternatively: updateData.profilePicture = `/api/images/uploads/breeder-profiles/${filename}`;
      // but not both prefixes
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

// Update breeder password (development only)
const updateBreederPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid breeder ID' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    const breeder = await Breeder.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );

    if (!breeder) {
      return res.status(404).json({ error: 'Breeder not found' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// login breeder
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
  createBreeder,
  deleteBreeder,
  updateBreeder,
  loginBreeder,
  updateBreederPassword
}