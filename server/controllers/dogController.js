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
        .sort('-birthDate');
      res.json(puppies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getLitters: async (req, res) => {
    try {
      const litters = await Puppy.findLitters();
      res.json(litters);
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

const handleImageUpload = async (Model, id, files) => {
  if (!files || files.length === 0) {
    throw new Error('No files uploaded');
  }

  const doc = await Model.findById(id);
  if (!doc) throw new Error('Document not found');

  const newImages = files.map(file => ({
    url: `/uploads/${file.filename}`,
    caption: '',
    isProfile: doc.images.length === 0
  }));

  doc.images.push(...newImages);
  await doc.save();
  return doc;
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

  doc.profilePicture = file.filename;
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

  // Delete all associated images
  for (const image of doc.images || []) {
    const imagePath = path.join(__dirname, '..', 'public', image.url);
    await fs.unlink(imagePath).catch(console.error);
  }

  await doc.deleteOne();
  return { message: 'Document deleted successfully' };
};

Object.assign(dogController, {
  uploadGrownDogImages: async (req, res) => {
    try {
      const dog = await handleImageUpload(GrownDog, req.params.id, req.files);
      res.json(dog);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  uploadPuppyImages: async (req, res) => {
    try {
      const puppy = await handleImageUpload(Puppy, req.params.id, req.files);
      res.json(puppy);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

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
  },

  setProfileImage: async (Model, req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) throw new Error('Document not found');

      doc.images.forEach(img => {
        img.isProfile = img._id.toString() === req.params.imageId;
      });

      await doc.save();
      res.json(doc);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  setGrownDogProfileImage: (req, res) => dogController.setProfileImage(GrownDog, req, res),
  setPuppyProfileImage: (req, res) => dogController.setProfileImage(Puppy, req, res),

  deleteImage: async (Model, req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) throw new Error('Document not found');

      const image = doc.images.id(req.params.imageId);
      if (!image) throw new Error('Image not found');

      const filePath = path.join(__dirname, '..', 
        image.url.replace('/api/images/', 'public/'));
      
      await fs.unlink(filePath);
      
      doc.images.pull(req.params.imageId);
      
      if (image.isProfile && doc.images.length > 0) {
        doc.images[0].isProfile = true;
      }

      await doc.save();
      res.json(doc);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteGrownDogImage: (req, res) => dogController.deleteImage(GrownDog, req, res),
  deletePuppyImage: (req, res) => dogController.deleteImage(Puppy, req, res)
});

module.exports = dogController;
