const mongoose = require('mongoose')

const Schema = mongoose.Schema

const grumbleSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "/uploads/grumble-images/grumble-placeholder.jpg"
    },
    birthDate: {
        type: Date,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Grumble', grumbleSchema)
