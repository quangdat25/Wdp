const bookingService = require("../services/booking.service");

const handleService = async (res, action, fallbackMessage) => {
  try {
    const result = await action();
    return res.status(result.statusCode).json(result.response);
  } catch (error) {
    console.error(fallbackMessage, error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Giường vừa được sinh viên khác đặt. Vui lòng chọn giường khác.",
      });
    }

    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : fallbackMessage,
      error: error.message,
    });
  }
};

const checkBookingEligibility = async (req, res) => {
  const isRenew = req.query.isRenew === "true";
  return handleService(
    res,
    () => bookingService.checkBookingEligibility(req.user?._id, isRenew),
    "Lỗi khi kiểm tra điều kiện đặt phòng",
  );
};

const getAvailableRooms = async (req, res) => {
  return handleService(
    res,
    () =>
      bookingService.getAvailableRooms(
        req.params.buildingId,
        req.query.floor,
      ),
    "Lỗi khi lấy danh sách phòng trống",
  );
};

const getRoomBedAvailability = async (req, res) => {
  return handleService(
    res,
    () => bookingService.getRoomBedAvailability(req.params.roomId),
    "Lỗi khi lấy tình trạng giường",
  );
};

const createBooking = async (req, res) => {
  const { roomId, bedNumber, renewedFrom } = req.body;

  return handleService(
    res,
    () =>
      bookingService.createBooking(
        req.user?._id,
        roomId,
        bedNumber,
        renewedFrom
      ),
    "Lỗi khi đặt phòng",
  );
};

const getMyBooking = async (req, res) => {
  return handleService(
    res,
    () => bookingService.getMyBooking(req.user?._id),
    "Lỗi khi lấy thông tin đặt phòng",
  );
};

const getMyHistory = async (req, res) => {
  return handleService(
    res,
    () => bookingService.getMyHistory(req.user?._id),
    "Lỗi khi lấy lịch sử đặt phòng",
  );
};

const getRoomHistory = async (req, res) => {
  return handleService(
    res,
    () => bookingService.getRoomHistory(req.params.roomId),
    "Lỗi khi lấy lịch sử phòng",
  );
};

const getAllBookings = async (req, res) => {
  return handleService(
    res,
    () => bookingService.getAllBookings(req.query),
    "Lỗi khi lấy danh sách đặt phòng",
  );
};

const getRoommates = async (req, res) => {
  return handleService(
    res,
    () => bookingService.getRoommates(req.params.roomId, req.query.semester),
    "Lỗi khi lấy thông tin bạn cùng phòng",
  );
};

module.exports = {
  checkBookingEligibility,
  getAvailableRooms,
  getRoomBedAvailability,
  createBooking,
  getMyBooking,
  getMyHistory,
  getRoomHistory,
  getAllBookings,
  getRoommates,
};
