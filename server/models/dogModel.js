const mongoose = require('mongoose');

// Shared image schema
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  isProfile: { type: Boolean, default: false },
  uploadDate: { type: Date, default: Date.now }
});

// Simplified grown dog schema with images
const grownDogSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  birthDate: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  color: { 
    type: String, 
    enum: ['black', 'fawn', 'apricot'],
    required: true 
  },
  images: [imageSchema]
}, { timestamps: true });

// Updated puppy schema with images
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
  images: [imageSchema]
}, { timestamps: true });

// Add method to set profile picture
const setProfilePicture = async function(imageId) {
  // Reset all images isProfile flag to false
  await this.updateOne({
    'images': { '$set': { 'isProfile': false } }
  });
  
  // Set the selected image as profile
  await this.updateOne(
    { 'images._id': imageId },
    { '$set': { 'images.$.isProfile': true } }
  );
};

grownDogSchema.methods.setProfilePicture = setProfilePicture;
puppySchema.methods.setProfilePicture = setProfilePicture;

// Virtual for profile picture
const profilePictureVirtual = {
  get() {
    const profileImg = this.images.find(img => img.isProfile);
    return profileImg ? profileImg.url : null;
  }
};

grownDogSchema.virtual('profilePicture').get(profilePictureVirtual.get);
puppySchema.virtual('profilePicture').get(profilePictureVirtual.get);

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
