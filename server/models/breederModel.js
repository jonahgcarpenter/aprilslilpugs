const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const breederSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    story: {
      type: String,
      required: false,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Breeder", breederSchema);

