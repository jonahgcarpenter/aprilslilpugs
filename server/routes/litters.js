const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
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

// Public routes
router.get('/', getLitters);
router.get('/:litterId', getLitter);

// Protected routes
router.post('/', requireAuth, littersUpload.single('profilePicture'), createLitter);
router.patch('/:litterId', requireAuth, littersUpload.single('profilePicture'), updateLitter);
router.delete('/:litterId', requireAuth, deleteLitter);

// Protected puppy routes
router.post('/:litterId/puppies', requireAuth, puppyUpload.single('profilePicture'), addPuppy);
router.patch('/:litterId/puppies/:puppyId', requireAuth, puppyUpload.single('profilePicture'), updatePuppy);
router.delete('/:litterId/puppies/:puppyId', requireAuth, deletePuppy);

module.exports = router;