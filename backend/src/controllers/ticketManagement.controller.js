const ticketService = require("../services/ticket.service");

// Quản lý xem tất cả ticket
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    const formattedTickets = tickets.map((t) => {
      const ticketObj = t.toObject();
      // true if studentId exists (even if populate returned null because the student was deleted/not found)
      ticketObj.isStudentTicket = !!t.populated("studentId");
      return ticketObj;
    });
    res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu cầu thành công",
      data: formattedTickets,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi lấy danh sách yêu cầu",
      error: error.message,
    });
  }
};

// Duyệt ticket
exports.approveTicket = async (req, res) => {
  try {
    const ticket = await ticketService.approveTicket(req.params.ticketId, req.user._id);
    res.status(200).json({
      success: true,
      message: "Duyệt yêu cầu thành công",
      data: ticket,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi duyệt yêu cầu",
      error: error.message,
    });
  }
};

// Hủy / từ chối ticket có lý do
exports.rejectTicket = async (req, res) => {
  try {
    const ticket = await ticketService.rejectTicket(req.params.ticketId, req.body.rejectedReason);
    res.status(200).json({
      success: true,
      message: "Hủy yêu cầu thành công",
      data: ticket,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi hủy yêu cầu",
      error: error.message,
    });
  }
};

// Giao ticket cho staff
exports.assignTicket = async (req, res) => {
  try {
    const ticket = await ticketService.assignTicket(req.params.ticketId, req.body.staffId, req.user._id);
    res.status(200).json({
      success: true,
      message: "Giao việc thành công",
      data: ticket,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi giao việc",
      error: error.message,
    });
  }
};

// Lấy danh sách staff để giao việc
exports.getStaffList = async (req, res) => {
  try {
    const staffList = await ticketService.getStaffList();
    res.status(200).json({
      success: true,
      message: "Lấy danh sách nhân viên thành công",
      data: staffList,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.status ? error.message : "Lỗi khi lấy danh sách nhân viên",
      error: error.message,
    });
  }
};

// Duyệt báo cáo sự cố từ staff
exports.approveStaffDamageReport = async (req, res) => {
  try {
    const ticket = await ticketService.approveStaffDamageReport(
      req.params.ticketId,
      req.user._id
    );
    res.status(200).json({
      success: true,
      message: "Duyệt báo cáo và tạo phiếu sửa chữa thành công",
      data: ticket,
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi khi duyệt công việc",
      error: error.message,
    });
  }
};