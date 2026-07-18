/**
 * Sinh file xlsx test case cho NEWS_CREATE theo mau WDP_ECS_Unit Test Case.xlsx
 * Chay: node scripts/gen-testcase-xlsx.js
 */
const XLSX = require("xlsx");
const path = require("path");

const wb = XLSX.utils.book_new();

/* ============================= COVER ============================= */
const coverData = [
  ["", "", "", "", "", ""],
  ["", "UNIT TEST CASE", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["Project Name", "DORMITORY BOOKING SYSTEM", "", "", "Creator", "quypd"],
  ["Project Code", "DBS", "", "", "Reviewer/Approver", "Group"],
  ["Document Code", "DBS_UnitTest_NEWS_v1.0", "", "", "Issue Date", "11/07/2026"],
  ["", "", "", "", "Version", 1],
  ["", "", "", "", "", ""],
  ["Record of change", "", "", "", "", ""],
  ["Effective Date", "Version", "Change Item", "*A,D,M", "Change description", "Reference"],
  ["11/07/2026", "1.0", "Cover, FunctionList, Create News, Test Report", "A", "Add unit test cases for news.createNews (8 passed)", ""],
];
const coverWs = XLSX.utils.aoa_to_sheet(coverData);
coverWs["!cols"] = [{ wch: 18 }, { wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 30 }];
XLSX.utils.book_append_sheet(wb, coverWs, "Cover");

/* ========================== FUNCTION LIST ========================== */
const funcListData = [
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "UNIT TEST CASE LIST", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["Project Name", "", "", "", "DORMITORY BOOKING SYSTEM", "", "", ""],
  ["Project Code", "", "", "", "DBS", "", "", ""],
  ["Normal number of Test cases/KLOC ", "", "", "", 29, "", "", ""],
  [
    "Test Environment Setup Description",
    "",
    "",
    "",
    "1. Server (Node.js/Express API)\n2. Database (MongoDB)\n3. Test framework: Jest\n4. OS: Windows 11",
    "",
    "",
    "",
  ],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["No", "Requirement\nName", "Class Name", "Function Name", " Function Code(Optional)", "Sheet Name", "Description", "Pre-Condition"],
  [1, "", "News", "Create News", "NEWS_CREATE", "Create News", "Manager tao ban tin moi", "User login role MANAGER"],
];
const funcListWs = XLSX.utils.aoa_to_sheet(funcListData);
funcListWs["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 28 }, { wch: 28 }];
XLSX.utils.book_append_sheet(wb, funcListWs, "FunctionList");

/* ============================ TEST REPORT ============================ */
const reportData = [
  ["", "", "", "", "", "", "", "", ""],
  ["UNIT TEST REPORT", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["Project Name", "DORMITORY BOOKING SYSTEM", "", "Creator", "", "quypd", "", "", ""],
  ["Project Code", "DBS", "", "Reviewer/Approver", "", "Group", "", "", ""],
  ["Document Code", "DBS_Test Report_NEWS_v1.0", "", "Issue Date", "", "11/07/2026", "", "", ""],
  ["Notes", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", ""],
  ["No", "Function code", "Passed", "Failed", "Untested", "N", "A", "B", "Total Test Cases"],
  [1, "Create News", 8, 0, 0, 2, 4, 2, 8],
  ["", "", "", "", "", "", "", "", ""],
  ["", "Sub total", 8, 0, 0, 2, 4, 2, 8],
  ["", "", "", "", "", "", "", "", ""],
  ["", "Test coverage", "", 100, "%", "", "", "", ""],
  ["", "Test successful coverage", "", 100, "%", "", "", "", ""],
  ["", "Normal case", "", 25, "%", "", "", "", ""],
  ["", "Abnormal case", "", 50, "%", "", "", "", ""],
  ["", "Boundary case", "", 25, "%", "", "", "", ""],
];
const reportWs = XLSX.utils.aoa_to_sheet(reportData);
reportWs["!cols"] = [{ wch: 6 }, { wch: 22 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 4 }, { wch: 4 }, { wch: 4 }, { wch: 16 }];
XLSX.utils.book_append_sheet(wb, reportWs, "Test Report");

/* =========================== CREATE NEWS =========================== */
/*
 UTCID01 - Normal   : title + content hop le -> 201 tao thanh cong
 UTCID02 - Abnormal : title = ""             -> 400 loi thieu tieu de
 UTCID03 - Boundary : title = "   "          -> 400 loi thieu tieu de
 UTCID04 - Abnormal : content = ""           -> 400 loi thieu noi dung
 UTCID05 - Boundary : content = "   "        -> 400 loi thieu noi dung
 UTCID06 - Abnormal : thieu title            -> 400 loi thieu tieu de
 UTCID07 - Abnormal : thieu content          -> 400 loi thieu noi dung
 UTCID08 - Normal   : status=draft,isPinned=true -> 201, khong emit socket
*/
const createNewsData = [
  // 0
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  // 1
  ["Function Code", "", "NEWS_CREATE", "", "", "Function Name", "", "", "", "", "", "Create News", "", "", ""],
  // 2
  ["Created By", "", "quypd", "", "", "Executed By", "", "", "", "", "", "quypd", "", "", ""],
  // 3
  ["Lines  of code", "", 69, "", "", "Lack of test cases", "", "", "", "", "", 0, "", "", ""],
  // 4
  ["Test requirement", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  // 5
  ["Passed", "", "Failed", "", "", "Untested", "", "", "", "", "", "N/A/B", "", "", "Total Test Cases"],
  // 6
  [8, "", 0, "", "", 0, "", "", "", "", "", "", 2, 4, 2, 8],
  // 7
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  // 8 - header UTCID
  ["", "", "", "", "", "UTCID01", "UTCID02", "UTCID03", "UTCID04", "UTCID05", "UTCID06", "UTCID07", "UTCID08", "", ""],

  // ================ Precondition ================
  ["Condition", "Precondition ", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "Can connect with server", "", "O", "O", "O", "O", "O", "O", "O", "O", "", ""],
  ["", "", "", "User login with role MANAGER", "", "O", "O", "O", "O", "O", "O", "O", "O", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // ================ title ================
  ["", "title (bat buoc, khong rong sau trim)", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", 'title hop le (vi du "Bao tri he thong")', "", "O", "", "", "O", "O", "", "", "O", "", ""],
  ["", "", "", 'title = "" (rong)', "", "", "O", "", "", "", "", "", "", "", ""],
  ["", "", "", 'title = "   " (chi khoang trang)', "", "", "", "O", "", "", "", "", "", "", ""],
  ["", "", "", "title = undefined (khong truyen)", "", "", "", "", "", "", "O", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // ================ content ================
  ["", "content (bat buoc, khong rong sau trim)", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "content hop le", "", "O", "O", "O", "", "", "O", "", "O", "", ""],
  ["", "", "", 'content = "" (rong)', "", "", "", "", "O", "", "", "", "", "", ""],
  ["", "", "", 'content = "   " (chi khoang trang)', "", "", "", "", "", "O", "", "", "", "", ""],
  ["", "", "", "content = undefined", "", "", "", "", "", "", "", "O", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // ================ status ================
  ["", "status (tuy chon, mac dinh published)", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", 'status mac dinh "published"', "", "O", "O", "O", "O", "O", "O", "O", "", "", ""],
  ["", "", "", 'status = "draft"', "", "", "", "", "", "", "", "", "O", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // ================ isPinned ================
  ["", "isPinned (tuy chon)", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "isPinned = false (mac dinh)", "", "O", "O", "O", "O", "O", "O", "O", "", "", ""],
  ["", "", "", "isPinned = true", "", "", "", "", "", "", "", "", "O", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // ================ Confirm - Return ================
  ["Confirm", "Return", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "HTTP 201 - success:true - Dang ban tin thanh cong", "", "O", "", "", "", "", "", "", "O", "", ""],
  ["", "", "", 'HTTP 400 - "Vui long nhap tieu de ban tin"', "", "", "O", "O", "", "", "O", "", "", "", ""],
  ["", "", "", 'HTTP 400 - "Vui long nhap noi dung ban tin"', "", "", "", "", "O", "O", "", "O", "", "", ""],
  ["", "", "", "Emit socket new_news + tao Notification", "", "O", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "KHONG emit socket, KHONG tao Notification", "", "", "O", "O", "O", "O", "O", "O", "O", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // ================ Type (N/A/B) ================
  ["Type", "", "", "", "", "N", "A", "B", "A", "B", "A", "A", "N", "", ""],

  // ================ Result ================
  ["Result", "", "", "", "", "P", "P", "P", "P", "P", "P", "P", "P", "", ""],
  ["Executed Date", "", "", "", "", "11/07/2026", "11/07/2026", "11/07/2026", "11/07/2026", "11/07/2026", "11/07/2026", "11/07/2026", "11/07/2026", "", ""],
  ["Note", "", "", "", "", "Normal", "Abnormal", "Boundary", "Abnormal", "Boundary", "Abnormal", "Abnormal", "Normal", "", ""],
];

const createNewsWs = XLSX.utils.aoa_to_sheet(createNewsData);
createNewsWs["!cols"] = [
  { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 38 }, { wch: 4 },
  { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
  { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 4 }, { wch: 8 },
];
XLSX.utils.book_append_sheet(wb, createNewsWs, "Create News");

/* ============================= WRITE ============================= */
const outPath = path.resolve(__dirname, "..", "..", "WDP_ECS_Unit Test Case_NEWS.xlsx");
XLSX.writeFile(wb, outPath);
console.log("Da tao file:", outPath);
