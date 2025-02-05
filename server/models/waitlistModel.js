const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema(
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
    position: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      enum: ["waiting", "contacted", "completed"],
      default: "waiting",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

waitlistSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const lastEntry = await this.constructor.findOne().sort({ position: -1 });
      this.position = lastEntry ? lastEntry.position + 1 : 1;
    }
    next();
  } catch (error) {
    console.error("Error in pre-save middleware:", error);
    next(error);
  }
});

module.exports = mongoose.model("Waitlist", waitlistSchema);
