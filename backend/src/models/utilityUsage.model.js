const mongoose = require("mongoose");

const utilityUsageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    buildingName: {
      type: String,
      required: true,
      trim: true,
    },

    floor: {
      type: Number,
      required: true,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    semester: {
      type: String,
      required: true,
      trim: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    electricityAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    waterAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    importedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

utilityUsageSchema.index(
  {
    roomId: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("UtilityUsage", utilityUsageSchema);