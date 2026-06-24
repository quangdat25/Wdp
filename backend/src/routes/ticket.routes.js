const express = require("express");
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  deleteMyTicket,
  getStaffTickets,
  updateTicketStatus,
  createStaffTicket,
} = require("../controllers/ticket.controller");

const { authenticate, authorize } = require("../middleware/authUser");

// Student Routes
router.post("/", authenticate, authorize("student"), createTicket);
router.get("/my", authenticate, authorize("student"), getMyTickets);
router.delete("/my/:id", authenticate, authorize("student"), deleteMyTicket);

// Staff Routes
router.get("/staff", authenticate, authorize("staff"), getStaffTickets);
router.patch("/staff/:id/status", authenticate, authorize("staff"), updateTicketStatus);
router.post("/staff-report", authenticate, authorize("staff"), createStaffTicket);

module.exports = router;
