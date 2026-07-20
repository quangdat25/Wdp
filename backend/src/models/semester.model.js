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
      unique: true,
      min: 2020,
      max: 2100,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Semester", semesterSchema);