// Central export for all models
const User = require("./user.model");
const Student = require("./student.model");
const Parent = require("./parent.model");
const Admin = require("./admin.model");
const DormManager = require("./dormManager.model");
const SecurityStaff = require("./securityStaff.model");
const CleaningStaff = require("./cleaningStaff.model");
const MaintenanceStaff = require("./maintenanceStaff.model");
const Room = require("./room.model");

module.exports = {
  User,
  Student,
  Parent,
  Admin,
  DormManager,
  SecurityStaff,
  CleaningStaff,
  MaintenanceStaff,
  Room,
};
