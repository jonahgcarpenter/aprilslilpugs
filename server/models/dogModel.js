const mongoose = require('mongoose');

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
    get: function(v) {
      return v ? `/api/images/uploads/profile-pictures/${v}` : null;
    }
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
  profilePicture: { type: String }
}, { timestamps: true });

// Helper method to find litter siblings (puppies with same parents and birthdate)
puppySchema.statics.findLittermates = async function(puppyId) {
  const puppy = await this.findById(puppyId);
  if (!puppy) return [];
  
  return this.find({
    mother: puppy.mother,
    father: puppy.father,
    birthDate: puppy.birthDate,
    _id: { $ne: puppyId }
  });
};

// Helper method to find all litters (grouped by parents and birthdate)
puppySchema.statics.findLitters = async function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          mother: '$mother',
          father: '$father',
          birthDate: '$birthDate'
        },
        puppies: { $push: '$$ROOT' },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'growndogs',
        localField: '_id.mother',
        foreignField: '_id',
        as: 'motherDetails'
      }
    },
    {
      $lookup: {
        from: 'growndogs',
        localField: '_id.father',
        foreignField: '_id',
        as: 'fatherDetails'
      }
    },
    {
      $project: {
        mother: { $arrayElemAt: ['$motherDetails', 0] },
        father: { $arrayElemAt: ['$fatherDetails', 0] },
        birthDate: '$_id.birthDate',
        puppies: 1,
        count: 1
      }
    },
    { $sort: { birthDate: -1 } }
  ]);
};

// Add indexes
grownDogSchema.index({ name: 1 });
puppySchema.index({ mother: 1, father: 1, birthDate: 1 });

module.exports = {
  GrownDog: mongoose.model('GrownDog', grownDogSchema),
  Puppy: mongoose.model('Puppy', puppySchema)
};
