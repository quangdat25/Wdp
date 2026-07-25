const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    invoiceCode: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["room_fee", "utility"],
      required: true,
      index: true,
    },

    semester: {
      type: String,
      trim: true,
    },

    billingMonth: {
      type: Number,
      min: 1,
      max: 12,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    items: [
      {
        name: {
          type: String,
          enum: ["electricity", "water"],
          required: true,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    dueDate: {
      type: Date,
      required: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["unpaid", "paid", "overdue", "cancelled"],
      default: "unpaid",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
