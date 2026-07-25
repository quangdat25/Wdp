const express = require("express");
const router = express.Router();

const {
  getAllPersonnel,
  getPersonnelById,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
} = require("../controllers/personnel.controller");

router.get("/", getAllPersonnel);
router.get("/:id", getPersonnelById);
router.post("/", createPersonnel);
router.put("/:id", updatePersonnel);
router.delete("/:id", deletePersonnel);

module.exports = router;