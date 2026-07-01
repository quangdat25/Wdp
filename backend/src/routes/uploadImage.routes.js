const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const uploadImageController = require("../controllers/uploadImage.controller");
const { authenticate, authorize } = require("../middleware/authUser");

router.post("/", authenticate, authorize("student", "staff", "manager", "admin"), upload.single("image"), uploadImageController.upload);

module.exports = router;