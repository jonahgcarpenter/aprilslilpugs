const fetch = require("node-fetch");

const sendNotification = async () => {
  try {
    const payload = {
      message: "Puppy Cam is down!",
      title: "Oswald",
      data: {
        push: {
          sound: "DeviceShutdown.caf",
          badge: 1,
        },
      },
    };

    const response = await fetch(process.env.HAS_NOTIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HAS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: "Notification failed" };
  }
};

module.exports = {
  sendNotification,
};
