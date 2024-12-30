const express = require('express');
const router = express.Router();
const dogController = require('../controllers/dogController');

// Grown dog routes
router.post('/dogs/grown', dogController.createGrownDog);
router.get('/dogs/grown', dogController.getActiveBreeders);
router.get('/dogs/grown/:id', dogController.getGrownDog);

// Puppy routes
router.post('/dogs/puppies', dogController.createPuppy);
router.get('/dogs/puppies/litter/:litterId', dogController.getPuppiesByLitter);

// Litter routes
router.post('/litters', dogController.createLitter);
router.get('/litters', dogController.getAllLitters);
router.get('/litters/active', dogController.getActiveLitters);
router.get('/litters/:id', dogController.getLitter);

module.exports = router;
