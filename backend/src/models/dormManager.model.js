const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dormManagerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    managedBuildings: {
      type: [String],
      default: [],
    },
    employeeCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DormManager", dormManagerSchema);
