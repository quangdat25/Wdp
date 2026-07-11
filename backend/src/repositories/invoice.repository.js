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
}

module.exports = new InvoiceRepository();
