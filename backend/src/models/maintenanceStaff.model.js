const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const maintenanceStaffSchema = new Schema(
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
    specialization: {
      type: String,
      enum: ["electrical", "plumbing", "general", "hvac", "carpentry"],
      default: "general",
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "off_duty"],
      default: "available",
    },
    assignedBuilding: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceStaff", maintenanceStaffSchema);
