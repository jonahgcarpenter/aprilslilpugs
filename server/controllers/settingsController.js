const Settings = require("../models/settingsModel");
const { sendNotification } = require("../util/notify");

const getSettings = async (req, res) => {
  try {
    let settings =
      (await Settings.findOne({})) || (await new Settings().save());
    res.status(200).json({
      waitlistEnabled: settings.waitlistEnabled,
      liveEnabled: settings.liveEnabled,
      streamDown: settings.streamDown,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleWaitlist = async (req, res) => {
  try {
    let settings =
      (await Settings.findOne({})) || (await new Settings().save());
    settings.waitlistEnabled = !settings.waitlistEnabled;
    await settings.save();
    res.status(200).json({ waitlistEnabled: settings.waitlistEnabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleLive = async (req, res) => {
  try {
    let settings =
      (await Settings.findOne({})) || (await new Settings().save());
    settings.liveEnabled = !settings.liveEnabled;
    await settings.save();
    res.status(200).json({ liveEnabled: settings.liveEnabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const streamDown = async (req, res) => {
  try {
    let settings =
      (await Settings.findOne({})) || (await new Settings().save());
    const previousState = settings.streamDown;
    settings.streamDown = !settings.streamDown;
    await settings.save();

    if (!previousState && settings.streamDown) {
      const notificationResult = await sendNotification();

      if (!notificationResult.success) {
        console.error("Failed to send stream down notification");
      }
    }

    res.status(200).json({ streamDown: settings.streamDown });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSettings,
  toggleWaitlist,
  toggleLive,
  streamDown,
};
