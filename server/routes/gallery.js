const express = require("express");
const router = express.Router();
const {
  getGalleryItems,
  addGalleryItems,
  updateGalleryItem,
  deleteGalleryItem,
} = require("../controllers/galleryController");
const { galleryUpload } = require("../middleware/multerConfig");
const requireAuth = require("../middleware/auth");

// Public routes
router.get("/", getGalleryItems);

// Protected routes
router.post(
  "/",
  requireAuth,
  galleryUpload.array("images", 20),
  addGalleryItems,
);

router.patch(
  "/:id",
  requireAuth,
  galleryUpload.single("image"),
  updateGalleryItem,
);

router.delete("/:id", requireAuth, deleteGalleryItem);

module.exports = router;
