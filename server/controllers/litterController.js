const Litter = require('../models/litterModel')
const mongoose = require('mongoose')
const { parseCentralTime } = require('../util/timezone')
const fs = require('fs').promises
const path = require('path')

/**
 * Utility Functions
 */
// Validates if a given ID matches MongoDB ObjectId format
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// Centralizes error handling across all controller functions
const handleErrors = (res, error) => {
  res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' })
}

const deleteImageFile = async (imagePath) => {
    try {
        if (!imagePath || imagePath.includes('placeholder')) return;
        
        const relativePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        const absolutePath = path.join('public', relativePath);
        
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
      profilePicture: req.file ? `/uploads/litter-images/${req.file.filename}` : '/uploads/litter-images/litter-placeholder.jpg',
      birthDate: parseCentralTime(req.body.birthDate),
      availableDate: parseCentralTime(req.body.availableDate)
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
  let newFilePath = null;
  try {
    const { litterId } = req.params

    if (!isValidObjectId(litterId)) {
      return res.status(400).json({ error: 'Invalid litter ID format' })
    }

    const litter = await Litter.findById(litterId)
    if (!litter) {
      return res.status(404).json({ error: 'Litter not found' })
    }

    const updateData = { ...req.body }

    if (req.file) {
      newFilePath = `/uploads/litter-images/${req.file.filename}`;
      try {
        await deleteImageFile(litter.profilePicture);
        updateData.profilePicture = newFilePath;
      } catch (error) {
        console.error('Error deleting old image:', error);
        // Continue with update even if old image deletion fails
      }
    }

    if (req.body.birthDate) {
      updateData.birthDate = parseCentralTime(req.body.birthDate)
    }

    if (req.body.availableDate) {
      updateData.availableDate = parseCentralTime(req.body.availableDate)
    }

    const updatedLitter = await Litter.findByIdAndUpdate(
      litterId,
      updateData,
      { new: true }
    )

    if (!updatedLitter) {
      throw new Error('Failed to update litter')
    }

    res.status(200).json(updatedLitter)
  } catch (error) {
    // If there was an error and we uploaded a new file, clean it up
    if (newFilePath) {
      try {
        await deleteImageFile(newFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up new file:', cleanupError);
      }
    }
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

    const litter = await Litter.findById(litterId)
    if (!litter) {
      return res.status(404).json({ error: 'Litter not found' })
    }

    // Delete litter's profile picture
    await deleteImageFile(litter.profilePicture)

    // Delete all puppy profile pictures
    for (const puppy of litter.puppies) {
      await deleteImageFile(puppy.profilePicture)
    }

    await litter.deleteOne()
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
      profilePicture: req.file ? `/uploads/puppy-images/${req.file.filename}` : '/uploads/puppy-images/puppy-placeholder.jpg'
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

    const litter = await Litter.findOne({
      _id: litterId,
      'puppies._id': puppyId
    })

    if (!litter) {
      return res.status(404).json({ error: 'Litter or puppy not found' })
    }

    const puppy = litter.puppies.id(puppyId)

    const updateData = {}
    if (req.body.name) updateData['puppies.$.name'] = req.body.name
    if (req.body.color) updateData['puppies.$.color'] = req.body.color
    if (req.body.gender) updateData['puppies.$.gender'] = req.body.gender
    if (req.body.status) updateData['puppies.$.status'] = req.body.status
    if (req.file) {
      await deleteImageFile(puppy.profilePicture)
      updateData['puppies.$.profilePicture'] = `/uploads/puppy-images/${req.file.filename}`
    }

    const updatedLitter = await Litter.findOneAndUpdate(
      {
        _id: litterId,
        'puppies._id': puppyId
      },
      { $set: updateData },
      { new: true }
    )

    res.status(200).json(updatedLitter)
  } catch (error) {
    if (req.file) {
      await deleteImageFile(`/uploads/puppy-images/${req.file.filename}`)
    }
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

    const litter = await Litter.findById(litterId)
    if (!litter) {
      return res.status(404).json({ error: 'Litter not found' })
    }

    const puppy = litter.puppies.id(puppyId)
    if (!puppy) {
      return res.status(404).json({ error: 'Puppy not found' })
    }

    // Delete puppy's profile picture
    await deleteImageFile(puppy.profilePicture)

    const updatedLitter = await Litter.findByIdAndUpdate(
      litterId,
      { $pull: { puppies: { _id: puppyId } } },
      { new: true }
    )

    res.status(200).json(updatedLitter)
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
