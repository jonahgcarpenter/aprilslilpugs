const express = require('express')
const router = express.Router();
const upload = require('../middleware/multerConfig');

const{
  createBreeder,
  getBreeders,
  getBreeder,
  deleteBreeder,
  updateBreeder
} = require('../controllers/breederController')

// GET all breeders
router.get('/', getBreeders)

// GET one breeders
router.get('/:id', getBreeder)

// POST a breeder
router.post('/', createBreeder)

// DELETE one breeder
router.delete('/:id', deleteBreeder)

// Update breeder
router.patch('/:id',  upload.single('profilePicture'), updateBreeder)

module.exports = router