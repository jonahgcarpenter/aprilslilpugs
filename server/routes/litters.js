const express = require('express');
const router = express.Router();
const Litter = require('../models/litterModel');
const { littersUpload, puppyUpload } = require('../middleware/multerConfig');

// Get all litters
router.get('/', async (req, res) => {
  try {
    const litters = await Litter.find().sort({ createdAt: -1 });
    res.json(litters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new litter with image upload
router.post('/', littersUpload.single('image'), async (req, res) => {
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
});

// Add a puppy to a litter with image upload
router.post('/:litterId/puppies', puppyUpload.single('image'), async (req, res) => {
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
});

// Update puppy status
router.patch('/:litterId/puppies/:puppyId', async (req, res) => {
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
});

module.exports = router;
