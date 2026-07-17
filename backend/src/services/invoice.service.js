const invoiceRepository = require("../repositories/invoice.repository");

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

class InvoiceService {
  async getMyInvoices(userId) {
    if (!userId) {
      throw createError(401, "Bạn chưa đăng nhập");
    }

    return invoiceRepository.findInvoicesByStudentId(userId);
  }

  async getAllInvoices(query) {
    const filter = {};

    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.studentId) filter.studentId = query.studentId;
    if (query.bookingId) filter.bookingId = query.bookingId;

    return invoiceRepository.findAllInvoices(filter);
  }
}

module.exports = new InvoiceService();