const mongoose = require("mongoose");
const Invoice = require("../models/invoice.model");

const bookingRepository = require("../repositories/booking.repository");
const systemConfigRepository = require("../repositories/systemConfig.repository");
const semesterService = require("./semester.service");

const BOOKING_HOLD_MINUTES = 5;

const getUTCDateString = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const formatDateUTC = (date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

class BookingService {
  async getNextSemesterInfo() {
    const nextSemester = await semesterService.getNextSemester();

    if (!nextSemester) return null;

    return {
      data: nextSemester,
      text: `${nextSemester.name} ${nextSemester.year}`,
    };
  }

  async checkBookingEligibility(studentId, isRenew = false) {
    if (!studentId) {
      return {
        statusCode: 401,
        response: {
          success: false,
          eligible: false,
          message: "Không xác định được sinh viên",
        },
      };
    }

    const student = await bookingRepository.findStudentById(studentId);

    if (!student || student.role !== "student") {
      return {
        statusCode: 404,
        response: {
          success: false,
          eligible: false,
          message: "Không tìm thấy thông tin sinh viên",
        },
      };
    }

    const currentSemester = await semesterService.getCurrentSemester();
    const nextSemesterInfo = await this.getNextSemesterInfo();

    if (!nextSemesterInfo) {
      return {
        statusCode: 404,
        response: {
          success: false,
          eligible: false,
          reason: "next_semester_not_found",
          message: "Không tìm thấy kỳ tiếp theo",
        },
      };
    }

    const targetStart = isRenew
      ? currentSemester?.renewalStartDate
      : currentSemester?.bookingStartDate;
    const targetEnd = isRenew
      ? currentSemester?.renewalEndDate
      : currentSemester?.bookingEndDate;
    const timeTypeLabel = isRenew ? "gia hạn" : "đăng ký mới";

    if (!targetStart || !targetEnd) {
      return {
        statusCode: 400,
        response: {
          success: false,
          eligible: false,
          reason: "booking_time_not_configured",
          message: `Kỳ hiện tại chưa được cấu hình thời gian ${timeTypeLabel}`,
        },
      };
    }

    const today = getUTCDateString(new Date());
    const bookingStart = getUTCDateString(targetStart);
    const bookingEnd = getUTCDateString(targetEnd);

    if (today < bookingStart || today > bookingEnd) {
      return {
        statusCode: 400,
        response: {
          success: false,
          eligible: false,
          reason: "booking_closed",
          message: `Hiện không nằm trong thời gian ${timeTypeLabel} phòng. Thời gian ${timeTypeLabel} từ ${formatDateUTC(
            targetStart,
          )} đến ${formatDateUTC(targetEnd)}.`,
        },
      };
    }

    const existingRoom =
      await bookingRepository.findCurrentRoomByStudent(studentId);

    if (existingRoom && !isRenew) {
      const studentEntry = existingRoom.students.find(
        (item) => item.student.toString() === studentId.toString(),
      );

      return {
        statusCode: 400,
        response: {
          success: false,
          eligible: false,
          reason: "already_in_room",
          message: `Bạn đang ở phòng ${existingRoom.displayName}${
            studentEntry ? ` - Giường ${studentEntry.bedNumber}` : ""
          }. Không thể đặt phòng mới.`,
        },
      };
    }

    const existingBooking =
      await bookingRepository.findActiveBookingByStudentAndSemester(
        studentId,
        nextSemesterInfo.text,
      );

    if (existingBooking) {
      return {
        statusCode: 409,
        response: {
          success: false,
          eligible: false,
          reason: "has_active_booking",
          message: "Bạn đã có booking trong kỳ tiếp theo",
          data: {
            bookingStatus: existingBooking.status,
            semester: existingBooking.semester,
          },
        },
      };
    }

    const cfdScore = Number(student.CFDScore || 0);

    if (cfdScore < 80) {
      return {
        statusCode: 400,
        response: {
          success: false,
          eligible: false,
          reason: "low_cfd",
          message: `Điểm CFD hiện tại là ${cfdScore}. Cần tối thiểu 80 điểm để đặt phòng.`,
        },
      };
    }

    const unpaidInvoices =
      await bookingRepository.findUnpaidInvoicesByStudent(studentId);

    const totalUnpaid = unpaidInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.amount || 0),
      0,
    );

    if (totalUnpaid > 0) {
      return {
        statusCode: 400,
        response: {
          success: false,
          eligible: false,
          reason: "unpaid_invoice",
          message: `Bạn còn nợ ${totalUnpaid.toLocaleString(
            "vi-VN",
          )}đ. Vui lòng thanh toán trước khi đặt phòng.`,
        },
      };
    }

    return {
      statusCode: 200,
      response: {
        success: true,
        eligible: true,
        message: "Bạn đủ điều kiện đặt phòng",
        data: {
          CFDScore: cfdScore,
          nextSemester: nextSemesterInfo.text,
        },
      },
    };
  }

  async getAvailableRooms(buildingId, floor) {
    if (!mongoose.Types.ObjectId.isValid(buildingId)) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "buildingId không hợp lệ",
        },
      };
    }

    const building = await bookingRepository.findBuildingById(buildingId);

    if (!building) {
      return {
        statusCode: 404,
        response: {
          success: false,
          message: "Không tìm thấy tòa nhà",
        },
      };
    }

    const nextSemesterInfo = await this.getNextSemesterInfo();

    if (!nextSemesterInfo) {
      return {
        statusCode: 404,
        response: {
          success: false,
          message: "Không tìm thấy kỳ tiếp theo",
        },
      };
    }

    const query = {
      building: buildingId,
      status: { $ne: "maintenance" },
    };

    if (floor !== undefined && floor !== "") {
      const parsedFloor = Number(floor);

      if (!Number.isInteger(parsedFloor) || parsedFloor < 1) {
        return {
          statusCode: 400,
          response: {
            success: false,
            message: "Tầng không hợp lệ",
          },
        };
      }

      query.floor = parsedFloor;
    }

    const rooms = await bookingRepository.findAvailableRooms(query);
    const roomIds = rooms.map((room) => room._id);

    const reservedBookings = roomIds.length
      ? await bookingRepository.findReservedBedsByRoomsAndSemester(
          roomIds,
          nextSemesterInfo.text,
        )
      : [];

    const reservedByRoom = new Map();

    reservedBookings.forEach((booking) => {
      const roomKey = booking.roomId.toString();

      if (!reservedByRoom.has(roomKey)) {
        reservedByRoom.set(roomKey, new Set());
      }

      reservedByRoom.get(roomKey).add(Number(booking.bedNumber));
    });

    const formattedRooms = rooms
      .map((room) => {
        const reservedBeds =
          reservedByRoom.get(room._id.toString()) || new Set();

        const beds = Array.from(
          { length: Number(room.capacity || 0) },
          (_, index) => {
            const bedNumber = index + 1;
            const available = !reservedBeds.has(bedNumber);

            return {
              bedNumber,
              available,
              status: available ? "available" : "reserved",
            };
          },
        );

        return {
          ...room,
          semester: nextSemesterInfo.text,
          beds,
          availableBeds: beds
            .filter((bed) => bed.available)
            .map((bed) => bed.bedNumber),
          reservedBeds: beds
            .filter((bed) => !bed.available)
            .map((bed) => bed.bedNumber),
          availableCount: beds.filter((bed) => bed.available).length,
          isAvailable: beds.some((bed) => bed.available),
        };
      })
      .filter((room) => room.isAvailable);

    return {
      statusCode: 200,
      response: {
        success: true,
        data: formattedRooms,
        building,
        semester: nextSemesterInfo.text,
        totalAvailable: formattedRooms.length,
      },
    };
  }

  async getRoomBedAvailability(roomId) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "roomId không hợp lệ",
        },
      };
    }

    const nextSemesterInfo = await this.getNextSemesterInfo();
    const room = await bookingRepository.findRoomById(roomId);

    if (!nextSemesterInfo) {
      return {
        statusCode: 404,
        response: {
          success: false,
          message: "Không tìm thấy kỳ tiếp theo",
        },
      };
    }

    if (!room) {
      return {
        statusCode: 404,
        response: {
          success: false,
          message: "Không tìm thấy phòng",
        },
      };
    }

    const reservedBookings =
      await bookingRepository.findReservedBedsByRoomAndSemester(
        roomId,
        nextSemesterInfo.text,
      );

    const reservedMap = new Map(
      reservedBookings.map((booking) => [
        Number(booking.bedNumber),
        booking.status,
      ]),
    );

    const beds = Array.from(
      { length: Number(room.capacity || 0) },
      (_, index) => {
        const bedNumber = index + 1;
        const bookingStatus = reservedMap.get(bedNumber);

        return {
          bedNumber,
          available: !bookingStatus,
          status: bookingStatus ? "reserved" : "available",
          bookingStatus: bookingStatus || null,
        };
      },
    );

    return {
      statusCode: 200,
      response: {
        success: true,
        message: "Lấy tình trạng giường thành công",
        data: {
          roomId: room._id,
          roomNumber: room.roomNumber,
          semester: nextSemesterInfo.text,
          capacity: room.capacity,
          availableCount: beds.filter((bed) => bed.available).length,
          reservedCount: beds.filter((bed) => !bed.available).length,
          beds,
        },
      },
    };
  }

  async createBooking(studentId, roomId, bedNumber, renewedFrom = null) {
    if (!studentId) {
      return {
        statusCode: 401,
        response: {
          success: false,
          message: "Không xác định được sinh viên",
        },
      };
    }

    if (
      !roomId ||
      bedNumber === undefined ||
      bedNumber === null ||
      bedNumber === ""
    ) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "Thiếu thông tin phòng hoặc giường",
        },
      };
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "roomId không hợp lệ",
        },
      };
    }

    const parsedBedNumber = Number(bedNumber);

    if (!Number.isInteger(parsedBedNumber)) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "Số giường không hợp lệ",
        },
      };
    }

    const nextSemesterInfo = await this.getNextSemesterInfo();

    if (!nextSemesterInfo) {
      return {
        statusCode: 404,
        response: {
          success: false,
          message: "Không tìm thấy kỳ tiếp theo",
        },
      };
    }

    const semester = nextSemesterInfo.text;
    const nextSemester = nextSemesterInfo.data;

    const student = await bookingRepository.findStudentById(studentId);

    if (!student || student.role !== "student") {
      return {
        statusCode: 404,
        response: {
          success: false,
          message: "Không tìm thấy thông tin sinh viên",
        },
      };
    }

    const existingRoom =
      await bookingRepository.findCurrentRoomByStudent(studentId);

    if (existingRoom && !renewedFrom) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: `Bạn đang ở phòng ${existingRoom.displayName}. Không thể đặt thêm.`,
        },
      };
    }

    const existingBooking =
      await bookingRepository.findActiveBookingByStudentAndSemester(
        studentId,
        semester,
      );

    if (existingBooking) {
      if (existingBooking.status !== "pending") {
        return {
          statusCode: 409,
          response: {
            success: false,
            message: "Bạn đã có booking trong kỳ này",
          },
        };
      }

      await bookingRepository.releasePendingBookingsByStudentAndSemester(
        studentId,
        semester,
      );
    }

    if (Number(student.CFDScore || 0) < 80) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "Điểm CFD không đủ để đặt phòng (yêu cầu từ 80)",
        },
      };
    }

    const unpaidInvoices =
      await bookingRepository.findUnpaidInvoicesByStudent(studentId);

    const totalUnpaid = unpaidInvoices.reduce(
      (sum, invoice) => sum + Number(invoice.amount || 0),
      0,
    );

    if (totalUnpaid > 0) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "Bạn còn hóa đơn chưa thanh toán",
        },
      };
    }

    const room = await bookingRepository.findRoomById(roomId);

    if (!room) {
      return {
        statusCode: 404,
        response: {
          success: false,
          message: "Không tìm thấy phòng",
        },
      };
    }

    if (room.status === "maintenance") {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "Phòng đang bảo trì, không thể đặt",
        },
      };
    }

    if (parsedBedNumber < 1 || parsedBedNumber > Number(room.capacity)) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: `Số giường không hợp lệ (1-${room.capacity})`,
        },
      };
    }

    const reservedCount =
      await bookingRepository.countReservedBedsByRoomAndSemester(
        roomId,
        semester,
      );

    if (reservedCount >= Number(room.capacity)) {
      return {
        statusCode: 409,
        response: {
          success: false,
          message: "Phòng đã đủ người trong kỳ này",
        },
      };
    }

    const reservedBed = await bookingRepository.findReservedBed(
      roomId,
      semester,
      parsedBedNumber,
    );

    if (reservedBed) {
      return {
        statusCode: 409,
        response: {
          success: false,
          message: `Giường số ${parsedBedNumber} đã có sinh viên đặt`,
        },
      };
    }

    // Lấy cấu hình đang active
    const activeConfig = await systemConfigRepository.findActive();

    if (!activeConfig) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message:
            "Hệ thống chưa có cấu hình giá đang hoạt động. Vui lòng liên hệ quản trị viên.",
        },
      };
    }

    const roomPrice = Number(activeConfig.roomPrice);

    if (!Number.isFinite(roomPrice) || roomPrice < 0) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "Giá phòng trong cấu hình hệ thống không hợp lệ",
        },
      };
    }

    try {
      const paymentExpiresAt = new Date(
        Date.now() + BOOKING_HOLD_MINUTES * 60 * 1000,
      );

      const bookingPayload = {
        studentId,
        roomId,
        bedNumber: parsedBedNumber,
        semester,
        startDate: nextSemester.startDate,
        endDate: nextSemester.endDate,

        // Lưu ID của cấu hình đã áp dụng
        configId: activeConfig._id,

        status: "pending",
        paymentExpiresAt,
      };

      if (renewedFrom) {
        bookingPayload.renewedFrom = renewedFrom;
      }

      const booking = await bookingRepository.createBooking(bookingPayload);

      const invoiceCode = `INV-${booking._id
        .toString()
        .slice(-6)
        .toUpperCase()}-${Date.now().toString().slice(-4)}`;

      await Invoice.create({
        bookingId: booking._id,
        studentId,
        invoiceCode,
        type: "room_fee",
        amount: roomPrice,
        status: "unpaid",
        dueDate: paymentExpiresAt,
      });

      const populatedRoom =
        await bookingRepository.findPopulatedRoomById(roomId);

      return {
        statusCode: 201,
        response: {
          success: true,
          message: `Đặt phòng thành công. Giường được giữ trong ${BOOKING_HOLD_MINUTES} phút, vui lòng thanh toán để xác nhận.`,
          data: {
            booking,
            room: populatedRoom,
            bedNumber: parsedBedNumber,
            semester,
            paymentExpiresAt,

            // Không lấy room.price nữa
            price: roomPrice,

            config: {
              id: activeConfig._id,
              name: activeConfig.name,
              roomPrice,
            },
          },
        },
      };
    } catch (error) {
      if (error?.code === 11000) {
        const duplicatedFields = error.keyPattern || {};

        if (
          duplicatedFields.roomId &&
          duplicatedFields.semester &&
          duplicatedFields.bedNumber
        ) {
          return {
            statusCode: 409,
            response: {
              success: false,
              message: `Giường số ${parsedBedNumber} vừa được sinh viên khác đặt. Vui lòng chọn giường khác.`,
            },
          };
        }

        if (duplicatedFields.studentId && duplicatedFields.semester) {
          return {
            statusCode: 409,
            response: {
              success: false,
              message: "Bạn đã có booking trong kỳ này",
            },
          };
        }

        return {
          statusCode: 409,
          response: {
            success: false,
            message: "Dữ liệu booking bị trùng. Vui lòng thử lại",
          },
        };
      }

      throw error;
    }
  }
  async getMyBooking(studentId) {
    const booking =
      await bookingRepository.findCurrentBookingByStudent(studentId);

    if (!booking) {
      return {
        statusCode: 200,
        response: {
          success: true,
          data: null,
          message: "Chưa có đơn đặt phòng",
        },
      };
    }

    let myBedNumber = booking.bedNumber || null;

    if (booking.roomId && Array.isArray(booking.roomId.students)) {
      const myEntry = booking.roomId.students.find((entry) => {
        const populatedStudent = entry.student;
        if (!populatedStudent) return false;

        const populatedStudentId = populatedStudent._id || populatedStudent;

        return populatedStudentId.toString() === studentId.toString();
      });

      if (myEntry) myBedNumber = myEntry.bedNumber;
    }

    return {
      statusCode: 200,
      response: {
        success: true,
        data: {
          ...booking.toObject(),
          myBedNumber,
        },
      },
    };
  }

  async getMyHistory(studentId) {
    const history = await bookingRepository.findMyBookingHistory(studentId);
    return {
      statusCode: 200,
      response: {
        success: true,
        data: history,
      },
    };
  }

  async getRoomHistory(roomId) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "roomId không hợp lệ",
        },
      };
    }

    const currentSemester = await semesterService.getCurrentSemester();

    const nextSemester = await semesterService.getNextSemester();

    const currentSemesterText = `${currentSemester.name} ${currentSemester.year}`;

    const nextSemesterText = `${nextSemester.name} ${nextSemester.year}`;

    const semesterOrder = {
      Spring: 1,
      Summer: 2,
      Fall: 3,
    };

    const parseSemester = (semester) => {
      if (!semester) {
        return {
          name: "",
          year: 0,
          order: 0,
        };
      }

      const [name, year] = semester.split(" ");

      return {
        name,
        year: Number(year),
        order: semesterOrder[name] || 0,
      };
    };

    const current = parseSemester(currentSemesterText);

    const isHistorySemester = (semester) => {
      const parsed = parseSemester(semester);

      if (parsed.year < current.year) return true;
      if (parsed.year > current.year) return false;

      return parsed.order < current.order;
    };

    const bookings = await bookingRepository.findRoomBookingHistory(roomId);

    const history = {};
    const nextSemesterBookings = [];

    bookings.forEach((booking) => {
      const student = {
        _id: booking.studentId?._id,
        fullName: booking.studentId?.fullName || "N/A",
        studentCode: booking.studentId?.studentCode || "N/A",
        email: booking.studentId?.email || "",
        phone: booking.studentId?.phone || "",
        gender: booking.studentId?.gender || "",
        bedNumber: booking.bedNumber,
        status: booking.status,
        semester: booking.semester,
        startDate: booking.startDate,
        endDate: booking.endDate,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
      };

      // ======= Kỳ trước =======
      if (isHistorySemester(booking.semester)) {
        if (!history[booking.semester]) {
          history[booking.semester] = {
            semester: booking.semester,
            students: [],
          };
        }

        history[booking.semester].students.push(student);
      }

      // ======= Kỳ tiếp theo =======
      else if (booking.semester === nextSemesterText) {
        nextSemesterBookings.push(student);
      }
    });

    return {
      statusCode: 200,
      response: {
        success: true,
        currentSemester: currentSemesterText,
        nextSemester: nextSemesterText,

        history: Object.values(history),

        upcoming: nextSemesterBookings,
      },
    };
  }

  async getAllBookings(filters = {}) {
    const { status, semester, studentCode, roomId } = filters;
    const query = {};

    if (status) query.status = status;
    if (semester) query.semester = semester;

    if (roomId) {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return {
          statusCode: 400,
          response: {
            success: false,
            message: "roomId không hợp lệ",
          },
        };
      }

      query.roomId = roomId;
    }

    if (studentCode) {
      const students =
        await bookingRepository.findStudentsByStudentCode(studentCode);

      query.studentId = {
        $in: students.map((student) => student._id),
      };
    }

    const bookings = await bookingRepository.findAllBookings(query);

    return {
      statusCode: 200,
      response: {
        success: true,
        total: bookings.length,
        data: bookings,
      },
    };
  }

  async getRoommates(roomId, semester) {
    if (!roomId || !semester) {
      return {
        statusCode: 400,
        response: {
          success: false,
          message: "Thiếu thông tin phòng hoặc kỳ học",
        },
      };
    }

    const roommates = await bookingRepository.findRoommatesByRoomAndSemester(
      roomId,
      semester,
    );

    // Format to match the frontend expectations: array of { bedNumber, student }
    const formattedRoommates = roommates
      .filter((booking) => booking.studentId) // Ensure studentId is populated
      .map((booking) => ({
        bedNumber: booking.bedNumber,
        student: booking.studentId,
      }));

    return {
      statusCode: 200,
      response: {
        success: true,
        data: formattedRoommates,
      },
    };
  }
}

module.exports = new BookingService();
