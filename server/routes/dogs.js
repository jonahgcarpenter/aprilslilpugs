const express = require('express');
const router = express.Router();
const dogController = require('../controllers/dogController');
const { dogUpload, puppyUpload } = require('../middleware/multerConfig');

// Grown dog routes
router.post('/grown', 
  dogUpload.single('profilePicture'),
  (req, res, next) => {
    if (req.file) {
      // Store only the filename in the database
      req.body.profilePicture = req.file.filename;
    }
    next();
  },
  dogController.createGrownDog
);

router.get('/grown', dogController.getActiveBreeders);
router.get('/grown/:id', dogController.getGrownDog);

router.put('/grown/:id',
  dogUpload.single('profilePicture'),
  (req, res, next) => {
    if (req.file) {
      // Store only the filename in the database
      req.body.profilePicture = req.file.filename;
    }
    next();
  },
  dogController.updateGrownDog
);

router.delete('/grown/:id', dogController.deleteGrownDog);

// Puppy routes
router.post('/puppies', 
  dogUpload.single('profilePicture'),
  (req, res, next) => {
    if (req.file) {
      // Store full API path
      req.body.profilePicture = `/api/images/uploads/profile-pictures/${req.file.filename}`;
    }
    next();
  },
  dogController.createPuppy
);

router.put('/puppies/:id',
  dogUpload.single('profilePicture'),
  (req, res, next) => {
    if (req.file) {
      // Store full API path
      req.body.profilePicture = `/api/images/uploads/profile-pictures/${req.file.filename}`;
    }
    next();
  },
  dogController.updatePuppy
);

router.get('/puppies', dogController.getAllPuppies);
router.get('/puppies/litters', dogController.getLitters); // Note: changed from /litter to /litters
router.get('/puppies/:id', dogController.getPuppy);
router.delete('/puppies/:id', dogController.deletePuppy);

module.exports = router;
