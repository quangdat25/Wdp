const Room = require("../models/room.models");
const Building = require("../models/building.model");
const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const Invoice = require("../models/invoice.model");

class BookingRepository {
  async findStudentById(studentId) {
    return User.findById(studentId).lean();
  }

  async findStudentsByStudentCode(studentCode) {
    return User.find({
      role: "student",
      studentCode: { $regex: studentCode, $options: "i" },
    })
      .select("_id")
      .lean();
  }

  async findBuildingById(buildingId) {
    return Building.findById(buildingId).lean();
  }

  async findCurrentRoomByStudent(studentId) {
    return Room.findOne({ "students.student": studentId });
  }

  async findRoomById(roomId) {
    return Room.findById(roomId);
  }

  async findAvailableRooms(query) {
    return Room.find(query)
      .sort({ floor: 1, roomNumber: 1 })
      .populate("building", "name")
      .lean();
  }

  async findPopulatedRoomById(roomId) {
    return Room.findById(roomId)
      .populate("building", "name")
      .populate(
        "students.student",
        "fullName studentCode gender",
      );
  }

  async findActiveBookingByStudentAndSemester(studentId, semester) {
    return Booking.findOne({
      studentId,
      semester,
      isBedReserved: true,
    });
  }

  async findReservedBed(roomId, semester, bedNumber) {
    return Booking.findOne({
      roomId,
      semester,
      bedNumber,
      isBedReserved: true,
    }).lean();
  }

  async findReservedBedsByRoomAndSemester(roomId, semester) {
    return Booking.find({
      roomId,
      semester,
      isBedReserved: true,
    })
      .select("bedNumber status studentId")
      .lean();
  }

  async findReservedBedsByRoomsAndSemester(roomIds, semester) {
    return Booking.find({
      roomId: { $in: roomIds },
      semester,
      isBedReserved: true,
    })
      .select("roomId bedNumber status")
      .lean();
  }

  async countReservedBedsByRoomAndSemester(roomId, semester) {
    return Booking.countDocuments({
      roomId,
      semester,
      isBedReserved: true,
    });
  }

  async releasePendingBookingsByStudentAndSemester(
    studentId,
    semester,
  ) {
    return Booking.updateMany(
      {
        studentId,
        semester,
        status: "pending",
        isBedReserved: true,
      },
      {
        $set: {
          status: "cancelled",
          isBedReserved: false,
          paymentExpiresAt: null,
        },
      },
    );
  }

  async createBooking(data) {
    return Booking.create(data);
  }

  async findCurrentBookingByStudent(studentId) {
    return Booking.findOne({
      studentId,
      status: {
        $in: ["pending", "confirmed", "checked_in", "checked_out"],
      },
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
  }

  async findMyBookingHistory(studentId) {
    return Booking.find({ studentId })
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
      .sort({ createdAt: -1 })
      .lean();
  }

  async findRoomBookingHistory(roomId) {
    return Booking.find({
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
  }

  async findAllBookings(query) {
    return Booking.find(query)
      .populate(
        "studentId",
        "fullName studentCode email phone gender",
      )
      .populate({
        path: "roomId",
        select:
          "roomNumber displayName floor price capacity status building",
        populate: { path: "building", select: "name" },
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findUnpaidInvoicesByStudent(studentId) {
    return Invoice.find({
      studentId,
      status: { $in: ["unpaid", "overdue"] },
    }).lean();
  }
}

module.exports = new BookingRepository();
