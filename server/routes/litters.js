const express = require('express');
const router = express.Router();
const { 
  getLitters, 
  createLitter, 
  addPuppy, 
  updatePuppy 
} = require('../controllers/litterController');
const { littersUpload, puppyUpload } = require('../middleware/multerConfig');

// Get all litters
router.get('/', getLitters);

// Create a new litter with image upload
router.post('/', littersUpload.single('image'), createLitter);

// Add a puppy to a litter with image upload
router.post('/:litterId/puppies', puppyUpload.single('image'), addPuppy);

// Update puppy status
router.patch('/:litterId/puppies/:puppyId', updatePuppy);

module.exports = router;
