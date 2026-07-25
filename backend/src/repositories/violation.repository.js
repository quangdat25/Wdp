const Violation = require("../models/violation.model");

class ViolationRepository {
  async create(data) {
    return await Violation.create(data);
  }

  async findWithDetails(query) {
    return await Violation.find(query)
      .populate({
        path: "studentId",
        select: "fullName email studentCode roomId buildingId",
        populate: [
          { path: "buildingId", select: "name" },
          { path: "roomId", select: "roomNumber" }
        ]
      })
      .populate("buildingId", "name")
      .populate("securityId", "fullName email")
      .populate("managerId", "fullName email")
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Violation.findById(id).populate("buildingId", "name");
  }

  async save(violationDoc) {
    return await violationDoc.save();
  }
}

module.exports = new ViolationRepository();
