const mongoose = require('mongoose');

// Base schema for shared dog properties
const baseFields = {
  name: { type: String, required: true, trim: true },
  birthDate: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  color: { 
    type: String, 
    enum: ['black', 'fawn', 'apricot'],
    required: true 
  },
  health: {
    vaccinations: [{
      name: String,
      date: Date
    }],
    medicalHistory: [{
      date: Date,
      description: String
    }]
  }
};

// Schema for grown dogs (breeders and retired)
const grownDogSchema = new mongoose.Schema({
  ...baseFields,
  status: { 
    type: String, 
    enum: ['active', 'retired'],
    default: 'active',
    required: true
  },
  registration: { type: String, unique: true, sparse: true },
  offspring: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Puppy' }]
}, { timestamps: true });

// Schema for puppies
const puppySchema = new mongoose.Schema({
  ...baseFields,
  mother: { type: mongoose.Schema.Types.ObjectId, ref: 'GrownDog', required: true },
  father: { type: mongoose.Schema.Types.ObjectId, ref: 'GrownDog', required: true },
  litterRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Litter', required: true },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold'],
    default: 'available'
  }
}, { timestamps: true });

const litterSchema = new mongoose.Schema({
  litterName: { 
    type: String,
    unique: true,
    sparse: true
  },
  mother: { type: mongoose.Schema.Types.ObjectId, ref: 'GrownDog', required: true },
  father: { type: mongoose.Schema.Types.ObjectId, ref: 'GrownDog', required: true },
  expectedBy: { 
    type: Date,
    required: true
  },
  birthDate: { 
    type: Date,
    validate: {
      validator: function(birthDate) {
        return !this.expectedBy || birthDate >= this.expectedBy - (5 * 24 * 60 * 60 * 1000); // Within 5 days of expected date
      },
      message: 'Birth date should not be more than 5 days before expected date'
    }
  },
  readyBy: { 
    type: Date,
    validate: {
      validator: function(readyDate) {
        // Puppies should be at least 8 weeks old before ready
        return !this.birthDate || readyDate >= new Date(this.birthDate.getTime() + (8 * 7 * 24 * 60 * 60 * 1000));
      },
      message: 'Puppies must be at least 8 weeks old before being ready'
    }
  },
  notes: String,
  status: { 
    type: String, 
    enum: ['expecting', 'born', 'completed'],
    default: 'expecting',
    required: true
  },
  puppies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Puppy' }]
}, { timestamps: true });

// Helper function to generate litter name
litterSchema.methods.generateLitterName = async function() {
  try {
    const mother = await mongoose.model('GrownDog').findById(this.mother);
    const father = await mongoose.model('GrownDog').findById(this.father);
    if (mother && father) {
      return `${mother.name}X${father.name}`;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Pre-save middleware to set litter name and handle dates
litterSchema.pre('save', async function(next) {
  try {
    // Generate litter name if not set
    if (!this.litterName) {
      const generatedName = await this.generateLitterName();
      if (!generatedName) {
        throw new Error('Unable to generate litter name - parent dogs not found');
      }
      this.litterName = generatedName;
    }

    // Handle existing date logic
    if (this.birthDate && !this.readyBy) {
      this.readyBy = new Date(this.birthDate.getTime() + (8 * 7 * 24 * 60 * 60 * 1000));
    }
    
    // Update status based on dates
    const now = new Date();
    if (this.birthDate) {
      this.status = 'born';
    } else if (this.expectedBy > now) {
      this.status = 'expecting';
    } else if (this.readyBy && this.readyBy < now) {
      this.status = 'completed';
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Add indexes
grownDogSchema.index({ status: 1, name: 1 });
puppySchema.index({ status: 1, litterRef: 1, name: 1 });
litterSchema.index({ status: 1, expectedBy: -1 });

module.exports = {
  GrownDog: mongoose.model('GrownDog', grownDogSchema),
  Puppy: mongoose.model('Puppy', puppySchema),
  Litter: mongoose.model('Litter', litterSchema)
};
