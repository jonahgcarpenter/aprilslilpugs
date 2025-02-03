const express = require('express');
const router = express.Router();
const { 
  loginBreeder, 
  getBreederProfile, 
  updateBreederProfile,
  logoutBreeder
} = require('../controllers/breederController');
const requireAuth = require('../middleware/auth');
const { breederUpload } = require('../middleware/multerConfig');

// public routes
router.post('/login', loginBreeder);
router.get('/profile', getBreederProfile);

// protected routes
router.use(requireAuth);
router.patch('/profile', breederUpload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'galleryImage0', maxCount: 1 },
  { name: 'galleryImage1', maxCount: 1 }
]), updateBreederProfile);
router.post('/logout', logoutBreeder);

module.exports = router;
