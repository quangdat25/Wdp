const violationRepository = require("../repositories/violation.repository");
const studentRepository = require("../repositories/student.repository");
const notificationRepository = require("../repositories/notification.repository");
const { getIO } = require("../socket");

class ViolationService {
  async createViolation({ studentCode, studentName, location, reason, securityId, securityBuilding }) {
    const student = await studentRepository.findByCode(studentCode);
    if (!student) {
      throw { status: 404, message: "Mã sinh viên không tồn tại trong hệ thống." };
    }

    if (student.fullName.trim().toLowerCase() !== studentName.trim().toLowerCase()) {
      throw { 
        status: 400, 
        message: `Tên sinh viên không khớp với mã số. Tên đúng trên hệ thống là: ${student.fullName}. Vui lòng kiểm tra lại!` 
      };
    }

    const violation = await violationRepository.create({
      studentId: student._id,
      securityId,
      reason,
      location,
      building: securityBuilding || student.building || "Unknown",
      status: "PENDING",
    });

    // Lưu thông báo vào DB cho tất cả Manager
    const notification = await notificationRepository.create({
      title: "Cảnh báo: Có biên bản sự vụ mới",
      content: `Bảo vệ vừa lập biên bản vi phạm cho sinh viên ${studentName} (${studentCode}) tại ${location}. Lý do: ${reason}. Vui lòng kiểm tra và duyệt.`,
      targetType: "roles",
      targetRoles: ["manager"], // Gửi cho Role Manager
      targetUsers: [],
      senderId: securityId,
    });

    const io = getIO();
    if (io) {
      // Bắn sự kiện nạp lại bảng
      io.emit("new_violation_created", violation);
      
      // Bắn sự kiện "có thông báo mới" vào thẳng phòng của Manager
      io.to("role:manager").emit("new_notification", notification);
    }

    return violation;
  }

  async getViolations({ userRole, userId, userBuilding }) {
    let query = {};
    if (userRole === "student") {
      query.studentId = userId;
    } else if (userRole !== "admin") {
      // Manager hoặc Security: Chỉ thấy lỗi thuộc tòa nhà mình quản lý
      if (userBuilding) {
        query.building = userBuilding;
      }
    }
    return await violationRepository.findWithDetails(query);
  }

  async approveViolation({ id, pointsDeducted, managerId }) {
    if (pointsDeducted === undefined || typeof pointsDeducted !== "number" || pointsDeducted <= 0) {
      throw { status: 400, message: "Vui lòng nhập số điểm trừ lớn hơn 0" };
    }

    const violation = await violationRepository.findById(id);
    if (!violation) {
      throw { status: 404, message: "Không tìm thấy biên bản vi phạm" };
    }

    if (violation.status !== "PENDING") {
      throw { status: 400, message: "Biên bản này đã được xử lý" };
    }

    // Đổi trạng thái và cập nhật điểm trừ
    violation.status = "APPROVED";
    violation.managerId = managerId;
    violation.pointsDeducted = pointsDeducted;
    await violationRepository.save(violation);

    // Trừ điểm sinh viên
    const student = await studentRepository.findById(violation.studentId);
    if (student) {
      student.CFDScore -= pointsDeducted;
      await studentRepository.save(student);
    }

    // Tạo Notification
    const notification = await notificationRepository.create({
      title: "Thông báo trừ điểm Kỷ luật (CFD)",
      content: `Bạn bị trừ ${pointsDeducted} điểm CFD tại ${violation.location} - Tòa ${violation.building}. Lý do: ${violation.reason}. Điểm CFD hiện tại: ${student ? student.CFDScore : 'N/A'}`,
      targetType: "users",
      targetRoles: [],
      targetUsers: [violation.studentId],
      senderId: managerId,
    });

    // Bắn Socket
    const io = getIO();
    if (io) {
      io.to(`user:${violation.studentId.toString()}`).emit("new_notification", notification);
    }

    return violation;
  }

  async rejectViolation({ id, managerId }) {
    const violation = await violationRepository.findById(id);
    if (!violation) {
      throw { status: 404, message: "Không tìm thấy biên bản vi phạm" };
    }

    if (violation.status !== "PENDING") {
      throw { status: 400, message: "Biên bản này đã được xử lý" };
    }

    violation.status = "REJECTED";
    violation.managerId = managerId;
    await violationRepository.save(violation);

    return violation;
  }
}

module.exports = new ViolationService();
