const violationService = require("../services/violation.service");

class ViolationController {
  // 1. Bảo vệ tạo biên bản lỗi
  async createViolation(req, res) {
    try {
      const { studentCode, studentName, location, reason } = req.body;
      const securityId = req.user.id;
      const securityBuildingId = req.user.buildingId || null; // ObjectId của tòa nhà bảo vệ

      const violation = await violationService.createViolation({
        studentCode, 
        studentName, 
        location, 
        reason, 
        securityId, 
        securityBuildingId
      });

      return res.status(201).json({
        success: true,
        message: "Lập biên bản thành công, chờ Manager duyệt",
        data: violation,
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      console.error("Create violation error:", error);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
  }

  // 2. Lấy danh sách vi phạm
  async getViolations(req, res) {
    try {
      const { role: userRole, id: userId, buildingId: userBuildingId } = req.user;
      
      const violations = await violationService.getViolations({ userRole, userId, userBuildingId });

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

      const violation = await violationService.approveViolation({ id, pointsDeducted, managerId });

      return res.status(200).json({
        success: true,
        message: "Duyệt biên bản thành công, đã trừ điểm sinh viên",
        data: violation,
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      console.error("Approve violation error:", error);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
  }

  // 4. Manager từ chối biên bản (Reject)
  async rejectViolation(req, res) {
    try {
      const { id } = req.params;
      const managerId = req.user.id;

      const violation = await violationService.rejectViolation({ id, managerId });

      return res.status(200).json({
        success: true,
        message: "Đã từ chối biên bản vi phạm",
        data: violation,
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      console.error("Reject violation error:", error);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
  }

  // 5. Manager thu hồi biên bản (Revoke)
  async revokeViolation(req, res) {
    try {
      const { id } = req.params;
      const { revokeReason } = req.body;
      const managerId = req.user.id;

      const violation = await violationService.revokeViolation({ id, managerId, revokeReason });

      return res.status(200).json({
        success: true,
        message: "Đã thu hồi biên bản và hoàn lại điểm",
        data: violation,
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ success: false, message: error.message });
      }
      console.error("Revoke violation error:", error);
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    }
  }
}

module.exports = new ViolationController();
