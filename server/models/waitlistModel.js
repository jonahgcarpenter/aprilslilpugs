const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'contacted', 'completed'],
    default: 'waiting'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Waitlist', waitlistSchema);
