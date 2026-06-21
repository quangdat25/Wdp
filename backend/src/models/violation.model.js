const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    securityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    building: {
      type: String,
      required: true,
      trim: true,
    },
    pointsDeducted: {
      type: Number,
      default: 0, 
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Violation", violationSchema);
