const express = require("express");
const router = express.Router();
const {
  getLitters,
  getLitter,
  createLitter,
  updateLitter,
  deleteLitter,
  addPuppy,
  updatePuppy,
  deletePuppy,
} = require("../controllers/litterController");
const { littersUpload, puppyUpload } = require("../middleware/multerConfig");
const requireAuth = require("../middleware/auth");

// Public routes
router.get("/", getLitters);
router.get("/:litterId", getLitter);

// Protected routes
router.post(
  "/",
  requireAuth,
  littersUpload.fields([{ name: "profilePicture", maxCount: 1 }]),
  createLitter,
);
router.patch(
  "/:litterId",
  requireAuth,
  littersUpload.fields([{ name: "profilePicture", maxCount: 1 }]),
  updateLitter,
);
router.delete("/:litterId", requireAuth, deleteLitter);

// Protected puppy routes
router.post(
  "/:litterId/puppies",
  requireAuth,
  puppyUpload.fields([{ name: "profilePicture", maxCount: 1 }]),
  addPuppy,
);
router.patch(
  "/:litterId/puppies/:puppyId",
  requireAuth,
  puppyUpload.fields([{ name: "profilePicture", maxCount: 1 }]),
  updatePuppy,
);
router.delete("/:litterId/puppies/:puppyId", requireAuth, deletePuppy);
module.exports = router;

