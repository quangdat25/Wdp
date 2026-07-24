const mongoose = require("mongoose");

const checkInOutRepository = require("../repositories/checkInOut.repository");

const bookingRepository = require("../repositories/booking.repository");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getVNDateString = (date) => {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const formatDateVN = (date) => {
  if (!date) {
    return "Chưa xác định";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

class CheckInOutService {
  validateSecurity(security) {
    if (!security) {
      throw createError(401, "Vui lòng đăng nhập");
    }

    if (security.role !== "staff" || security.staffType !== "security") {
      throw createError(403, "Chỉ bảo vệ mới được sử dụng chức năng này");
    }

    if (!security.buildingId) {
      throw createError(403, "Bảo vệ chưa được phân công tòa nhà");
    }
  }

  validateObjectId(id, fieldName) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw createError(400, `${fieldName} không hợp lệ`);
    }
  }

  getObjectIdString(value) {
    if (!value) {
      return null;
    }

    if (value._id) {
      return value._id.toString();
    }

    return value.toString();
  }

  validateBookingBuilding(security, booking) {
    const securityBuildingId = this.getObjectIdString(security.buildingId);

    const bookingBuildingId = this.getObjectIdString(booking.roomId?.building);

    if (!bookingBuildingId) {
      throw createError(
        400,
        "Phòng của booking chưa được liên kết với tòa nhà",
      );
    }

    if (securityBuildingId !== bookingBuildingId) {
      throw createError(403, "Booking không thuộc tòa nhà bạn phụ trách");
    }
  }

  validateCheckInDate(booking) {
    if (!booking.startDate) {
      throw createError(400, "Booking chưa được cấu hình ngày bắt đầu");
    }

    const todayVN = getVNDateString(new Date());

    const startDateVN = getVNDateString(booking.startDate);

    const endDateVN = getVNDateString(booking.endDate);

    if (todayVN < startDateVN) {
      throw createError(
        400,
        `Chưa đến ngày bắt đầu kỳ. Sinh viên chỉ có thể check-in từ ngày ${formatDateVN(
          booking.startDate,
        )}.`,
      );
    }

    if (endDateVN && todayVN > endDateVN) {
      throw createError(
        400,
        `Booking đã hết hạn từ ngày ${formatDateVN(
          booking.endDate,
        )}, không thể check-in.`,
      );
    }
  }

  async validateStudentDebt(studentId) {
    const unpaidInvoices =
      await bookingRepository.findUnpaidInvoicesByStudent(studentId);

    const invoices = Array.isArray(unpaidInvoices) ? unpaidInvoices : [];

    const totalUnpaid = invoices.reduce((sum, invoice) => {
      return sum + Number(invoice.amount || 0);
    }, 0);

    if (totalUnpaid > 0) {
      throw createError(
        400,
        `Sinh viên còn nợ ${totalUnpaid.toLocaleString(
          "vi-VN",
        )}đ. Vui lòng thanh toán đầy đủ trước khi check-in.`,
      );
    }
  }

  async getBookings(security, status) {
    this.validateSecurity(security);

    const allowedStatuses = ["confirmed", "checked_in"];

    if (status && !allowedStatuses.includes(status)) {
      throw createError(400, "Trạng thái booking không hợp lệ");
    }

    const rooms = await checkInOutRepository.findRoomsByBuildingId(
      security.buildingId,
    );

    const roomIds = rooms.map((room) => room._id);

    if (roomIds.length === 0) {
      return [];
    }

    return checkInOutRepository.findBookingsByRoomIds(roomIds, status);
  }

  async checkIn(security, bookingId) {
    this.validateSecurity(security);

    this.validateObjectId(bookingId, "bookingId");

    const booking = await checkInOutRepository.findBookingById(bookingId);

    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }

    if (!booking.studentId) {
      throw createError(404, "Không tìm thấy sinh viên của booking");
    }

    if (!booking.roomId) {
      throw createError(404, "Không tìm thấy phòng của booking");
    }

    this.validateBookingBuilding(security, booking);

    if (booking.status !== "confirmed") {
      throw createError(400, "Chỉ booking đã xác nhận mới được check-in");
    }

    // Kiểm tra đã bắt đầu kỳ chưa
    this.validateCheckInDate(booking);

    // Kiểm tra sinh viên còn nợ tiền không
    await this.validateStudentDebt(booking.studentId);

    const room = booking.roomId;

    if (room.status === "maintenance") {
      throw createError(400, "Phòng đang bảo trì, không thể check-in");
    }

    const students = Array.isArray(room.students) ? room.students : [];

    const studentExists = students.some(
      (item) => item.student?.toString() === booking.studentId.toString(),
    );

    if (studentExists) {
      throw createError(400, "Sinh viên đã tồn tại trong phòng");
    }

    const bedOccupied = students.some(
      (item) => Number(item.bedNumber) === Number(booking.bedNumber),
    );

    if (bedOccupied) {
      throw createError(400, `Giường số ${booking.bedNumber} đã có sinh viên`);
    }

    if (students.length >= room.capacity) {
      throw createError(400, "Phòng đã đủ số lượng sinh viên");
    }

    const roomUpdateResult = await checkInOutRepository.addStudentToRoom({
      roomId: room._id,
      buildingId: security.buildingId,
      studentId: booking.studentId,
      bedNumber: booking.bedNumber,
    });

    if (roomUpdateResult.modifiedCount === 0) {
      throw createError(
        409,
        "Không thể thêm sinh viên vào phòng. Dữ liệu phòng có thể đã thay đổi.",
      );
    }

    const updatedRoom = await checkInOutRepository.updateRoomOccupancyAndStatus(
      room._id,
    );

    if (!updatedRoom) {
      throw createError(404, "Không tìm thấy phòng để cập nhật trạng thái");
    }

    const updatedBooking = await checkInOutRepository.updateBookingStatus({
      bookingId: booking._id,
      currentStatus: "confirmed",
      newStatus: "checked_in",
      staffId: security._id,
    });

    if (!updatedBooking) {
      throw createError(409, "Booking đã được xử lý trước đó");
    }

    return updatedBooking;
  }

  async checkOut(security, bookingId) {
    this.validateSecurity(security);

    this.validateObjectId(bookingId, "bookingId");

    const booking = await checkInOutRepository.findBookingById(bookingId);

    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }

    if (!booking.studentId) {
      throw createError(404, "Không tìm thấy sinh viên của booking");
    }

    if (!booking.roomId) {
      throw createError(404, "Không tìm thấy phòng của booking");
    }

    this.validateBookingBuilding(security, booking);

    if (booking.status !== "checked_in") {
      throw createError(400, "Chỉ booking checked_in mới được check-out");
    }

    // Kiểm tra sinh viên còn nợ tiền không
    await this.validateStudentDebt(booking.studentId);

    const roomUpdateResult = await checkInOutRepository.removeStudentFromRoom({
      roomId: booking.roomId._id,
      buildingId: security.buildingId,
      studentId: booking.studentId,
    });

    if (roomUpdateResult.modifiedCount === 0) {
      throw createError(400, "Sinh viên không tồn tại trong phòng");
    }

    const updatedRoom = await checkInOutRepository.updateRoomOccupancyAndStatus(
      booking.roomId._id,
    );

    if (!updatedRoom) {
      throw createError(404, "Không tìm thấy phòng để cập nhật trạng thái");
    }

    const updatedBooking = await checkInOutRepository.updateBookingStatus({
      bookingId: booking._id,
      currentStatus: "checked_in",
      newStatus: "checked_out",
      staffId: security._id,
    });

    if (!updatedBooking) {
      throw createError(409, "Booking đã được xử lý trước đó");
    }

    return updatedBooking;
  }
}

module.exports = new CheckInOutService();
