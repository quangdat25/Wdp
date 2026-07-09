import React, { useState } from "react";
import { FaSearch, FaShieldAlt } from "react-icons/fa";
import { searchStudents } from "../../../api/studentService";
import { showError, showWarning } from "../../../components/Alert";

function SearchStudentTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      showWarning("Vui lòng nhập ít nhất 2 ký tự để tìm kiếm");
      return;
    }

    try {
      setLoading(true);
      setSelectedStudent(null);
      const res = await searchStudents(q);

      if (res.success) {
        setResults(res.data || []);
        setHasSearched(true);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Có lỗi xảy ra khi tìm kiếm sinh viên!");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Ô tìm kiếm */}
      <div
        style={{
          background: "#FFFFFF",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <h4
          style={{
            margin: "0 0 12px 0",
            color: "#64748B",
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          <FaSearch style={{ marginRight: 8 }} />
          Tra cứu học vụ & chỉ số uy tín (CFD Profile)
        </h4>
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            placeholder="Nhập MSSV, họ tên hoặc SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #CBD5E1",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              background: loading ? "#94A3B8" : "#0A4E9B",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading ? "Đang tìm..." : <><FaSearch /> Tìm kiếm</>}
          </button>
        </div>
      </div>

      {/* Danh sách kết quả */}
      {hasSearched && (
        <div
          style={{
            background: "#FFFFFF",
            padding: 24,
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h5 style={{ margin: 0, color: "#334155", fontSize: 14, fontWeight: 700 }}>
              Kết quả ({results.length})
            </h5>
          </div>

          {results.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#94A3B8",
                fontSize: 14,
              }}
            >
              Không tìm thấy sinh viên phù hợp
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.map((student) => (
                <div
                  key={student._id}
                  onClick={() => setSelectedStudent(student)}
                  style={{
                    padding: "14px 18px",
                    borderRadius: 10,
                    border:
                      selectedStudent?._id === student._id
                        ? "2px solid #0A4E9B"
                        : "1px solid #E2E8F0",
                    background:
                      selectedStudent?._id === student._id
                        ? "#F0F7FF"
                        : "#FAFBFC",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.15s",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 14 }}>
                      {student.fullName}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                        marginTop: 3,
                        fontFamily: "monospace",
                      }}
                    >
                      {student.studentCode}
                      {student.buildingId
                        ? ` • Phòng ${student.roomId?.displayName || student.roomId?.roomNumber || "?"} - Tòa ${student.buildingId.name}`
                        : " • Chưa phân phòng"}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      background: student.isSameBuilding ? "#D1FAE5" : "#FEF3C7",
                      color: student.isSameBuilding ? "#065F46" : "#92400E",
                    }}
                  >
                    {student.isSameBuilding ? "Cùng tòa" : "Khác tòa"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Panel chi tiết sinh viên */}
      {selectedStudent ? (
        <div
          style={{
            background: "#FFFFFF",
            padding: 28,
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Header: tên + CFD */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1px solid #F1F5F9",
              paddingBottom: 16,
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: "#0F172A" }}>
                {selectedStudent.fullName}
              </h2>
              <span
                style={{ fontSize: 14, color: "#64748B" }}
              >
                Mã sinh viên: <strong>{selectedStudent.studentCode}</strong>
                {selectedStudent.buildingId
                  ? ` | Phòng: ${selectedStudent.roomId?.displayName || selectedStudent.roomId?.roomNumber || "?"} - Tòa ${selectedStudent.buildingId.name}`
                  : " | Chưa phân phòng"}
                {selectedStudent.bedNumber
                  ? ` | Giường ${selectedStudent.bedNumber}`
                  : ""}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748B",
                }}
              >
                ĐIỂM CFD UY TÍN
              </div>
              {selectedStudent.isSameBuilding ? (
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color:
                      selectedStudent.CFDScore >= 80
                        ? "#10B981"
                        : selectedStudent.CFDScore >= 50
                        ? "#F59E0B"
                        : "#EF4444",
                  }}
                >
                  {selectedStudent.CFDScore} / 100
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#94A3B8",
                    marginTop: 6,
                  }}
                >
                  🔒 Không có quyền xem
                </div>
              )}
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            <div>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  color: "#0A4E9B",
                  fontSize: 14,
                }}
              >
                Thông tin liên hệ
              </h4>
              <p style={{ margin: "6px 0", fontSize: 14 }}>
                Số điện thoại:{" "}
                <strong>
                  {selectedStudent.isSameBuilding
                    ? selectedStudent.phone || "Chưa cập nhật"
                    : (selectedStudent.phone || "") + " 🔒"}
                </strong>
              </p>
              <p style={{ margin: "6px 0", fontSize: 14 }}>
                Email:{" "}
                <strong>
                  {selectedStudent.isSameBuilding
                    ? selectedStudent.email
                    : (selectedStudent.email || "") + " 🔒"}
                </strong>
              </p>
            </div>
            <div>
              <h4
                style={{
                  margin: "0 0 12px 0",
                  color: "#0A4E9B",
                  fontSize: 14,
                }}
              >
                Người bảo hộ / Phụ huynh
              </h4>
              {selectedStudent.isSameBuilding ? (
                <>
                  <p style={{ margin: "6px 0", fontSize: 14 }}>
                    Họ tên:{" "}
                    <strong>
                      {selectedStudent.parent?.fullName || "Chưa cập nhật"}
                    </strong>
                  </p>
                  <p style={{ margin: "6px 0", fontSize: 14 }}>
                    SĐT liên hệ:{" "}
                    <strong>
                      {selectedStudent.parent?.phone || "Chưa cập nhật"}
                    </strong>
                  </p>
                </>
              ) : (
                <p
                  style={{
                    margin: "6px 0",
                    fontSize: 14,
                    color: "#94A3B8",
                    fontStyle: "italic",
                  }}
                >
                  🔒 Thuộc tòa khác — không có quyền xem
                </p>
              )}
            </div>
          </div>

          {/* Lịch sử vi phạm */}
          <div>
            <h4
              style={{
                margin: "0 0 12px 0",
                color: "#0A4E9B",
                fontSize: 14,
              }}
            >
              <FaShieldAlt
                style={{ marginRight: 6, fontSize: 13 }}
              />
              Lịch sử vi phạm nội quy
            </h4>
            {selectedStudent.isSameBuilding ? (
              selectedStudent.violations &&
              selectedStudent.violations.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {selectedStudent.violations.map((v) => (
                    <div
                      key={v._id}
                      style={{
                        border: "1px solid #F1F5F9",
                        padding: 12,
                        borderRadius: 8,
                        background: "#F8FAFC",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong
                          style={{ fontSize: 13, color: "#EF4444" }}
                        >
                          [{v.location}]
                        </strong>{" "}
                        — Ngày:{" "}
                        {v.createdAt
                          ? new Date(v.createdAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 12,
                            color: "#64748B",
                          }}
                        >
                          {v.reason}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#DC2626",
                        }}
                      >
                        -{v.pointsDeducted} CFD
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    color: "#10B981",
                    fontWeight: 600,
                    fontStyle: "italic",
                    fontSize: 13,
                  }}
                >
                  Không có tiền lệ vi phạm. Sinh viên gương mẫu!
                </div>
              )
            ) : (
              <p
                style={{
                  margin: "6px 0",
                  fontSize: 14,
                  color: "#94A3B8",
                  fontStyle: "italic",
                }}
              >
                🔒 Thuộc tòa khác — không có quyền xem
              </p>
            )}
          </div>
        </div>
      ) : hasSearched ? (
        <div
          style={{
            border: "2px dashed #CBD5E1",
            borderRadius: 16,
            padding: 48,
            textAlign: "center",
            color: "#64748B",
          }}
        >
          {results.length > 0
            ? "Nhấn vào một sinh viên trong danh sách để xem chi tiết"
            : ""}
        </div>
      ) : (
        <div
          style={{
            border: "2px dashed #CBD5E1",
            borderRadius: 16,
            padding: 48,
            textAlign: "center",
            color: "#64748B",
          }}
        >
          Nhập MSSV, họ tên hoặc SĐT để tìm kiếm sinh viên
        </div>
      )}
    </div>
  );
}

export default SearchStudentTab;
