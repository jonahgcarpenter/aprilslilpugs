const express = require('express');
const router = express.Router();
const {
  getAllEntries,
  createEntry,
  getEntry,
  updateEntry,
  deleteEntry
} = require('../controllers/waitlistController');

// CRUD routes
router.get('/', getAllEntries);
router.post('/', createEntry);
router.get('/:id', getEntry);
router.patch('/:id', updateEntry);
router.delete('/:id', deleteEntry);

module.exports = router;
