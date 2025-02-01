const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  waitlistEnabled: {
    type: Boolean,
    default: true
  }
});

// Ensure we only ever have one settings document
settingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ waitlistEnabled: true });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
