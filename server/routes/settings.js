const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { toggleWaitlist, getSettings, toggleLive } = require('../controllers/settingsController');

// Public endpoint
router.get('/', getSettings);

// Protected endpoints
router.post('/toggle-waitlist', requireAuth, toggleWaitlist);
router.post('/toggle-live', requireAuth, toggleLive);

module.exports = router;
