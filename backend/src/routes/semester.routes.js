const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semester.controller");
const { authenticate, authorize } = require("../middleware/authUser");
const { asyncHandler } = require("../middleware/asyncHandler");

// Get current semester
router.get("/current", authenticate, asyncHandler(semesterController.getCurrentSemester));

// Get next semester
router.get("/next", authenticate, asyncHandler(semesterController.getNextSemester));

// Get all semesters (Admin only)
router.get("/", authenticate, authorize("admin"), asyncHandler(semesterController.getAllSemesters));

// // Create a new semester (Admin only)

router.post("/", authenticate, authorize("admin"), asyncHandler(semesterController.createSemester));

// Update a semester (Admin only)
router.put("/:id", authenticate, authorize("admin"), asyncHandler(semesterController.updateSemester));

// Soft delete a semester (Admin only)
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(semesterController.deleteSemester));

module.exports = router;
