const { GrownDog, Puppy } = require('../models/dogModel');
const fs = require('fs').promises;
const path = require('path');

const dogController = {
  createGrownDog: async (req, res) => {
    try {
      // Create the dog with all data including profilePicture
      const dogData = {
        ...req.body,
        // The filename is already set in the middleware
      };
      
      const dog = await GrownDog.create(dogData);
      
      // Return the populated dog object
      const populatedDog = await GrownDog.findById(dog._id);
      res.status(201).json(populatedDog);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getActiveBreeders: async (req, res) => {
    try {
      const breeders = await GrownDog.find()
        .select('name birthDate gender color profilePicture')
        .sort('name');
      res.json(breeders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getGrownDog: async (req, res) => {
    try {
      const dog = await GrownDog.findById(req.params.id);
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      res.json(dog);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateGrownDog: async (req, res) => {
    try {
      const dog = await GrownDog.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      res.json(dog);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteGrownDog: async (req, res) => {
    try {
      const result = await deleteDocument(GrownDog, req.params.id);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  createPuppy: async (req, res) => {
    try {
      // Create the puppy with all data including profilePicture
      const puppyData = {
        ...req.body,
        // The filename is already set in the middleware
      };
      
      const puppy = await Puppy.create(puppyData);
      
      // Return the populated puppy object
      const populatedPuppy = await Puppy.findById(puppy._id)
        .populate('mother father', 'name color');
      res.status(201).json(populatedPuppy);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getAllPuppies: async (req, res) => {
    try {
      const puppies = await Puppy.find()
        .populate('mother father', 'name color')
        .sort('-birthDate')
        .lean();  // Convert to plain objects for easier manipulation

      const enrichedPuppies = puppies.map(puppy => ({
        ...puppy,
        parents: {
          mother: puppy.mother,
          father: puppy.father
        }
      }));

      res.json(enrichedPuppies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPuppy: async (req, res) => {
    try {
      const puppy = await Puppy.findById(req.params.id)
        .populate('mother father', 'name color');
      if (!puppy) {
        return res.status(404).json({ error: 'Puppy not found' });
      }
      res.json(puppy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updatePuppy: async (req, res) => {
    try {
      const puppy = await Puppy.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).populate('mother father', 'name color');

      if (!puppy) {
        return res.status(404).json({ error: 'Puppy not found' });
      }
      res.json(puppy);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deletePuppy: async (req, res) => {
    try {
      const result = await deleteDocument(Puppy, req.params.id);
      res.json(result);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
};

const handleProfilePicUpload = async (Model, id, file) => {
  if (!file) {
    throw new Error('No file uploaded');
  }

  const doc = await Model.findById(id);
  if (!doc) throw new Error('Document not found');

  // Delete old profile picture if it exists
  if (doc.profilePicture) {
    const oldPath = path.join(__dirname, '..', 'public/uploads/profile-pictures', doc.profilePicture);
    await fs.unlink(oldPath).catch(console.error);
  }

  // Store the complete URL path
  doc.profilePicture = `/api/images/uploads/profile-pictures/${file.filename}`;
  await doc.save();
  return doc;
};

const deleteDocument = async (Model, id) => {
  const doc = await Model.findById(id);
  if (!doc) throw new Error('Document not found');

  // Delete profile picture
  if (doc.profilePicture) {
    const profilePath = path.join(__dirname, '..', 'public/uploads/profile-pictures', doc.profilePicture);
    await fs.unlink(profilePath).catch(console.error);
  }

  await doc.deleteOne();
  return { message: 'Document deleted successfully' };
};

Object.assign(dogController, {
  uploadGrownDogProfilePic: async (req, res) => {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      const dog = await handleProfilePicUpload(GrownDog, req.params.id, req.file);
      res.json(dog);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  uploadPuppyProfilePic: async (req, res) => {
    try {
      const puppy = await handleProfilePicUpload(Puppy, req.params.id, req.file);
      res.json(puppy);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
});

module.exports = dogController;
