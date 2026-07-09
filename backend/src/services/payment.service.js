const Booking = require("../models/booking.model");
const Room = require("../models/room.models");
const User = require("../models/user.model");
const Invoice = require("../models/invoice.model");
const { sendInvoiceMail } = require("./invoiceEmail.service");
const { createVNPayUrl, generatePayID } = require("../config/vnpay");

class PaymentService {
  async getBookingPaymentUrl(bookingId, studentId, ipAddr) {
    const booking = await Booking.findById(bookingId).populate("roomId");

    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    if (booking.studentId.toString() !== studentId.toString()) {
      throw new Error("Không có quyền thanh toán booking này");
    }

    if (booking.status !== "pending") {
      throw new Error("Booking không ở trạng thái chờ thanh toán");
    }

    const amount = booking.roomId?.price || 2000000;

    const paymentUrl = createVNPayUrl({
      amount,
      ipAddr,
      txnRef: `BOOKING_${booking._id}_${generatePayID()}`,
      orderInfo: `Thanh toan dat phong ${booking.roomId?.displayName || booking.roomId?.roomNumber}`,
    });

    return { paymentUrl, bookingId: booking._id };
  }

  async getInvoicePaymentUrl(invoiceId, studentId, ipAddr) {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      throw new Error("Không tìm thấy hóa đơn");
    }

    if (invoice.studentId.toString() !== studentId.toString()) {
      throw new Error("Không có quyền thanh toán hóa đơn này");
    }

    if (invoice.status === "paid") {
      throw new Error("Hóa đơn này đã được thanh toán");
    }

    const paymentUrl = createVNPayUrl({
      amount: invoice.amount,
      ipAddr,
      txnRef: `INVOICE_${invoice._id}_${generatePayID()}`,
      orderInfo: `Thanh toan hoa don ${invoice.invoiceCode}`,
    });

    return { paymentUrl, invoiceId: invoice._id };
  }

  async processBookingSuccess(bookingId) {
    const booking = await Booking.findById(bookingId).populate("roomId");

    if (!booking) {
      throw new Error("BookingNotFound");
    }

    if (booking.status === "confirmed") {
      return true; // Đã xử lý rồi
    }

    booking.status = "confirmed";
    await booking.save();

    const room = await Room.findById(booking.roomId);
    const student = await User.findById(booking.studentId);

    // Cập nhật sinh viên vào phòng
    if (room) {
      room.students.push({ student: booking.studentId, bedNumber: booking.bedNumber });
      room.currentOccupants = room.students.length;
      if (room.status !== "maintenance") {
        room.status = room.students.length >= room.capacity ? "occupied" : "available";
      }
      await room.save();
    }

    // Cập nhật thông tin phòng của sinh viên
    if (student && room) {
      student.roomId = room._id;
      student.buildingId = room.building;
      await student.save();
    }

    const amount = room?.price || 2000000;

    const newInvoice = await Invoice.create({
      bookingId: booking._id,
      studentId: booking.studentId,
      invoiceCode: `INV-${booking._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      type: "room_fee",
      semester: booking.semester || "Summer 2026",
      amount,
      status: "paid",
      paidAt: new Date(),
      dueDate: new Date(),
    });

    // Gửi email thông báo
    if (student && room) {
      sendInvoiceMail({ invoice: newInvoice, user: student, room: room });
    }

    return true;
  }

  async processInvoiceSuccess(invoiceId) {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      throw new Error("InvoiceNotFound");
    }

    if (invoice.status === "paid") {
      return true; // Đã xử lý rồi
    }

    invoice.status = "paid";
    invoice.paidAt = new Date();
    await invoice.save();

    return true;
  }
}

module.exports = new PaymentService();
