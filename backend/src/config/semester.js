function getCurrentSemester(date = new Date()) {
  const month = date.getMonth() + 1; // 1 - 12
  const year = date.getFullYear().toString().slice(-2);

  let semester;

  if (month >= 1 && month <= 4) {
    semester = "Spring";
  } else if (month >= 5 && month <= 8) {
    semester = "Summer";
  } else {
    semester = "Fall";
  }

  return `${semester}${year}`;
}

module.exports = {
  getCurrentSemester,
};