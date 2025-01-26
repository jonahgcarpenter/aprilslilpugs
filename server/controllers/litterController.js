const Litter = require('../models/litterModel')
const mongoose = require('mongoose')

/**
 * Utility Functions
 */
// Validates if a given ID matches MongoDB ObjectId format
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// Centralizes error handling across all controller functions
const handleErrors = (res, error) => {
  res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' })
}

/**
 * Controller Functions
 */
// Retrieves all litters, sorted by creation date (newest first)
const getLitters = async (req, res) => {
  try {
    const litters = await Litter.find({}).sort({ createdAt: -1 })
    res.status(200).json(litters)
  } catch (error) {
    handleErrors(res, error)
  }
}

// Fetches a specific litter by ID with validation
const getLitter = async (req, res) => {
  try {
    const { litterId } = req.params

    if (!isValidObjectId(litterId)) {
      return res.status(400).json({ error: 'Invalid litter ID format' })
    }

    const litter = await Litter.findById(litterId)
    if (!litter) {
      return res.status(404).json({ error: 'Litter not found' })
    }

    res.status(200).json(litter)
  } catch (error) {
    handleErrors(res, error)
  }
}

// Creates a new litter with optional image upload
// Handles both birthDate and availableDate conversion to Date objects
const createLitter = async (req, res) => {
  try {
    const litterData = {
      ...req.body,
      image: req.file ? `/uploads/litter-images/${req.file.filename}` : '/uploads/litter-images/litter-placeholder.jpg',
      birthDate: new Date(req.body.birthDate),
      availableDate: new Date(req.body.availableDate)
    }
    const litter = await Litter.create(litterData)
    res.status(201).json(litter)
  } catch (error) {
    handleErrors(res, error)
  }
}

// Updates existing litter information including optional image update
// Handles date conversions and validates litter existence
const updateLitter = async (req, res) => {
  try {
    const { litterId } = req.params

    if (!isValidObjectId(litterId)) {
      return res.status(400).json({ error: 'Invalid litter ID format' })
    }

    const updateData = { ...req.body }

    if (req.file) {
      updateData.image = `/uploads/litter-images/${req.file.filename}`
    }

    if (req.body.birthDate) {
      updateData.birthDate = new Date(req.body.birthDate)
    }

    if (req.body.availableDate) {
      updateData.availableDate = new Date(req.body.availableDate)
    }

    const litter = await Litter.findByIdAndUpdate(litterId, updateData, { new: true })

    if (!litter) {
      return res.status(404).json({ error: 'Litter not found' })
    }

    res.status(200).json(litter)
  } catch (error) {
    handleErrors(res, error)
  }
}

// Removes a litter from the database with validation
const deleteLitter = async (req, res) => {
  try {
    const { litterId } = req.params

    if (!isValidObjectId(litterId)) {
      return res.status(400).json({ error: 'Invalid litter ID format' })
    }

    const litter = await Litter.findByIdAndDelete(litterId)

    if (!litter) {
      return res.status(404).json({ error: 'Litter not found' })
    }

    res.status(200).json({ message: 'Litter deleted successfully', litter })
  } catch (error) {
    handleErrors(res, error)
  }
}

// Adds a new puppy to an existing litter
// Includes optional puppy image handling
const addPuppy = async (req, res) => {
  try {
    const { litterId } = req.params

    if (!isValidObjectId(litterId)) {
      return res.status(400).json({ error: 'Invalid litter ID format' })
    }

    const puppyData = {
      ...req.body,
      image: req.file ? `/uploads/puppy-images/${req.file.filename}` : '/uploads/puppy-images/puppy-placeholder.jpg'
    }

    const litter = await Litter.findByIdAndUpdate(
      litterId,
      { $push: { puppies: puppyData } },
      { new: true }
    )

    if (!litter) {
      return res.status(404).json({ error: 'Litter not found' })
    }

    res.status(200).json(litter)
  } catch (error) {
    handleErrors(res, error)
  }
}

// Updates specific puppy information within a litter
// Only updates fields that are provided in the request
const updatePuppy = async (req, res) => {
  try {
    const { litterId, puppyId } = req.params

    if (!isValidObjectId(litterId) || !isValidObjectId(puppyId)) {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    // Create update data with file path if image is uploaded
    const updateData = {}
    if (req.body.name) updateData['puppies.$.name'] = req.body.name
    if (req.body.color) updateData['puppies.$.color'] = req.body.color
    if (req.body.gender) updateData['puppies.$.gender'] = req.body.gender
    if (req.body.status) updateData['puppies.$.status'] = req.body.status
    if (req.file) {
      updateData['puppies.$.image'] = `/uploads/puppy-images/${req.file.filename}`
    }

    const litter = await Litter.findOneAndUpdate(
      {
        _id: litterId,
        'puppies._id': puppyId
      },
      { $set: updateData },
      { new: true }
    )

    if (!litter) {
      return res.status(404).json({ error: 'Litter or puppy not found' })
    }

    res.status(200).json(litter)
  } catch (error) {
    handleErrors(res, error)
  }
}

// Removes a specific puppy from a litter
const deletePuppy = async (req, res) => {
  try {
    const { litterId, puppyId } = req.params

    if (!isValidObjectId(litterId) || !isValidObjectId(puppyId)) {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    const litter = await Litter.findByIdAndUpdate(
      litterId,
      { $pull: { puppies: { _id: puppyId } } },
      { new: true }
    )

    if (!litter) {
      return res.status(404).json({ error: 'Litter or puppy not found' })
    }

    res.status(200).json(litter)
  } catch (error) {
    handleErrors(res, error)
  }
}

module.exports = {
  getLitters,
  getLitter,
  createLitter,
  updateLitter,
  deleteLitter,
  addPuppy,
  updatePuppy,
  deletePuppy
}
