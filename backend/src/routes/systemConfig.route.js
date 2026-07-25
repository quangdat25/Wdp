const express = require("express");

const systemConfigController = require("../controllers/systemConfig.controller");
const { authenticate, authorize } = require("../middleware/authUser");

const router = express.Router();


router.get("/active", systemConfigController.getActiveConfig);


router.get(
  "/",
  authenticate,
  authorize("admin"),
  systemConfigController.getAllConfigs,
);

router.get(
  "/:configId",
  authenticate,
  authorize("admin"),
  systemConfigController.getConfigById,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  systemConfigController.createConfig,
);

router.put(
  "/:configId",
  authenticate,
  authorize("admin"),
  systemConfigController.updateConfig,
);

router.patch(
  "/:configId/activate",
  authenticate,
  authorize("admin"),
  systemConfigController.activateConfig,
);

router.delete(
  "/:configId",
  authenticate,
  authorize("admin"),
  systemConfigController.deleteConfig,
);

module.exports = router;