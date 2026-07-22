const cron = require("node-cron");
const invoiceRepository = require("../repositories/invoice.repository");
const sendMail = require("../config/mail");

const TIMEZONE = "Asia/Ho_Chi_Minh";
const REMINDER_DAYS = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const getVNDateString = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const getVNStartOfDay = (date) => {
  return new Date(`${getVNDateString(date)}T00:00:00+07:00`);
};

const formatDateVN = (date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

const formatMoney = (amount) => {
  return Number(amount || 0).toLocaleString("vi-VN");
};

const getRemainingDays = (dueDate, currentDate = new Date()) => {
  const today = getVNStartOfDay(currentDate);
  const dueDay = getVNStartOfDay(dueDate);

  return Math.round(
    (dueDay.getTime() - today.getTime()) / ONE_DAY_MS,
  );
};

const getStudentName = (invoice) => {
  return invoice.studentId?.fullName || "Sinh viên";
};

const getRoomName = (invoice) => {
  return invoice.bookingId?.roomId?.displayName || "Chưa xác định";
};

const getInvoiceTypeLabel = (type) => {
  const labels = {
    room_fee: "Phí phòng",
    utility: "Phí điện nước",
  };

  return labels[type] || "Hóa đơn ký túc xá";
};

const sendUpcomingPaymentReminder = async (
  invoice,
  remainingDays,
) => {
  const student = invoice.studentId;

  if (!student?.email) {
    return;
  }

  const dueMessage =
    remainingDays === 0
      ? "Hóa đơn của bạn đến hạn thanh toán hôm nay."
      : `Hóa đơn của bạn sẽ đến hạn thanh toán sau ${remainingDays} ngày.`;

  await sendMail({
    to: student.email,
    subject:
      remainingDays === 0
        ? `[FPT Dormitory] Hóa đơn ${invoice.invoiceCode} đến hạn hôm nay`
        : `[FPT Dormitory] Hóa đơn ${invoice.invoiceCode} còn ${remainingDays} ngày đến hạn`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="color: #2563eb;">
          Nhắc thanh toán hóa đơn
        </h2>

        <p>Xin chào <b>${getStudentName(invoice)}</b>,</p>

        <p>${dueMessage}</p>

        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0;">
          <p><b>Mã hóa đơn:</b> ${invoice.invoiceCode}</p>
          <p><b>Loại hóa đơn:</b> ${getInvoiceTypeLabel(invoice.type)}</p>
          <p><b>Phòng:</b> ${getRoomName(invoice)}</p>
          <p><b>Số tiền:</b> ${formatMoney(invoice.amount)} VNĐ</p>
          <p><b>Hạn thanh toán:</b> ${formatDateVN(invoice.dueDate)}</p>
          <p><b>Trạng thái:</b> Chưa thanh toán</p>
        </div>

        <p>
          Vui lòng thanh toán trước hạn để tránh phát sinh vấn đề trong quá trình ở ký túc xá.
        </p>

        <p>Trân trọng,<br/>FPT Dormitory</p>
      </div>
    `,
  });
};

const sendOverduePaymentReminder = async (
  invoice,
  overdueDays,
) => {
  const student = invoice.studentId;

  if (!student?.email) {
    return;
  }

  await sendMail({
    to: student.email,
    subject: `[FPT Dormitory] Hóa đơn ${invoice.invoiceCode} đã quá hạn ${overdueDays} ngày`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="color: #dc2626;">
          Thông báo quá hạn thanh toán
        </h2>

        <p>Xin chào <b>${getStudentName(invoice)}</b>,</p>

        <p>
          Hóa đơn của bạn đã
          <b style="color: #dc2626;">quá hạn ${overdueDays} ngày</b>
          nhưng hệ thống vẫn chưa ghi nhận thanh toán.
        </p>

        <div style="background: #fef2f2; padding: 16px; border-radius: 12px; margin: 16px 0;">
          <p><b>Mã hóa đơn:</b> ${invoice.invoiceCode}</p>
          <p><b>Loại hóa đơn:</b> ${getInvoiceTypeLabel(invoice.type)}</p>
          <p><b>Phòng:</b> ${getRoomName(invoice)}</p>
          <p><b>Số tiền:</b> ${formatMoney(invoice.amount)} VNĐ</p>
          <p><b>Hạn thanh toán:</b> ${formatDateVN(invoice.dueDate)}</p>
          <p><b>Trạng thái:</b> Quá hạn thanh toán</p>
        </div>

        <p>
          Vui lòng thanh toán trong thời gian sớm nhất hoặc liên hệ Ban quản lý ký túc xá để được hỗ trợ.
        </p>

        <p>Trân trọng,<br/>FPT Dormitory</p>
      </div>
    `,
  });
};

const paymentReminderJob = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        const now = new Date();
        const startOfToday = getVNStartOfDay(now);

        const reminderEndDate = new Date(startOfToday);
        reminderEndDate.setDate(
          reminderEndDate.getDate() + REMINDER_DAYS + 1,
        );

        const [upcomingInvoices, overdueInvoices] =
          await Promise.all([
            invoiceRepository.findUpcomingDueInvoices(
              startOfToday,
              reminderEndDate,
            ),
            invoiceRepository.findOverdueInvoices(startOfToday),
          ]);

        for (const invoice of upcomingInvoices) {
          const remainingDays = getRemainingDays(
            invoice.dueDate,
            now,
          );

          await sendUpcomingPaymentReminder(
            invoice,
            remainingDays,
          );
        }

        for (const invoice of overdueInvoices) {
          const overdueDays = Math.abs(
            getRemainingDays(invoice.dueDate, now),
          );

          await sendOverduePaymentReminder(
            invoice,
            overdueDays,
          );
        }
      } catch (error) {
        console.error(
          "Payment reminder job error:",
          error,
        );
      }
    },
    {
      timezone: TIMEZONE,
    },
  );
};

module.exports = paymentReminderJob;