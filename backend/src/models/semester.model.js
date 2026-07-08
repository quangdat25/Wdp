const mongoose = require("mongoose");

const semesterPeriodSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    renewalStartDate: {
      type: Date,
      required: true,
    },
    renewalEndDate: {
      type: Date,
      required: true,
    },

    bookingStartDate: {
      type: Date,
      required: true,
    },
    bookingEndDate: {
      type: Date,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const semesterSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,

    },

    spring: {
      type: semesterPeriodSchema,
      required: true,
    },

    summer: {
      type: semesterPeriodSchema,
      required: true,
    },

    fall: {
      type: semesterPeriodSchema,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

semesterSchema.index(
  { year: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

module.exports = mongoose.model("Semester", semesterSchema);