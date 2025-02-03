const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  waitlistEnabled: {
    type: Boolean,
    default: true
  },
  liveEnabled: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
