const utilityUsageService = require("../services/utilityUsage.service");

exports.importUtilityExcel = async (req, res) => {
  try {
    const result = await utilityUsageService.importUtilityExcel(
      req.file,
      req.user?._id,
    );

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.log("IMPORT UTILITY EXCEL ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi import tiền điện nước",
      error: error.message,
    });
  }
};

exports.getAllUtilityUsages = async (req, res) => {
  try {
    const records = await utilityUsageService.getAllUtilityUsages(req.query);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tiền điện nước thành công",
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.log("GET UTILITY USAGES ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status
        ? error.message
        : "Lỗi khi lấy danh sách tiền điện nước",
      error: error.message,
    });
  }
};
exports.getMyUtility = async (req, res) => {
  try {
    const studentId = req.user?._id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Không xác định được sinh viên",
      });
    }

    const records = await utilityUsageService.getUtilityByStudentId(studentId);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tiền điện nước của sinh viên thành công",
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.log("GET UTILITY BY STUDENT ID ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status
        ? error.message
        : "Lỗi khi lấy danh sách tiền điện nước của sinh viên",
      error: error.message,
    });
  }
};
exports.getUtilityByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID sinh viên",
      });
    }

    const records = await utilityUsageService.getUtilityByStudentId(studentId);

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết điện nước của sinh viên thành công",
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.log("GET UTILITY BY STUDENT ID ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status
        ? error.message
        : "Lỗi khi lấy chi tiết điện nước của sinh viên",
      error: error.message,
    });
  }
};

exports.deleteUtilityUsage = async (req, res) => {
  try {
    const record = await utilityUsageService.deleteUtilityUsage(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Xóa bản ghi điện nước thành công",
      data: record,
    });
  } catch (error) {
    console.log("DELETE UTILITY USAGE ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi xóa bản ghi điện nước",
      error: error.message,
    });
  }
};

exports.createUtilityInvoices = async (req, res) => {
  try {
    const result = await utilityUsageService.createUtilityInvoices(req.body);

    return res.status(201).json({
      success: true,
      message: "Tạo hóa đơn điện nước thành công",
      data: result,
    });
  } catch (error) {
    console.log("CREATE UTILITY INVOICES ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi tạo hóa đơn điện nước",
      error: error.message,
    });
  }
};
