const Violation = require("../models/violation.model");

class ViolationRepository {
  async create(data) {
    return await Violation.create(data);
  }

  async findWithDetails(query) {
    return await Violation.find(query)
      .populate("studentId", "fullName email studentCode room building")
      .populate("securityId", "fullName email")
      .populate("managerId", "fullName email")
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Violation.findById(id);
  }

  async save(violationDoc) {
    return await violationDoc.save();
  }
}

module.exports = new ViolationRepository();
