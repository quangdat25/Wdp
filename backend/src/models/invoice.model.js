const invoiceSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
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

    amount: {
      type: Number,
      required: true,
    },

    items: [
      {
        name: {
          type: String,
          enum: ["electricity", "water", "internet"],
        },

        amount: {
          type: Number,
          required: true,
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
