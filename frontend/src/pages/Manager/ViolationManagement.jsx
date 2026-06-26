import React, { useState, useEffect } from "react";
import {
  getViolations,
  approveViolation,
  rejectViolation,
  revokeViolation,
} from "../../api/violationService";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { FaShieldAlt, FaCheck, FaTimes } from "react-icons/fa";
import { showSuccess, showError,showConfirm } from "../../components/alert";
import { socket } from "../../socket";

function ViolationManagement() {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [showModal, setShowModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [points, setPoints] = useState(5);
  const [revokeReason, setRevokeReason] = useState("");

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const res = await getViolations();
      if (res.success) {
        setViolations(res.data);
      }
    } catch (error) {
      showError("Lỗi tải danh sách vi phạm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();

    // Vẫn lắng nghe để cập nhật bảng, nhưng bỏ cái Toast đi vì Header.jsx đã lo
    const handleNewViolation = () => {
      fetchViolations();
    };

    socket.on("new_violation_created", handleNewViolation);

    return () => {
      socket.off("new_violation_created", handleNewViolation);
    };
  }, []);

  const handleApprove = async () => {
    if (!selectedViolation) return;
    try {
      await approveViolation(selectedViolation._id, Number(points));
      showSuccess("Duyệt thành công! Đã trừ điểm sinh viên.");
      setShowModal(false);
      fetchViolations();
    } catch (error) {
      showError(error.response?.data?.message || "Lỗi khi duyệt");
    }
  };

  const handleReject = async (id) => {
    const confirm = await showConfirm(
      "Từ chối yêu cầu?",
      "Bạn có chắc chắn muốn từ chối biên bản này không? Sinh viên sẽ không bị trừ điểm.",
      "Từ chối",
    );

    if (!confirm) return;
    try {
      await rejectViolation(id);
      showSuccess("Đã từ chối biên bản");
      fetchViolations();
    } catch (error) {
      showError(error.response?.data?.message || "Lỗi khi từ chối");
    }
  };

  const handleRevoke = async () => {
    if (!selectedViolation) return;
    if (!revokeReason.trim()) {
      showError("Vui lòng nhập lý do thu hồi");
      return;
    }
    try {
      await revokeViolation(selectedViolation._id, revokeReason);
      showSuccess("Đã thu hồi biên bản và hoàn lại điểm cho sinh viên");
      setShowRevokeModal(false);
      setRevokeReason("");
      fetchViolations();
    } catch (error) {
      showError(error.response?.data?.message || "Lỗi khi thu hồi");
    }
  };

  const filteredViolations = violations.filter((v) => v.status === activeTab);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F5F6F8",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Sidebar />
      <main
        style={{
          marginLeft: 270,
          flex: 1,
          padding: "24px 32px",
          height: "100vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <Header />

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {["PENDING", "APPROVED", "REJECTED", "REVOKED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === tab ? "#0A4E9B" : "#E2E8F0",
                color: activeTab === tab ? "#FFFFFF" : "#64748B",
                transition: "all 0.2s",
              }}
            >
              {tab === "PENDING"
                ? "Chờ xử lý"
                : tab === "APPROVED"
                  ? "Đã duyệt"
                  : tab === "REJECTED"
                    ? "Từ chối"
                    : "Đã thu hồi"}
            </button>
          ))}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
              Đang tải dữ liệu...
            </div>
          ) : filteredViolations.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>
              Không có dữ liệu trong mục này
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#F8FAFC",
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: 13,
                      color: "#64748B",
                      fontWeight: 700,
                    }}
                  >
                    SINH VIÊN
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: 13,
                      color: "#64748B",
                      fontWeight: 700,
                    }}
                  >
                    ĐỊA ĐIỂM
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: 13,
                      color: "#64748B",
                      fontWeight: 700,
                    }}
                  >
                    LÝ DO VI PHẠM
                  </th>
                  <th
                    style={{
                      padding: "16px 20px",
                      fontSize: 13,
                      color: "#64748B",
                      fontWeight: 700,
                    }}
                  >
                    NGƯỜI BÁO CÁO
                  </th>
                  {activeTab !== "PENDING" && (
                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        color: "#64748B",
                        fontWeight: 700,
                      }}
                    >
                      ĐIỂM TRỪ
                    </th>
                  )}
                  {activeTab === "REVOKED" && (
                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        color: "#64748B",
                        fontWeight: 700,
                      }}
                    >
                      LÝ DO THU HỒI
                    </th>
                  )}
                  {(activeTab === "PENDING" || activeTab === "APPROVED") && (
                    <th
                      style={{
                        padding: "16px 20px",
                        fontSize: 13,
                        color: "#64748B",
                        fontWeight: 700,
                        textAlign: "center",
                      }}
                    >
                      THAO TÁC
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredViolations.map((v) => (
                  <tr key={v._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 700, color: "#0F172A" }}>
                        {v.studentId?.fullName}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>
                        {v.studentId?.studentCode} - Phòng{" "}
                        {v.studentId?.roomId?.roomNumber || "N/A"}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 14 }}>
                      {v.location} (Tòa {v.buildingId?.name || "N/A"})
                    </td>
                    <td
                      style={{
                        padding: "16px 20px",
                        fontSize: 14,
                        maxWidth: 300,
                      }}
                    >
                      {v.reason}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 14 }}>
                      {v.securityId?.fullName}
                    </td>
                    {activeTab !== "PENDING" && (
                      <td
                        style={{
                          padding: "16px 20px",
                          fontSize: 14,
                          fontWeight: 700,
                          color:
                            v.status === "APPROVED" || v.status === "REVOKED"
                              ? "#EF4444"
                              : "#94A3B8",
                          textDecoration:
                            v.status === "REVOKED" ? "line-through" : "none",
                        }}
                      >
                        {v.status === "APPROVED" || v.status === "REVOKED"
                          ? `-${v.pointsDeducted}`
                          : "0"}
                      </td>
                    )}
                    {activeTab === "REVOKED" && (
                      <td
                        style={{
                          padding: "16px 20px",
                          fontSize: 14,
                          color: "#D97706",
                          maxWidth: 200,
                        }}
                      >
                        {v.revokeReason}
                      </td>
                    )}
                    {activeTab === "PENDING" && (
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <button
                          onClick={() => {
                            setSelectedViolation(v);
                            setShowModal(true);
                            setPoints(5);
                          }}
                          style={{
                            background: "#10B981",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: 6,
                            cursor: "pointer",
                            marginRight: 8,
                            fontWeight: 600,
                          }}
                        >
                          <FaCheck /> Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(v._id)}
                          style={{
                            background: "#FEE2E2",
                            color: "#DC2626",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          <FaTimes />
                        </button>
                      </td>
                    )}
                    {activeTab === "APPROVED" && (
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <button
                          onClick={() => {
                            setSelectedViolation(v);
                            setShowRevokeModal(true);
                            setRevokeReason("");
                          }}
                          style={{
                            background: "#F59E0B",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Thu hồi
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Duyệt */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                padding: 32,
                borderRadius: 16,
                width: 400,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 16px 0", color: "#0F172A" }}>
                Duyệt Biên Bản Vi Phạm
              </h3>
              <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>
                Sinh viên{" "}
                <strong>{selectedViolation?.studentId?.fullName}</strong> sẽ bị
                trừ điểm CFD và nhận được thông báo ngay lập tức.
              </p>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#64748B",
                    marginBottom: 8,
                  }}
                >
                  Số điểm CFD sẽ trừ
                </label>
                <input
                  type="number"
                  min="1"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 16,
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "#E2E8F0",
                    color: "#475569",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleApprove}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "#EF4444",
                    color: "white",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Trừ điểm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Thu Hồi */}
        {showRevokeModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "white",
                padding: 32,
                borderRadius: 16,
                width: 450,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 16px 0", color: "#0F172A" }}>
                Thu hồi Biên Bản
              </h3>
              <p style={{ fontSize: 14, color: "#475569", marginBottom: 20 }}>
                Sinh viên{" "}
                <strong>{selectedViolation?.studentId?.fullName}</strong> sẽ
                được hoàn lại{" "}
                <strong>{selectedViolation?.pointsDeducted}</strong> điểm CFD.
              </p>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#64748B",
                    marginBottom: 8,
                  }}
                >
                  Lý do thu hồi (Bắt buộc)
                </label>
                <textarea
                  rows="3"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Ví dụ: Xác minh qua camera thấy sinh viên bị mạo danh..."
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #CBD5E1",
                    fontSize: 14,
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}
              >
                <button
                  onClick={() => setShowRevokeModal(false)}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "#E2E8F0",
                    color: "#475569",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleRevoke}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "#F59E0B",
                    color: "white",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Xác nhận Thu hồi
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ViolationManagement;
