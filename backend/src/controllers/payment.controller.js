const Booking = require("../models/booking.model");
const Room = require("../models/room.models");
const User = require("../models/user.model");
const Invoice = require("../models/invoice.model");
const sendMail = require("../config/mail");

const {
  createVNPayUrl,
  verifyVNPayReturn,
  generatePayID,
} = require("../config/vnpay");

class PaymentController {
  async sendBookingSuccessMail({ booking, student, room, invoice }) {
    try {
      if (!student?.email) {
        console.log("Sinh viên không có email, bỏ qua gửi mail booking");
        return;
      }

      const studentName = student.fullName || student.username || "sinh viên";

      const buildingName = room?.building?.name || "Chưa xác định";

      const roomName = room?.displayName || room?.roomNumber || "Chưa xác định";

      const formatDate = (date) => {
        if (!date) return "Chưa xác định";

        return new Intl.DateTimeFormat("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(date));
      };

      const formatDateTime = (date) => {
        if (!date) return "Chưa xác định";

        return new Intl.DateTimeFormat("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(date));
      };

      const formatCurrency = (amount) => {
        return Number(amount || 0).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
      };

      await sendMail({
        to: student.email,
        subject: "[FPT Dormitory] Thanh toán và xác nhận đặt phòng thành công",
        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #111827;
              max-width: 680px;
              margin: 0 auto;
            "
          >
            <h2 style="color: #16a34a;">
              Xác nhận đặt phòng thành công
            </h2>

            <p>
              Xin chào <b>${studentName}</b>,
            </p>

            <p>
              Hệ thống đã ghi nhận thanh toán thành công.
              Đơn đặt phòng của bạn đã được
              <b style="color: #16a34a;">xác nhận</b>.
            </p>

            <div
              style="
                background: #f8fafc;
                padding: 18px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                margin: 18px 0;
              "
            >
              <p style="margin: 7px 0;">
                <b>Mã booking:</b> ${booking._id}
              </p>

              <p style="margin: 7px 0;">
                <b>Mã hóa đơn:</b>
                ${invoice?.invoiceCode || "Chưa xác định"}
              </p>

              <p style="margin: 7px 0;">
                <b>Mã sinh viên:</b>
                ${student.studentCode || "Chưa cập nhật"}
              </p>

              <p style="margin: 7px 0;">
                <b>Học kỳ:</b>
                ${booking.semester || "Chưa xác định"}
              </p>

              <p style="margin: 7px 0;">
                <b>Tòa:</b> ${buildingName}
              </p>

              <p style="margin: 7px 0;">
                <b>Phòng:</b> ${roomName}
              </p>

              <p style="margin: 7px 0;">
                <b>Giường:</b> Giường ${booking.bedNumber}
              </p>

              <p style="margin: 7px 0;">
                <b>Thời gian ở:</b>
                ${formatDate(booking.startDate)}
                -
                ${formatDate(booking.endDate)}
              </p>

              <p style="margin: 7px 0;">
                <b>Số tiền:</b>
                ${formatCurrency(invoice?.amount)}
              </p>

              <p style="margin: 7px 0;">
                <b>Thanh toán lúc:</b>
                ${formatDateTime(invoice?.paidAt)}
              </p>

              <p style="margin: 7px 0;">
                <b>Trạng thái booking:</b>
                <span
                  style="
                    color: #16a34a;
                    font-weight: bold;
                  "
                >
                  Đã xác nhận
                </span>
              </p>
            </div>

            <div
              style="
                background: #eff6ff;
                padding: 14px 16px;
                border-left: 4px solid #2563eb;
                border-radius: 8px;
                margin: 18px 0;
              "
            >
              Sinh viên sẽ được hệ thống tự động check-in
              vào phòng khi đến ngày bắt đầu kỳ học.
            </div>

            <p>
              Trân trọng,<br />
              <b>FPT Dormitory</b>
            </p>
          </div>
        `,
      });

      console.log(`Đã gửi email xác nhận booking đến ${student.email}`);
    } catch (error) {
      console.error("SEND BOOKING SUCCESS MAIL ERROR:", error.message);
    }
  }
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
    try {
      const booking = await Booking.findById(bookingId).populate({
        path: "roomId",
        populate: {
          path: "building",
          select: "name",
        },
      });

      if (!booking) {
        return res.redirect(
          `${process.env.CLIENT_URL}/student/payment-result?status=error&message=BookingNotFound`,
        );
      }

      /*
       * VNPay có thể gọi return URL nhiều lần.
       * Nếu booking đã confirmed thì không tạo thêm hóa đơn
       * và không gửi lại email.
       */
      if (booking.status === "confirmed" || booking.status === "checked_in") {
        return res.redirect(
          `${process.env.CLIENT_URL}/student/booking-result?status=success&bookingId=${booking._id}`,
        );
      }

      if (booking.status !== "pending") {
        return res.redirect(
          `${process.env.CLIENT_URL}/student/payment-result?status=error&message=InvalidBookingStatus`,
        );
      }

      const student = await User.findById(booking.studentId)
        .select("fullName username email studentCode role")
        .lean();

      if (!student) {
        return res.redirect(
          `${process.env.CLIENT_URL}/student/payment-result?status=error&message=StudentNotFound`,
        );
      }

      const room = booking.roomId;

      if (!room) {
        return res.redirect(
          `${process.env.CLIENT_URL}/student/payment-result?status=error&message=RoomNotFound`,
        );
      }

      const amount = Number(room.price || 2000000);

      /*
       * Kiểm tra hóa đơn đã tồn tại để chống tạo trùng
       * khi VNPay callback/return bị gọi lại.
       */
      let invoice = await Invoice.findOne({
        bookingId: booking._id,
        type: "room_fee",
      });

      if (!invoice) {
        invoice = await Invoice.create({
          bookingId: booking._id,
          studentId: booking.studentId,
          invoiceCode: `INV-${booking._id
            .toString()
            .slice(-6)
            .toUpperCase()}-${Date.now().toString().slice(-4)}`,
          type: "room_fee",
          amount,
          status: "paid",
          paidAt: new Date(),
          dueDate: new Date(),
        });
      } else if (invoice.status !== "paid") {
        invoice.status = "paid";
        invoice.paidAt = new Date();
        await invoice.save();
      }

      booking.status = "confirmed";
      await booking.save();

      this.sendBookingSuccessMail({
        booking,
        student,
        room,
        invoice,
      }).catch((mailError) => {
        console.error("SEND BOOKING MAIL PROMISE ERROR:", mailError.message);
      });

      return res.redirect(
        `${process.env.CLIENT_URL}/student/booking-result?status=success&bookingId=${booking._id}`,
      );
    } catch (error) {
      console.error("HANDLE BOOKING SUCCESS ERROR:", error);

      return res.redirect(
        `${process.env.CLIENT_URL}/student/payment-result?status=error&message=BookingConfirmationFailed`,
      );
    }
  }
  async handleInvoiceSuccess(invoiceId, res) {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.redirect(
        `${process.env.CLIENT_URL}/student/payment-result?status=error&message=InvoiceNotFound`,
      );
    }

    if (invoice.status !== "paid") {
      invoice.status = "paid";
      invoice.paidAt = new Date();
      await invoice.save();
    }

    if (invoice.type === "room_fee" && invoice.bookingId) {
      try {
        const booking = await Booking.findById(invoice.bookingId).populate({
          path: "roomId",
          populate: { path: "building", select: "name" },
        });

        if (booking && booking.status === "pending") {
          booking.status = "confirmed";
          await booking.save();

          const student = await User.findById(booking.studentId)
            .select("fullName username email studentCode role")
            .lean();

          if (student && booking.roomId) {
            this.sendBookingSuccessMail({
              booking,
              student,
              room: booking.roomId,
              invoice,
            }).catch((mailError) => {
              console.error("SEND BOOKING MAIL PROMISE ERROR:", mailError.message);
            });
          }
        }

        return res.redirect(
          `${process.env.CLIENT_URL}/student/booking-result?status=success&bookingId=${booking._id}`,
        );
      } catch (err) {
        console.error("HANDLE INVOICE SUCCESS FOR ROOM FEE ERROR:", err);
      }
    }

    return res.redirect(
      `${process.env.CLIENT_URL}/student/payment-result?status=success&invoiceId=${invoice._id}`,
    );
  }
}

module.exports = new PaymentController();
