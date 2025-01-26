const Litter = require('../models/litterModel')
const mongoose = require('mongoose')

const getLitters = async (req, res) => {
  try {
    const litters = await Litter.find({}).sort({createdAt: -1})
    res.status(200).json(litters)
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code })
  }
}

const getLitter = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.litterId)) {
      return res.status(400).json({error: 'Invalid litter ID format'})
    }
    const litter = await Litter.findById(req.params.litterId)
    if (!litter) {
      return res.status(404).json({error: 'Litter not found'})
    }
    res.status(200).json(litter)
  } catch (error) {
    res.status(500).json({ error: error.message })
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
    res.status(400).json({ error: error.message })
  }
}

const updateLitter = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.litterId)) {
      return res.status(400).json({error: 'Invalid litter ID format'})
    }

    const updateData = {
      ...req.body
    }
    
    if (req.file) {
      updateData.image = `/uploads/litter-images/${req.file.filename}`
    }
    
    if (req.body.birthDate) {
      updateData.birthDate = new Date(req.body.birthDate)
    }
    
    if (req.body.availableDate) {
      updateData.availableDate = new Date(req.body.availableDate)
    }

    const litter = await Litter.findOneAndUpdate(
      { _id: req.params.litterId },
      updateData,
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

const deleteLitter = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.litterId)) {
      return res.status(400).json({error: 'Invalid litter ID format'})
    }

    const litter = await Litter.findOneAndDelete({ _id: req.params.litterId })

    if (!litter) {
      return res.status(404).json({error: 'Litter not found'})
    }

    res.status(200).json(litter)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

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

const updatePuppy = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.litterId)) {
      return res.status(400).json({error: 'Invalid litter ID format'})
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
        _id: req.params.litterId,
        'puppies._id': req.params.puppyId
      },
      { $set: updateData },
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

const deletePuppy = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.litterId)) {
      return res.status(400).json({error: 'Invalid litter ID format'})
    }

    const litter = await Litter.findOneAndUpdate(
      { _id: req.params.litterId },
      { $pull: { puppies: { _id: req.params.puppyId } } },
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
  getLitter,
  createLitter,
  updateLitter,
  deleteLitter,
  addPuppy,
  updatePuppy,
  deletePuppy
}
