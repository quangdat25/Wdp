const mongoose = require("mongoose");
const Room = require("../models/room.models");
const Building = require("../models/building.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const Student = require("../models/student.model");
const Invoice = require("../models/invoice.model");
const semesterService = require("../services/semester.service");

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
// Kiểm tra điều kiện booking
const checkBookingEligibility = async (req, res) => {
  try {
    const studentId = req.user._id;

    const student = await User.findById(studentId).lean();

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        eligible: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    // Check thời gian được phép booking theo kỳ hiện tại
    const currentSemester = await semesterService.getCurrentSemester();

    const today = getUTCDateString(new Date());
    const bookingStart = getUTCDateString(currentSemester.bookingStartDate);
    const bookingEnd = getUTCDateString(currentSemester.bookingEndDate);

    if (today < bookingStart || today > bookingEnd) {
      return res.status(400).json({
        success: false,
        eligible: false,
        reason: "booking_closed",
        message: `Hiện không nằm trong thời gian đăng ký phòng. Thời gian đăng ký kỳ ${
          currentSemester.name
        } là từ ${formatDateUTC(
          currentSemester.bookingStartDate,
        )} đến ${formatDateUTC(currentSemester.bookingEndDate)}.`,
        data: {
          currentSemester: currentSemester.name,
          semesterCode: currentSemester.code,
          bookingStartDate: currentSemester.bookingStartDate,
          bookingEndDate: currentSemester.bookingEndDate,
        },
      });
    }

    // Kiểm tra sinh viên đã có phòng chưa
    const existingRoom = await Room.findOne({
      "students.student": studentId,
    });

    if (existingRoom) {
      const studentEntry = existingRoom.students.find(
        (s) => s.student.toString() === studentId.toString(),
      );

      const bedInfo = studentEntry ? ` - Giường ${studentEntry.bedNumber}` : "";

      return res.status(400).json({
        success: false,
        eligible: false,
        reason: "already_booked",
        message: `Bạn đang ở phòng ${existingRoom.displayName}${bedInfo}. Không thể đặt phòng mới.`,
        data: {
          CFDScore: student.CFDScore,
          currentRoom: existingRoom.displayName,
          bedNumber: studentEntry ? studentEntry.bedNumber : null,
        },
      });
    }

    // Kiểm tra có booking đang confirmed/checked_in không
    const existingBooking = await Booking.findOne({
      studentId,
      status: { $in: ["confirmed", "checked_in"] },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        eligible: false,
        reason: "has_active_booking",
        message: "Bạn đã có đơn đặt phòng đang xử lý. Không thể đặt thêm.",
        data: {
          CFDScore: student.CFDScore,
          bookingStatus: existingBooking.status,
        },
      });
    }

    // Check CFD Score >= 80
    const cfdScore = student.CFDScore || 0;

    if (cfdScore < 80) {
      return res.status(400).json({
        success: false,
        eligible: false,
        reason: "low_cfd",
        message: `Điểm CFD của bạn hiện tại là ${cfdScore}. Cần tối thiểu 80 điểm để đặt phòng.`,
        data: {
          CFDScore: cfdScore,
          requiredScore: 80,
        },
      });
    }

    // Check không có hóa đơn chưa thanh toán
    const unpaidInvoices = await Invoice.find({
      studentId,
      status: { $in: ["unpaid", "overdue"] },
    });

    const totalUnpaid = unpaidInvoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0,
    );

    if (totalUnpaid > 0) {
      return res.status(400).json({
        success: false,
        eligible: false,
        reason: "unpaid_invoice",
        message: `Bạn còn nợ ${totalUnpaid.toLocaleString(
          "vi-VN",
        )}đ hóa đơn chưa thanh toán. Vui lòng thanh toán trước khi đặt phòng.`,
        data: {
          CFDScore: cfdScore,
          totalUnpaid,
          unpaidCount: unpaidInvoices.length,
        },
      });
    }

    return res.status(200).json({
      success: true,
      eligible: true,
      message: "Bạn đủ điều kiện đặt phòng!",
      data: {
        CFDScore: cfdScore,
        totalUnpaid: 0,
        currentSemester: currentSemester.name,
        semesterCode: currentSemester.code,
      },
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

    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tòa nhà",
      });
    }

    const query = {
      building: buildingId,
      status: { $ne: "maintenance" },
    };

    if (floor) {
      query.floor = parseInt(floor);
    }

    const rooms = await Room.find(query)
      .sort({ floor: 1, roomNumber: 1 })
      .populate("building", "name")
      .populate("students.student", "fullName studentCode gender");

    // Format rooms với thông tin giường trống
    const formattedRooms = rooms.map((room) => {
      const roomObj = room.toObject();
      const occupiedBeds = roomObj.students.map((s) => s.bedNumber);
      const availableBeds = [];

      for (let i = 1; i <= roomObj.capacity; i++) {
        if (!occupiedBeds.includes(i)) {
          availableBeds.push(i);
        }
      }

      // Format students info
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

    // Chỉ trả về phòng còn giường trống
    const availableRooms = formattedRooms.filter((r) => r.isAvailable);

    res.status(200).json({
      success: true,
      data: availableRooms,
      building: building,
      totalAvailable: availableRooms.length,
    });
  } catch (error) {
    res.status(500).json({
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
    const nextSemester = await semesterService.getNextSemester();
    const semester = `${nextSemester.name} ${nextSemester.year}`;
    if (!roomId || !bedNumber) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin phòng hoặc giường",
      });
    }

    const student = await User.findById(studentId).lean();
    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    // === Kiểm tra lại điều kiện (chống bypass) ===

    // Check sinh viên đã có phòng chưa
    const existingRoom = await Room.findOne({ "students.student": studentId });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Bạn đang ở phòng ${existingRoom.displayName}. Không thể đặt thêm.`,
      });
    }

    // Xóa các booking pending (nếu có) do user thoát giữa chừng trước đó
    await Booking.deleteMany({
      studentId: studentId,
      status: "pending",
    });

    // Check booking đang active
    const existingBooking = await Booking.findOne({
      studentId: studentId,
      status: { $in: ["confirmed", "checked_in"] },
    });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã có đơn đặt phòng đang xử lý.",
      });
    }

    // Check CFD Score
    if ((student.CFDScore || 0) < 80) {
      return res.status(400).json({
        success: false,
        message: "Điểm CFD không đủ để đặt phòng (yêu cầu >= 80).",
      });
    }

    // Check Invoice
    const unpaidInvoices = await Invoice.find({
      studentId: studentId,
      status: { $in: ["unpaid", "overdue"] },
    });
    const totalUnpaid = unpaidInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );
    if (totalUnpaid > 0) {
      return res.status(400).json({
        success: false,
        message: "Bạn còn nợ hóa đơn chưa thanh toán.",
      });
    }

    // === Kiểm tra phòng và giường ===
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng",
      });
    }

    if (room.status === "maintenance") {
      return res.status(400).json({
        success: false,
        message: "Phòng đang bảo trì, không thể đặt.",
      });
    }

    if (room.students.length >= room.capacity) {
      return res.status(400).json({
        success: false,
        message: "Phòng đã đầy, vui lòng chọn phòng khác.",
      });
    }

    // Kiểm tra giường đã bị lấy chưa
    const bedTaken = room.students.some((s) => s.bedNumber === bedNumber);
    if (bedTaken) {
      return res.status(400).json({
        success: false,
        message: `Giường số ${bedNumber} đã có người, vui lòng chọn giường khác.`,
      });
    }

    if (bedNumber < 1 || bedNumber > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Số giường không hợp lệ (1-${room.capacity}).`,
      });
    }

    const now = new Date();

    const booking = await Booking.create({
      studentId: studentId,
      roomId: roomId,
      bedNumber: bedNumber,
      semester: semester,
      startDate: nextSemester.startDate,
      endDate: nextSemester.endDate,
      status: "pending",
    });

    // Không gán sinh viên vào phòng ở bước này nữa, sẽ gán sau khi thanh toán thành công

    // Populate room info để trả về
    const populatedRoom = await Room.findById(roomId)
      .populate("building", "name")
      .populate("students.student", "fullName studentCode gender");

    res.status(201).json({
      success: true,
      message: `Đặt phòng thành công! Vui lòng thanh toán để xác nhận.`,
      data: {
        booking: booking,
        room: populatedRoom,
        bedNumber: bedNumber,
        price: room.price || 2000000,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi đặt phòng",
      error: error.message,
    });
  }
};

// Lấy booking hiện tại của sinh viên
const getMyBooking = async (req, res) => {
  try {
    const studentId = req.user._id;

    const booking = await Booking.findOne({
      studentId: studentId,
      status: { $in: ["confirmed", "checked_in"] },
    })
      .populate({
        path: "roomId",
        populate: [
          { path: "building", select: "name" },
          {
            path: "students.student",
            select: "fullName studentCode gender",
          },
        ],
      })
      .sort({ createdAt: -1 });

    if (!booking) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "Chưa có đơn đặt phòng",
      });
    }

    // Tìm bedNumber của sinh viên trong room
    let myBedNumber = null;
    if (booking.roomId && booking.roomId.students) {
      const myEntry = booking.roomId.students.find(
        (s) => s.student._id.toString() === studentId.toString(),
      );
      if (myEntry) {
        myBedNumber = myEntry.bedNumber;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...booking.toObject(),
        myBedNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin đặt phòng",
      error: error.message,
    });
  }
};

const getRoomHistory = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "roomId không hợp lệ",
      });
    }

    const currentSemester = await semesterService.getCurrentSemester();

    const currentSemesterText = `${currentSemester.name} ${currentSemester.year}`;

    const semesterOrder = {
      Spring: 1,
      Summer: 2,
      Fall: 3,
    };

    const parseSemester = (semester) => {
      const [name, year] = semester.split(" ");

      return {
        name,
        year: Number(year),
        order: semesterOrder[name] || 0,
      };
    };

    const current = parseSemester(currentSemesterText);

    const isBeforeCurrentSemester = (semester) => {
      const s = parseSemester(semester);

      if (s.year < current.year) return true;
      if (s.year > current.year) return false;

      return s.order < current.order;
    };

    const bookings = await Booking.find({
      roomId,
      status: { $in: ["confirmed", "checked_in", "checked_out"] },
    })
      .populate({
        path: "studentId",
        model: "User",
        select: "fullName studentCode email phone gender",
      })
      .sort({ startDate: 1, createdAt: 1 })
      .lean();

    const filteredBookings = bookings.filter((booking) =>
      isBeforeCurrentSemester(booking.semester),
    );

    const grouped = {};

    filteredBookings.forEach((booking) => {
      const semesterName = booking.semester || "Không xác định";

      if (!grouped[semesterName]) {
        grouped[semesterName] = {
          semester: semesterName,
          students: [],
        };
      }

      grouped[semesterName].students.push({
        _id: booking.studentId?._id,
        fullName: booking.studentId?.fullName || "N/A",
        studentCode: booking.studentId?.studentCode || "N/A",
        email: booking.studentId?.email || "",
        phone: booking.studentId?.phone || "",
        gender: booking.studentId?.gender || "",
        bedNumber: booking.bedNumber,
        status: booking.status,
        startDate: booking.startDate,
        endDate: booking.endDate,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
      });
    });

    return res.status(200).json({
      success: true,
      currentSemester: currentSemesterText,
      data: Object.values(grouped),
    });
  } catch (error) {
    console.error("GET ROOM HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy lịch sử phòng",
      error: error.message,
    });
  }
};
// Manager: Lấy tất cả booking
const getAllBookings = async (req, res) => {
  try {
    const { status, semester, studentCode, roomId } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (semester) {
      query.semester = semester;
    }

    if (roomId) {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({
          success: false,
          message: "roomId không hợp lệ",
        });
      }

      query.roomId = roomId;
    }

    if (studentCode) {
      const students = await User.find({
        role: "student",
        studentCode: { $regex: studentCode, $options: "i" },
      }).select("_id");

      query.studentId = { $in: students.map((s) => s._id) };
    }

    const bookings = await Booking.find(query)
      .populate("studentId", "fullName studentCode email phone gender")
      .populate({
        path: "roomId",
        select: "roomNumber displayName floor price capacity status building",
        populate: {
          path: "building",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("GET ALL BOOKINGS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đặt phòng",
      error: error.message,
    });
  }
};
module.exports = {
  checkBookingEligibility,
  getAvailableRooms,
  createBooking,
  getMyBooking,
  getRoomHistory,
  getAllBookings,
};
