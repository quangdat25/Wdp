const express = require("express");
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  deleteMyTicket,
  getCurrentRoom,
} = require("../controllers/ticket.controller");

const { authenticate, authorize } = require("../middleware/authUser");

router.post("/", authenticate, authorize("student"), createTicket);
router.get(
  "/current-room",
  authenticate,
  authorize("student"),
  getCurrentRoom,
);
router.get("/my", authenticate, authorize("student"), getMyTickets);

router.delete("/my/:id", authenticate, authorize("student"), deleteMyTicket);
module.exports = router;
