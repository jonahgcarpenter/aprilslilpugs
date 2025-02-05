const Waitlist = require("../models/waitlistModel");
const mongoose = require("mongoose");

// Get all waitlist entries
const getAllEntries = async (req, res) => {
  try {
    const entries = await Waitlist.find({}).sort({ position: 1 });

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new waitlist entry
const createEntry = async (req, res) => {
  try {
    const entry = new Waitlist({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      notes: req.body.notes || "",
      status: req.body.status || "waiting",
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating waitlist entry:", error);
    res.status(500).json({
      error: "Failed to create waitlist entry",
      details: error.message,
    });
  }
};

// Get single entry
const getEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const entry = await Waitlist.findById(id);
    if (!entry) {
      return res.status(404).json({ error: "Waitlist entry not found" });
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
      { new: true },
    );

    if (!entry) {
      return res.status(404).json({ error: "Waitlist entry not found" });
    }

    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message, code: error.code });
  }
};

// Delete entry
const deleteEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const entry = await Waitlist.findById(req.params.id);
    if (!entry) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Entry not found" });
    }

    const deletedPosition = entry.position;

    // Delete the entry
    await entry.deleteOne();

    // Update positions for all entries after the deleted one
    await Waitlist.updateMany(
      { position: { $gt: deletedPosition } },
      { $inc: { position: -1 } },
    );

    await session.commitTransaction();
    res.status(200).json(entry);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllEntries,
  createEntry,
  getEntry,
  updateEntry,
  deleteEntry,
};
