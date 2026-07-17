const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const uploadImageController = require("../controllers/uploadImage.controller");

router.post("/", upload.single("image"), uploadImageController.upload);

module.exports = router;