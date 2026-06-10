// Central export for all models
const User = require("./user.model");
const Student = require("./student.model");
const Admin = require("./admin.model");
const Staff = require("./staff.model");
const Manager = require("./manager.model");
const Parent = require("./parent.model");

module.exports = {
  User,
  Student,
  Admin,
  Staff,
  Manager,
  Parent,
};