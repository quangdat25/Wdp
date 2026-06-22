const Ticket = require("../models/ticket.model");
const User = require("../models/user.model");
const Student = require("../models/student.model");

class TicketRepository {
  async createTicket(data) {
    return await Ticket.create(data);
  }

  async findTicketsByStudentId(studentId) {
    return await Ticket.find({ studentId })
      .populate("approvedBy", "fullName username role")
      .populate("assignedTo", "fullName username role")
      .populate("assignedBy", "fullName username role")
      .sort({ createdAt: -1 });
  }

  async findTicketByIdAndStudent(id, studentId) {
    return await Ticket.findOne({ _id: id, studentId });
  }

  async deleteTicketById(id) {
    return await Ticket.findByIdAndDelete(id);
  }

  async findAllTickets() {
    return await Ticket.find()
      .populate("studentId", "fullName username studentCode phone email")
      .populate("approvedBy", "fullName username role")
      .populate("assignedTo", "fullName username role staffType")
      .populate("assignedBy", "fullName username role")
      .sort({ createdAt: -1 });
  }

  async findTicketByIdWithStudent(ticketId) {
    return await Ticket.findById(ticketId).populate(
      "studentId",
      "fullName username studentCode phone email"
    );
  }

  async findTicketById(ticketId) {
    return await Ticket.findById(ticketId);
  }

  async findStudentById(userId) {
    return await Student.findById(userId);
  }

  async findStaffById(staffId) {
    return await User.findById(staffId);
  }

  async getStaffList() {
    return await User.find({ role: "staff" }).select(
      "fullName username phone email role staffType"
    );
  }
}

module.exports = new TicketRepository();
