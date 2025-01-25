const mongoose = require('mongoose');

const puppySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '/puppy-placeholder.jpg'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Sold'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const litterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mother: {
    type: String,
    required: true
  },
  father: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  availableDate: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    default: '/litter-placeholder.jpg'
  },
  puppies: [puppySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Litter', litterSchema);
