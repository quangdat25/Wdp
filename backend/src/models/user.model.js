const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: {
      type: String,
    },

    role: {
      type: String,
      required: true,
      enum: ["student", "admin", "staff", "manager"],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "leave", "probation"],
      default: "active",
    },
  },
  {
    discriminatorKey: "role",
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);