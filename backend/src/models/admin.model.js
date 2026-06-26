const mongoose = require("mongoose");
const User = require("./user.model");

const adminSchema = new mongoose.Schema({
  adminCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    trim: true,
  },

  phone: {
    type: String,
    default: "",
  },

  department: {
    type: String,
    default: "General",
    trim: true,
  },

  permissionLevel: {
    type: String,
    enum: ["super_admin", "admin"],
    default: "admin",
  },
});

module.exports = User.discriminator("admin", adminSchema);