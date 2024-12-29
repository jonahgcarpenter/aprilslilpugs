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
  // phone: {
  //   type: String,
  //   required: true
  // },
  // email: {
  //   type: String,
  //   required: true,
  //   unique: true,
  //   lowercase: true
  // },
  // location: {
  //   type: String,
  //   required: true
  // },
  // story: {
  //   type: String,
  //   required: true
  // },
  // profilePicture: {
  //   type: String,
  //   default: ''  // URL to default image could be set here
  // }
}, {timestamps: true})

module.exports = mongoose.model('Breeder', breederSchema)