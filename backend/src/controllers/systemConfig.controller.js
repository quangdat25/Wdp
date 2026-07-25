const systemConfigService = require(
  "../services/systemConfig.service"
);

class SystemConfigController {
  async createConfig(req, res, next) {
    try {
      const config =
        await systemConfigService.createConfig(
          req.body,
          req.user._id
        );

      return res.status(201).json({
        success: true,
        message: "Tạo cấu hình thành công",
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllConfigs(req, res, next) {
    try {
      const configs =
        await systemConfigService.getAllConfigs();

      return res.status(200).json({
        success: true,
        total: configs.length,
        data: configs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConfigById(req, res, next) {
    try {
      const config =
        await systemConfigService.getConfigById(
          req.params.configId
        );

      return res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveConfig(req, res, next) {
    try {
      const config =
        await systemConfigService.getActiveConfig();

      return res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateConfig(req, res, next) {
    try {
      const config =
        await systemConfigService.updateConfig(
          req.params.configId,
          req.body
        );

      return res.status(200).json({
        success: true,
        message: "Cập nhật cấu hình thành công",
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  async activateConfig(req, res, next) {
    try {
      const config =
        await systemConfigService.activateConfig(
          req.params.configId,
          req.user._id
        );

      return res.status(200).json({
        success: true,
        message: "Kích hoạt cấu hình thành công",
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteConfig(req, res, next) {
    try {
      await systemConfigService.deleteConfig(
        req.params.configId
      );

      return res.status(200).json({
        success: true,
        message: "Xóa cấu hình thành công",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SystemConfigController();