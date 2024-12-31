const mongoose = require('mongoose');
const { GrownDog, Puppy } = require('../models/dogModel');
const fs = require('fs').promises;
const path = require('path');

const dogController = {
  createGrownDog: async (req, res) => {
    try {
      const dog = new GrownDog(req.body);
      await dog.save();
      res.status(201).json(dog);
    } catch (error) {
      res.status(400).json({ error: error.message, code: error.code });
    }
  },

  getActiveBreeders: async (req, res) => {
    try {
      const breeders = await GrownDog.find()
        .select('name birthDate gender color images')
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
      const dog = await GrownDog.findById(req.params.id);
      if (!dog) {
        return res.status(404).json({ error: 'Dog not found' });
      }
      
      // Delete associated images
      for (const image of dog.images || []) {
        await fs.unlink(image.url).catch(() => {});
      }
      
      await dog.deleteOne();
      res.json({ message: 'Dog deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  createPuppy: async (req, res) => {
    try {
      const puppy = new Puppy(req.body);
      await puppy.save();
      res.status(201).json(puppy);
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
      );
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
      const puppy = await Puppy.findByIdAndDelete(req.params.id);
      if (!puppy) {
        return res.status(404).json({ error: 'Puppy not found' });
      }
      // Delete associated images
      for (const image of puppy.images) {
        await fs.unlink(image.url).catch(() => {});
      }
      res.json({ message: 'Puppy deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

const handleImageUpload = async (Model, id, files) => {
  const doc = await Model.findById(id);
  if (!doc) throw new Error('Document not found');

  const newImages = files.map(file => ({
    url: `/api/images/uploads/${file.path.replace(/\\/g, '/').replace('public/uploads/', '')}`,
    caption: '',
    isProfile: doc.images.length === 0 // Make first image the profile image
  }));

  doc.images.push(...newImages);
  await doc.save();
  return doc;
};

const handleProfilePicUpload = async (Model, id, file) => {
  const doc = await Model.findById(id);
  if (!doc) throw new Error('Document not found');

  // Delete old profile picture if it exists
  if (doc.profilePicture) {
    const oldPath = path.join(__dirname, '..', 'public', 'uploads', 'profile-pictures', 
      doc.profilePicture.split('/').pop());
    await fs.unlink(oldPath).catch(() => {});
  }

  // Store just the filename in the database
  doc.profilePicture = file.filename;
  await doc.save();
  return doc;
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
