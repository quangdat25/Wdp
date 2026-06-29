const ticketService = require("../services/ticket.service");
const Ticket = require("../models/ticket.model");

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
exports.getCurrentRoom = async (req, res) => {
  try {
    const data = await ticketService.getCurrentRoom(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin phòng hiện tại thành công",
      data,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.status
        ? error.message
        : "Lỗi khi lấy thông tin phòng hiện tại",
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
      message: error.status
        ? error.message
        : "Lỗi khi lấy danh sách yêu cầu hỗ trợ",
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

exports.getStaffTickets = async (req, res) => {
  try {
    const userId = req.user._id;

    const tickets = await Ticket.find({
      assignedTo: userId,
    })
      .populate("studentId", "fullName studentCode phone email")
      .populate("assignedBy", "fullName username role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách công việc của nhân viên thành công",
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách công việc",
      error: error.message,
    });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { status, resolution } = req.body;

    const validStatuses = ["assigned", "in_progress", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const updates = {};
    if (status) {
      updates.status = status;
      if (status === "in_progress") {
        updates.startedAt = new Date();
      } else if (status === "completed") {
        updates.completedAt = new Date();
      }
    }

    if (resolution !== undefined) {
      updates.resolution = resolution;
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, assignedTo: userId },
      { $set: updates },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc được giao hoặc không có quyền cập nhật",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái công việc thành công",
      data: ticket,
    });
  } catch (error) {
    console.error("Update ticket status error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật công việc",
      error: error.message,
    });
  }
};

exports.createStaffTicket = async (req, res) => {
  try {
    const { taskId, description, severity } = req.body;

    if (!taskId || !description) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc (taskId và mô tả hỏng hóc)",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      taskId,
      {
        $set: {
          damageReported: {
            ticketId: null,
            description: description.trim(),
            date: new Date().toLocaleString("vi-VN"),
            severity: severity || "MEDIUM",
          },
        },
      },
      { new: new Date() }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc dọn dẹp tương ứng",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tạo báo cáo hỏng hóc thành công",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo báo cáo hỏng hóc",
      error: error.message,
    });
  }
};
