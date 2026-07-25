const mongoose = require("mongoose");

const systemConfigRepository = require("../repositories/systemConfig.repository");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizePrice = (value, fieldName) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    throw createError(400, `${fieldName} phải là số lớn hơn hoặc bằng 0`);
  }

  return number;
};

class SystemConfigService {
  async createConfig(data, adminId) {
    const name = String(data.name || "").trim();

    if (!name) {
      throw createError(400, "Vui lòng nhập tên cấu hình");
    }

    const configData = {
      name,
      roomPrice: normalizePrice(data.roomPrice, "Giá phòng"),
      electricityPrice: normalizePrice(data.electricityPrice, "Giá điện"),
      waterPrice: normalizePrice(data.waterPrice, "Giá nước"),

      // Config mới không tự động active
      status: "inactive",

      createdBy: adminId,
    };

    return systemConfigRepository.create(configData);
  }

  async getAllConfigs() {
    return systemConfigRepository.findAll();
  }

  async getConfigById(configId) {
    if (!mongoose.Types.ObjectId.isValid(configId)) {
      throw createError(400, "ID cấu hình không hợp lệ");
    }

    const config = await systemConfigRepository.findById(configId);

    if (!config) {
      throw createError(404, "Không tìm thấy cấu hình");
    }

    return config;
  }

  async getActiveConfig() {
    const config = await systemConfigRepository.findActive();

    if (!config) {
      throw createError(404, "Hệ thống chưa có cấu hình đang hoạt động");
    }

    return config;
  }

  async updateConfig(configId, data) {
    const config = await this.getConfigById(configId);

    if (config.status === "active") {
      throw createError(
        400,
        "Không thể sửa cấu hình đang hoạt động. Hãy tạo cấu hình mới",
      );
    }

    const updateData = {};

    if (data.name !== undefined) {
      const name = String(data.name).trim();

      if (!name) {
        throw createError(400, "Tên cấu hình không được để trống");
      }

      updateData.name = name;
    }

    if (data.roomPrice !== undefined) {
      updateData.roomPrice = normalizePrice(data.roomPrice, "Giá phòng");
    }

    if (data.electricityPrice !== undefined) {
      updateData.electricityPrice = normalizePrice(
        data.electricityPrice,
        "Giá điện",
      );
    }

    if (data.waterPrice !== undefined) {
      updateData.waterPrice = normalizePrice(data.waterPrice, "Giá nước");
    }

    if (Object.keys(updateData).length === 0) {
      throw createError(400, "Không có dữ liệu cấu hình cần cập nhật");
    }

    return systemConfigRepository.updateById(configId, updateData);
  }

  async activateConfig(configId, adminId) {
    const config = await systemConfigRepository.findById(configId);

    if (!config) {
      throw createError(404, "Không tìm thấy cấu hình");
    }

    if (config.status === "active") {
      throw createError(400, "Cấu hình này đang hoạt động");
    }

    await systemConfigRepository.deactivateAll();

    return systemConfigRepository.activateById(configId, adminId);
  }

  async deleteConfig(configId) {
    const config = await this.getConfigById(configId);

    if (config.status === "active") {
      throw createError(400, "Không thể xóa cấu hình đang hoạt động");
    }

    await systemConfigRepository.deleteById(configId);

    return config;
  }
}

module.exports = new SystemConfigService();
