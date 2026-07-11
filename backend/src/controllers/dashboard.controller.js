const dashboardService = require("../services/dashboard.service");

class DashboardController {
  async getDashboard(req, res) {
    try {
      const data = await dashboardService.getDashboardData();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("DASHBOARD ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy dữ liệu dashboard",
        error: error.message,
      });
    }
  }
}

module.exports = new DashboardController();
