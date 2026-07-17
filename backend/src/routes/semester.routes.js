const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/semester.controller");
const { authenticate, authorize } = require("../middleware/authUser");

// All semester routes require admin access
router.use(authenticate, authorize("admin"));

router.post("/", semesterController.createSemester);
router.get("/", semesterController.getAllSemesters);
router.patch("/:id", semesterController.updateSemester);
router.patch("/:id/active", semesterController.setActiveSemester);
router.delete("/:id", semesterController.deleteSemester);

module.exports = router;
