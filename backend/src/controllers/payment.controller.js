const Booking = require("../models/booking.model");
const Room = require("../models/room.models");
const User = require("../models/user.model");
const Invoice = require("../models/invoice.model");

const {
  createVNPayUrl,
  verifyVNPayReturn,
  generatePayID,
} = require("../config/vnpay");

class PaymentController {
  async createBookingPayment(req, res) {
    try {
      const { bookingId } = req.body;
      const studentId = req.user._id;

      const booking = await Booking.findById(bookingId).populate("roomId");

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy booking",
        });
      }

      if (booking.studentId.toString() !== studentId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền thanh toán booking này",
        });
      }

      if (booking.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Booking không ở trạng thái chờ thanh toán",
        });
      }

      const amount = booking.roomId?.price || 2000000;

      const paymentUrl = createVNPayUrl({
        amount,
        ipAddr: req.ip,
        txnRef: `BOOKING_${booking._id}_${generatePayID()}`,
        orderInfo: `Thanh toan dat phong ${booking.roomId?.displayName || booking.roomId?.roomNumber}`,
      });

      return res.status(200).json({
        success: true,
        message: "Tạo URL thanh toán thành công",
        data: {
          paymentUrl,
          bookingId: booking._id,
        },
      });
    } catch (error) {
      console.error("Create Booking Payment Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createInvoicePayment(req, res) {
    try {
      const { invoiceId } = req.body;
      const studentId = req.user._id;

      const invoice = await Invoice.findById(invoiceId);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy hóa đơn",
        });
      }

      if (invoice.studentId.toString() !== studentId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền thanh toán hóa đơn này",
        });
      }

      if (invoice.status === "paid") {
        return res.status(400).json({
          success: false,
          message: "Hóa đơn này đã được thanh toán",
        });
      }

      const paymentUrl = createVNPayUrl({
        amount: invoice.amount,
        ipAddr: req.ip,
        txnRef: `INVOICE_${invoice._id}_${generatePayID()}`,
        orderInfo: `Thanh toan hoa don ${invoice.invoiceCode}`,
      });

      return res.status(200).json({
        success: true,
        message: "Tạo URL thanh toán hóa đơn thành công",
        data: {
          paymentUrl,
          invoiceId: invoice._id,
        },
      });
    } catch (error) {
      console.error("Create Invoice Payment Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async vnpayReturn(req, res) {
    try {
      const verifyResult = verifyVNPayReturn(req.query);

      const { vnp_ResponseCode, vnp_TxnRef } = req.query;

      if (!verifyResult.isVerified) {
        return res.redirect(
          `${process.env.CLIENT_URL}/student/payment-result?status=error&message=InvalidSignature`,
        );
      }

      const parts = vnp_TxnRef.split("_");
      const paymentType = parts[0];
      const targetId = parts[1];

      if (vnp_ResponseCode !== "00") {
        if (paymentType === "BOOKING") {
          await Booking.findByIdAndDelete(targetId);
        }

        return res.redirect(
          `${process.env.CLIENT_URL}/student/payment-result?status=error&message=PaymentFailed`,
        );
      }

      if (paymentType === "BOOKING") {
        return await this.handleBookingSuccess(targetId, res);
      }

      if (paymentType === "INVOICE") {
        return await this.handleInvoiceSuccess(targetId, res);
      }

      return res.redirect(
        `${process.env.CLIENT_URL}/student/payment-result?status=error&message=InvalidPaymentType`,
      );
    } catch (error) {
      console.error("VNPAY Return Error:", error);
      return res.redirect(
        `${process.env.CLIENT_URL}/student/payment-result?status=error`,
      );
    }
  }

  async handleBookingSuccess(bookingId, res) {
    const booking = await Booking.findById(bookingId).populate("roomId");

    if (!booking) {
      return res.redirect(
        `${process.env.CLIENT_URL}/student/payment-result?status=error&message=BookingNotFound`,
      );
    }

    if (booking.status === "confirmed") {
      return res.redirect(
        `${process.env.CLIENT_URL}/student/booking-result?status=success&bookingId=${booking._id}`,
      );
    }

    booking.status = "confirmed";
    await booking.save();

    const amount = booking.roomId?.price || 2000000;

    await Invoice.create({
      bookingId: booking._id,
      studentId: booking.studentId,
      invoiceCode: `INV-${booking._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      type: "room_fee",
      amount,
      status: "paid",
      paidAt: new Date(),
      dueDate: new Date(),
    });

    return res.redirect(
      `${process.env.CLIENT_URL}/student/booking-result?status=success&bookingId=${booking._id}`,
    );
  }

  async handleInvoiceSuccess(invoiceId, res) {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.redirect(
        `${process.env.CLIENT_URL}/student/payment-result?status=error&message=InvoiceNotFound`,
      );
    }

    invoice.status = "paid";
    invoice.paidAt = new Date();
    await invoice.save();

    return res.redirect(
      `${process.env.CLIENT_URL}/student/payment-result?status=success&invoiceId=${invoice._id}`,
    );
  }
}

module.exports = new PaymentController();
