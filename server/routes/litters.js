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

router.get('/', getLitters);
router.get('/:litterId', getLitter);
router.post('/', littersUpload.single('image'), createLitter);
router.patch('/:litterId', littersUpload.single('image'), updateLitter);
router.delete('/:litterId', deleteLitter);
router.post('/:litterId/puppies', puppyUpload.single('image'), addPuppy);
router.patch('/:litterId/puppies/:puppyId', puppyUpload.single('image'), updatePuppy);
router.delete('/:litterId/puppies/:puppyId', deletePuppy);

module.exports = router;
