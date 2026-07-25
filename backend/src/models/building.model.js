const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    totalFloors: {
      type: Number,
      default: 5,
      immutable: true,
    },

    totalRoomsPerFloor: {
      type: Number,
      default: 14,
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Building", buildingSchema);
