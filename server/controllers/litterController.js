const Litter = require("../models/litterModel");
const { parseCentralTime } = require("../util/timezone");
const fs = require("fs").promises;
const path = require("path");

// delete file helper
const deleteFile = async (filename, type = "litter") => {
  try {
    if (!filename || filename.includes("placeholder")) return;

    const folder = type === "puppy" ? "puppy-images" : "litter-images";
    const absolutePath = path.join("public", "uploads", folder, filename);

    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
    console.log("Successfully deleted file:", absolutePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("File not found at path:", error.path);
    } else {
      console.error("Error deleting file:", error);
    }
  }
};

// get all litters
const getLitters = async (req, res) => {
  try {
    const litters = await Litter.find({}).sort({ createdAt: -1 });
    if (!litters) {
      return res.status(404).json({ error: "No litters found" });
    }
    res.status(200).json(litters);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get single litter
const getLitter = async (req, res) => {
  const { litterId } = req.params;

  try {
    const litter = await Litter.findById(litterId);
    if (!litter) {
      return res.status(404).json({ error: "No such litter found" });
    }
    res.status(200).json(litter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// create new litter
const createLitter = async (req, res) => {
  try {
    const litterData = {
      ...req.body,
      profilePicture:
        req.files?.profilePicture?.[0]?.filename || "litter-placeholder.jpg",
      birthDate: parseCentralTime(req.body.birthDate),
      availableDate: parseCentralTime(req.body.availableDate),
    };

    const litter = await Litter.create(litterData);
    res.status(201).json(litter);
  } catch (error) {
    if (req.files?.profilePicture?.[0]) {
      await deleteFile(req.files.profilePicture[0].filename);
    }
    res.status(400).json({ error: error.message });
  }
};

// delete litter
const deleteLitter = async (req, res) => {
  const { litterId } = req.params;

  try {
    const litter = await Litter.findById(litterId);
    if (!litter) {
      return res.status(404).json({ error: "No such litter found" });
    }

    await deleteFile(litter.profilePicture);

    // Delete all puppy profile pictures
    for (const puppy of litter.puppies) {
      await deleteFile(puppy.profilePicture, "puppy");
    }

    await litter.deleteOne();
    res.status(200).json({ message: "Litter deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update litter
const updateLitter = async (req, res) => {
  const { litterId } = req.params;

  try {
    const litter = await Litter.findById(litterId);
    if (!litter) {
      return res.status(404).json({ error: "No such litter found" });
    }

    const updateData = { ...req.body };

    // Handle profile picture if uploaded
    if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
      await deleteFile(litter.profilePicture);
      updateData.profilePicture = req.files.profilePicture[0].filename;
    }

    if (req.body.birthDate) {
      updateData.birthDate = parseCentralTime(req.body.birthDate);
    }

    if (req.body.availableDate) {
      updateData.availableDate = parseCentralTime(req.body.availableDate);
    }

    const updatedLitter = await Litter.findByIdAndUpdate(litterId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedLitter);
  } catch (error) {
    // Delete newly uploaded files if update fails
    if (req.files && req.files.profilePicture) {
      await deleteFile(req.files.profilePicture[0].filename);
    }
    res.status(400).json({ error: error.message });
  }
};

// add puppy to litter
const addPuppy = async (req, res) => {
  const { litterId } = req.params;

  try {
    // Handle puppy data exactly like litter data
    let puppyData = { ...req.body };

    // Handle profile picture the same way as litters
    if (req.files && req.files.profilePicture && req.files.profilePicture[0]) {
      puppyData.profilePicture = req.files.profilePicture[0].filename;
    } else {
      puppyData.profilePicture = "puppy-placeholder.jpg";
    }

    const litter = await Litter.findById(litterId);
    if (!litter) {
      // Clean up any uploaded file
      if (req.files?.profilePicture?.[0]) {
        await deleteFile(req.files.profilePicture[0].filename, "puppy");
      }
      return res.status(404).json({ error: "Litter not found" });
    }

    const updatedLitter = await Litter.findByIdAndUpdate(
      litterId,
      { $push: { puppies: puppyData } },
      { new: true },
    );

    res.status(200).json(updatedLitter);
  } catch (error) {
    // Clean up any uploaded file
    if (req.files?.profilePicture?.[0]) {
      await deleteFile(req.files.profilePicture[0].filename, "puppy");
    }
    res.status(400).json({ error: error.message });
  }
};

// update puppy
const updatePuppy = async (req, res) => {
  const { litterId, puppyId } = req.params;

  try {
    const litter = await Litter.findOne({
      _id: litterId,
      "puppies._id": puppyId,
    });

    if (!litter) {
      if (req.files?.profilePicture?.[0]) {
        await deleteFile(req.files.profilePicture[0].filename, "puppy");
      }
      return res.status(404).json({ error: "Litter or puppy not found" });
    }

    const puppy = litter.puppies.id(puppyId);
    if (!puppy) {
      if (req.files?.profilePicture?.[0]) {
        await deleteFile(req.files.profilePicture[0].filename, "puppy");
      }
      return res.status(404).json({ error: "Puppy not found" });
    }

    const updateData = {
      "puppies.$.name": req.body.name || puppy.name,
      "puppies.$.color": req.body.color || puppy.color,
      "puppies.$.gender": req.body.gender || puppy.gender,
      "puppies.$.status": req.body.status || puppy.status,
      "puppies.$.profilePicture": puppy.profilePicture,
    };

    if (req.files?.profilePicture?.[0]) {
      const newProfilePicture = req.files.profilePicture[0].filename;
      updateData["puppies.$.profilePicture"] = newProfilePicture;

      if (
        puppy.profilePicture &&
        puppy.profilePicture !== "puppy-placeholder.jpg"
      ) {
        await deleteFile(puppy.profilePicture, "puppy");
      }
    }

    const updatedLitter = await Litter.findOneAndUpdate(
      { _id: litterId, "puppies._id": puppyId },
      { $set: updateData },
      { new: true },
    );

    if (!updatedLitter) {
      throw new Error("Failed to update puppy");
    }

    res.status(200).json(updatedLitter);
  } catch (error) {
    if (req.files?.profilePicture?.[0]) {
      await deleteFile(req.files.profilePicture[0].filename, "puppy");
    }
    res.status(400).json({ error: error.message });
  }
};

// delete puppy
const deletePuppy = async (req, res) => {
  const { litterId, puppyId } = req.params;

  try {
    const litter = await Litter.findById(litterId);
    if (!litter) {
      return res.status(404).json({ error: "Litter not found" });
    }

    const puppy = litter.puppies.id(puppyId);
    if (!puppy) {
      return res.status(404).json({ error: "Puppy not found" });
    }

    await deleteFile(puppy.profilePicture, "puppy");

    const updatedLitter = await Litter.findByIdAndUpdate(
      litterId,
      { $pull: { puppies: { _id: puppyId } } },
      { new: true },
    );

    res.status(200).json(updatedLitter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getLitters,
  getLitter,
  createLitter,
  updateLitter,
  deleteLitter,
  addPuppy,
  updatePuppy,
  deletePuppy,
};
