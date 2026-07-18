/**
 * Them 2 tab "Room" va "Notification" vao file WDP_ECS_Unit Test Case.xlsx
 * Bo cuc bam theo tab "Create News" co san trong file.
 * Chay: node backend/scripts/add-room-noti-sheets.js
 */
const XLSX = require("xlsx");
const path = require("path");

const FILE = path.join(__dirname, "..", "..", "WDP_ECS_Unit Test Case.xlsx");
const EXEC_DATE = "16/07/2026";

// Chuan hoa moi hang ve cung so cot cho dep
const W = 20;
const pad = (row) => {
  const r = row.slice();
  while (r.length < W) r.push("");
  return r;
};

/**
 * Dung cac hang danh dau (O) cho tung dieu kien.
 * cols: mang cac chi so cot (bat dau tu 5 = UTCID01) can danh "O".
 */
const mark = (label0, label1, label3, cols, total) => {
  const row = new Array(W).fill("");
  row[0] = label0;
  row[1] = label1;
  row[3] = label3;
  for (const c of cols) row[5 + c] = "O"; // c = 0 -> UTCID01 (cot 5)
  return row;
};

// Header chung cho moi sheet test case
const buildHeader = (code, name, loc, passed, failed, n, a, b) => {
  const total = n + a + b;
  const utcRow = new Array(W).fill("");
  for (let i = 0; i < total; i++) utcRow[5 + i] = `UTCID${String(i + 1).padStart(2, "0")}`;
  return [
    pad([]),
    pad(["Function Code", "", code, "", "", "Function Name", "", "", "", "", "", name]),
    pad(["Created By", "", "quypd", "", "", "Executed By", "", "", "", "", "", "quypd"]),
    pad(["Lines  of code", "", loc, "", "", "Lack of test cases", "", "", "", "", "", 0]),
    pad(["Test requirement"]),
    pad(["Passed", "", "Failed", "", "", "Untested", "", "", "", "", "", "N/A/B", "", "", "Total Test Cases"]),
    (() => {
      const r = new Array(W).fill("");
      r[0] = passed; r[2] = failed; r[5] = 0;
      r[11] = n; r[12] = a; r[13] = b; r[14] = total;
      return r;
    })(),
    pad([]),
    utcRow,
  ];
};

/* ============================ NOTIFICATION ============================ */
// 6 test case (UTCID01..06), cot 0..5 (= cot 5..10)
const notiRows = [
  ...buildHeader("NOTI_CREATE", "Create Notification", 70, 6, 0, /*N*/ 4, /*A*/ 2, /*B*/ 0),

  // ---------- Condition: Precondition ----------
  pad(["Condition", "Precondition "]),
  mark("", "", "Can connect with server", [0, 1, 2, 3, 4, 5]),
  mark("", "", "User login (role admin/manager)", [0, 1, 2, 3, 4, 5]),
  pad([]),

  // ---------- targetType ----------
  pad(["", "targetType (loai nguoi nhan)"]),
  mark("", "", 'targetType = "all"', [0, 5]),
  mark("", "", 'targetType = "roles"', [1]),
  mark("", "", 'targetType = "users"', [2]),
  mark("", "", 'targetType = "studentCode"', [3, 4]),
  pad([]),

  // ---------- studentCode ----------
  pad(["", "studentCode (khi targetType = studentCode)"]),
  mark("", "", "studentCode ton tai trong DB", [3]),
  mark("", "", "studentCode KHONG ton tai", [4]),
  pad([]),

  // ---------- trang thai he thong ----------
  pad(["", "Trang thai he thong"]),
  mark("", "", "Notification.create thanh cong", [0, 1, 2, 3]),
  mark("", "", "Notification.create throw loi (DB down)", [5]),
  pad([]),

  // ---------- Confirm: Return ----------
  pad(["Confirm", "Return"]),
  mark("", "", "HTTP 201 - success:true - Gui thong bao thanh cong", [0, 1, 2, 3]),
  mark("", "", 'HTTP 404 - "Khong tim thay sinh vien voi ma nay"', [4]),
  mark("", "", 'HTTP 500 - "Loi khi gui thong bao"', [5]),
  mark("", "", "Emit new_notification dung room (all/role/user)", [0, 1, 2, 3]),
  pad([]),

  // ---------- Result ----------
  (() => {
    const r = new Array(W).fill("");
    r[0] = "Result"; r[1] = "Type(N : Normal, A : Abnormal, B : Boundary)";
    ["N", "N", "N", "N", "A", "A"].forEach((t, i) => (r[5 + i] = t));
    return r;
  })(),
  (() => {
    const r = new Array(W).fill("");
    r[1] = "Passed/Failed";
    for (let i = 0; i < 6; i++) r[5 + i] = "P";
    return r;
  })(),
  (() => {
    const r = new Array(W).fill("");
    r[1] = "Executed Date";
    for (let i = 0; i < 6; i++) r[5 + i] = EXEC_DATE;
    return r;
  })(),
  pad(["", "Defect ID"]),
];

/* =============================== ROOM =============================== */
// 7 test case (UTCID01..07): createBuilding (01-04) + deleteBuilding (05-07)
const roomRows = [
  ...buildHeader("BUILDING_CREATE / BUILDING_DELETE", "Create / Delete Building", 118, 7, 0, /*N*/ 2, /*A*/ 4, /*B*/ 1),

  // ---------- Condition: Precondition ----------
  pad(["Condition", "Precondition "]),
  mark("", "", "Can connect with server", [0, 1, 2, 3, 4, 5, 6]),
  mark("", "", "User login with role ADMIN", [0, 1, 2, 3, 4, 5, 6]),
  pad([]),

  // ---------- name (createBuilding) ----------
  pad(["", "name (createBuilding - bat buoc, khong rong sau trim)"]),
  mark("", "", "name hop le, chua ton tai", [0]),
  mark("", "", 'name = "" (rong)', [1]),
  mark("", "", 'name = "   " (chi khoang trang)', [2]),
  mark("", "", "name da ton tai trong DB", [3]),
  pad([]),

  // ---------- buildingId (deleteBuilding) ----------
  pad(["", "buildingId (deleteBuilding)"]),
  mark("", "", "Toa nha ton tai", [4, 6]),
  mark("", "", "Toa nha KHONG ton tai", [5]),
  pad([]),

  // ---------- trang thai phong (deleteBuilding) ----------
  pad(["", "Trang thai phong (deleteBuilding)"]),
  mark("", "", "Khong co phong dang occupied", [4]),
  mark("", "", "Con phong dang co nguoi o (occupied > 0)", [6]),
  pad([]),

  // ---------- Confirm: Return ----------
  pad(["Confirm", "Return"]),
  mark("", "", "HTTP 201 - Tao toa nha + phong thanh cong", [0]),
  mark("", "", 'HTTP 400 - "Ten toa nha khong duoc de trong"', [1, 2]),
  mark("", "", 'HTTP 400 - "Toa nha ... da ton tai"', [3]),
  mark("", "", "HTTP 200 - Xoa toa nha thanh cong", [4]),
  mark("", "", 'HTTP 404 - "Khong tim thay toa nha"', [5]),
  mark("", "", 'HTTP 400 - "... con phong dang co nguoi o"', [6]),
  mark("", "", "Tao 24 phong (4 tang x 6 phong)", [0]),
  mark("", "", "Xoa toan bo phong cua toa", [4]),
  pad([]),

  // ---------- Result ----------
  (() => {
    const r = new Array(W).fill("");
    r[0] = "Result"; r[1] = "Type(N : Normal, A : Abnormal, B : Boundary)";
    ["N", "A", "B", "A", "N", "A", "A"].forEach((t, i) => (r[5 + i] = t));
    return r;
  })(),
  (() => {
    const r = new Array(W).fill("");
    r[1] = "Passed/Failed";
    for (let i = 0; i < 7; i++) r[5 + i] = "P";
    return r;
  })(),
  (() => {
    const r = new Array(W).fill("");
    r[1] = "Executed Date";
    for (let i = 0; i < 7; i++) r[5 + i] = EXEC_DATE;
    return r;
  })(),
  pad(["", "Defect ID"]),
];

const COLS = [
  { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 44 }, { wch: 4 },
  ...Array.from({ length: 15 }, () => ({ wch: 9 })),
];

// ---- Mo file co san, them 2 sheet, ghi lai ----
const wb = XLSX.readFile(FILE);

const upsertSheet = (name, rows) => {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = COLS;
  if (wb.SheetNames.includes(name)) {
    wb.Sheets[name] = ws; // ghi de neu da ton tai
  } else {
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
};

upsertSheet("Notification", notiRows);
upsertSheet("Room", roomRows);

XLSX.writeFile(wb, FILE);
console.log("Da them/cap nhat 2 tab 'Notification' va 'Room' vao:", FILE);
console.log("Sheets hien tai:", wb.SheetNames.join(", "));
