const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    targetType: {
      type: String,
      enum: ["all", "roles", "users"],
      required: true,
    },

    targetRoles: [
      {
        type: String,
        enum: ["student", "staff", "manager", "admin","parent"],
      },
    ],

    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);