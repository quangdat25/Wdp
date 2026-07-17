const express = require("express");

const systemConfigController = require("../controllers/systemConfig.controller");

const { authenticate, authorize } = require("../middleware/authUser");

const router = express.Router();

router.use(authenticate);

// Student hoặc các chức năng khác có thể đọc config active
router.get("/active", systemConfigController.getActiveConfig);

// Các API quản trị chỉ dành cho admin
router.get("/", authorize("admin"), systemConfigController.getAllConfigs);

router.get(
  "/:configId",
  authorize("admin"),
  systemConfigController.getConfigById,
);

router.post("/", authorize("admin"), systemConfigController.createConfig);

router.put(
  "/:configId",
  authorize("admin"),
  systemConfigController.updateConfig,
);

router.patch(
  "/:configId/activate",
  authorize("admin"),
  systemConfigController.activateConfig,
);

router.delete(
  "/:configId",
  authorize("admin"),
  systemConfigController.deleteConfig,
);

module.exports = router;
