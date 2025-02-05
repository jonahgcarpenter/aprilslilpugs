const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const {
  getAllEntries,
  createEntry,
  getEntry,
  updateEntry,
  deleteEntry,
} = require("../controllers/waitlistController");

// Public route
router.post("/", createEntry);

// Protected routes
router.get("/", requireAuth, getAllEntries);
router.get("/:id", requireAuth, getEntry);
router.patch("/:id", requireAuth, updateEntry);
router.delete("/:id", requireAuth, deleteEntry);

module.exports = router;
