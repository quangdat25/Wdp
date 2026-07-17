import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import bookingService from "../../api/bookingService";

const OrderManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingService.getAllBookings();
        if (response.success) {
          setBookings(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách booking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusTag = (status) => {
    switch (status) {
      case "pending":
        return <span style={{ padding: "6px 12px", borderRadius: "12px", background: "#fef3c7", color: "#d97706", fontWeight: "700", fontSize: "13px", display: "inline-block" }}>Chưa thanh toán</span>;
      case "confirmed":
        return <span style={{ padding: "6px 12px", borderRadius: "12px", background: "#d1fae5", color: "#059669", fontWeight: "700", fontSize: "13px", display: "inline-block" }}>Đã thanh toán</span>;
      case "checked_in":
        return <span style={{ padding: "6px 12px", borderRadius: "12px", background: "#dbeafe", color: "#2563eb", fontWeight: "700", fontSize: "13px", display: "inline-block" }}>Đang ở</span>;
      case "checked_out":
        return <span style={{ padding: "6px 12px", borderRadius: "12px", background: "#f3f4f6", color: "#4b5563", fontWeight: "700", fontSize: "13px", display: "inline-block" }}>Đã trả phòng</span>;
      case "cancelled":
        return <span style={{ padding: "6px 12px", borderRadius: "12px", background: "#fee2e2", color: "#dc2626", fontWeight: "700", fontSize: "13px", display: "inline-block" }}>Đã hủy</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 270, padding: "32px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, color: "#0f172a", fontWeight: 800 }}>Quản lý Đơn đặt phòng</h1>
            <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 15 }}>Theo dõi và quản lý thông tin đặt phòng của sinh viên</p>
          </div>
        </div>

        <div style={{
          background: "#fff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 40px rgba(15, 23, 42, 0.04)",
          border: "1px solid rgba(148, 163, 184, 0.1)",
          overflowX: "auto"
        }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "16px" }}>Đang tải dữ liệu...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "18px 16px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #e2e8f0", borderTopLeftRadius: "12px" }}>Tên sinh viên</th>
                  <th style={{ padding: "18px 16px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #e2e8f0" }}>Mã SV</th>
                  <th style={{ padding: "18px 16px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #e2e8f0" }}>SĐT</th>
                  <th style={{ padding: "18px 16px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #e2e8f0" }}>Phòng đang ở</th>
                  <th style={{ padding: "18px 16px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #e2e8f0" }}>Phòng đăng ký</th>
                  <th style={{ padding: "18px 16px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #e2e8f0" }}>Kỳ học</th>
                  <th style={{ padding: "18px 16px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #e2e8f0" }}>Ngày book</th>
                  <th style={{ padding: "18px 16px", textAlign: "center", color: "#475569", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #e2e8f0", borderTopRightRadius: "12px" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id} style={{ borderBottom: "1px solid #f1f5f9", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                    <td style={{ padding: "18px 16px", color: "#0f172a", fontWeight: 600 }}>{booking.studentId?.fullName || "N/A"}</td>
                    <td style={{ padding: "18px 16px", color: "#64748b", fontWeight: 500 }}>{booking.studentId?.studentCode || "N/A"}</td>
                    <td style={{ padding: "18px 16px", color: "#64748b", fontWeight: 500 }}>{booking.studentId?.phone || "N/A"}</td>
                    <td style={{ padding: "18px 16px", color: "#0f172a", fontWeight: 600 }}>
                      {booking.studentId?.roomId ? (
                        <span>{booking.studentId.roomId.displayName || booking.studentId.roomId.roomNumber} <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>({booking.studentId.roomId.building?.name})</span></span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td style={{ padding: "18px 16px", color: "#0f172a", fontWeight: 600 }}>
                      {booking.roomId ? (
                        <span>{booking.roomId.displayName || booking.roomId.roomNumber} <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>({booking.roomId.building?.name})</span></span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td style={{ padding: "18px 16px", color: "#64748b", fontWeight: 500 }}>{booking.semester}</td>
                    <td style={{ padding: "18px 16px", color: "#64748b", fontWeight: 500 }}>{new Date(booking.createdAt || booking.startDate).toLocaleString("vi-VN")}</td>
                    <td style={{ padding: "18px 16px", textAlign: "center" }}>{getStatusTag(booking.status)}</td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "15px" }}>
                      Không có đơn đặt phòng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;