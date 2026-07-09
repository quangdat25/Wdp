const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate, authorize } = require("../middleware/authUser");

router.get(
  "/",
  authenticate,
  authorize("admin", "manager"),
  dashboardController.getDashboard,
);

module.exports = router;
