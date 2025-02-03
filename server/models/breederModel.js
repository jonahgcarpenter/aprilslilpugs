const mongoose = require('mongoose')
const Schema = mongoose.Schema

const breederSchema = new Schema({
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
  email: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  story: {
    type: String,
    required: false
  },
  profilePicture: {
    type: String,
    required: false,
    // Stores: "1234567890-profile.jpg"
  },
  images: {
    type: [String],
    // Stores: ["1234567890-gallery1.jpg", "1234567890-gallery2.jpg"]
  },
  password: {
    type: String,
    required: true
  }
}, {timestamps: true})

module.exports = mongoose.model('Breeder', breederSchema)