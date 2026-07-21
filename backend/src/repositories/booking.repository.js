const Room = require("../models/room.models");
const Building = require("../models/building.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const Invoice = require("../models/invoice.model");

/**
 * Điều kiện xác định booking đang giữ giường:
 *
 * 1. pending và chưa hết 15 phút thanh toán
 * 2. confirmed: đã thanh toán
 * 3. checked_in: đang ở trong phòng
 */
const getReservedBookingCondition = () => ({
  $or: [
    {
      status: "pending",
      paymentExpiresAt: {
        $gt: new Date(),
      },
    },
    {
      status: {
        $in: ["confirmed", "checked_in"],
      },
    },
  ],
});

class BookingRepository {
  async findStudentById(studentId) {
    return User.findById(studentId).lean();
  }

  async findStudentsByStudentCode(studentCode) {
    return User.find({
      role: "student",
      studentCode: {
        $regex: studentCode,
        $options: "i",
      },
    })
      .select("_id")
      .lean();
  }

  async findBuildingById(buildingId) {
    return Building.findById(buildingId).lean();
  }

  async findCurrentRoomByStudent(studentId) {
    return Room.findOne({
      "students.student": studentId,
    });
  }

  async findRoomById(roomId) {
    return Room.findById(roomId);
  }

  async findAvailableRooms(query) {
    return Room.find(query)
      .sort({
        floor: 1,
        roomNumber: 1,
      })
      .populate("building", "name")
      .lean();
  }

  async findPopulatedRoomById(roomId) {
    return Room.findById(roomId)
      .populate("building", "name")
      .populate("students.student", "fullName studentCode gender");
  }

  /**
   * Kiểm tra sinh viên đã có booking đang hoạt động
   * trong kỳ hay chưa.
   *
   * Pending hết hạn không được tính là booking hoạt động.
   */
  async findActiveBookingByStudentAndSemester(studentId, semester) {
    return Booking.findOne({
      studentId,
      semester,
      ...getReservedBookingCondition(),
    })
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  /**
   * Kiểm tra một giường cụ thể có đang bị giữ không.
   */
  async findReservedBed(roomId, semester, bedNumber) {
    return Booking.findOne({
      roomId,
      semester,
      bedNumber,
      ...getReservedBookingCondition(),
    }).lean();
  }

  /**
   * Lấy tất cả giường đang bị giữ trong một phòng.
   */
  async findReservedBedsByRoomAndSemester(roomId, semester) {
    return Booking.find({
      roomId,
      semester,
      ...getReservedBookingCondition(),
    })
      .select("bedNumber status studentId paymentExpiresAt")
      .lean();
  }

  /**
   * Lấy danh sách bạn cùng phòng trong một phòng theo kỳ học.
   */
  async findRoommatesByRoomAndSemester(roomId, semester) {
    return Booking.find({
      roomId,
      semester,
      status: { $in: ["confirmed", "checked_in", "checked_out"] },
    })
      .populate("studentId", "fullName studentCode phone email gender")
      .select("bedNumber status studentId")
      .lean();
  }

  /**
   * Lấy các giường đang bị giữ trong nhiều phòng.
   */
  async findReservedBedsByRoomsAndSemester(roomIds, semester) {
    return Booking.find({
      roomId: {
        $in: roomIds,
      },
      semester,
      ...getReservedBookingCondition(),
    })
      .select("roomId bedNumber status studentId paymentExpiresAt")
      .lean();
  }

  /**
   * Đếm số giường đang bị giữ trong phòng.
   */
  async countReservedBedsByRoomAndSemester(roomId, semester) {
    return Booking.countDocuments({
      roomId,
      semester,
      ...getReservedBookingCondition(),
    });
  }

  /**
   * Khi sinh viên chọn một giường mới:
   * xóa booking pending cũ trong cùng kỳ.
   */
  async releasePendingBookingsByStudentAndSemester(studentId, semester) {
    return Booking.deleteMany({
      studentId,
      semester,
      status: "pending",
    });
  }


  async deleteExpiredPendingBookings() {
    const now = new Date();

    // Lấy các booking pending đã quá hạn
    const expiredBookings = await Booking.find({
      status: "pending",
      paymentExpiresAt: {
        $lte: now,
      },
    }).select("_id");

    if (!expiredBookings.length) {
      return {
        deletedBookings: 0,
        deletedInvoices: 0,
      };
    }

    const bookingIds = expiredBookings.map((booking) => booking._id);

    // Xóa hóa đơn tiền phòng thuộc các booking hết hạn
    const invoiceResult = await Invoice.deleteMany({
      bookingId: {
        $in: bookingIds,
      },
      type: "room_fee",
      status: "unpaid",
    });

    // Xóa booking hết hạn
    const bookingResult = await Booking.deleteMany({
      _id: {
        $in: bookingIds,
      },
      status: "pending",
      paymentExpiresAt: {
        $lte: now,
      },
    });

    return {
      deletedBookings: bookingResult.deletedCount,
      deletedInvoices: invoiceResult.deletedCount,
    };
  }

  /**
   * Xóa một booking pending cụ thể.
   * Dùng khi người dùng hủy hoặc thanh toán VNPay thất bại.
   */
  async deletePendingBookingById(bookingId) {
    return Booking.findOneAndDelete({
      _id: bookingId,
      status: "pending",
    });
  }

  /**
   * Xóa booking pending theo mã giao dịch.
   * Chỉ dùng khi model Booking có trường paymentId hoặc txnRef.
   */
  async deletePendingBookingByTxnRef(txnRef) {
    return Booking.findOneAndDelete({
      txnRef,
      status: "pending",
    });
  }

  async createBooking(data) {
    return Booking.create(data);
  }

  /**
   * Lấy booking hiện tại của sinh viên.
   *
   * Pending chỉ được lấy nếu chưa hết hạn.
   * Confirmed và checked_in luôn được lấy.
   * Checked_out được giữ để hiển thị trạng thái gần nhất.
   */
  async findCurrentBookingByStudent(studentId) {
    return Booking.findOne({
      studentId,
      $or: [
        {
          status: "pending",
          paymentExpiresAt: {
            $gt: new Date(),
          },
        },
        {
          status: {
            $in: ["confirmed", "checked_in", "checked_out"],
          },
        },
      ],
    })
      .populate({
        path: "roomId",
        populate: [
          {
            path: "building",
            select: "name",
          },
          {
            path: "students.student",
            select: "fullName studentCode gender",
          },
        ],
      })
      .sort({
        createdAt: -1,
      });
  }

  /**
   * Lịch sử phòng chỉ lấy các booking hợp lệ,
   * không lấy pending hoặc cancelled.
   */
  async findMyBookingHistory(studentId) {
    return Booking.find({
      studentId,
      status: { $nin: ["pending", "cancelled"] },
    })
      .populate({
        path: "roomId",
        populate: [
          { path: "building", select: "name" },
          {
            path: "students.student",
            select: "fullName studentCode gender phone email",
          },
        ],
      })
      .populate({
        path: "configId",
        select: "roomPrice",
      })
      .sort({ createdAt: -1 })
      .lean();
  }
  async findRoomBookingHistory(roomId) {
    return Booking.find({
      roomId,
      status: {
        $in: ["confirmed", "checked_in", "checked_out"],
      },
    })
      .populate({
        path: "studentId",
        model: "User",
        select: "fullName studentCode email phone gender",
      })
      .sort({
        startDate: 1,
        createdAt: 1,
      })
      .lean();
  }

  async findAllBookings(query = {}) {
    return Booking.find(query)
      .populate("studentId", "fullName studentCode email phone gender")
      .populate({
        path: "roomId",
        select: "roomNumber displayName floor price capacity status building",
        populate: {
          path: "building",
          select: "name",
        },
      })
      .sort({
        createdAt: -1,
      })
      .lean();
  }

  async findUnpaidInvoicesByStudent(studentId) {
    return Invoice.find({
      studentId,
      status: {
        $in: ["unpaid", "overdue"],
      },
    }).lean();
  }
}

module.exports = new BookingRepository();
