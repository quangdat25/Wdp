const express = require("express");
const parentController = require("../controllers/parent.controller");
const { authUser } = require("../middleware/authUser");

const router = express.Router();

router.get("/my-child-room", authUser, parentController.getMyChildRoom);
router.get("/student-info", authUser, parentController.getStudentInfo);

module.exports = router;
