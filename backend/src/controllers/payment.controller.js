const paymentService = require("../services/payment.service");

class PaymentController {
  async createBookingPayment(req, res) {
    try {
      const data = await paymentService.createBookingPayment({
        bookingId: req.body.bookingId,
        studentId: req.user._id,
        ipAddr: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: "Tạo URL thanh toán thành công",
        data,
      });
    } catch (error) {
      console.error("CREATE BOOKING PAYMENT ERROR:", error);

      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Không thể tạo thanh toán đặt phòng",
      });
    }
  }

  async createInvoicePayment(req, res) {
    try {
      const data = await paymentService.createInvoicePayment({
        invoiceId: req.body.invoiceId,
        studentId: req.user._id,
        ipAddr: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: "Tạo URL thanh toán hóa đơn thành công",
        data,
      });
    } catch (error) {
      console.error("CREATE INVOICE PAYMENT ERROR:", error);

      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Không thể tạo thanh toán hóa đơn",
      });
    }
  }

  async vnpayReturn(req, res) {
    try {
      const redirectUrl = await paymentService.handleVnpayReturn(req.query);
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error("VNPAY RETURN ERROR:", error);

      return res.redirect(
        `${process.env.CLIENT_URL}/student/payment-result?status=error`,
      );
    }
  }
}

module.exports = new PaymentController();
