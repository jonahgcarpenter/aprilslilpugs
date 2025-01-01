const express = require('express');
const router = express.Router();
const dogController = require('../controllers/dogController');
const { dogUpload } = require('../middleware/multerConfig');

const handleFileUpload = (req, res, next) => {
  if (req.file) {
    req.body.profilePicture = req.file.filename;
  }
  next();
};

// Grown dog routes
router.post('/grown', dogUpload.single('profilePicture'), handleFileUpload, dogController.createGrownDog);
router.get('/grown', dogController.getActiveBreeders);
router.get('/grown/:id', dogController.getGrownDog);
router.put('/grown/:id', dogUpload.single('profilePicture'), handleFileUpload, dogController.updateGrownDog);
router.delete('/grown/:id', dogController.deleteGrownDog);

// Grown dog image routes
router.post('/grown/:id/images', dogUpload.array('images', 10), dogController.uploadGrownDogImages);
router.post('/grown/:id/profile-picture', dogUpload.single('profilePicture'), dogController.uploadGrownDogProfilePic);
router.put('/grown/:id/images/:imageId/set-profile', dogController.setGrownDogProfileImage);
router.delete('/grown/:id/images/:imageId', dogController.deleteGrownDogImage);

// Puppy routes
router.post('/puppies', dogUpload.single('profilePicture'), handleFileUpload, dogController.createPuppy);
router.get('/puppies', dogController.getAllPuppies);
router.get('/puppies/litters', dogController.getLitters);
router.get('/puppies/:id', dogController.getPuppy);
router.put('/puppies/:id', dogUpload.single('profilePicture'), handleFileUpload, dogController.updatePuppy);
router.delete('/puppies/:id', dogController.deletePuppy);

// Puppy image routes
router.post('/puppies/:id/images', dogUpload.array('images', 10), dogController.uploadPuppyImages);
router.post('/puppies/:id/profile-picture', dogUpload.single('profilePicture'), dogController.uploadPuppyProfilePic);
router.put('/puppies/:id/images/:imageId/set-profile', dogController.setPuppyProfileImage);
router.delete('/puppies/:id/images/:imageId', dogController.deletePuppyImage);

module.exports = router;
