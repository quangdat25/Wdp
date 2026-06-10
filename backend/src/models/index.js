// Central export for all models
const User = require("./user.model");
const Student = require("./student.model");
<<<<<<< HEAD
const Admin = require("./admin.model");
const Staff = require("./staff.model");
const Manager = require("./manager.model");
const Parent = require("./parent.model");
=======
const Parent = require("./parent.model");
const Admin = require("./admin.model");
const DormManager = require("./dormManager.model");
const SecurityStaff = require("./securityStaff.model");
const CleaningStaff = require("./cleaningStaff.model");
const MaintenanceStaff = require("./maintenanceStaff.model");
const Room = require("./room.model");
>>>>>>> 8dbf6fb443b9483d79ab779bd0c9421fa20fa8ee

module.exports = {
  User,
  Student,
<<<<<<< HEAD
  Admin,
  Staff,
  Manager,
  Parent,
=======
  Parent,
  Admin,
  DormManager,
  SecurityStaff,
  CleaningStaff,
  MaintenanceStaff,
  Room,
>>>>>>> 8dbf6fb443b9483d79ab779bd0c9421fa20fa8ee
};