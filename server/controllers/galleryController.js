const Gallery = require("../models/galleryModel");
const Grumble = require("../models/grumbleModel");
const Litter = require("../models/litterModel");
const fs = require("fs").promises;
const path = require("path");

// Helper function to delete old image files
const deleteGalleryFile = async (filename) => {
  try {
    if (!filename) return;

    const absolutePath = path.join("public", "uploads", "gallery", filename);
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
    console.log("Successfully deleted gallery file:", absolutePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("File not found at path:", error.path);
    } else {
      console.error("Error deleting file:", error);
    }
  }
};

// Helper to validate entity exists
const validateEntity = async (entityType, entityId, puppyId = null) => {
  switch (entityType) {
    case "grumble":
      const grumble = await Grumble.findById(entityId);
      return !!grumble;
    case "litter":
      const litter = await Litter.findById(entityId);
      if (!puppyId) return !!litter;
      return litter?.puppies.id(puppyId) != null;
    default:
      return false;
  }
};

// Get gallery items
const getGalleryItems = async (req, res) => {
  const { entityType, entityId, puppyId } = req.query;

  try {
    let query = {};

    if (entityType && entityId) {
      query.entityType = entityType;
      if (entityType === "grumble") {
        query.grumbleId = entityId;
      } else if (entityType === "litter") {
        query.litterId = entityId;
        if (puppyId) {
          query.puppyId = puppyId;
        }
      }
    }

    const galleryItems = await Gallery.find(query).sort({ createdAt: -1 });
    res.status(200).json(galleryItems);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add multiple gallery items
const addGalleryItems = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image files provided" });
    }

    if (req.files.length > 20) {
      for (const file of req.files) {
        await deleteGalleryFile(file.filename);
      }
      return res
        .status(400)
        .json({ error: "Maximum 20 images allowed per upload" });
    }

    const { entityType } = req.body;
    let descriptions;

    try {
      descriptions = JSON.parse(req.body.descriptions || "[]");
    } catch (error) {
      descriptions = [];
    }

    if (entityType === "litter" && req.body.litterId) {
      const isValid = await validateEntity(
        entityType,
        req.body.litterId,
        req.body.puppyId,
      );
      if (!isValid) {
        for (const file of req.files) {
          await deleteGalleryFile(file.filename);
        }
        return res.status(404).json({
          error: req.body.puppyId
            ? "Litter or puppy not found"
            : "Litter not found",
        });
      }
    }

    // Create gallery items for each uploaded file
    const galleryItems = req.files.map((file, index) => {
      const item = {
        filename: file.filename,
        description: descriptions[index] || "",
        entityType: entityType || "none",
        grumbleId: null,
        litterId: null,
        puppyId: null,
      };

      if (entityType === "grumble") {
        item.grumbleId = req.body.grumbleId;
      } else if (entityType === "litter") {
        item.litterId = req.body.litterId;
        if (req.body.puppyId) {
          item.puppyId = req.body.puppyId;
        }
      }

      return item;
    });

    const savedItems = await Gallery.insertMany(galleryItems);
    res.status(201).json({
      message: `Successfully uploaded ${savedItems.length} images`,
      items: savedItems,
    });
  } catch (error) {
    if (req.files) {
      for (const file of req.files) {
        await deleteGalleryFile(file.filename);
      }
    }
    res.status(400).json({ error: error.message });
  }
};

// Update gallery item
const updateGalleryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const galleryItem = await Gallery.findById(id);
    if (!galleryItem) {
      if (req.file) {
        await deleteGalleryFile(req.file.filename);
      }
      return res.status(404).json({ error: "Gallery item not found" });
    }

    const updateData = { ...req.body };

    if (req.file) {
      await deleteGalleryFile(galleryItem.filename);
      updateData.filename = req.file.filename;
    }

    const updatedItem = await Gallery.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    if (req.file) {
      await deleteGalleryFile(req.file.filename);
    }
    res.status(400).json({ error: error.message });
  }
};

// Delete gallery item
const deleteGalleryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const galleryItem = await Gallery.findById(id);
    if (!galleryItem) {
      return res.status(404).json({ error: "Gallery item not found" });
    }

    await deleteGalleryFile(galleryItem.filename);
    await galleryItem.deleteOne();

    res.status(200).json({ message: "Gallery item deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getGalleryItems,
  addGalleryItems,
  updateGalleryItem,
  deleteGalleryItem,
};
