const SystemConfig = require("../models/systemConfig.model");
class SystemConfigRepository {
  async create(data) {
    return SystemConfig.create(data);
  }

  async findAll() {
    return SystemConfig.find()
      .populate("createdBy", "fullName email role")
      .populate("activatedBy", "fullName email role")
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return SystemConfig.findById(id)
      .populate("createdBy", "fullName email role")
      .populate("activatedBy", "fullName email role");
  }

  async findActive() {
    return SystemConfig.findOne({
      status: "active",
    })
      .populate("createdBy", "fullName email role")
      .populate("activatedBy", "fullName email role");
  }

  async deactivateAll() {
    return SystemConfig.updateMany(
      {
        status: "active",
      },
      {
        $set: {
          status: "inactive",
          activatedBy: null,
        },
      },
    );
  }

  async activateById(id, adminId) {
    return SystemConfig.findByIdAndUpdate(
      id,
      {
        $set: {
          status: "active",
          effectiveFrom: new Date(),
          activatedBy: adminId,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("createdBy", "fullName email role")
      .populate("activatedBy", "fullName email role");
  }

  async updateById(id, data) {
    return SystemConfig.findByIdAndUpdate(
      id,
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("createdBy", "fullName email role")
      .populate("activatedBy", "fullName email role");
  }

  async deleteById(id) {
    return SystemConfig.findByIdAndDelete(id);
  }
}

module.exports = new SystemConfigRepository();
