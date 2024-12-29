const express = require('express')
const router = express.Router();
const upload = require('../middleware/multerConfig');

const{
  createBreeder,
  getBreeders,
  getBreeder,
  deleteBreeder,
  updateBreeder,
  loginBreeder,
  updateBreederPassword
} = require('../controllers/breederController')

// GET all breeders
router.get('/', getBreeders)

// Login breeder
router.post('/login', loginBreeder)

// GET one breeder
router.get('/:id', getBreeder)

// POST a breeder
router.post('/', createBreeder)

// DELETE one breeder
router.delete('/:id', deleteBreeder)

// Update breeder
router.patch('/:id',  upload.single('profilePicture'), updateBreeder)

// Update password (development only)
router.post('/update-password/:id', updateBreederPassword)

module.exports = router