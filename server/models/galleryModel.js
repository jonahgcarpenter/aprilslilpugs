const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gallerySchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    grumbleId: {
      type: Schema.Types.ObjectId,
      ref: "Grumble",
      default: null,
    },
    litterId: {
      type: Schema.Types.ObjectId,
      ref: "Litter",
      default: null,
    },
    puppyId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    entityType: {
      type: String,
      enum: ["grumble", "litter", "puppy", "none"],
      default: "none",
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      virtuals: false,
    },
  },
);

gallerySchema.index({ entityType: 1, grumbleId: 1 });
gallerySchema.index({ entityType: 1, litterId: 1 });
gallerySchema.index({ entityType: 1, litterId: 1, puppyId: 1 });

module.exports = mongoose.model("Gallery", gallerySchema);
