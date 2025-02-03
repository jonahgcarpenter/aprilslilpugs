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
    profilePicture: {
        type: String,
        default: 'grumble-placeholder.jpg' // Store only filename
    },
    birthDate: {
        type: Date,
        required: true,
        get: function(date) {
            if (!date) return null;
            const d = new Date(date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
    }
}, { 
    timestamps: true,
    toJSON: { 
        getters: true,
        virtuals: false
    }
})

module.exports = mongoose.model('Grumble', grumbleSchema)
