const express = require('express')
const router = express.Router();
const { breederUpload } = require('../middleware/multerConfig');

const{
  getBreeders,
  getBreeder,
  updateBreeder,
  loginBreeder,
} = require('../controllers/breederController')

// Breeder authentication and management routes
router.get('/', getBreeders)      // Get all breeders
router.post('/login', loginBreeder)  // Breeder authentication
router.get('/:id', getBreeder)    // Get single breeder profile

// Update breeder profile with image handling
router.patch('/:id', 
  breederUpload.single('profilePicture'), 
  (req, res, next) => {
    // Transform uploaded file path for storage
    if (req.file) {
      req.body.profilePicture = `/api/images/breeder-profiles/${req.file.filename}`;
    }
    next();
  },
  updateBreeder
);

module.exports = router