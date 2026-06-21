const express = require("express");
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  deleteMyTicket,
} = require("../controllers/ticket.controller");

const { verifyToken, authorizeRoles } = require("../middleware/checkAuth");

router.post("/", verifyToken, authorizeRoles("student"), createTicket);

router.get("/my", verifyToken, authorizeRoles("student"), getMyTickets);

router.delete("/my/:id", verifyToken, authorizeRoles("student"), deleteMyTicket);
module.exports = router;
