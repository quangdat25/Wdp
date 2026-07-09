const Booking = require("../models/booking.model");

class BookingRepository {
  async findOne(query) {
    return await Booking.findOne(query);
  }

  async deleteMany(query) {
    return await Booking.deleteMany(query);
  }

  async create(data) {
    return await Booking.create(data);
  }

  async findActiveBookingByStudentId(studentId) {
    return await Booking.findOne({
      studentId,
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
  }
}

module.exports = new BookingRepository();
