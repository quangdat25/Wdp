const invoiceService = require("../services/invoice.service");

exports.getMyInvoices = async (req, res) => {
  try {
    const invoices = await invoiceService.getMyInvoices(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách hóa đơn thành công",
      data: invoices,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi lấy danh sách hóa đơn",
      error: error.message,
    });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await invoiceService.getAllInvoices(req.query);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách hóa đơn thành công",
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi lấy danh sách hóa đơn",
      error: error.message,
    });
  }
};