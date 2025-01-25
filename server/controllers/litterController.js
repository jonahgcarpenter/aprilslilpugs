const Litter = require('../models/litterModel')
const mongoose = require('mongoose')

// get all litters
const getLitters = async (req, res) => {
  try {
    const litters = await Litter.find({}).sort({createdAt: -1})
    res.status(200).json(litters)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code })
  }
}

// Create a new litter
const createLitter = async (req, res) => {
  try {
    const litterData = {
      ...req.body,
      image: req.file ? `/uploads/litter-images/${req.file.filename}` : '/litter-placeholder.jpg',
      birthDate: new Date(req.body.birthDate),
      availableDate: new Date(req.body.availableDate)
    }

    const litter = await Litter.create(litterData)
    res.status(201).json(litter)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Add puppy to litter
const addPuppy = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.litterId)) {
      return res.status(400).json({error: 'Invalid litter ID format'})
    }

    const puppyData = {
      ...req.body,
      image: req.file ? `/uploads/puppy-images/${req.file.filename}` : '/puppy-placeholder.jpg'
    }

    const litter = await Litter.findOneAndUpdate(
      { _id: req.params.litterId },
      { $push: { puppies: puppyData } },
      { new: true }
    )

    if (!litter) {
      return res.status(404).json({error: 'Litter not found'})
    }

    res.status(200).json(litter)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Update puppy status
const updatePuppy = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.litterId)) {
      return res.status(400).json({error: 'Invalid litter ID format'})
    }

    const litter = await Litter.findOneAndUpdate(
      { 
        _id: req.params.litterId,
        'puppies._id': req.params.puppyId
      },
      { 
        $set: {
          'puppies.$.status': req.body.status,
          'puppies.$.name': req.body.name,
          'puppies.$.color': req.body.color
        }
      },
      { new: true }
    )

    if (!litter) {
      return res.status(404).json({error: 'Litter or puppy not found'})
    }

    res.status(200).json(litter)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  getLitters,
  createLitter,
  addPuppy,
  updatePuppy
}
