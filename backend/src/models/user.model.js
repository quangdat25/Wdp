const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    roleId: {
      type: String,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "users",
    discriminatorKey: "userType",
  }
);

module.exports = mongoose.model("User", userSchema);