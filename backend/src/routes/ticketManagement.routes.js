const express = require("express");
const router = express.Router();

const {
  getAllTickets,
  approveTicket,
  rejectTicket,
  assignTicket,
  getStaffList,
  approveStaffDamageReport,
} = require("../controllers/ticketManagement.controller");

const { authenticate, authorize } = require("../middleware/authUser");

router.get(
  "/",
  authenticate,
  authorize("admin", "manager"),
  getAllTickets
);

router.get(
  "/staff",
  authenticate,
  authorize("admin", "manager"),
  getStaffList
);

router.patch(
  "/:ticketId/approve",
  authenticate,
  authorize("admin", "manager"),
  approveTicket
);

router.patch(
  "/:ticketId/reject",
  authenticate,
  authorize("admin", "manager"),
  rejectTicket
);

router.patch(
  "/:ticketId/assign",
  authenticate,
  authorize("admin", "manager"),
  assignTicket
);

router.patch(
  "/:ticketId/approve-damage",
  authenticate,
  authorize("admin", "manager"),
  approveStaffDamageReport
);

module.exports = router;