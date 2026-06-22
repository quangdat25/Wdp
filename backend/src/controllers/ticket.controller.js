const ticketService = require("../services/ticket.service");

exports.createTicket = async (req, res) => {
  try {
    const ticket = await ticketService.createTicket(req.user._id, req.body);
    return res.status(201).json({
      success: true,
      message: "Gửi yêu cầu hỗ trợ thành công",
      data: ticket,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi gửi yêu cầu hỗ trợ",
      error: error.message,
    });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getMyTickets(req.user._id);
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu cầu hỗ trợ thành công",
      data: tickets,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi lấy danh sách yêu cầu hỗ trợ",
      error: error.message,
    });
  }
};

exports.deleteMyTicket = async (req, res) => {
  try {
    await ticketService.deleteMyTicket(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Xóa yêu cầu hỗ trợ thành công",
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi xóa yêu cầu hỗ trợ",
      error: error.message,
    });
  }
};