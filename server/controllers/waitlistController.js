const Waitlist = require('../models/waitlistModel');
const mongoose = require('mongoose');

// Get all waitlist entries
const getAllEntries = async (req, res) => {
  try {
    const entries = await Waitlist.find({})
      .sort({ createdAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code });
  }
};

// Create new waitlist entry
const createEntry = async (req, res) => {
  try {
    const entry = await Waitlist.create(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code });
  }
};

// Get single entry
const getEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'Invalid ID format'});
    }

    const entry = await Waitlist.findById(id);
    if (!entry) {
      return res.status(404).json({error: 'Waitlist entry not found'});
    }

    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code });
  }
};

// Update entry
const updateEntry = async (req, res) => {
  try {
    const entry = await Waitlist.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    
    if (!entry) {
      return res.status(404).json({error: 'Waitlist entry not found'});
    }
    
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code });
  }
};

// Delete entry
const deleteEntry = async (req, res) => {
  try {
    const entry = await Waitlist.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.status(200).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllEntries,
  createEntry,
  getEntry,
  updateEntry,
  deleteEntry
};
