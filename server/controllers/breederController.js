const Breeder = require('../models/breederModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

const deleteFile = async (filepath) => {
  try {
    if (!filepath) return;
    
    // Remove leading slash if present
    const relativePath = filepath.startsWith('/') ? filepath.slice(1) : filepath;
    console.log('Original filepath:', filepath);
    console.log('Relative path:', relativePath);
    
    const absolutePath = path.join('public', relativePath);
    console.log('Attempting to delete:', absolutePath);
    
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
    console.log('Successfully deleted file:', absolutePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File not found at path:', absolutePath);
    } else {
      console.error('Error deleting file:', error);
    }
  }
};

// login breeder
const loginBreeder = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const breeder = await Breeder.findOne({ email });
    if (!breeder) {
      throw Error('Incorrect email');
    }
    
    const match = await bcrypt.compare(password, breeder.password);
    if (!match) {
      throw Error('Incorrect password');
    }

    const token = createToken(breeder._id);
    res.status(200).json({ 
      email, 
      token,
      firstName: breeder.firstName,
      lastName: breeder.lastName 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get breeder profile
const getBreederProfile = async (req, res) => {
  try {
    const breeder = await Breeder.findOne().select('-password');
    if (!breeder) {
      return res.status(404).json({ error: 'No breeder profile found' });
    }
    res.status(200).json(breeder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update breeder profile
const updateBreederProfile = async (req, res) => {
  try {
    const breeder = await Breeder.findById(req.breeder._id);
    if (!breeder) {
      return res.status(404).json({ error: 'Breeder not found' });
    }

    const updates = req.body;
    if (req.file) {
      // Delete old profile picture if it exists
      if (breeder.profilePicture) {
        await deleteFile(breeder.profilePicture);
      }
      updates.profilePicture = `/uploads/breeder-profiles/${req.file.filename}`;
    }

    // Hash password if it's being updated
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    Object.keys(updates).forEach((key) => {
      breeder[key] = updates[key];
    });

    await breeder.save();
    
    // Remove password from response
    const breederResponse = breeder.toObject();
    delete breederResponse.password;
    
    res.status(200).json(breederResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// upload breeder images
const uploadBreederImages = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const imageIndex = parseInt(req.params.index);
    if (imageIndex !== 0 && imageIndex !== 1) {
      return res.status(400).json({ error: 'Invalid image index. Must be 0 or 1' });
    }

    const breeder = await Breeder.findById(req.breeder._id);
    if (!breeder) {
      return res.status(404).json({ error: 'Breeder not found' });
    }

    // Delete old image if it exists
    if (breeder.images[imageIndex]) {
      await deleteFile(breeder.images[imageIndex]);
    }

    // Update the specific image slot
    const newImagePath = `/uploads/breeder-profiles/${req.file.filename}`;
    breeder.images[imageIndex] = newImagePath;
    
    await breeder.save();
    
    res.status(200).json({ 
      message: 'Image updated successfully',
      images: breeder.images 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// logout breeder
const logoutBreeder = async (req, res) => {
  // Since JWT is stateless, we just return success
  // The client should remove the token
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  loginBreeder,
  getBreederProfile,
  updateBreederProfile,
  logoutBreeder,
  uploadBreederImages
};
