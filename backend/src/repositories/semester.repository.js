const Semester = require("../models/semester.model");

const semesterRepository = {
  findAll: async () => {
    return Semester.find()
      .sort({ year: -1 })
      .lean();
  },

  findAllAsc: async () => {
    return Semester.find()
      .sort({ year: 1 })
      .lean();
  },

  findByYear: async (year) => {
    return Semester.findOne({
      year: Number(year),
    }).lean();
  },

  findById: async (id) => {
    return Semester.findById(id);
  },

  create: async (data) => {
    return Semester.create(data);
  },

  deleteById: async (id) => {
    return Semester.findByIdAndDelete(id);
  },
};

module.exports = semesterRepository;