const express = require("express");
const router = express.Router();

const {
  getAllPersonnel,
  getPersonnelById,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
} = require("../controllers/personnel.controller");

const { authenticate, authorize } = require("../middleware/authUser");

router.get("/", authenticate, authorize("admin"), getAllPersonnel);
router.get("/:id", authenticate, authorize("admin"), getPersonnelById);
router.post("/", authenticate, authorize("admin"), createPersonnel);
router.put("/:id", authenticate, authorize("admin"), updatePersonnel);
router.delete("/:id", authenticate, authorize("admin"), deletePersonnel);

module.exports = router;