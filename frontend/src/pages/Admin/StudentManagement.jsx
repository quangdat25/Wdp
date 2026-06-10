import { useEffect, useMemo, useRef, useState } from "react";
import { Pagination } from "antd";
import AdminSidebar from "./AdminSidebar";
import { getAllStudents, importStudents } from "../../api/studentService";
import { showError, showSuccess } from "../../components/alert";
const statusColors = {
  active: { background: "#dcfce7", color: "#166534", label: "Đang hoạt động" },
  inactive: { background: "#fef3c7", color: "#92400e", label: "Tạm nghỉ" },
  pending: { background: "#dbeafe", color: "#1d4ed8", label: "Chờ duyệt" },
};

function StudentManagement() {
  const inputRef = useRef(null);
  const [importErrors, setImportErrors] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getAllStudents();
      setStudents(res.data.data || []);
    } catch (error) {
      console.error(error);
      showError("Lỗi khi tải danh sách sinh viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return students;

    return students.filter((student) =>
      [
        student.studentCode,
        student.fullName,
        student.email,
        student.phone,
        student.major,
        student.address,
        student.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [searchText, students]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [currentPage, filteredStudents, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredStudents.length / pageSize),
    );
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredStudents.length, pageSize]);

  const openImportModal = () => {
    setImportError("");
    setImportErrors([]);
    setSelectedFile(null);
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    if (importing) return;

    setIsImportModalOpen(false);
    setImportError("");
    setImportErrors([]);
    setSelectedFile(null);
  };

  const handleFilePick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportError("");
    setImportErrors([]);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      setImportError("Vui lòng chọn file Excel trước khi bấm OK.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setImporting(true);
      await importStudents(formData);
      showSuccess("Import sinh viên thành công");
      setIsImportModalOpen(false);
      setSelectedFile(null);
      setImportError("");
      fetchStudents();
    } catch (error) {
      const data = error.response?.data;

      if (data?.errors?.length > 0) {
        setImportError(data.message);
        setImportErrors(data.errors);
        return;
      }

      showError(data?.message || "Import thất bại");
    } finally {
      setImporting(false);
    }
  };

  const getGenderLabel = (gender) => {
    if (gender === "male") return "Nam";
    if (gender === "female") return "Nữ";
    return "Khác";
  };

  const renderStudentRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="9" style={{ padding: 20, textAlign: "center" }}>
            Đang tải dữ liệu...
          </td>
        </tr>
      );
    }

    if (paginatedStudents.length === 0) {
      return (
        <tr>
          <td colSpan="9" style={{ padding: 20, textAlign: "center" }}>
            Không có sinh viên nào
          </td>
        </tr>
      );
    }

    return (
      <>
        {paginatedStudents.map((student) => {
          const badge = statusColors[student.status] || statusColors.active;

          return (
            <tr key={student._id}>
              <td style={tdStyle}>{student.studentCode}</td>
              <td style={tdStyle}>{student.fullName}</td>
              <td style={tdStyle}>{student.email}</td>
              <td style={tdStyle}>{student.phone || "Chưa có"}</td>
              <td style={tdStyle}>{getGenderLabel(student.gender)}</td>
              <td style={tdStyle}>
                {student.dateOfBirth
                  ? new Date(student.dateOfBirth).toLocaleDateString("vi-VN")
                  : "Chưa có"}
              </td>
              <td style={tdStyle}>{student.major || "Chưa có"}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    minWidth: 118,
                    padding: "7px 14px",
                    borderRadius: 999,
                    background: badge.background,
                    color: badge.color,
                    fontWeight: 700,
                    fontSize: 13,
                    lineHeight: 1,
                  }}
                >
                  {badge.label}
                </span>
              </td>
              <td style={tdStyle}>
                <button
                  onClick={() => setSelectedParent(student.parent)}
                  style={{
                    border: "none",
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                    color: "#fff",
                    padding: "9px 12px",
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
                  }}
                >
                  Thông tin phụ huynh
                </button>
              </td>
            </tr>
          );
        })}
      </>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #f3f8f6 100%)",
      }}
    >
      <AdminSidebar />

      <main
        style={{
          marginLeft: "270px",
          width: "calc(100% - 270px)",
          padding: "24px 28px 32px",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            marginBottom: 24,
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: 24,
            padding: "22px 24px",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
          }}
        >
          <h1 style={{ fontSize: 34, color: "#1e4f8f", margin: 0 }}>
            Quản lý sinh viên
          </h1>
          <p style={{ color: "#64748b", marginBottom: 0 }}>
            Hiển thị danh sách sinh viên và thông tin phụ huynh.
          </p>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <SummaryCard title="Tổng sinh viên" value={students.length} />
          <SummaryCard
            title="Đang hoạt động"
            value={students.filter((s) => s.status === "active").length}
          />
          <SummaryCard
            title="Tạm nghỉ"
            value={students.filter((s) => s.status === "inactive").length}
          />
        </section>

        <section
          style={{
            background: "rgba(255,255,255,0.82)",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Danh sách sinh viên</h2>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={openImportModal}
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)",
                  color: "#fff",
                  borderRadius: 14,
                  padding: "12px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 12px 24px rgba(245, 158, 11, 0.22)",
                }}
              >
                Thêm sinh viên
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo mã SV, tên, email, ngành..."
              style={{
                flex: 1,
                minHeight: 46,
                borderRadius: 14,
                border: "1px solid #d7e0ea",
                padding: "0 16px",
                fontSize: 14,
                background: "#fdfefe",
                outline: "none",
                boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.02)",
              }}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1000,
                background: "#fff",
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "#f7fafc", textAlign: "left" }}>
                  {[
                    "Mã SV",
                    "Họ tên",
                    "Email",
                    "SĐT",
                    "Giới tính",
                    "Ngày sinh",
                    "Chuyên ngành",
                    "Trạng thái",
                    "Phụ huynh",
                  ].map((head) => (
                    <th
                      key={head}
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid #e2e8f0",
                        color: "#475569",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>{renderStudentRows()}</tbody>
            </table>
          </div>

          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
          >
            <Pagination
              current={currentPage}
              total={filteredStudents.length}
              pageSize={pageSize}
              showSizeChanger
              pageSizeOptions={["5", "10", "20", "50"]}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          </div>
        </section>
      </main>

      {selectedParent && (
        <ParentModal
          parent={selectedParent}
          onClose={() => setSelectedParent(null)}
        />
      )}

      {isImportModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={closeImportModal}
        >
          <div
            style={{
              width: 560,
              maxWidth: "100%",
              background: "#fff",
              borderRadius: 24,
              padding: 24,
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.28)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "start",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 24 }}>Thêm sinh viên</h2>
                <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                  Chọn file Excel rồi bấm OK để import vào hệ thống.
                </p>
              </div>

              <button
                type="button"
                onClick={closeImportModal}
                disabled={importing}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: "none",
                  background: "#e2e8f0",
                  color: "#0f172a",
                  fontSize: 18,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginTop: 22 }}>
              <label
                htmlFor="excel-file-input"
                style={{
                  display: "block",
                  border: "2px dashed #cbd5e1",
                  borderRadius: 20,
                  padding: 22,
                  background: "#f8fafc",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}
                >
                  Thêm file Excel
                </div>
                <div style={{ marginTop: 8, color: "#64748b", fontSize: 14 }}>
                  Hỗ trợ .xlsx, .xls, .csv
                </div>
                <div
                  style={{
                    marginTop: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#2563eb",
                    fontWeight: 700,
                  }}
                >
                  Chọn file
                </div>
              </label>

              <input
                id="excel-file-input"
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFilePick}
                style={{ display: "none" }}
              />

              <div
                style={{
                  marginTop: 14,
                  minHeight: 46,
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  padding: "0 16px",
                  display: "flex",
                  alignItems: "center",
                  color: selectedFile ? "#0f172a" : "#64748b",
                  background: "#fff",
                }}
              >
                {selectedFile ? selectedFile.name : "Chưa chọn file Excel"}
              </div>

              {importError && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {importError}
                </div>
              )}

              {importErrors.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    maxHeight: 220,
                    overflowY: "auto",
                    borderRadius: 14,
                    border: "1px solid #fecaca",
                    background: "#fff7f7",
                    padding: 12,
                  }}
                >
                  {importErrors.map((err, index) => (
                    <div
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr",
                        gap: 10,
                        padding: "10px 8px",
                        borderBottom:
                          index === importErrors.length - 1
                            ? "none"
                            : "1px solid #fee2e2",
                        color: "#7f1d1d",
                        fontSize: 14,
                      }}
                    >
                      <strong>Dòng {err.row}</strong>

                      <span>
                        <b>{err.column}</b>: {err.reason}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 24,
              }}
            >
              <button
                type="button"
                onClick={closeImportModal}
                disabled={importing}
                style={{
                  minWidth: 110,
                  height: 46,
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  color: "#0f172a",
                  fontWeight: 800,
                  cursor: importing ? "not-allowed" : "pointer",
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing}
                style={{
                  minWidth: 120,
                  height: 46,
                  borderRadius: 14,
                  border: "none",
                  background: importing ? "#93c5fd" : "#2563eb",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: importing ? "not-allowed" : "pointer",
                }}
              >
                {importing ? "Đang import..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tdStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #eef2f7",
  color: "#334155",
  verticalAlign: "middle",
};

function SummaryCard({ title, value }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.96) 100%)",
        borderRadius: 20,
        padding: "20px 22px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
      }}
    >
      <div style={{ color: "#64748b", fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800 }}>
        {value}
      </div>
    </div>
  );
}

function ParentModal({ parent, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: 460,
          maxWidth: "90vw",
          background: "#fff",
          borderRadius: 22,
          padding: 24,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Thông tin phụ huynh</h2>

        <InfoRow label="Họ tên" value={parent.fullName || "Chưa có"} />
        <InfoRow label="Tài khoản" value={parent.username || "Chưa có"} />
        <InfoRow label="Số điện thoại" value={parent.phone || "Chưa có"} />
        <button
          onClick={onClose}
          style={{
            marginTop: 20,
            width: "100%",
            height: 44,
            border: "none",
            borderRadius: 12,
            background: "#0f172a",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #e2e8f0",
        gap: 12,
        alignItems: "center",
      }}
    >
      <strong>{label}</strong>
      <span style={{ color: "#475569", textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default StudentManagement;
