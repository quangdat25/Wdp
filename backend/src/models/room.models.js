const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },

    floor: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    displayName: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },

    capacity: {
      type: Number,
      default: 4,
      min: 4,
      max: 4,
    },

    currentOccupants: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },

    students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        bedNumber: {
          type: Number,
          required: true,
          min: 1,
          max: 4,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique room per building+floor+roomNumber
roomSchema.index({ building: 1, floor: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
