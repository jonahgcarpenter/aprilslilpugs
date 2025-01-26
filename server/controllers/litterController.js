const Litter = require('../models/litterModel')
const mongoose = require('mongoose')

// Function to check if ObjectId is valid
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// Function to handle errors
const handleErrors = (res, error) => {
  res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' })
}

const getLitters = async (req, res) => {
  try {
    const litters = await Litter.find({}).sort({ createdAt: -1 })
    res.status(200).json(litters)
  } catch (error) {
    handleErrors(res, error)
  }
}

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
    handleErrors(res, error)
  }
}

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

const addPuppy = async (req, res) => {
  try {
    const { litterId } = req.params

    if (!isValidObjectId(litterId)) {
      return res.status(400).json({ error: 'Invalid litter ID format' })
    }

    const puppyData = {
      ...req.body,
      image: req.file ? `/uploads/puppy-images/${req.file.filename}` : '/puppy-placeholder.jpg'
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

const updatePuppy = async (req, res) => {
  try {
    const { litterId, puppyId } = req.params

    if (!isValidObjectId(litterId) || !isValidObjectId(puppyId)) {
      return res.status(400).json({ error: 'Invalid ID format' })
    }

    const updateData = {
      'puppies.$.status': req.body.status,
      'puppies.$.name': req.body.name,
      'puppies.$.color': req.body.color,
      'puppies.$.gender': req.body.gender
    }

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
