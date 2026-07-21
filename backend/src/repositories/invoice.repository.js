const Invoice = require("../models/invoice.model");

class InvoiceRepository {
  async findInvoicesByStudentId(studentId) {
    return Invoice.find({ studentId })
      .populate("bookingId")
      .sort({ createdAt: -1 });
  }
  async findAllInvoices(filter = {}) {
    return Invoice.find(filter)
      .populate("studentId", "fullName username studentCode email phone")
      .populate({
        path: "bookingId",
        populate: {
          path: "roomId",
          populate: {
            path: "building",
          },
        },
      })
      .sort({ createdAt: -1 });
  }

  async findUpcomingDueInvoices(startDate, endDate) {
    return Invoice.find({
      status: "unpaid",
      dueDate: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate("studentId", "fullName email studentCode")
      .populate({
        path: "bookingId",
        select: "roomId semester bedNumber",
        populate: {
          path: "roomId",
          select: "displayName",
        },
      });
  }

  async findOverdueInvoices(currentDate) {
    return Invoice.find({
      status: "unpaid",
      dueDate: {
        $lt: currentDate,
      },
    })
      .populate("studentId", "fullName email studentCode")
      .populate({
        path: "bookingId",
        populate: {
          path: "roomId",
          select: "displayName",
        },
      });
  }
}

module.exports = new InvoiceRepository();
