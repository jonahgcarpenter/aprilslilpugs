require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const breederRoutes = require("./routes/breeder");
const littersRoutes = require("./routes/litters");
const grumbleRoutes = require("./routes/grumble");
const waitlistRoutes = require("./routes/waitlist");
const settingsRoutes = require("./routes/settings");
const galleryRoutes = require("./routes/gallery");

//TODO: remove logging for deleting files or change to relative paths

// Create an express app
const app = express();

// middleware
app.use(express.json());

// Serve images from public directory
app.use("/api/images", express.static(path.join(__dirname, "public")));

app.use((req, _res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/breeder", breederRoutes);
app.use("/api/litters", littersRoutes);
app.use("/api/grumble", grumbleRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/gallery", galleryRoutes);

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, "build")));

// Handle React routing by serving index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    // listen
    app.listen(process.env.PORT, () => {
      console.log("Database connected, listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
