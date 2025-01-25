const express = require('express');
const router = express.Router();
const { 
  getLitters, 
  createLitter, 
  addPuppy, 
  updatePuppy 
} = require('../controllers/litterController');
const { littersUpload, puppyUpload } = require('../middleware/multerConfig');

router.get('/', getLitters);
router.post('/', littersUpload.single('image'), createLitter);
router.post('/:litterId/puppies', puppyUpload.single('image'), addPuppy);
router.patch('/:litterId/puppies/:puppyId', updatePuppy);

module.exports = router;
