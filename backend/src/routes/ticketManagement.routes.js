const express = require("express");
const router = express.Router();

const {
  getAllTickets,
  approveTicket,
  rejectTicket,
  assignTicket,
  getStaffList,
} = require("../controllers/ticketManagement.controller");

const { verifyToken, authorizeRoles } = require("../middleware/checkAuth");

router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "manager"),
  getAllTickets
);

router.get(
  "/staff",
  verifyToken,
  authorizeRoles("admin", "manager"),
  getStaffList
);

router.patch(
  "/:ticketId/approve",
  verifyToken,
  authorizeRoles("admin", "manager"),
  approveTicket
);

router.patch(
  "/:ticketId/reject",
  verifyToken,
  authorizeRoles("admin", "manager"),
  rejectTicket
);

router.patch(
  "/:ticketId/assign",
  verifyToken,
  authorizeRoles("admin", "manager"),
  assignTicket
);

module.exports = router;