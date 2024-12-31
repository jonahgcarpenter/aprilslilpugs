const express = require('express');
const router = express.Router();
const dogController = require('../controllers/dogController');
const { dogUpload } = require('../middleware/multerConfig');

// Grown dog routes
router.post('/grown', dogController.createGrownDog);
router.get('/grown', dogController.getActiveBreeders);
router.get('/grown/:id', dogController.getGrownDog);
router.put('/grown/:id', dogController.updateGrownDog);
router.delete('/grown/:id', dogController.deleteGrownDog);

// Puppy routes
router.post('/puppies', dogController.createPuppy);
router.get('/puppies', dogController.getAllPuppies);
router.get('/puppies/litters', dogController.getLitters); // Note: changed from /litter to /litters
router.get('/puppies/:id', dogController.getPuppy);
router.put('/puppies/:id', dogController.updatePuppy);
router.delete('/puppies/:id', dogController.deletePuppy);

// Profile picture routes
router.post('/:type/:id/profile-picture', 
  dogUpload.single('profilePicture'),
  (req, res) => {
    if (req.params.type === 'grown') {
      return dogController.uploadGrownDogProfilePic(req, res);
    }
    return dogController.uploadPuppyProfilePic(req, res);
  }
);

module.exports = router;
