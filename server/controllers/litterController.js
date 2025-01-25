const Litter = require('../models/litterModel');

// Get all litters
const getLitters = async (req, res) => {
  try {
    const litters = await Litter.find().sort({ createdAt: -1 });
    res.json(litters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new litter
const createLitter = async (req, res) => {
  try {
    const litterData = {
      ...req.body,
      image: req.file ? `/uploads/litter-images/${req.file.filename}` : '/litter-placeholder.jpg',
      birthDate: new Date(req.body.birthDate),
      availableDate: new Date(req.body.availableDate)
    };

    const litter = new Litter(litterData);
    const newLitter = await litter.save();
    res.status(201).json(newLitter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add puppy to litter
const addPuppy = async (req, res) => {
  try {
    const litter = await Litter.findById(req.params.litterId);
    if (!litter) {
      return res.status(404).json({ message: 'Litter not found' });
    }

    const puppyData = {
      ...req.body,
      image: req.file ? `/uploads/puppy-images/${req.file.filename}` : '/puppy-placeholder.jpg'
    };

    litter.puppies.push(puppyData);
    const updatedLitter = await litter.save();
    res.status(201).json(updatedLitter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update puppy status
const updatePuppy = async (req, res) => {
  try {
    const litter = await Litter.findById(req.params.litterId);
    if (!litter) {
      return res.status(404).json({ message: 'Litter not found' });
    }

    const puppy = litter.puppies.id(req.params.puppyId);
    if (!puppy) {
      return res.status(404).json({ message: 'Puppy not found' });
    }

    if (req.body.status) puppy.status = req.body.status;
    if (req.body.name) puppy.name = req.body.name;
    if (req.body.color) puppy.color = req.body.color;

    await litter.save();
    res.json(litter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getLitters,
  createLitter,
  addPuppy,
  updatePuppy
};
