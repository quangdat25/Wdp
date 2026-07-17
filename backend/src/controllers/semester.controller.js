const semesterService = require("../services/semester.service");

const semesterController = {
  getAllSemesters: async (req, res) => {
    const semesters = await semesterService.getAllSemesters();
    res.status(200).json(semesters);
  },

  getCurrentSemester: async (req, res) => {
    const currentSemester = await semesterService.getCurrentSemester();
    console.log("DEBUG currentSemester:", currentSemester);
    res.status(200).json(currentSemester);
  },

  getNextSemester: async (req, res) => {
    const nextSemester = await semesterService.getNextSemester();
    res.status(200).json(nextSemester);
  },

  createSemester: async (req, res) => {
    const semester = await semesterService.createSemester(req.body);

    res.status(201).json({
      message: "Tạo năm học thành công",
      semester,
    });
  },

  updateSemester: async (req, res) => {
    const { id } = req.params;

    const semester = await semesterService.updateSemester(id, req.body);

    res.status(200).json({
      message: "Cập nhật kỳ học thành công",
      semester,
    });
  },

  deleteSemester: async (req, res) => {
    const { id } = req.params;

    await semesterService.deleteSemester(id);

    res.status(200).json({
      message: "Xóa năm học thành công",
    });
  },
};

module.exports = semesterController;