const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.post("/", async (req, res) => {
  // The payload coming from the frontend
  const payload = req.body;

  try {
    // Forward the request to the target endpoint (e.g., Home Assistant)
    const response = await fetch(process.env.HAS_NOTIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HAS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    // Get the response data
    const data = await response.json();
    // Return the response data to the client
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Error notifying:", error);
    res.status(500).json({ error: "Notification failed" });
  }
});

module.exports = router;
