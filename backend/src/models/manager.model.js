const mongoose = require("mongoose");
const User = require("./user.model");

const managerSchema = new mongoose.Schema({
  managerCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },

  phone: {
    type: String,
    default: "",
  },

  department: {
    type: String,
    default: "Quản lý ký túc xá",
  },

  startDate: {
    type: Date,
  },

  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
  },
});

module.exports = User.discriminator("manager", managerSchema);