const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    roomPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    electricityPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    waterPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },

    effectiveFrom: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    activatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

systemConfigSchema.index({ status: 1 });

module.exports = mongoose.model("SystemConfig", systemConfigSchema);