const mongoose = require('mongoose');

const liveStatusSchema = new mongoose.Schema({
  isLive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('LiveStatus', liveStatusSchema);