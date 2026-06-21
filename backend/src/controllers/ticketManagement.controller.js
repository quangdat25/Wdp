const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");
require("../models/student.model");

const sendMail = require("../config/mail");

const sendTicketMail = async ({ ticket, type }) => {
  try {
    const student = ticket.studentId;

    if (!student?.email) {
      console.log("Student không có email, bỏ qua gửi mail");
      return;
    }

    const studentName = student.fullName || student.username || "sinh viên";

    const isApproved = type === "approved";

    const subject = isApproved
      ? "[FPT Dormitory] Yêu cầu hỗ trợ đã được duyệt"
      : "[FPT Dormitory] Yêu cầu hỗ trợ đã bị từ chối";

    const statusText = isApproved ? "đã được duyệt" : "đã bị từ chối";

    const extraContent = isApproved
      ? `
        <p>
          Nhân viên sẽ được phân công xử lý yêu cầu của bạn trong thời gian sớm nhất.
        </p>
      `
      : `
        <p><b>Lý do từ chối:</b> ${ticket.rejectedReason || "Không có"}</p>
        <p>
          Nếu cần, bạn có thể tạo lại yêu cầu hỗ trợ mới với thông tin đầy đủ hơn.
        </p>
      `;

    await sendMail({
      to: student.email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="color: ${isApproved ? "#16a34a" : "#dc2626"};">
            Yêu cầu hỗ trợ ${statusText}
          </h2>

          <p>Xin chào <b>${studentName}</b>,</p>

          <p>Yêu cầu hỗ trợ của bạn ${statusText}.</p>

          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p><b>Tiêu đề:</b> ${ticket.title}</p>
            <p><b>Loại yêu cầu:</b> ${ticket.type}</p>
            <p><b>Tòa / Phòng:</b> ${ticket.buildingName} - ${ticket.roomNumber}</p>
            <p><b>Trạng thái:</b> ${isApproved ? "Đã duyệt" : "Từ chối"}</p>
            ${extraContent}
          </div>

          <p>Trân trọng,<br/>FPT Dormitory</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Send ticket mail error:", error.message);
  }
};

// Quản lý xem tất cả ticket
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("studentId", "fullName username studentCode phone email")
      .populate("approvedBy", "fullName username role")
      .populate("assignedTo", "fullName username role staffType")
      .populate("assignedBy", "fullName username role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu cầu thành công",
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách yêu cầu",
      error: error.message,
    });
  }
};

// Duyệt ticket
exports.approveTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId).populate(
      "studentId",
      "fullName username studentCode phone email"
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    if (ticket.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể duyệt yêu cầu đang chờ duyệt",
      });
    }

    ticket.status = "approved";
    ticket.approvedBy = req.user._id;
    ticket.approvedAt = new Date();
    ticket.rejectedReason = null;

    await ticket.save();

    await sendTicketMail({
      ticket,
      type: "approved",
    });

    res.status(200).json({
      success: true,
      message: "Duyệt yêu cầu thành công",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi duyệt yêu cầu",
      error: error.message,
    });
  }
};

// Hủy / từ chối ticket có lý do
exports.rejectTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { rejectedReason } = req.body;

    if (!rejectedReason || !rejectedReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do hủy yêu cầu",
      });
    }

    const ticket = await Ticket.findById(ticketId).populate(
      "studentId",
      "fullName username studentCode phone email"
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    if (ticket.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy yêu cầu đang chờ duyệt",
      });
    }

    ticket.status = "rejected";
    ticket.rejectedReason = rejectedReason.trim();

    await ticket.save();

    await sendTicketMail({
      ticket,
      type: "rejected",
    });

    res.status(200).json({
      success: true,
      message: "Hủy yêu cầu thành công",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi hủy yêu cầu",
      error: error.message,
    });
  }
};

// Giao ticket cho staff
exports.assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { staffId } = req.body;

    if (!staffId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn nhân viên xử lý",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    if (ticket.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể giao việc sau khi yêu cầu đã được duyệt",
      });
    }

    const staff = await User.findById(staffId);

    if (!staff || staff.role !== "staff") {
      return res.status(400).json({
        success: false,
        message: "Nhân viên không hợp lệ",
      });
    }

    ticket.status = "assigned";
    ticket.assignedTo = staffId;
    ticket.assignedBy = req.user._id;
    ticket.assignedAt = new Date();

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Giao việc thành công",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi giao việc",
      error: error.message,
    });
  }
};

// Lấy danh sách staff để giao việc
exports.getStaffList = async (req, res) => {
  try {
    const staffList = await User.find({ role: "staff" }).select(
      "fullName username phone email role staffType"
    );

    res.status(200).json({
      success: true,
      message: "Lấy danh sách nhân viên thành công",
      data: staffList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nhân viên",
      error: error.message,
    });
  }
};