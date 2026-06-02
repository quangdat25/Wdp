const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const securityStaffSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employeeCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    shiftSchedule: {
      type: String,
      enum: ["morning", "afternoon", "night"],
      default: "morning",
    },
    assignedArea: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SecurityStaff", securityStaffSchema);
