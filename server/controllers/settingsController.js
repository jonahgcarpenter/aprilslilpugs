const Settings = require('../models/settingsModel');

const toggleWaitlist = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    settings.waitlistEnabled = !settings.waitlistEnabled;
    await settings.save();
    res.status(200).json({ waitlistEnabled: settings.waitlistEnabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    res.status(200).json({ waitlistEnabled: settings.waitlistEnabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  toggleWaitlist,
  getSettings
};
