const mongoose = require("mongoose");
const User = require("./user.model");

const staffSchema = new mongoose.Schema({
  staffCode: {
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

  staffType: {
    type: String,
    required: true,
    enum: ["security", "maintenance", "cleaner"],
  },

  shift: {
    type: String,
    enum: ["morning", "afternoon", "night", "office"],
    default: "office",
  },

  startDate: {
    type: Date,
  },

});

module.exports = User.discriminator("staff", staffSchema);