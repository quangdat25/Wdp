const express = require("express");
const parentController = require("../controllers/parent.controller");
const { authenticate } = require("../middleware/authUser");

const router = express.Router();

router.get("/my-child-room", authenticate, parentController.getMyChildRoom);
router.get("/student-info", authenticate, parentController.getStudentInfo);

module.exports = router;
