const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invoiceCode: {
      type: String,
      unique: true,
      required: true,
    },

    type: {
      type: String,
      enum: ["room_fee", "utility"],
      required: true,
    },

    semester: {
      type: String, // e.g. 'SP26', 'SU26'
      required: true,
    },

    billingMonth: {
      type: Number, // 1, 2, 3, 4, or actual month 1-12. Null for room_fee
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    items: [
      {
        name: {
          type: String,
        },

        amount: {
          type: Number,
          required: true,
        },
        
        oldIndex: {
          type: Number,
          default: null,
        },

        newIndex: {
          type: Number,
          default: null,
        },
      },
    ],

    dueDate: Date,

    paidAt: Date,

    status: {
      type: String,
      enum: ["unpaid", "paid", "overdue", "cancelled"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Invoice", invoiceSchema);
