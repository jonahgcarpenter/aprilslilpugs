const express = require('express');
const router = express.Router();
const { toggleWaitlist, getSettings } = require('../controllers/settingsController');

router.get('/', getSettings);
router.post('/toggle-waitlist', toggleWaitlist);

module.exports = router;
