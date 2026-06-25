const express = require("express");
const parentController = require("../controllers/parent.controller");
const { authenticate, authorize } = require("../middleware/authUser");

const router = express.Router();

router.get("/my-child-room", authenticate, authorize("parent"), parentController.getMyChildRoom);
router.get("/student-info", authenticate, authorize("parent"), parentController.getStudentInfo);

module.exports = router;
