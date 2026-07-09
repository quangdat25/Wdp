const path = require("path");
const sendMail = require("../config/mail");

const formatCurrency = (amount) => {
  return amount ? amount.toLocaleString("vi-VN") + " VNĐ" : "0 VNĐ";
};

const sendInvoiceMail = async ({ invoice, user, room }) => {
  try {
    if (!user?.email) {
      console.log("Sinh viên không có email, bỏ qua gửi mail thông báo hóa đơn");
      return;
    }

    const isRoomFee = invoice.type === "room_fee";
    const invoiceTitle = isRoomFee ? "Hóa đơn Tiền phòng" : "Hóa đơn Điện nước";
    const subject = `[FPT Dormitory] Xác nhận thanh toán - ${invoiceTitle}`;
    const studentName = user.fullName || user.username || "Sinh viên";
    const roomName = room ? (room.displayName || room.roomNumber) : "N/A";
    const billingPeriod = invoice.billingMonth 
      ? `Tháng ${invoice.billingMonth} - Kỳ ${invoice.semester}`
      : `Kỳ ${invoice.semester}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #fcfcfc;">
        <div style="background-color: #f36f21; padding: 20px; text-align: center;">
          <img src="cid:logo" alt="FPT Dormitory Logo" style="max-height: 60px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.2));" />
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #333333; margin-top: 0;">Xác nhận thanh toán thành công</h2>
          <p style="color: #555555; line-height: 1.6;">
            Chào bạn <strong>${studentName}</strong>,
          </p>
          <p style="color: #555555; line-height: 1.6;">
            FPT Dormitory xin thông báo: Hóa đơn <strong>${invoiceTitle}</strong> của bạn đã được thanh toán thành công. Dưới đây là thông tin chi tiết:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
            <tbody>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #777;">Mã hóa đơn:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333; font-weight: bold; text-align: right;">${invoice.invoiceCode}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #777;">Phòng:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333; font-weight: bold; text-align: right;">${roomName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #777;">Kỳ hóa đơn:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333; font-weight: bold; text-align: right;">${billingPeriod}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #777;">Trạng thái:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #28a745; font-weight: bold; text-align: right;">ĐÃ THANH TOÁN (PAID)</td>
              </tr>
              <tr>
                <td style="padding: 15px 10px; background-color: #f9f9f9; color: #333; font-weight: bold; font-size: 16px;">Tổng tiền:</td>
                <td style="padding: 15px 10px; background-color: #f9f9f9; color: #e53935; font-weight: bold; font-size: 16px; text-align: right;">${formatCurrency(invoice.amount)}</td>
              </tr>
            </tbody>
          </table>

          <p style="color: #555555; line-height: 1.6; font-size: 14px;">
            Cảm ơn bạn đã hoàn thành nghĩa vụ thanh toán đúng hạn. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ Ban quản lý Ký túc xá hoặc tạo Ticket hỗ trợ trên hệ thống.
          </p>
          <br/>
          <p style="color: #777777; margin-bottom: 0; font-size: 13px;">
            Trân trọng,<br/>
            <strong>Ban Quản lý Ký túc xá FPT</strong>
          </p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #999999; font-size: 12px;">
          Đây là email tự động từ hệ thống. Vui lòng không trả lời email này.
        </div>
      </div>
    `;

    const mailOptions = {
      to: user.email,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../assets/logo.png"),
          cid: "logo" // same cid value as in the html img src
        }
      ]
    };

    // Override the generic sendMail to use attachments
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM || "FPT Dormitory"}" <${process.env.EMAIL_USER}>`,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      attachments: mailOptions.attachments
    });

    console.log(`Đã gửi email thông báo hóa đơn thành công tới ${user.email}`);
  } catch (error) {
    console.error("Lỗi khi gửi email thông báo hóa đơn:", error.message);
  }
};

module.exports = {
  sendInvoiceMail,
};
