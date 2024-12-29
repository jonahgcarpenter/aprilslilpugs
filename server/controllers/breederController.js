const Breeder = require('../models/breederModel')
const mongoose = require('mongoose')

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
  const {firstName, lastName} = req.body

  // add doc to db
  try {
    const breeder = await Breeder.create({firstName, lastName})
    res.status(200).json(breeder)
  } catch (error) {
    res.status(400).json({error: error.message})
  }
}

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
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({error: 'Invalid ID, Breeder not found'})
  }

  const breeder = await Breeder.findOneAndUpdate({_id: id}, {
    ...req.body
  })

  if (!breeder) {
    return res.status(404).json({error: 'Breeder not found'})
  }

  res.status(200).json(breeder)
}

module.exports = {
  getBreeders,
  getBreeder,
  createBreeder,
  deleteBreeder,
  updateBreeder
}