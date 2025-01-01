const mongoose = require('mongoose');

const profilePictureGetter = function(v) {
  // Return just the filename as the URL already contains the path
  return v ? v : null;
};

// Simplified grown dog schema with profile picture
const grownDogSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  birthDate: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  color: { 
    type: String, 
    enum: ['black', 'fawn', 'apricot'],
    required: true 
  },
  profilePicture: { 
    type: String,
    get: profilePictureGetter
  }
}, { 
  timestamps: true,
  toJSON: { getters: true }, // Enable getters when converting to JSON
  toObject: { getters: true } // Enable getters when converting to object
});

// Updated puppy schema with profile picture
const puppySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mother: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GrownDog', 
    required: true 
  },
  father: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GrownDog', 
    required: true 
  },
  birthDate: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  color: { 
    type: String, 
    enum: ['black', 'fawn', 'apricot'],
    required: true 
  },
  profilePicture: { 
    type: String,
    get: profilePictureGetter
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Add indexes
grownDogSchema.index({ name: 1 });
puppySchema.index({ mother: 1, father: 1, birthDate: 1 });

module.exports = {
  GrownDog: mongoose.model('GrownDog', grownDogSchema),
  Puppy: mongoose.model('Puppy', puppySchema)
};
