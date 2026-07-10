const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", 
      required: true,
    },

    bedNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },

    semester: {
      type: String,
      required: true,
    },

    startDate: Date,

    endDate: Date,

    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
      default: "pending",
    },

    renewedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    checkInDate: Date,

    checkOutDate: Date,
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Booking", bookingSchema);
