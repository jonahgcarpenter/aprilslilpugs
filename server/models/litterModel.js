const mongoose = require('mongoose')
const Schema = mongoose.Schema

const puppySchema = new Schema({
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
    default: '/uploads/puppy-images/puppy-placeholder.jpg'
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

const litterSchema = new Schema({
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
    default: '/uploads/litter-images/litter-placeholder.jpg'
  },
  puppies: [puppySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Litter', litterSchema)
