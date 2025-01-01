const express = require('express')
const router = express.Router();
const { breederUpload } = require('../middleware/multerConfig');

const{
  getBreeders,
  getBreeder,
  updateBreeder,
  loginBreeder,
} = require('../controllers/breederController')

// GET all breeders
router.get('/', getBreeders)

// Login breeder
router.post('/login', loginBreeder)

// GET one breeder
router.get('/:id', getBreeder)

// Update breeder - update file handling middleware
router.patch('/:id', 
  breederUpload.single('profilePicture'), 
  (req, res, next) => {
    if (req.file) {
      req.body.profilePicture = `/api/images/breeder-profiles/${req.file.filename}`;
    }
    next();
  },
  updateBreeder
);

module.exports = router