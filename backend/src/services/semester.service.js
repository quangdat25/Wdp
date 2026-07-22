const semesterRepository = require("../repositories/semester.repository");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

const SEMESTER_KEYS = ["spring", "summer", "fall"];

const SEMESTER_META = {
  spring: {
    name: "Spring",
    prefix: "SP",
    order: 1,
  },

  summer: {
    name: "Summer",
    prefix: "SU",
    order: 2,
  },

  fall: {
    name: "Fall",
    prefix: "FA",
    order: 3,
  },
};

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const toVNStartOfDay = (date) => {
  return dayjs.tz(date, VN_TIMEZONE).startOf("day").toDate();
};

const toVNEndOfDay = (date) => {
  return dayjs.tz(date, VN_TIMEZONE).endOf("day").toDate();
};

const getPeriodWindows = (endDate) => {
  const bookingEndDate = toVNEndOfDay(endDate);

  const bookingStartDate = dayjs(bookingEndDate)
    .tz(VN_TIMEZONE)
    .subtract(6, "day")
    .startOf("day")
    .toDate();

  const renewalEndDate = dayjs(bookingStartDate)
    .tz(VN_TIMEZONE)
    .subtract(1, "millisecond")
    .toDate();

  const renewalStartDate = dayjs(renewalEndDate)
    .tz(VN_TIMEZONE)
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
    throw createError(
      400,
      "Vui lòng nhập đủ ngày bắt đầu và ngày kết thúc"
    );
  }

  const start = toVNStartOfDay(startDate);
  const end = toVNEndOfDay(endDate);

  if (start >= end) {
    throw createError(
      400,
      "Ngày bắt đầu phải nhỏ hơn ngày kết thúc"
    );
  }

  return {
    startDate: start,
    endDate: end,
    ...getPeriodWindows(endDate),
  };
};

const getStatus = (period) => {
  if (!period?.startDate || !period?.endDate) {
    return "Upcoming";
  }

  const now = new Date();
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);

  if (now > endDate) {
    return "Completed";
  }

  if (now >= startDate && now <= endDate) {
    return "Ongoing";
  }

  return "Upcoming";
};

const isUpcomingSemester = (period) => {
  if (!period?.startDate) {
    return false;
  }

  return new Date(period.startDate) > new Date();
};

const ensureUpcomingSemester = (period, semesterName) => {
  const status = getStatus(period);

  if (status === "Ongoing") {
    throw createError(
      400,
      `Không thể chỉnh sửa kỳ ${semesterName} vì kỳ này đang diễn ra`
    );
  }

  if (status === "Completed") {
    throw createError(
      400,
      `Không thể chỉnh sửa kỳ ${semesterName} vì kỳ này đã kết thúc`
    );
  }
};

const getYearStatus = (yearDoc) => {
  const statuses = SEMESTER_KEYS.map((key) =>
    getStatus(yearDoc[key])
  );

  if (statuses.includes("Ongoing")) {
    return "Ongoing";
  }

  if (statuses.every((status) => status === "Completed")) {
    return "Completed";
  }

  return "Upcoming";
};

const formatSemester = (yearDoc, key) => {
  const meta = SEMESTER_META[key];

  return {
    academicYearId: yearDoc._id,
    year: yearDoc.year,
    key,
    semesterKey: key,
    name: meta.name,
    code: `${meta.prefix}${yearDoc.year.toString().slice(-2)}`,
    ...yearDoc[key],
    status: getStatus(yearDoc[key]),
    canEdit: isUpcomingSemester(yearDoc[key]),
  };
};

const formatYear = (yearDoc) => {
  const plain = yearDoc.toObject
    ? yearDoc.toObject()
    : yearDoc;

  const semesters = SEMESTER_KEYS.map((key) =>
    formatSemester(plain, key)
  );

  return {
    ...plain,
    status: getYearStatus(plain),
    semesters,
    canDelete: semesters.every(
      (semester) => semester.status === "Upcoming"
    ),
  };
};

const getAllSemesterPeriods = (years) => {
  return years.flatMap((yearDoc) =>
    SEMESTER_KEYS.map((key) =>
      formatSemester(yearDoc, key)
    )
  );
};

const validateYearOrder = (spring, summer, fall) => {
  if (
    new Date(spring.endDate) >=
    new Date(summer.startDate)
  ) {
    throw createError(
      400,
      "Kỳ Summer phải bắt đầu sau khi kỳ Spring kết thúc"
    );
  }

  if (
    new Date(summer.endDate) >=
    new Date(fall.startDate)
  ) {
    throw createError(
      400,
      "Kỳ Fall phải bắt đầu sau khi kỳ Summer kết thúc"
    );
  }
};

const semesterService = {
  getAllSemesters: async () => {
    const years = await semesterRepository.findAll();

    return years.map(formatYear);
  },

  getCurrentSemester: async () => {
    const years = await semesterRepository.findAllAsc();

    const periods = getAllSemesterPeriods(years).sort(
      (a, b) =>
        new Date(a.startDate) - new Date(b.startDate)
    );

    const now = new Date();

    const currentSemester = periods.find(
      (period) =>
        now >= new Date(period.startDate) &&
        now <= new Date(period.endDate)
    );

    if (!currentSemester) {
      throw createError(
        404,
        "Không có kỳ học nào đang diễn ra"
      );
    }

    return currentSemester;
  },

  getNextSemester: async () => {
    const years = await semesterRepository.findAllAsc();

    const periods = getAllSemesterPeriods(years).sort(
      (a, b) =>
        new Date(a.startDate) - new Date(b.startDate)
    );

    const now = new Date();

    const nextSemester = periods.find(
      (period) => new Date(period.startDate) > now
    );

    if (!nextSemester) {
      throw createError(
        404,
        "Chưa có kỳ học tiếp theo"
      );
    }

    return nextSemester;
  },

  createSemester: async (data) => {
    const { year, spring, summer, fall } = data;

    if (!year || !spring || !summer || !fall) {
      throw createError(
        400,
        "Vui lòng nhập đủ thông tin năm học"
      );
    }

    const numericYear = Number(year);

    if (
      !Number.isInteger(numericYear) ||
      numericYear < 2020 ||
      numericYear > 2100
    ) {
      throw createError(
        400,
        "Năm học không hợp lệ"
      );
    }

    const existing =
      await semesterRepository.findByYear(numericYear);

    if (existing) {
      throw createError(
        400,
        `Năm học ${numericYear} đã tồn tại`
      );
    }

    const springPeriod = buildPeriod(spring);
    const summerPeriod = buildPeriod(summer);
    const fallPeriod = buildPeriod(fall);

    validateYearOrder(
      springPeriod,
      summerPeriod,
      fallPeriod
    );

    /*
     * Không cho tạo mới một năm học có kỳ đã bắt đầu.
     * Tránh trường hợp admin tạo dữ liệu quá khứ rồi sửa/xóa sai logic.
     */
    if (!isUpcomingSemester(springPeriod)) {
      throw createError(
        400,
        "Ngày bắt đầu kỳ Spring phải lớn hơn thời điểm hiện tại"
      );
    }

    const createdYear =
      await semesterRepository.create({
        year: numericYear,
        spring: springPeriod,
        summer: summerPeriod,
        fall: fallPeriod,
      });

    return formatYear(createdYear);
  },

  updateSemester: async (id, data) => {
    const {
      key,
      semesterKey,
      name,
      startDate,
      endDate,
    } = data;

    const resolvedKey =
      key ||
      semesterKey ||
      name?.toLowerCase();

    if (!SEMESTER_KEYS.includes(resolvedKey)) {
      throw createError(
        400,
        "Kỳ học không hợp lệ"
      );
    }

    const academicYear =
      await semesterRepository.findById(id);

    if (!academicYear) {
      throw createError(
        404,
        "Không tìm thấy năm học"
      );
    }

    const oldPeriod = academicYear[resolvedKey];
    const semesterName =
      SEMESTER_META[resolvedKey].name;

    /*
     * Kiểm tra trạng thái của kỳ trước khi sửa.
     */
    ensureUpcomingSemester(
      oldPeriod,
      semesterName
    );

    const updatedPeriod = buildPeriod({
      startDate: startDate || oldPeriod.startDate,
      endDate: endDate || oldPeriod.endDate,
    });

    /*
     * Sau khi cập nhật, ngày bắt đầu vẫn phải nằm trong tương lai.
     */
    if (!isUpcomingSemester(updatedPeriod)) {
      throw createError(
        400,
        `Ngày bắt đầu kỳ ${semesterName} phải lớn hơn thời điểm hiện tại`
      );
    }

    academicYear[resolvedKey] = updatedPeriod;

    validateYearOrder(
      academicYear.spring,
      academicYear.summer,
      academicYear.fall
    );

    await academicYear.save();

    return formatYear(academicYear);
  },

  deleteSemester: async (id) => {
    const academicYear =
      await semesterRepository.findById(id);

    if (!academicYear) {
      throw createError(
        404,
        "Không tìm thấy năm học"
      );
    }

    const blockedSemesterKey =
      SEMESTER_KEYS.find(
        (key) => !isUpcomingSemester(academicYear[key])
      );

    if (blockedSemesterKey) {
      const semesterName =
        SEMESTER_META[blockedSemesterKey].name;

      const status = getStatus(
        academicYear[blockedSemesterKey]
      );

      if (status === "Ongoing") {
        throw createError(
          400,
          `Không thể xóa năm học vì kỳ ${semesterName} đang diễn ra`
        );
      }

      throw createError(
        400,
        `Không thể xóa năm học vì kỳ ${semesterName} đã kết thúc`
      );
    }

    await semesterRepository.deleteById(id);

    return true;
  },
};

module.exports = semesterService;