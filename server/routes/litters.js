// Import dependencies
const express = require('express');
const router = express.Router();
const { 
  getLitters,
  getLitter,
  createLitter,
  updateLitter,
  deleteLitter,
  addPuppy,
  updatePuppy,
  deletePuppy
} = require('../controllers/litterController');
const { littersUpload, puppyUpload } = require('../middleware/multerConfig');

// Litter management routes
router.get('/', getLitters);                    // Get all litters
router.get('/:litterId', getLitter);           // Get specific litter
router.post('/', littersUpload.single('image'), createLitter);  // Create new litter
router.patch('/:litterId', littersUpload.single('image'), updateLitter);  // Update litter
router.delete('/:litterId', deleteLitter);     // Delete litter

// Puppy management routes within litters
router.post('/:litterId/puppies', puppyUpload.single('image'), addPuppy);  // Add puppy to litter
router.patch('/:litterId/puppies/:puppyId', puppyUpload.single('image'), updatePuppy);  // Update puppy
router.delete('/:litterId/puppies/:puppyId', deletePuppy);  // Remove puppy from litter

module.exports = router;
