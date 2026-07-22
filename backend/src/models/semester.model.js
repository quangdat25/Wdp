const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["Spring", "Summer", "Fall"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
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

//check duplicate semester (name and year)
semesterSchema.index(
  { name: 1, year: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Semester = mongoose.model("Semester", semesterSchema);

module.exports = Semester;
