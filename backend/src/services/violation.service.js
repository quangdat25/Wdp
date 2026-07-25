const violationRepository = require("../repositories/violation.repository");
const studentRepository = require("../repositories/student.repository");
const notificationRepository = require("../repositories/notification.repository");
const { getIO } = require("../socket");
const Building = require("../models/building.model");

class ViolationService {
  async createViolation({ studentCode, studentName, location, reason, securityId, securityBuildingId }) {
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
      buildingId: securityBuildingId,
      status: "PENDING",
    });

    let buildingName = "N/A";
    if (securityBuildingId) {
      const building = await Building.findById(securityBuildingId);
      if (building) buildingName = building.name;
    }

    // Lưu thông báo vào DB cho tất cả Manager
    const notification = await notificationRepository.create({
      title: "Cảnh báo: Có biên bản sự vụ mới",
      content: `Bảo vệ vừa lập biên bản vi phạm cho sinh viên ${studentName} (${studentCode}) tại ${location} - Tòa ${buildingName}. Lý do: ${reason}. Vui lòng kiểm tra và duyệt.`,
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

  async getViolations({ userRole, userId, userBuildingId }) {
    let query = {};
    if (userRole === "student" || userRole === "parent") {
      query.studentId = userId;
    } else if (userRole !== "admin") {
      if (userBuildingId) {
        query.buildingId = userBuildingId;
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

    const buildingName = violation.buildingId?.name || "N/A";
    // Tạo Notification
    const notification = await notificationRepository.create({
      title: "Thông báo trừ điểm Kỷ luật (CFD)",
      content: `Bạn bị trừ ${pointsDeducted} điểm CFD tại ${violation.location} - Tòa ${buildingName}. Lý do: ${violation.reason}. Điểm CFD hiện tại: ${student ? student.CFDScore : 'N/A'}`,
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

  async revokeViolation({ id, managerId, revokeReason }) {
    if (!revokeReason || typeof revokeReason !== "string" || revokeReason.trim() === "") {
      throw { status: 400, message: "Vui lòng nhập lý do thu hồi biên bản" };
    }

    const violation = await violationRepository.findById(id);
    if (!violation) {
      throw { status: 404, message: "Không tìm thấy biên bản vi phạm" };
    }

    if (violation.status !== "APPROVED") {
      throw { status: 400, message: "Chỉ có thể thu hồi biên bản đã được duyệt" };
    }

    // Đổi trạng thái và cập nhật lý do
    violation.status = "REVOKED";
    violation.revokeReason = revokeReason;
    const pointsToRestore = violation.pointsDeducted || 0;
    
    // Cộng lại điểm cho sinh viên
    const student = await studentRepository.findById(violation.studentId);
    if (student && pointsToRestore > 0) {
      student.CFDScore += pointsToRestore;
      await studentRepository.save(student);
    }
    
    // Save violation
    await violationRepository.save(violation);

    const buildingName = violation.buildingId?.name || "N/A";
    
    // Tạo Notification
    const notification = await notificationRepository.create({
      title: "Thông báo thu hồi biên bản vi phạm",
      content: `Biên bản vi phạm tại ${violation.location} - Tòa ${buildingName} đã được thu hồi. Lý do: ${revokeReason}. Bạn được hoàn lại ${pointsToRestore} điểm CFD. Điểm CFD hiện tại: ${student ? student.CFDScore : 'N/A'}`,
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
}

module.exports = new ViolationService();
