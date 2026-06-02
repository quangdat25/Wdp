const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Nam", "Nữ"],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    major: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      default: null,
      trim: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Parent",
      default: null,
    },
  },
  { timestamps: true }
);

// --- Indexes ---
studentSchema.index({ roomId: 1 });
studentSchema.index({ parentId: 1 });

module.exports = mongoose.model("Student", studentSchema);
