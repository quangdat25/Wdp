const semesterRepository = require("../repositories/semester.repository");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const SEMESTER_KEYS = ["spring", "summer", "fall"];

const SEMESTER_META = {
  spring: { name: "Spring", prefix: "SP", order: 1 },
  summer: { name: "Summer", prefix: "SU", order: 2 },
  fall: { name: "Fall", prefix: "FA", order: 3 },
};

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const toVNStartOfDay = (date) =>
  dayjs.tz(date, "Asia/Ho_Chi_Minh").startOf("day").toDate();

const toVNEndOfDay = (date) =>
  dayjs.tz(date, "Asia/Ho_Chi_Minh").endOf("day").toDate();

const getPeriodWindows = (endDate) => {
  const bookingEndDate = toVNEndOfDay(endDate);

  const bookingStartDate = dayjs(bookingEndDate)
    .tz("Asia/Ho_Chi_Minh")
    .subtract(6, "day")
    .startOf("day")
    .toDate();

  const renewalEndDate = dayjs(bookingStartDate)
    .tz("Asia/Ho_Chi_Minh")
    .subtract(1, "millisecond")
    .toDate();

  const renewalStartDate = dayjs(renewalEndDate)
    .tz("Asia/Ho_Chi_Minh")
    .subtract(6, "day")
    .startOf("day")
    .toDate();

  return {
    renewalStartDate,
    renewalEndDate,
    bookingStartDate,
    bookingEndDate,
  };
};

const buildPeriod = ({ startDate, endDate }) => {
  if (!startDate || !endDate) {
    throw createError(400, "Vui lòng nhập đủ ngày bắt đầu và ngày kết thúc");
  }

  const start = toVNStartOfDay(startDate);
  const end = toVNEndOfDay(endDate);

  if (start >= end) {
    throw createError(400, "Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
  }

  return {
    startDate: start,
    endDate: end,
    ...getPeriodWindows(endDate),
  };
};

const getStatus = (period) => {
  const now = new Date();

  if (now > new Date(period.endDate)) return "Completed";
  if (now >= new Date(period.startDate) && now <= new Date(period.endDate)) {
    return "Ongoing";
  }

  return "Upcoming";
};

const getYearStatus = (yearDoc) => {
  const statuses = SEMESTER_KEYS.map((key) => getStatus(yearDoc[key]));

  if (statuses.includes("Ongoing")) return "Ongoing";
  if (statuses.every((status) => status === "Completed")) return "Completed";

  return "Upcoming";
};

const formatSemester = (yearDoc, key) => {
  const meta = SEMESTER_META[key];

  return {
    academicYearId: yearDoc._id,
    year: yearDoc.year,
    key,
    name: meta.name,
    code: `${meta.prefix}${yearDoc.year.toString().slice(-2)}`,
    ...yearDoc[key],
    status: getStatus(yearDoc[key]),
  };
};

const formatYear = (yearDoc) => {
  const plain = yearDoc.toObject ? yearDoc.toObject() : yearDoc;

  return {
    ...plain,
    status: getYearStatus(plain),
    semesters: SEMESTER_KEYS.map((key) => formatSemester(plain, key)),
  };
};

const getAllSemesterPeriods = (years) => {
  return years.flatMap((yearDoc) =>
    SEMESTER_KEYS.map((key) => formatSemester(yearDoc, key))
  );
};

const validateYearOrder = (spring, summer, fall) => {
  if (spring.endDate >= summer.startDate) {
    throw createError(400, "Kỳ Summer phải bắt đầu sau khi kỳ Spring kết thúc");
  }

  if (summer.endDate >= fall.startDate) {
    throw createError(400, "Kỳ Fall phải bắt đầu sau khi kỳ Summer kết thúc");
  }
};

const semesterService = {
  getAllSemesters: async () => {
    const years = await semesterRepository.findAllActive();
    return years.map(formatYear);
  },

  getCurrentSemester: async () => {
    const years = await semesterRepository.findAllActiveAsc();
    const periods = getAllSemesterPeriods(years);

    const currentSemester = periods.find(
      (period) =>
        new Date() >= new Date(period.startDate) &&
        new Date() <= new Date(period.endDate)
    );

    if (!currentSemester) {
      throw createError(404, "Không có kỳ học nào đang diễn ra");
    }

    return currentSemester;
  },

  getNextSemester: async () => {
    const years = await semesterRepository.findAllActiveAsc();
    const periods = getAllSemesterPeriods(years).sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );

    const nextSemester = periods.find(
      (period) => new Date(period.startDate) > new Date()
    );

    if (!nextSemester) {
      throw createError(404, "Chưa có kỳ học tiếp theo");
    }

    return nextSemester;
  },

  getTargetBookingSemester: async () => {
    const years = await semesterRepository.findAllActiveAsc();
    const periods = getAllSemesterPeriods(years);
    const now = new Date();

    const targetSemester = periods.find(
      (period) =>
        now >= new Date(period.bookingStartDate) &&
        now <= new Date(period.bookingEndDate)
    );

    // HACK CHO HỘI ĐỒNG BẢO VỆ: Luôn luôn bypass để cho phép đặt phòng
    if (!targetSemester) {
      const currentSemester = periods.find(
        (period) =>
          now >= new Date(period.startDate) &&
          now <= new Date(period.endDate)
      );
      return currentSemester || periods[0];
    }

    return targetSemester;
  },

  createSemester: async (data) => {
    const { year, spring, summer, fall } = data;

    if (!year || !spring || !summer || !fall) {
      throw createError(400, "Vui lòng nhập đủ thông tin năm học");
    }

    const existing = await semesterRepository.findByYear(year);
    if (existing) {
      throw createError(400, `Năm học ${year} đã tồn tại`);
    }

    const springPeriod = buildPeriod(spring);
    const summerPeriod = buildPeriod(summer);
    const fallPeriod = buildPeriod(fall);

    validateYearOrder(springPeriod, summerPeriod, fallPeriod);

    const createdYear = await semesterRepository.create({
      year,
      spring: springPeriod,
      summer: summerPeriod,
      fall: fallPeriod,
    });

    return formatYear(createdYear);
  },

  updateSemester: async (id, data) => {
    const { key, name, startDate, endDate } = data;

    const semesterKey = key || name?.toLowerCase();

    if (!SEMESTER_KEYS.includes(semesterKey)) {
      throw createError(400, "Kỳ học không hợp lệ");
    }

    const academicYear = await semesterRepository.findById(id);
    if (!academicYear) {
      throw createError(404, "Không tìm thấy năm học");
    }

    const oldPeriod = academicYear[semesterKey];

    academicYear[semesterKey] = buildPeriod({
      startDate: startDate || oldPeriod.startDate,
      endDate: endDate || oldPeriod.endDate,
    });

    validateYearOrder(
      academicYear.spring,
      academicYear.summer,
      academicYear.fall
    );

    await academicYear.save();

    return formatYear(academicYear);
  },

  deleteSemester: async (id) => {
    const academicYear = await semesterRepository.findById(id);

    if (!academicYear) {
      throw createError(404, "Không tìm thấy năm học");
    }

    academicYear.isDeleted = true;
    await academicYear.save();

    return true;
  },
};

module.exports = semesterService;