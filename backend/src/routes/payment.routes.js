const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { authenticate, authorize } = require("../middleware/authUser");

// Tạo URL thanh toán VNPAY cho booking
router.post(
  "/create-booking-payment",
  authenticate,
  authorize("student"),
  paymentController.createBookingPayment.bind(paymentController)
);

// VNPAY return URL (không cần authenticate vì VNPAY redirect về)
router.get("/vnpay-callback", paymentController.vnpayReturn.bind(paymentController));
module.exports = router;
