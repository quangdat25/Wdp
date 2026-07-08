const ticketRepository = require("../repositories/ticket.repository");
const sendMail = require("../config/mail");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

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

class TicketService {
  async createTicket(userId, data) {
    const { title, type, description, image } = data;

    if (!title || !type || !description) {
      throw createError(400, "Vui lòng nhập đầy đủ thông tin bắt buộc");
    }

    const student = await ticketRepository.findStudentById(userId);

    if (!student) {
      throw createError(404, "Không tìm thấy thông tin sinh viên");
    }

    const currentBooking = await ticketRepository.findCurrentBookingByStudentId(
      student._id,
    );

    if (!currentBooking) {
      throw createError(
        403,
        "Chỉ sinh viên đang ở ký túc xá mới được gửi yêu cầu hỗ trợ",
      );
    }

    const room = currentBooking.roomId;

    if (!room) {
      throw createError(404, "Không tìm thấy thông tin phòng hiện tại");
    }

    const building = room.building;

    if (!building) {
      throw createError(404, "Không tìm thấy thông tin tòa nhà hiện tại");
    }

    const ticket = await ticketRepository.createTicket({
      studentId: student._id,
      buildingName:
        building.name || building.buildingName || building.displayName,
      roomNumber: room.roomNumber,
      title,
      type,
      description,
      image: image || "",
      status: "pending",
    });

    return ticket;
  }
  async getCurrentRoom(userId) {
    const student = await ticketRepository.findStudentById(userId);

    if (!student) {
      throw createError(404, "Không tìm thấy thông tin sinh viên");
    }

    const currentBooking = await ticketRepository.findCurrentBookingByStudentId(
      student._id,
    );

    if (!currentBooking) {
      throw createError(
        403,
        "Bạn chưa ở ký túc xá nên không thể gửi yêu cầu hỗ trợ",
      );
    }

    const room = currentBooking.roomId;
    const building = room?.building;

    return {
      buildingName: building?.name || "",
      roomNumber: room?.roomNumber || "",
    };
  }
  async getMyTickets(userId) {
    const student = await ticketRepository.findStudentById(userId);
    if (!student) {
      throw createError(404, "Không tìm thấy thông tin sinh viên");
    }

    const tickets = await ticketRepository.findTicketsByStudentId(student._id);
    return tickets;
  }

  async deleteMyTicket(userId, ticketId) {
    const ticket = await ticketRepository.findTicketByIdAndStudent(
      ticketId,
      userId,
    );

    if (!ticket) {
      throw createError(404, "Không tìm thấy yêu cầu hỗ trợ");
    }

    if (!["pending", "rejected", "cancelled"].includes(ticket.status)) {
      throw createError(
        400,
        "Chỉ có thể xóa yêu cầu đang chờ duyệt, đã từ chối hoặc đã hủy",
      );
    }

    await ticketRepository.deleteTicketById(ticketId);
  }

  async getAllTickets() {
    return await ticketRepository.findAllTickets();
  }

  async approveTicket(ticketId, userId) {
    const ticket = await ticketRepository.findTicketByIdWithStudent(ticketId);

    if (!ticket) {
      throw createError(404, "Không tìm thấy yêu cầu");
    }

    if (ticket.status !== "pending") {
      throw createError(400, "Chỉ có thể duyệt yêu cầu đang chờ duyệt");
    }

    ticket.status = "approved";
    ticket.approvedBy = userId;
    ticket.approvedAt = new Date();
    ticket.rejectedReason = null;

    await ticket.save();

    await sendTicketMail({
      ticket,
      type: "approved",
    });

    return ticket;
  }

  async rejectTicket(ticketId, rejectedReason) {
    if (!rejectedReason || !rejectedReason.trim()) {
      throw createError(400, "Vui lòng nhập lý do hủy yêu cầu");
    }

    const ticket = await ticketRepository.findTicketByIdWithStudent(ticketId);

    if (!ticket) {
      throw createError(404, "Không tìm thấy yêu cầu");
    }

    if (ticket.status !== "pending") {
      throw createError(400, "Chỉ có thể hủy yêu cầu đang chờ duyệt");
    }

    ticket.status = "rejected";
    ticket.rejectedReason = rejectedReason.trim();

    await ticket.save();

    await sendTicketMail({
      ticket,
      type: "rejected",
    });

    return ticket;
  }

  async assignTicket(ticketId, staffId, assignerId) {
    if (!staffId) {
      throw createError(400, "Vui lòng chọn nhân viên xử lý");
    }

    const ticket = await ticketRepository.findTicketById(ticketId);

    if (!ticket) {
      throw createError(404, "Không tìm thấy yêu cầu");
    }

    if (ticket.status !== "approved") {
      throw createError(
        400,
        "Chỉ có thể giao việc sau khi yêu cầu đã được duyệt",
      );
    }

    const staff = await ticketRepository.findStaffById(staffId);

    if (!staff || staff.role !== "staff") {
      throw createError(400, "Nhân viên không hợp lệ");
    }

    ticket.status = "assigned";
    ticket.assignedTo = staffId;
    ticket.assignedBy = assignerId;
    ticket.assignedAt = new Date();

    await ticket.save();

    return ticket;
  }

  async getStaffList() {
    return await ticketRepository.getStaffList();
  }
}

module.exports = new TicketService();
