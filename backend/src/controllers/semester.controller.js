const Semester = require("../models/semester.model");

// Create a new semester
const createSemester = async (req, res) => {
  try {
    const { name, year, startDate, endDate, isActive } = req.body;

    if (!name || !year || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ thông tin kỳ học",
      });
    }

    // Check if semester already exists for this year
    const existing = await Semester.findOne({ name, year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Kỳ ${name} năm ${year} đã tồn tại`,
      });
    }

    // If this semester is set to active, deactivate others
    if (isActive) {
      await Semester.updateMany({}, { isActive: false });
    }

    const newSemester = new Semester({
      name,
      year,
      startDate,
      endDate,
      isActive: isActive || false,
    });

    await newSemester.save();

    res.status(201).json({
      success: true,
      message: "Tạo kỳ học thành công",
      data: newSemester,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo kỳ học",
      error: error.message,
    });
  }
};

// Get all semesters
const getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semester.find().sort({ startDate: -1 });
    res.status(200).json({
      success: true,
      data: semesters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách kỳ học",
      error: error.message,
    });
  }
};

// Update a semester
const updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kỳ học",
      });
    }

    if (startDate) semester.startDate = startDate;
    if (endDate) semester.endDate = endDate;

    await semester.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật kỳ học thành công",
      data: semester,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật kỳ học",
      error: error.message,
    });
  }
};

// Set a semester as active
const setActiveSemester = async (req, res) => {
  try {
    const { id } = req.params;

    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kỳ học",
      });
    }

    // Deactivate all
    await Semester.updateMany({}, { isActive: false });

    // Activate the selected one
    semester.isActive = true;
    await semester.save();

    res.status(200).json({
      success: true,
      message: `Đã thiết lập ${semester.name} ${semester.year} làm kỳ hiện hành`,
      data: semester,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi thiết lập kỳ hiện hành",
      error: error.message,
    });
  }
};

// Delete a semester
const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;

    const semester = await Semester.findById(id);
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kỳ học",
      });
    }

    if (semester.isActive) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa kỳ học đang hoạt động",
      });
    }

    await Semester.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Xóa kỳ học thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa kỳ học",
      error: error.message,
    });
  }
};

module.exports = {
  createSemester,
  getAllSemesters,
  updateSemester,
  setActiveSemester,
  deleteSemester,
};
