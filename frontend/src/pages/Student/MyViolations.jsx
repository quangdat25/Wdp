import { useState, useEffect, useMemo } from "react";
import { getViolations } from "../../api/violationService";
import { FaShieldAlt, FaFilter } from "react-icons/fa";
import { showSuccess, showError } from "../../components/Alert";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { Pagination } from "antd";

function MyViolations() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "student";
  const todayStr = new Date().toLocaleDateString("en-CA");

  // State filters & pagination
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true);
        const res = await getViolations();
        if (res.success) {
          let data = res.data || [];
          // Filter out PENDING and REJECTED so students/parents don't see unapproved violations
          data = data.filter(v => v.status === "APPROVED" || v.status === "REVOKED");
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setViolations(data);
        }
      } catch (error) {
        showError("Lỗi tải lịch sử trừ điểm");
      } finally {
        setLoading(false);
      }
    };
    fetchViolations();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="status-badge" style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}>Chờ duyệt</span>;
      case "APPROVED":
        return <span className="status-badge" style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}>Đã trừ điểm</span>;
      case "REJECTED":
        return <span className="status-badge" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>Từ chối</span>;
      case "REVOKED":
        return <span className="status-badge" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>Đã thu hồi (Hoàn điểm)</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const filteredViolations = useMemo(() => {
    if (!filterDate) return violations;
    return violations.filter(v => {
      // Create date format YYYY-MM-DD in local time
      const vDate = new Date(v.createdAt);
      const pad = (n) => String(n).padStart(2, "0");
      const localDateStr = `${vDate.getFullYear()}-${pad(vDate.getMonth() + 1)}-${pad(vDate.getDate())}`;
      return localDateStr === filterDate;
    });
  }, [violations, filterDate]);

  const paginatedViolations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredViolations.slice(start, start + pageSize);
  }, [filteredViolations, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [filterDate]);

  return (
    <div className={role === "parent" ? "parent-shell" : "student-shell"}>
      <Sidebar />
      <main className={role === "parent" ? "parent-main" : "student-main"}>
        <Header avatarText={role === "parent" ? "P" : undefined} />

        <div className={role === "parent" ? "parent-stack" : "student-stack"}>
          <div className={role === "parent" ? "parent-panel" : "student-panel"} style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                  background: role === "parent" ? "#dcfce7" : "#e0e7ff",
                  color: role === "parent" ? "#16a34a" : "#4f46e5",
                  fontSize: 20
                }}>
                  <FaShieldAlt />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, color: role === "parent" ? "#14532d" : "#0f1f35", fontWeight: 800 }}>
                    Lịch sử trừ điểm (Kỷ luật)
                  </h2>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: role === "parent" ? "#4b7a5e" : "#637386" }}>
                    Danh sách các biên bản vi phạm và lịch sử trừ điểm CFD của sinh viên.
                  </p>
                </div>
              </div>

              {/* Date Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <FaFilter color="#64748b" />
                <span style={{ fontSize: 14, color: "#475569", fontWeight: 600 }}>Lọc theo ngày:</span>
                <input 
                  type="date" 
                  value={filterDate}
                  max={todayStr}
                  onChange={(e) => setFilterDate(e.target.value)}
                  style={{
                    border: "none", outline: "none", background: "transparent", 
                    fontSize: 14, color: "#0f172a", fontFamily: "inherit"
                  }}
                />
                {filterDate && (
                  <button 
                    onClick={() => setFilterDate("")}
                    style={{ background: "none", border: "none", color: "#ef4444", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                  >
                    Xóa lọc
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={role === "parent" ? "parent-panel" : "student-panel"}>
            <div className="invoice-table-container">
              {loading ? (
                <p style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>Đang tải dữ liệu...</p>
              ) : filteredViolations.length === 0 ? (
                <p style={{ padding: 40, textAlign: "center", color: "#6b7280", fontWeight: 600 }}>Không có lịch sử vi phạm nào.</p>
              ) : (
                <>
                  <table className="invoice-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: role === "parent" ? "#f0faf4" : "#f8fafc", textAlign: "left" }}>
                        <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Ngày lập</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Lý do vi phạm</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Địa điểm</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb", textAlign: "center" }}>Điểm trừ</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e5e7eb" }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedViolations.map((v) => (
                        <tr key={v._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: 12 }}>{new Date(v.createdAt).toLocaleDateString("vi-VN")}</td>
                          <td style={{ padding: 12, maxWidth: 200 }}>
                            <div style={{ fontWeight: 600, color: "#1f2937" }}>{v.reason}</div>
                            {v.status === "REVOKED" && v.revokeReason && (
                              <div style={{ fontSize: 12, color: "#166534", marginTop: 4 }}>Lý do thu hồi: {v.revokeReason}</div>
                            )}
                          </td>
                          <td style={{ padding: 12, color: "#4b5563" }}>{v.location}</td>
                          <td style={{ padding: 12, textAlign: "center", fontWeight: "bold", color: v.status === "APPROVED" ? "#dc2626" : "#6b7280" }}>
                            {v.pointsDeducted ? `-${v.pointsDeducted}` : "-"}
                          </td>
                          <td style={{ padding: 12 }}>{getStatusBadge(v.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div style={{ padding: "20px", display: "flex", justifyContent: "center", borderTop: "1px solid #e5e7eb" }}>
                    <Pagination
                      current={currentPage}
                      pageSize={pageSize}
                      total={filteredViolations.length}
                      onChange={(page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                      }}
                      showSizeChanger
                      pageSizeOptions={["5", "10", "20", "50"]}
                      locale={{ items_per_page: "/ trang" }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MyViolations;
