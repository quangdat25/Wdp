const checkInOutService = require(
  "../services/checkInOut.service",
);

exports.getBookings = async (req, res) => {
  try {
    const bookings =
      await checkInOutService.getBookings(
        req.user,
        req.query.status,
      );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách booking thành công",
      data: bookings,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.status
        ? error.message
        : "Lỗi khi lấy danh sách booking",
      error: error.message,
    });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const booking = await checkInOutService.checkIn(
      req.user,
      req.params.bookingId,
    );

    return res.status(200).json({
      success: true,
      message: "Check-in cho sinh viên thành công",
      data: booking,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.status
        ? error.message
        : "Lỗi khi check-in",
      error: error.message,
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const booking = await checkInOutService.checkOut(
      req.user,
      req.params.bookingId,
    );

    return res.status(200).json({
      success: true,
      message: "Check-out cho sinh viên thành công",
      data: booking,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.status
        ? error.message
        : "Lỗi khi check-out",
      error: error.message,
    });
  }
};