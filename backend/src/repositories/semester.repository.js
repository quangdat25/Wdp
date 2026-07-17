const Semester = require("../models/semester.model");

const semesterRepository = {
  findAllActive: async () => {
    return await Semester.find()
      .sort({ year: -1 })
      .lean();
  },

  findAllActiveAsc: async () => {
    return await Semester.find()
      .sort({ year: 1 })
      .lean();
  },

  findByYear: async (year) => {
    return await Semester.findOne({
      year,
      isDeleted: false,
    }).lean();
  },

  findById: async (id) => {
    return await Semester.findOne({
      _id: id,
      isDeleted: false,
    });
  },

  create: async (data) => {
    return await Semester.create(data);
  },
};

module.exports = semesterRepository;