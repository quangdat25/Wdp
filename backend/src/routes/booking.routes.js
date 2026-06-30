const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const { authenticate, authorize } = require("../middleware/authUser");

// Kiểm tra điều kiện booking (CFD Score + Invoice)
router.get(
  "/check-eligibility",
  authenticate,
  authorize("student"),
  bookingController.checkBookingEligibility
);

// Lấy danh sách phòng trống theo tòa nhà
router.get(
  "/available-rooms/:buildingId",
  authenticate,
  bookingController.getAvailableRooms
);

// Tạo booking mới
router.post(
  "/create",
  authenticate,
  authorize("student"),
  bookingController.createBooking
);

// Lấy booking hiện tại của sinh viên
router.get(
  "/my-booking",
  authenticate,
  authorize("student"),
  bookingController.getMyBooking
);

module.exports = router;
