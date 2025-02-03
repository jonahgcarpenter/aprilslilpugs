const Breeder = require('../models/breederModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

const deleteFile = async (filename) => {
  try {
    if (!filename) return;
    
    const absolutePath = path.join('public', 'uploads', 'breeder-profiles', filename);
    console.log('Attempting to delete:', absolutePath);
    
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
    console.log('Successfully deleted file:', absolutePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('File not found at path:', error.path);
    } else {
      console.error('Error deleting file:', error);
    }
  }
};

const BREEDER_ID = "679fd1587f2c7fe4601d3f2e";

// login breeder
const loginBreeder = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // First find by email
    const breeder = await Breeder.findOne({ email });
    if (!breeder) {
      throw Error('Incorrect email');
    }
    
    // Then verify it's our specific breeder
    if (breeder._id.toString() !== BREEDER_ID) {
      throw Error('Unauthorized breeder');
    }

    const match = await bcrypt.compare(password, breeder.password);
    if (!match) {
      throw Error('Incorrect password');
    }

    const token = createToken(BREEDER_ID);
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
    const breeder = await Breeder.findById(BREEDER_ID).select('-password');
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
    const breeder = await Breeder.findById(BREEDER_ID);
    if (!breeder) {
      return res.status(404).json({ error: 'Breeder not found' });
    }

    const updates = req.body;

    // Handle profile picture
    if (req.files && req.files.profilePicture) {
      if (breeder.profilePicture) {
        await deleteFile(breeder.profilePicture);
      }
      // Store only filename
      updates.profilePicture = req.files.profilePicture[0].filename;
    }

    // Handle gallery images
    if (req.files) {
      for (let i = 0; i < 2; i++) {
        const galleryFile = req.files[`galleryImage${i}`];
        if (galleryFile && galleryFile[0]) {
          if (breeder.images[i]) {
            await deleteFile(breeder.images[i]);
          }
          // Store only filename
          breeder.images[i] = galleryFile[0].filename;
        }
      }
    }

    // Update other fields
    Object.keys(updates).forEach((key) => {
      if (key !== 'images') { // Don't overwrite images array directly
        breeder[key] = updates[key];
      }
    });

    await breeder.save();
    
    const breederResponse = breeder.toObject();
    delete breederResponse.password;
    
    // Transform response to include full paths
    if (breederResponse.profilePicture) {
      breederResponse.profilePicture = `/uploads/breeder-profiles/${breederResponse.profilePicture}`;
    }
    breederResponse.images = breederResponse.images.map(filename => 
      filename ? `/uploads/breeder-profiles/${filename}` : null
    );
    
    res.status(200).json(breederResponse);
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
  logoutBreeder
};
