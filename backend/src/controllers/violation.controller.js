const Violation = require("../models/violation.model");
const Student = require("../models/student.model");
const Notification = require("../models/notification.model");
const { getIO } = require("../socket");

class ViolationController {
  // 1. Bảo vệ tạo biên bản lỗi
  async createViolation(req, res) {
    try {
      const { studentCode, studentName, location, reason } = req.body;
      const securityId = req.user.id;
      const securityBuilding = req.user.building || ""; // Tòa nhà của bảo vệ

      // Validate Sinh Viên
      const student = await Student.findOne({ studentCode });
      if (!student) {
        return res.status(404).json({ success: false, message: "Mã sinh viên không tồn tại trong hệ thống." });
      }

      // Validate Tên Khớp Mã
      if (student.fullName.trim().toLowerCase() !== studentName.trim().toLowerCase()) {
        return res.status(400).json({ 
          success: false, 
          message: `Tên sinh viên không khớp với mã số. Tên đúng trên hệ thống là: ${student.fullName}. Vui lòng kiểm tra lại!` 
        });
      }

      // Lưu biên bản (Lấy tòa nhà của bảo vệ làm gốc)
      const violation = await Violation.create({
        studentId: student._id,
        securityId,
        reason,
        location,
        building: securityBuilding,
        status: "PENDING",
      });

      return res.status(201).json({
        success: true,
        message: "Lập biên bản thành công, chờ Manager duyệt",
        data: violation,
      });
    } catch (error) {
      console.error("Create violation error:", error);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
  }

  // 2. Lấy danh sách vi phạm
  async getViolations(req, res) {
    try {
      const userRole = req.user.role;
      const userId = req.user.id;
      const userBuilding = req.user.building;
      let query = {};

      if (userRole === "student") {
        query.studentId = userId;
      } else if (userRole !== "admin") {
        // Manager hoặc Security: Chỉ thấy lỗi thuộc tòa nhà mình quản lý
        if (userBuilding) {
          query.building = userBuilding;
        }
      }

      const violations = await Violation.find(query)
        .populate("studentId", "fullName email studentCode room building")
        .populate("securityId", "fullName email")
        .populate("managerId", "fullName email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: violations,
      });
    } catch (error) {
      console.error("Get violations error:", error);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
  }

  // 3. Manager duyệt biên bản (Approve)
  async approveViolation(req, res) {
    try {
      const { id } = req.params;
      const { pointsDeducted } = req.body;
      const managerId = req.user.id;

      if (pointsDeducted === undefined || typeof pointsDeducted !== "number" || pointsDeducted <= 0) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập số điểm trừ lớn hơn 0" });
      }

      const violation = await Violation.findById(id);
      if (!violation) {
        return res.status(404).json({ success: false, message: "Không tìm thấy biên bản vi phạm" });
      }

      if (violation.status !== "PENDING") {
        return res.status(400).json({ success: false, message: "Biên bản này đã được xử lý" });
      }

      // Đổi trạng thái và cập nhật điểm trừ
      violation.status = "APPROVED";
      violation.managerId = managerId;
      violation.pointsDeducted = pointsDeducted;
      await violation.save();

      // Trừ điểm sinh viên
      const student = await Student.findById(violation.studentId);
      if (student) {
        student.CFDScore -= pointsDeducted;
        await student.save();
      }

      // Tạo Notification
      const notification = await Notification.create({
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

      return res.status(200).json({
        success: true,
        message: "Duyệt biên bản thành công, đã trừ điểm sinh viên",
        data: violation,
      });
    } catch (error) {
      console.error("Approve violation error:", error);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
  }

  // 4. Manager từ chối biên bản (Reject)
  async rejectViolation(req, res) {
    try {
      const { id } = req.params;
      const managerId = req.user.id;

      const violation = await Violation.findById(id);
      if (!violation) {
        return res.status(404).json({ success: false, message: "Không tìm thấy biên bản vi phạm" });
      }

      if (violation.status !== "PENDING") {
        return res.status(400).json({ success: false, message: "Biên bản này đã được xử lý" });
      }

      violation.status = "REJECTED";
      violation.managerId = managerId;
      await violation.save();

      return res.status(200).json({
        success: true,
        message: "Đã từ chối biên bản vi phạm",
        data: violation,
      });
    } catch (error) {
      console.error("Reject violation error:", error);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
  }
}

module.exports = new ViolationController();
