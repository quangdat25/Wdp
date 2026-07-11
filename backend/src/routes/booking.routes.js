const express = require("express");

const router = express.Router();

const {
  checkBookingEligibility,
  getAvailableRooms,
  getRoomBedAvailability,
  createBooking,
  getMyBooking,
  getRoomHistory,
  getAllBookings,
} = require("../controllers/booking.controller");

const {
  authenticate,
  authorize,
} = require("../middleware/authUser");

router.get(
  "/check-eligibility",
  authenticate,
  authorize("student"),
  checkBookingEligibility,
);

router.get(
  "/available-rooms/:buildingId",
  authenticate,
  authorize("student"),
  getAvailableRooms,
);

router.get(
  "/rooms/:roomId/beds",
  authenticate,
  authorize("student"),
  getRoomBedAvailability,
);

router.post(
  "/",
  authenticate,
  authorize("student"),
  createBooking,
);

router.get(
  "/my-booking",
  authenticate,
  authorize("student"),
  getMyBooking,
);

router.get(
  "/",
  authenticate,
  authorize("manager", "admin"),
  getAllBookings,
);

router.get(
  "/room/:roomId/history",
  authenticate,
  authorize("manager", "admin"),
  getRoomHistory,
);

module.exports = router;
