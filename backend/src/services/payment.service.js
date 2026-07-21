const paymentRepository = require("../repositories/payment.repository");
const sendMail = require("../config/mail");

const {
  createVNPayUrl,
  verifyVNPayReturn,
  generatePayID,
} = require("../config/vnpay");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

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

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

class PaymentService {
  async createBookingPayment({ bookingId, studentId, ipAddr }) {
    if (!bookingId) {
      throw createError(400, "Thiếu bookingId");
    }

    const booking =
      await paymentRepository.findBookingForPayment(bookingId);

    if (!booking) {
      throw createError(404, "Không tìm thấy booking");
    }

    if (booking.studentId.toString() !== studentId.toString()) {
      throw createError(403, "Không có quyền thanh toán booking này");
    }

    if (booking.status !== "pending") {
      throw createError(
        400,
        "Booking không ở trạng thái chờ thanh toán",
      );
    }

    if (!booking.configId) {
      throw createError(400, "Booking chưa có cấu hình giá");
    }

    const amount = Number(booking.configId.roomPrice);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw createError(400, "Giá phòng của booking không hợp lệ");
    }

    const roomName =
      booking.roomId?.displayName ||
      booking.roomId?.roomNumber ||
      "chưa xác định";

    const paymentUrl = createVNPayUrl({
      amount,
      ipAddr,
      txnRef: `BOOKING_${booking._id}_${generatePayID()}`,
      orderInfo: `Thanh toan dat phong ${roomName}`,
    });

    return {
      paymentUrl,
      bookingId: booking._id,
      amount,
      config: {
        id: booking.configId._id,
        name: booking.configId.name,
        roomPrice: amount,
      },
    };
  }

  async createInvoicePayment({ invoiceId, studentId, ipAddr }) {
    if (!invoiceId) {
      throw createError(400, "Thiếu invoiceId");
    }

    const invoice = await paymentRepository.findInvoiceById(invoiceId);

    if (!invoice) {
      throw createError(404, "Không tìm thấy hóa đơn");
    }

    if (invoice.studentId.toString() !== studentId.toString()) {
      throw createError(403, "Không có quyền thanh toán hóa đơn này");
    }

    if (invoice.status === "paid") {
      throw createError(400, "Hóa đơn này đã được thanh toán");
    }

    const amount = Number(invoice.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw createError(400, "Số tiền hóa đơn không hợp lệ");
    }

    const paymentUrl = createVNPayUrl({
      amount,
      ipAddr,
      txnRef: `INVOICE_${invoice._id}_${generatePayID()}`,
      orderInfo: `Thanh toan hoa don ${invoice.invoiceCode}`,
    });

    return {
      paymentUrl,
      invoiceId: invoice._id,
      amount,
    };
  }

  async handleVnpayReturn(query) {
    const verifyResult = verifyVNPayReturn(query);
    const { vnp_ResponseCode, vnp_TxnRef } = query;

    if (!verifyResult.isVerified) {
      return this.paymentErrorUrl("InvalidSignature");
    }

    if (!vnp_TxnRef) {
      return this.paymentErrorUrl("InvalidTransactionReference");
    }

    const [paymentType, targetId] = vnp_TxnRef.split("_");

    if (!paymentType || !targetId) {
      return this.paymentErrorUrl("InvalidTransactionReference");
    }

    if (vnp_ResponseCode !== "00") {
      return this.paymentErrorUrl("PaymentFailed");
    }

    if (paymentType === "BOOKING") {
      return this.handleBookingSuccess(targetId);
    }

    if (paymentType === "INVOICE") {
      return this.handleInvoiceSuccess(targetId);
    }

    return this.paymentErrorUrl("InvalidPaymentType");
  }

  async handleBookingSuccess(bookingId) {
    try {
      const booking =
        await paymentRepository.findBookingForSuccess(bookingId);

      if (!booking) {
        return this.paymentErrorUrl("BookingNotFound");
      }

      if (
        booking.status === "confirmed" ||
        booking.status === "checked_in"
      ) {
        return this.bookingSuccessUrl(booking._id);
      }

      if (booking.status !== "pending") {
        return this.paymentErrorUrl("InvalidBookingStatus");
      }

      const student = await paymentRepository.findStudentById(
        booking.studentId,
      );

      if (!student) {
        return this.paymentErrorUrl("StudentNotFound");
      }

      if (!booking.roomId) {
        return this.paymentErrorUrl("RoomNotFound");
      }

      if (!booking.configId) {
        return this.paymentErrorUrl("BookingConfigNotFound");
      }

      const amount = Number(booking.configId.roomPrice);

      if (!Number.isFinite(amount) || amount <= 0) {
        return this.paymentErrorUrl("InvalidBookingPrice");
      }

      const invoice = await this.createOrPayRoomFeeInvoice({
        booking,
        amount,
      });

      booking.status = "confirmed";
      await paymentRepository.saveBooking(booking);

      this.sendBookingSuccessMail({
        booking,
        student,
        room: booking.roomId,
        invoice,
      }).catch((error) => {
        console.error("SEND BOOKING MAIL ERROR:", error.message);
      });

      return this.bookingSuccessUrl(booking._id);
    } catch (error) {
      console.error("HANDLE BOOKING SUCCESS ERROR:", error);
      return this.paymentErrorUrl("BookingConfirmationFailed");
    }
  }

  async handleInvoiceSuccess(invoiceId) {
    const invoice = await paymentRepository.findInvoiceById(invoiceId);

    if (!invoice) {
      return this.paymentErrorUrl("InvoiceNotFound");
    }

    if (invoice.status !== "paid") {
      invoice.status = "paid";
      invoice.paidAt = new Date();
      await paymentRepository.saveInvoice(invoice);
    }

    if (invoice.type !== "room_fee" || !invoice.bookingId) {
      return `${process.env.CLIENT_URL}/student/payment-result?status=success&invoiceId=${invoice._id}`;
    }

    try {
      const booking = await paymentRepository.findBookingWithRoom(
        invoice.bookingId,
      );

      if (!booking) {
        return this.paymentErrorUrl("BookingNotFound");
      }

      if (booking.status === "pending") {
        booking.status = "confirmed";
        await paymentRepository.saveBooking(booking);

        const student = await paymentRepository.findStudentById(
          booking.studentId,
        );

        if (student && booking.roomId) {
          this.sendBookingSuccessMail({
            booking,
            student,
            room: booking.roomId,
            invoice,
          }).catch((error) => {
            console.error("SEND BOOKING MAIL ERROR:", error.message);
          });
        }
      }

      return this.bookingSuccessUrl(booking._id);
    } catch (error) {
      console.error(
        "HANDLE INVOICE SUCCESS FOR ROOM FEE ERROR:",
        error,
      );

      return this.paymentErrorUrl("BookingConfirmationFailed");
    }
  }

  async createOrPayRoomFeeInvoice({ booking, amount }) {
    let invoice =
      await paymentRepository.findRoomFeeInvoiceByBookingId(
        booking._id,
      );

    if (!invoice) {
      return paymentRepository.createInvoice({
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
        description:
          `Tiền phòng kỳ ${booking.semester} ` +
          `theo cấu hình ${booking.configId.name}`,
      });
    }

    if (invoice.status !== "paid") {
      invoice.amount = amount;
      invoice.status = "paid";
      invoice.paidAt = new Date();
      await paymentRepository.saveInvoice(invoice);
    }

    return invoice;
  }

  async sendBookingSuccessMail({
    booking,
    student,
    room,
    invoice,
  }) {
    if (!student?.email) {
      console.log(
        "Sinh viên không có email, bỏ qua gửi mail booking",
      );
      return;
    }

    const studentName =
      student.fullName || student.username || "sinh viên";

    const buildingName =
      room?.building?.name || "Chưa xác định";

    const roomName =
      room?.displayName ||
      room?.roomNumber ||
      "Chưa xác định";

    await sendMail({
      to: student.email,
      subject:
        "[FPT Dormitory] Thanh toán và xác nhận đặt phòng thành công",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;
          color: #111827; max-width: 680px; margin: 0 auto;">
          <h2 style="color: #16a34a;">
            Xác nhận đặt phòng thành công
          </h2>

          <p>Xin chào <b>${studentName}</b>,</p>

          <p>
            Hệ thống đã ghi nhận thanh toán thành công.
            Đơn đặt phòng của bạn đã được
            <b style="color: #16a34a;">xác nhận</b>.
          </p>

          <div style="background: #f8fafc; padding: 18px;
            border-radius: 12px; border: 1px solid #e2e8f0;
            margin: 18px 0;">
            <p><b>Mã booking:</b> ${booking._id}</p>
            <p>
              <b>Mã hóa đơn:</b>
              ${invoice?.invoiceCode || "Chưa xác định"}
            </p>
            <p>
              <b>Mã sinh viên:</b>
              ${student.studentCode || "Chưa cập nhật"}
            </p>
            <p>
              <b>Học kỳ:</b>
              ${booking.semester || "Chưa xác định"}
            </p>
            <p><b>Tòa:</b> ${buildingName}</p>
            <p><b>Phòng:</b> ${roomName}</p>
            <p><b>Giường:</b> Giường ${booking.bedNumber}</p>
            <p>
              <b>Thời gian ở:</b>
              ${formatDate(booking.startDate)}
              -
              ${formatDate(booking.endDate)}
            </p>
            <p>
              <b>Số tiền:</b>
              ${formatCurrency(invoice?.amount)}
            </p>
            <p>
              <b>Thanh toán lúc:</b>
              ${formatDateTime(invoice?.paidAt)}
            </p>
            <p>
              <b>Trạng thái booking:</b>
              <span style="color: #16a34a; font-weight: bold;">
                Đã xác nhận
              </span>
            </p>
          </div>

          <div style="background: #eff6ff; padding: 14px 16px;
            border-left: 4px solid #2563eb; border-radius: 8px;
            margin: 18px 0;">
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

    console.log(
      `Đã gửi email xác nhận booking đến ${student.email}`,
    );
  }

  bookingSuccessUrl(bookingId) {
    return `${process.env.CLIENT_URL}/student/booking-result?status=success&bookingId=${bookingId}`;
  }

  paymentErrorUrl(message) {
    return `${process.env.CLIENT_URL}/student/payment-result?status=error&message=${message}`;
  }
}

module.exports = new PaymentService();
