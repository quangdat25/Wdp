const express = require("express");
const router = express.Router();

const {
  getMyInvoices,
  getAllInvoices,
} = require("../controllers/invoice.controller");

const { authenticate, authorize } = require("../middleware/authUser");

router.get("/my", authenticate, authorize("student"), getMyInvoices);

router.get(
  "/",
  authenticate,
  authorize("manager"),
  getAllInvoices
);

module.exports = router;