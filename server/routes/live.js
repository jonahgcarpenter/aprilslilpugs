const express = require('express');
const router = express.Router();
const LiveStatus = require('../models/liveModel');

// GET /api/live - Retrieve current live streaming status
router.get('/', async (req, res) => {
  try {
    let status = await LiveStatus.findOne();
    if (!status) {
      status = await LiveStatus.create({ isLive: false });
    }
    res.json({ isLive: status.isLive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/live - Update live streaming status
router.post('/', async (req, res) => {
  try {
    let status = await LiveStatus.findOne();
    if (!status) {
      status = await LiveStatus.create({ isLive: req.body.isLive });
    } else {
      status.isLive = req.body.isLive;
      await status.save();
    }
    res.json({ isLive: status.isLive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;