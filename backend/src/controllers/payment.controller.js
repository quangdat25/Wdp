const Booking = require("../models/booking.model");
const Room = require("../models/room.models");
const User = require("../models/user.model");
const Invoice = require("../models/invoice.model");

const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

function generatePayID() {
  const now = new Date();
  const timestamp = now.getTime();
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
  return `PAY${timestamp}${seconds}${milliseconds}`;
}

class PaymentController {
  // Tạo URL thanh toán VNPAY cho booking
 async createBookingPayment(req, res) {
  try {
    const { bookingId } = req.body;
    const studentId = req.user._id;

    const booking = await Booking.findById(bookingId).populate("roomId");
    if (!booking) return res.status(404).json({ success: false, message: "Không tìm thấy booking" });

    if (booking.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({ success: false, message: "Không có quyền" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking không ở trạng thái pending" });
    }

    const vnpay = new VNPay({
      tmnCode: "LD2LB3IS",
      secureSecret: "G9RG57L2JHWGZQP432WTNZQT5PDUYM91",
      vnpayHost: "https://sandbox.vnpayment.vn/vnpaygw-sit-testing/vpcpay.html",
      testMode: true,
      hashAlgorithm: "SHA512",  
      loggerFn: ignoreLogger,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: booking.roomId.price || 2000000,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: `${booking._id}-${generatePayID()}`,
      vnp_OrderInfo: `Thanh toan dat phong ${booking.roomId.displayName || booking.roomId.roomNumber}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `http://localhost:3000/api/payment/vnpay-callback`, // Phải khớp với route
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    res.status(200).json({
      success: true,
      message: "Tạo URL thanh toán thành công",
      data: {
        paymentUrl,
        bookingId: booking._id,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

  // VNPAY callback - xử lý kết quả thanh toán
  async vnpayReturn(req, res) {
    try {
      const vnpay = new VNPay({
        tmnCode: "LD2LB3IS",
        secureSecret: "G9RG57L2JHWGZQP432WTNZQT5PDUYM91",
        vnpayHost: "https://sandbox.vnpayment.vn",
        testMode: true,
        hashAlgorithm: "SHA512",
        loggerFn: ignoreLogger,
      });

      const verifyResult = vnpay.verifyReturnUrl(req.query);

      const { vnp_ResponseCode, vnp_TxnRef } = req.query;
      const bookingId = vnp_TxnRef.split("-")[0];

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.redirect(`${process.env.CLIENT_URL}/student/booking-result?status=error`);
      }

      if (vnp_ResponseCode === "00" && verifyResult.isVerified) {
        // Thanh toán thành công
        booking.status = "confirmed";
        await booking.save();

        const room = await Room.findById(booking.roomId);
        const student = await User.findById(booking.studentId);

        // Cập nhật sinh viên vào phòng (chỉ gán sau khi thanh toán thành công)
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

        // Tạo Invoice đã thanh toán
        const amount = room ? (room.price || 2000000) : 2000000;

        await Invoice.create({
          bookingId: booking._id,
          studentId: booking.studentId,
          invoiceCode: `INV-${booking._id.toString().slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
          type: "room_fee",
          amount: amount,
          status: "paid",
          paidAt: new Date(),
          dueDate: new Date(),
        });

        return res.redirect(`${process.env.CLIENT_URL}/student/booking-result?status=success&bookingId=${booking._id}`);
      } else {
        // Thanh toán thất bại → Chỉ xóa booking, không cần nhả giường vì chưa gán
        await booking.deleteOne();

        return res.redirect(
          `${process.env.CLIENT_URL}/student/booking-result?status=error&message=PaymentFailed`
        );
      }
    } catch (error) {
      console.error("VNPAY Return Error:", error);
      return res.redirect(`${process.env.CLIENT_URL}/student/booking-result?status=error`);
    }
  }
}

module.exports = new PaymentController();
