const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
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
      trim: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentExpiresAt: {
      type: Date,
      default: null,
    },

    renewedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    configId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SystemConfig",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index(
  {
    roomId: 1,
    semester: 1,
    bedNumber: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isBedReserved: true,
    },
    name: "unique_reserved_bed_per_semester",
  },
);

bookingSchema.index(
  {
    studentId: 1,
    semester: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isBedReserved: true,
    },
    name: "unique_student_booking_per_semester",
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
