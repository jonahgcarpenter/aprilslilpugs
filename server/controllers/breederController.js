const Breeder = require('../models/breederModel')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// get all breeders
const getBreeders = async (req, res) => {
  const breeders = await Breeder.find({}).sort ({createdAt: -1})

  res.status(200).json(breeders)
}

// get a single breeder
const getBreeder = async (req, res) => {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'Invalid ID, Breeder not found'})
  }

  const breeder = await Breeder.findById(id)

  if (!breeder) {
    return res.status(404).json({error: 'Breeder not found'})
  }

  res.status(200).json(breeder)
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
  const { id } = req.params;
  
  try {
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      location: req.body.location,
      story: req.body.story
    };

    if (req.file) {
      updateData.profilePicture = `/uploads/breeder-profiles/${req.file.filename}`;
    }

    const breeder = await Breeder.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(breeder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// login breeder
const loginBreeder = async (req, res) => {
  const { email, password } = req.body;

  try {
    const breeder = await Breeder.findOne({ email });
    
    if (!breeder) {
      return res.status(404).json({ error: 'No breeder found with this email' });
    }

    const isValidPassword = await bcrypt.compare(password, breeder.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign(
      { id: breeder._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      user: {
        id: breeder._id,
        email: breeder.email,
        firstName: breeder.firstName,
        lastName: breeder.lastName
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getBreeders,
  getBreeder,
  createBreeder,
  deleteBreeder,
  updateBreeder,
  loginBreeder
}