const paymentService = require("../services/payment.service");
const { verifyVNPayReturn, verifyVNPayIpn } = require("../config/vnpay");
const Booking = require("../models/booking.model"); // Cần cho việc rollback nếu huỷ ở ReturnUrl

class PaymentController {
  async createBookingPayment(req, res) {
    try {
      const { bookingId } = req.body;
      const studentId = req.user._id;

      const data = await paymentService.getBookingPaymentUrl(bookingId, studentId, req.ip);

      return res.status(200).json({
        success: true,
        message: "Tạo URL thanh toán thành công",
        data,
      });
    } catch (error) {
      console.error("Create Booking Payment Error:", error);
      return res.status(error.message.includes("Không tìm thấy") ? 404 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async createInvoicePayment(req, res) {
    try {
      const { invoiceId } = req.body;
      const studentId = req.user._id;

      const data = await paymentService.getInvoicePaymentUrl(invoiceId, studentId, req.ip);

      return res.status(200).json({
        success: true,
        message: "Tạo URL thanh toán hóa đơn thành công",
        data,
      });
    } catch (error) {
      console.error("Create Invoice Payment Error:", error);
      return res.status(error.message.includes("Không tìm thấy") ? 404 : 400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Webhook hứng IPN Server-to-Server từ VNPay
  async vnpayIpn(req, res) {
    try {
      const verifyResult = verifyVNPayIpn(req.query);
      if (!verifyResult.isVerified) {
        return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
      }

      const { vnp_ResponseCode, vnp_TxnRef } = req.query;

      const parts = vnp_TxnRef.split("_");
      const paymentType = parts[0];
      const targetId = parts[1];

      // Nếu VNPay báo thanh toán không thành công
      if (vnp_ResponseCode !== "00") {
        if (paymentType === "BOOKING") {
          // IPN cũng có thể tự dọn dẹp nếu muốn, nhưng return success RspCode để VNPay biết đã nhận
          await Booking.findByIdAndDelete(targetId);
        }
        return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
      }

      // Xử lý thanh toán thành công
      if (paymentType === "BOOKING") {
        await paymentService.processBookingSuccess(targetId);
      } else if (paymentType === "INVOICE") {
        await paymentService.processInvoiceSuccess(targetId);
      } else {
        return res.status(200).json({ RspCode: "99", Message: "Unknown payment type" });
      }

      // Luôn trả về 00 khi xử lý xong để VNPay không gọi lại nữa
      return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });

    } catch (error) {
      console.error("VNPAY IPN Error:", error);
      // RspCode 99 để báo VNPay lỗi không xác định
      return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
    }
  }

  // URL Return dành cho trình duyệt của người dùng sau khi thanh toán xong
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
        // Có thể dọn dẹp thêm ở đây để frontend phản hồi nhanh hơn nếu IPN chưa tới kịp
        if (paymentType === "BOOKING") {
          await Booking.findByIdAndDelete(targetId);
        }
        return res.redirect(
          `${process.env.CLIENT_URL}/student/payment-result?status=error&message=PaymentFailed`,
        );
      }

      // Thanh toán thành công, redirect thẳng về trang kết quả 
      // (DB đã được cập nhật bởi IPN, hoặc sẽ cập nhật ngay sau đó)
      if (paymentType === "BOOKING") {
        // Fallback: Nếu IPN bị chậm, ta vẫn có thể chủ động trigger logic ngay tại đây
        // để người dùng thấy kết quả ngay lập tức mà không phải chờ.
        await paymentService.processBookingSuccess(targetId).catch(console.error);

        return res.redirect(
          `${process.env.CLIENT_URL}/student/booking-result?status=success&bookingId=${targetId}`,
        );
      }

      if (paymentType === "INVOICE") {
        await paymentService.processInvoiceSuccess(targetId).catch(console.error);

        return res.redirect(
          `${process.env.CLIENT_URL}/student/payment-result?status=success&invoiceId=${targetId}`,
        );
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
}

module.exports = new PaymentController();
