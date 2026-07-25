const validateViolation = (req, res, next) => {
  const { studentCode, studentName, location, reason } = req.body;
  
  if (!studentCode || studentCode.trim() === "") {
    return res.status(400).json({ success: false, message: "Vui lòng nhập mã sinh viên (studentCode)" });
  }

  if (!studentName || studentName.trim() === "") {
    return res.status(400).json({ success: false, message: "Vui lòng nhập tên sinh viên (studentName)" });
  }

  if (!location || location.trim() === "") {
    return res.status(400).json({ success: false, message: "Vui lòng nhập địa điểm vi phạm (location)" });
  }
  
  if (!reason || reason.trim() === "") {
    return res.status(400).json({ success: false, message: "Vui lòng nhập lý do vi phạm (reason)" });
  }
  
  next();
};

module.exports = { validateViolation };
