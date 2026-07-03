import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaClipboardList, FaUsers, FaDoorOpen, FaPlusCircle, FaSearch } from "react-icons/fa";
import { getSecurityStats } from "../../../api/violationService";
import { useNavigate } from "react-router-dom";

function OverviewTab() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getSecurityStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Fetch security stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statusLabel = (status) => {
    switch (status) {
      case "PENDING": return { text: "Chờ duyệt", bg: "#FEF3C7", color: "#92400E" };
      case "APPROVED": return { text: "Đã duyệt", bg: "#D1FAE5", color: "#065F46" };
      case "REJECTED": return { text: "Bị từ chối", bg: "#FEE2E2", color: "#991B1B" };
      case "REVOKED": return { text: "Đã thu hồi", bg: "#E2E8F0", color: "#475569" };
      default: return { text: status, bg: "#F1F5F9", color: "#475569" };
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              border: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                width: "40%",
                height: 16,
                background: "#E2E8F0",
                borderRadius: 4,
                marginBottom: 12,
              }}
            />
            <div
              style={{
                width: "25%",
                height: 32,
                background: "#E2E8F0",
                borderRadius: 4,
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Cảnh báo: bảo vệ chưa được gán tòa */}
      {stats?.hasBuilding === false && (
        <div
          style={{
            background: "#FEE2E2",
            borderRadius: 12,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #FCA5A5",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "#991B1B",
              fontWeight: 700,
            }}
          >
            <FaExclamationTriangle style={{ marginRight: 8 }} />
            Tài khoản chưa được gán tòa nhà. Vui lòng liên hệ Admin/Manager để được phân công trước khi sử dụng.
          </span>
        </div>
      )}

      {/* Cảnh báo: có biên bản chờ duyệt */}
      {(stats?.pendingViolations || 0) > 0 && (
        <div
          style={{
            background: "#FFEEC2",
            borderRadius: 12,
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #FFD085",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "#9E5700",
              fontWeight: 700,
            }}
          >
            <FaExclamationTriangle style={{ marginRight: 8 }} />
            Có {stats.pendingViolations} biên bản vi phạm đang chờ Manager duyệt
          </span>
        </div>
      )}

      {/* 4 card thống kê thật */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        {/* Biên bản hôm nay */}
        <div
          style={{
            background: "#FFFFFF",
            padding: "20px",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            border: "1px solid #E2E8F0",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748B",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaClipboardList style={{ color: "#EF4444" }} />
            BIÊN BẢN HÔM NAY
          </span>
          <h3
            style={{
              fontSize: 28,
              margin: "8px 0 0",
              color: "#EF4444",
              fontWeight: 800,
            }}
          >
            {stats?.violationsToday ?? 0}
          </h3>
        </div>

        {/* Chờ duyệt */}
        <div
          style={{
            background: "#FFFFFF",
            padding: "20px",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            border: "1px solid #E2E8F0",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748B",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaExclamationTriangle style={{ color: "#F59E0B" }} />
            CHỜ DUYỆT
          </span>
          <h3
            style={{
              fontSize: 28,
              margin: "8px 0 0",
              color: "#F59E0B",
              fontWeight: 800,
            }}
          >
            {stats?.pendingViolations ?? 0}
          </h3>
        </div>

        {/* Sinh viên trong tòa */}
        <div
          style={{
            background: "#FFFFFF",
            padding: "20px",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            border: "1px solid #E2E8F0",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748B",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaUsers style={{ color: "#0A4E9B" }} />
            SINH VIÊN TRONG TÒA
          </span>
          <h3
            style={{
              fontSize: 28,
              margin: "8px 0 0",
              color: "#0A4E9B",
              fontWeight: 800,
            }}
          >
            {stats?.studentCount ?? 0}
          </h3>
        </div>

        {/* Phòng trống */}
        <div
          style={{
            background: "#FFFFFF",
            padding: "20px",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            border: "1px solid #E2E8F0",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#64748B",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FaDoorOpen style={{ color: "#10B981" }} />
            PHÒNG CÒN TRỐNG
          </span>
          <h3
            style={{
              fontSize: 28,
              margin: "8px 0 0",
              color: "#10B981",
              fontWeight: 800,
            }}
          >
            {stats?.availableRooms ?? 0}
          </h3>
        </div>
      </div>



      {/* Nhật ký vi phạm gần nhất (data thật) */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 12,
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#0A4E9B",
            padding: "14px 20px",
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Nhật Ký Vi Phạm Gần Nhất</span>
          {(stats?.recentViolations || []).length > 0 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 400,
                opacity: 0.8,
              }}
            >
              5 bản gần nhất
            </span>
          )}
        </div>
        <div style={{ maxHeight: 340, overflowY: "auto" }}>
          {(stats?.recentViolations || []).length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#94A3B8",
                fontSize: 14,
              }}
            >
              Chưa có vi phạm nào được ghi nhận
            </div>
          ) : (
            stats.recentViolations.map((v) => {
              const st = statusLabel(v.status);
              return (
                <div
                  key={v._id}
                  style={{
                    padding: "16px 20px",
                    background: "#F8FAFC",
                    borderBottom: "1px solid #E2E8F0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div>
                      <strong style={{ color: "#EF4444" }}>
                        [{v.location}]
                      </strong>{" "}
                      - {v.studentId?.fullName || "N/A"}{" "}
                      <span style={{ fontFamily: "monospace", color: "#64748B", fontSize: 13 }}>
                        ({v.studentId?.studentCode || "?"})
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      {v.reason}
                      {" • "}
                      {v.createdAt
                        ? new Date(v.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#DC2626",
                        fontSize: 13,
                      }}
                    >
                      -{v.pointsDeducted} CFD
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 12,
                        fontSize: 11,
                        background: st.bg,
                        color: st.color,
                        fontWeight: 700,
                      }}
                    >
                      {st.text}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
