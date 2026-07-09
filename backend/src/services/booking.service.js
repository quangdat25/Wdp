const userRepository = require("../repositories/user.repository");
const roomRepository = require("../repositories/room.repository");
const bookingRepository = require("../repositories/booking.repository");
const invoiceRepository = require("../repositories/invoice.repository");
const buildingRepository = require("../repositories/building.repository");
const semesterService = require("./semester.service");

class BookingService {
  async checkEligibility(studentId) {
    const student = await userRepository.findByIdLean(studentId);

    if (!student || student.role !== "student") {
      return {
        eligible: false,
        statusCode: 404,
        message: "Không tìm thấy thông tin sinh viên",
      };
    }

    const targetSemester = await semesterService.getTargetBookingSemester();

    if (!targetSemester) {
      return {
        eligible: false,
        statusCode: 400,
        reason: "booking_closed",
        message: "Hiện tại không nằm trong đợt mở cổng đặt phòng.",
      };
    }

    const existingRoom = await roomRepository.findOne({ "students.student": studentId });

    if (existingRoom) {
      const studentEntry = existingRoom.students.find(
        (s) => s.student.toString() === studentId.toString()
      );
      const bedInfo = studentEntry ? ` - Giường ${studentEntry.bedNumber}` : "";

      return {
        eligible: false,
        statusCode: 400,
        reason: "already_booked",
        message: `Bạn đang ở phòng ${existingRoom.displayName}${bedInfo}. Không thể đặt phòng mới.`,
        data: {
          CFDScore: student.CFDScore,
          currentRoom: existingRoom.displayName,
          bedNumber: studentEntry ? studentEntry.bedNumber : null,
        },
      };
    }

    const existingBooking = await bookingRepository.findActiveBookingByStudentId(studentId);

    if (existingBooking) {
      return {
        eligible: false,
        statusCode: 400,
        reason: "has_active_booking",
        message: "Bạn đã có đơn đặt phòng đang xử lý. Không thể đặt thêm.",
        data: {
          CFDScore: student.CFDScore,
          bookingStatus: existingBooking.status,
        },
      };
    }

    const cfdScore = student.CFDScore || 0;
    if (cfdScore < 80) {
      return {
        eligible: false,
        statusCode: 400,
        reason: "low_cfd",
        message: `Điểm CFD của bạn hiện tại là ${cfdScore}. Cần tối thiểu 80 điểm để đặt phòng.`,
        data: {
          CFDScore: cfdScore,
          requiredScore: 80,
        },
      };
    }

    const unpaidInvoices = await invoiceRepository.findUnpaidInvoicesByStudentId(studentId);
    const totalUnpaid = unpaidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

    if (totalUnpaid > 0) {
      return {
        eligible: false,
        statusCode: 400,
        reason: "unpaid_invoice",
        message: `Bạn còn nợ ${totalUnpaid.toLocaleString("vi-VN")}đ hóa đơn chưa thanh toán. Vui lòng thanh toán trước khi đặt phòng.`,
        data: {
          CFDScore: cfdScore,
          totalUnpaid,
          unpaidCount: unpaidInvoices.length,
        },
      };
    }

    return {
      eligible: true,
      statusCode: 200,
      message: "Bạn đủ điều kiện đặt phòng!",
      data: {
        CFDScore: cfdScore,
        totalUnpaid: 0,
        currentSemester: targetSemester.name,
        semesterCode: targetSemester.code,
      },
    };
  }

  async getAvailableRoomsByBuilding(buildingId, floor) {
    const building = await buildingRepository.findById(buildingId);
    if (!building) {
      throw new Error("Không tìm thấy tòa nhà");
    }

    const query = {
      building: buildingId,
      status: { $ne: "maintenance" },
    };

    if (floor) {
      query.floor = parseInt(floor);
    }

    const rooms = await roomRepository.findAvailableRooms(query);

    const formattedRooms = rooms.map((room) => {
      const roomObj = room.toObject();
      const occupiedBeds = roomObj.students.map((s) => s.bedNumber);
      const availableBeds = [];

      for (let i = 1; i <= roomObj.capacity; i++) {
        if (!occupiedBeds.includes(i)) {
          availableBeds.push(i);
        }
      }

      roomObj.students = roomObj.students.map((s) => ({
        ...s.student,
        bedNumber: s.bedNumber,
      }));

      return {
        ...roomObj,
        availableBeds,
        availableCount: availableBeds.length,
        isAvailable: availableBeds.length > 0,
      };
    });

    const availableRooms = formattedRooms.filter((r) => r.isAvailable);

    return {
      data: availableRooms,
      building: building,
      totalAvailable: availableRooms.length,
    };
  }

  async createNewBooking(studentId, roomId, bedNumber) {
    if (!roomId || !bedNumber) {
      throw new Error("Thiếu thông tin phòng hoặc giường");
    }

    const eligibilityCheck = await this.checkEligibility(studentId);
    if (!eligibilityCheck.eligible) {
      throw new Error(eligibilityCheck.message);
    }

    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error("Không tìm thấy phòng");
    if (room.status === "maintenance") throw new Error("Phòng đang bảo trì, không thể đặt.");
    if (room.students.length >= room.capacity) throw new Error("Phòng đã đầy, vui lòng chọn phòng khác.");

    const bedTaken = room.students.some((s) => s.bedNumber === bedNumber);
    if (bedTaken) throw new Error(`Giường số ${bedNumber} đã có người, vui lòng chọn giường khác.`);
    if (bedNumber < 1 || bedNumber > room.capacity) throw new Error(`Số giường không hợp lệ (1-${room.capacity}).`);

    const targetSemester = await semesterService.getTargetBookingSemester();
    const bookingSemesterCode = targetSemester.code || "Summer 2026";

    // Xóa các booking pending
    await bookingRepository.deleteMany({ studentId, status: "pending" });

    const booking = await bookingRepository.create({
      studentId: studentId,
      roomId: roomId,
      bedNumber: bedNumber,
      semester: bookingSemesterCode,
      startDate: targetSemester.startDate,
      endDate: targetSemester.endDate,
      status: "pending",
    });

    const populatedRoom = await roomRepository.findByIdWithPopulation(roomId);

    return {
      booking: booking,
      room: populatedRoom,
      bedNumber: bedNumber,
      price: room.price || 2000000,
    };
  }

  async getStudentCurrentBooking(studentId) {
    const booking = await bookingRepository.findActiveBookingByStudentId(studentId);

    if (!booking) return null;

    let myBedNumber = null;
    if (booking.roomId && booking.roomId.students) {
      const myEntry = booking.roomId.students.find(
        (s) => s.student._id.toString() === studentId.toString()
      );
      if (myEntry) myBedNumber = myEntry.bedNumber;
    }

    return {
      ...booking.toObject(),
      myBedNumber,
    };
  }
}

module.exports = new BookingService();
