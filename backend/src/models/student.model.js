const mongoose = require("mongoose");
const User = require("./user.model");

const parentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
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
  },
  { _id: false }
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

  dateOfBirth: {
    type: Date,
  },

  major: {
    type: String,
    default: "",
  },

  address: {
    type: String,
    default: "",
  },

  parent: parentSchema,
});

module.exports = User.discriminator("Student", studentSchema);