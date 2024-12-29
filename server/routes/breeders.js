const express = require('express')
const{
  createBreeder,
  getBreeders,
  getBreeder,
  deleteBreeder,
  updateBreeder
} = require('../controllers/breederController')
const router = express.Router()

// GET all breeders
router.get('/', getBreeders)

// GET one breeders
router.get('/:id', getBreeder)

// POST a breeder
router.post('/', createBreeder)

// DELETE one breeder
router.delete('/:id', deleteBreeder)

// Update breeder
router.patch('/:id', updateBreeder)

module.exports = router