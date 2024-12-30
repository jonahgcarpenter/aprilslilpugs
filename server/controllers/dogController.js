const { GrownDog, Puppy, Litter } = require('../models/dogModel');

const dogController = {
  createGrownDog: async (req, res) => {
    try {
      const dog = new GrownDog(req.body);
      await dog.save();
      res.status(201).json(dog);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  createPuppy: async (req, res) => {
    try {
      const puppy = new Puppy(req.body);
      await puppy.save();
      // Update litter's puppies array
      await Litter.findByIdAndUpdate(
        puppy.litterRef,
        { $push: { puppies: puppy._id } }
      );
      res.status(201).json(puppy);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  getActiveBreeders: async (req, res) => {
    try {
      const breeders = await GrownDog.find({ status: 'active' })
        .select('-health.medicalHistory')
        .sort('name');
      res.json(breeders);
    } catch (error) {
      res.status(500).json({ error: error.message, code: error.code });
    }
  },

  getPuppiesByLitter: async (req, res) => {
    try {
      const puppies = await Puppy.find({ litterRef: req.params.litterId })
        .populate('mother father', 'name registration color')
        .populate('litterRef', 'litterName birthDate readyBy')
        .sort('name');
      
      if (!puppies.length) {
        return res.status(404).json({ error: 'No puppies found for this litter' });
      }
      res.json(puppies);
    } catch (error) {
      res.status(500).json({ error: error.message, code: error.code });
    }
  },

  getAllLitters: async (req, res) => {
    try {
      const litters = await Litter.find()
        .populate('mother father', 'name registration color')
        .populate('puppies', 'name color status')
        .sort('-expectedBy');
      res.json(litters);
    } catch (error) {
      res.status(500).json({ error: error.message, code: error.code });
    }
  },

  getActiveLitters: async (req, res) => {
    try {
      const litters = await Litter.find({
        status: { $in: ['expecting', 'born'] }
      })
      .populate('mother father', 'name registration')
      .sort('-birthDate');
      res.json(litters);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = dogController;
