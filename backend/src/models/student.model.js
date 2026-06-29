const mongoose = require("mongoose");
const User = require("./user.model");
const parentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    password: {
      type: String,
    },
    fullName: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    relationship: {
      type: String,
      default: "parent",
    },

    role: {
      type: String,
      default: "parent",
    },
  },
  { _id: false },
);
const studentSchema = new mongoose.Schema({
  studentCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  phone: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", ""],
    default: "",
  },
  CFDScore: { type: Number, default: 100 },
  dateOfBirth: Date,
  major: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },
  parent: parentSchema,
});
module.exports = User.discriminator("student", studentSchema);
