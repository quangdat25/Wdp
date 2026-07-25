const Booking = require("../models/booking.model");
const User = require("../models/user.model");
const Invoice = require("../models/invoice.model");

class PaymentRepository {
  findBookingForPayment(bookingId) {
    return Booking.findById(bookingId)
      .populate("roomId")
      .populate({
        path: "configId",
        select: "name roomPrice status",
      });
  }

  findBookingForSuccess(bookingId) {
    return Booking.findById(bookingId)
      .populate({
        path: "roomId",
        populate: {
          path: "building",
          select: "name",
        },
      })
      .populate({
        path: "configId",
        select: "name roomPrice",
      });
  }

  findBookingWithRoom(bookingId) {
    return Booking.findById(bookingId).populate({
      path: "roomId",
      populate: {
        path: "building",
        select: "name",
      },
    });
  }

  deleteBookingById(bookingId) {
    return Booking.findByIdAndDelete(bookingId);
  }

  saveBooking(booking) {
    return booking.save();
  }

  findStudentById(studentId) {
    return User.findById(studentId)
      .select("fullName username email studentCode role")
      .lean();
  }

  findInvoiceById(invoiceId) {
    return Invoice.findById(invoiceId);
  }

  findRoomFeeInvoiceByBookingId(bookingId) {
    return Invoice.findOne({
      bookingId,
      type: "room_fee",
    });
  }

  createInvoice(data) {
    return Invoice.create(data);
  }

  saveInvoice(invoice) {
    return invoice.save();
  }
}

module.exports = new PaymentRepository();
