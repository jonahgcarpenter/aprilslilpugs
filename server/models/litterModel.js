const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { convertToCentralTime } = require('../util/timezone')

// Shared date getter function
const dateGetter = function(date) {
  if (!date) return null;
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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
    default: Date.now,
    get: dateGetter
  }
}, { toJSON: { getters: true } });

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
    required: true,
    get: dateGetter
  },
  availableDate: {
    type: Date,
    required: true,
    get: dateGetter
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
}, { 
  timestamps: true,
  toJSON: { getters: true }
});

module.exports = mongoose.model('Litter', litterSchema)
