const express = require("express");
const checkInOutController = require(
  "../controllers/checkInOut.controller",
);
const {
  authenticate,
  authorize,
} = require("../middleware/authUser");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("staff"),
  checkInOutController.getBookings,
);

router.patch(
  "/:bookingId/check-in",
  authenticate,
  authorize("staff"),
  checkInOutController.checkIn,
);

router.patch(
  "/:bookingId/check-out",
  authenticate,
  authorize("staff"),
  checkInOutController.checkOut,
);

module.exports = router;