const Student = require("../models/student.model");

class StudentRepository {
  async findByCode(studentCode) {
    return await Student.findOne({ studentCode });
  }

  async findById(id) {
    return await Student.findById(id);
  }

  async save(studentDoc) {
    return await studentDoc.save();
  }
}

module.exports = new StudentRepository();
