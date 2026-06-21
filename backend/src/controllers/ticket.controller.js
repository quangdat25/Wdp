const Ticket = require("../models/ticket.model");
const Student = require("../models/student.model");

exports.createTicket = async (req, res) => {
  try {
    const userId = req.user._id;

    const { buildingName, roomNumber, title, type, description, image } =
      req.body;

    if (!buildingName || !roomNumber || !title || !type || !description) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
      });
    }

    const student = await Student.findById(userId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    const ticket = await Ticket.create({
      studentId: student._id,
      buildingName,
      roomNumber,
      title,
      type,
      description,
      image: image || "",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Gửi yêu cầu hỗ trợ thành công",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi gửi yêu cầu hỗ trợ",
      error: error.message,
    });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user._id;

    const student = await Student.findById(userId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    const tickets = await Ticket.find({
      studentId: student._id,
    })
      .populate("approvedBy", "fullName username role")
      .populate("assignedTo", "fullName username role")
      .populate("assignedBy", "fullName username role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu cầu hỗ trợ thành công",
      data: tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách yêu cầu hỗ trợ",
      error: error.message,
    });
  }
};

exports.deleteMyTicket = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const ticket = await Ticket.findOne({
      _id: id,
      studentId: userId,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu hỗ trợ",
      });
    }

    if (!["pending", "rejected", "cancelled"].includes(ticket.status)) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể xóa yêu cầu đang chờ duyệt, đã từ chối hoặc đã hủy",
      });
    }

    await Ticket.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Xóa yêu cầu hỗ trợ thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa yêu cầu hỗ trợ",
      error: error.message,
    });
  }
};