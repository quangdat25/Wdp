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

  building: {
    type: String,
    default: "",
    trim: true,
  },
});

module.exports = User.discriminator("manager", managerSchema);