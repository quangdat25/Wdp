const mongoose = require("mongoose");
const Room = require("../models/room.models");
const Building = require("../models/building.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const Invoice = require("../models/invoice.model");

// Kiểm tra điều kiện booking (CFD Score >= 80 và Invoice = 0)
const checkBookingEligibility = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId);

    if (!student || student.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    // Kiểm tra sinh viên đã có phòng chưa
    const existingRoom = await Room.findOne({ "students.student": studentId });
    if (existingRoom) {
      const studentEntry = existingRoom.students.find(s => s.student.toString() === studentId.toString());
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

    // Kiểm tra có booking đang pending/confirmed không
    const existingBooking = await Booking.findOne({
      studentId: studentId,
      status: { $in: ["pending", "confirmed", "checked_in"] },
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

    // Check 1: CFD Score >= 80
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

    // Check 2: Invoice = 0 (không có hóa đơn chưa thanh toán)
    const unpaidInvoices = await Invoice.find({
      studentId: studentId,
      status: { $in: ["unpaid", "overdue"] },
    });

    const totalUnpaid = unpaidInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0
    );

    if (totalUnpaid > 0) {
      return res.status(400).json({
        success: false,
        eligible: false,
        reason: "unpaid_invoice",
        message: `Bạn còn nợ ${totalUnpaid.toLocaleString("vi-VN")}đ hóa đơn chưa thanh toán. Vui lòng thanh toán trước khi đặt phòng.`,
        data: {
          CFDScore: cfdScore,
          totalUnpaid: totalUnpaid,
          unpaidCount: unpaidInvoices.length,
        },
      });
    }

    // Tất cả điều kiện đạt
    return res.status(200).json({
      success: true,
      eligible: true,
      message: "Bạn đủ điều kiện đặt phòng!",
      data: {
        CFDScore: cfdScore,
        totalUnpaid: 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
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
      .populate(
        "students.student",
        "fullName studentCode gender"
      );

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
    const { roomId, bedNumber, semester } = req.body;

    if (!roomId || !bedNumber) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin phòng hoặc giường",
      });
    }

    const student = await User.findById(studentId);
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

    // Check booking đang active
    const existingBooking = await Booking.findOne({
      studentId: studentId,
      status: { $in: ["pending", "confirmed", "checked_in"] },
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
      0
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

    // === Tạo Booking ===
    const bookingSemester = semester || "Summer 2026";
    const now = new Date();

    const booking = await Booking.create({
      studentId: studentId,
      roomId: roomId,
      bedNumber: bedNumber,
      semester: bookingSemester,
      startDate: now,
      endDate: new Date(now.getFullYear(), now.getMonth() + 4, now.getDate()),
      status: "confirmed",
      checkInDate: now,
    });

    // === Tự động gán sinh viên vào phòng (Room.students) ===
    room.students.push({ student: studentId, bedNumber: bedNumber });
    room.currentOccupants = room.students.length;
    if (room.status !== "maintenance") {
      room.status = room.students.length >= room.capacity ? "occupied" : "available";
    }
    await room.save();

    // Cập nhật roomId và buildingId cho sinh viên
    student.roomId = room._id;
    student.buildingId = room.building;
    await student.save();

    // Populate room info để trả về
    const populatedRoom = await Room.findById(roomId)
      .populate("building", "name")
      .populate(
        "students.student",
        "fullName studentCode gender"
      );

    res.status(201).json({
      success: true,
      message: `Đặt phòng thành công! Phòng ${room.displayName}, Giường số ${bedNumber}.`,
      data: {
        booking: booking,
        room: populatedRoom,
        bedNumber: bedNumber,
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
      status: { $in: ["pending", "confirmed", "checked_in"] },
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
        (s) => s.student._id.toString() === studentId.toString()
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

module.exports = {
  checkBookingEligibility,
  getAvailableRooms,
  createBooking,
  getMyBooking,
};
