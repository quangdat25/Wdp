const express = require("express");
const router = express.Router();
const violationController = require("../controllers/violation.controller");
const { authenticate, authorize } = require("../middleware/authUser");
const { validateViolation } = require("../middleware/violation.validation");
const { asyncHandler } = require("../middleware/asyncHandler");

// 1. Tạo vi phạm (Chỉ Security)
router.post(
  "/create",
  authenticate,
  authorize("security"),
  validateViolation,
  asyncHandler(violationController.createViolation)
);

// 2. Lấy danh sách vi phạm (Ai cũng xem được)
router.get(
  "/",
  authenticate,
  asyncHandler(violationController.getViolations)
);

// 3. Duyệt vi phạm (Manager/Admin)
router.put(
  "/:id/approve",
  authenticate,
  authorize("manager", "admin"),
  asyncHandler(violationController.approveViolation)
);

// 4. Từ chối vi phạm (Manager/Admin)
router.put(
  "/:id/reject",
  authenticate,
  authorize("manager", "admin"),
  asyncHandler(violationController.rejectViolation)
);

// 5. Thu hồi vi phạm (Manager/Admin)
router.put(
  "/:id/revoke",
  authenticate,
  authorize("manager", "admin"),
  asyncHandler(violationController.revokeViolation)
);

module.exports = router;
