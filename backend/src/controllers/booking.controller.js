const bookingService = require("../services/booking.service");

// Kiểm tra điều kiện booking
const checkBookingEligibility = async (req, res) => {
  try {
    const studentId = req.user._id;
    const result = await bookingService.checkEligibility(studentId);

    return res.status(result.statusCode).json({
      success: result.eligible,
      ...result,
    });
  } catch (error) {
    console.error("CHECK BOOKING ELIGIBILITY ERROR:", error);
    return res.status(500).json({
      success: false,
      eligible: false,
      message: "Lỗi khi kiểm tra điều kiện đặt phòng",
      error: error.message,
    });
  }
};

// Lấy danh sách phòng trống theo tòa nhà
const getAvailableRooms = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const { floor } = req.query;

    const result = await bookingService.getAvailableRoomsByBuilding(buildingId, floor);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(error.message === "Không tìm thấy tòa nhà" ? 404 : 500).json({
      success: false,
      message: "Lỗi khi lấy danh sách phòng trống",
      error: error.message,
    });
  }
};

// Tạo booking mới
const createBooking = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { roomId, bedNumber } = req.body;

    const result = await bookingService.createNewBooking(studentId, roomId, bedNumber);

    res.status(201).json({
      success: true,
      message: `Đặt phòng thành công! Vui lòng thanh toán để xác nhận.`,
      data: result,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi đặt phòng",
    });
  }
};

// Lấy booking hiện tại của sinh viên
const getMyBooking = async (req, res) => {
  try {
    const studentId = req.user._id;

    const data = await bookingService.getStudentCurrentBooking(studentId);

    if (!data) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "Chưa có đơn đặt phòng",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin đặt phòng",
      error: error.message,
    });
  }
};

module.exports = {
  checkBookingEligibility,
  getAvailableRooms,
  createBooking,
  getMyBooking,
};
