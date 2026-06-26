const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", 
      required: true,
    },

    // bedId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Bed",
    // },

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
