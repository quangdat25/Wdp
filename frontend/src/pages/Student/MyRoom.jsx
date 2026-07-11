import React, { useEffect, useState } from "react";
import bookingService from "../../api/bookingService";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";

const MyRoom = () => {
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoommates, setShowRoommates] = useState(false);

  useEffect(() => {
    const fetchMyRoom = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getMyBooking();
        if (res.success && res.data) {
          setBookingInfo(res.data);
        } else {
          setError(res.message || "Bạn chưa có thông tin phòng.");
        }
      } catch (err) {
        setError("Lỗi khi lấy thông tin phòng.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyRoom();
  }, []);

  if (loading) {
    return <div style={styles.center}>Đang tải dữ liệu...</div>;
  }

  if (error || !bookingInfo) {
    return (
      <div style={styles.center}>
        <h3>{error || "Bạn hiện tại chưa có phòng nào."}</h3>
      </div>
    );
  }

  const { semester, roomId, myBedNumber, endDate } = bookingInfo;
  const buildingName = roomId?.building?.name || "N/A";
  const roomName = roomId?.displayName || "N/A";
  const roomPrice = roomId?.price || 2000000;

  // Xử lý hiển thị Semester (Spring -> 1, Summer -> 2, Fall -> 3)
  let semNum = "N/A";
  const semStr = semester || "";
  if (semStr.toLowerCase().includes("spring")) semNum = 1;
  else if (semStr.toLowerCase().includes("summer")) semNum = 2;
  else if (semStr.toLowerCase().includes("fall")) semNum = 3;

  const yearMatch = semStr.match(/\d{4}/);
  const semYear = yearMatch ? yearMatch[0] : new Date().getFullYear();

  // Xử lý hiển thị Check-out Date
  const formatCheckoutDate = (dateString) => {
    if (!dateString) return "Keep current bed";
    const d = new Date(dateString);
    if (isNaN(d)) return "Keep current bed";
    return d.toLocaleDateString("vi-VN");
  };

  // Lấy danh sách bạn cùng phòng (trừ mình ra)
  const roommates =
    roomId?.students?.filter((s) => s.bedNumber !== myBedNumber) || [];

  return (
    <div className="student-shell" style={{ display: "flex", height: "100vh", backgroundColor: "#f9fafb" }}>
      <Sidebar />
      <main className="student-main" style={{ flex: 1, overflowY: "auto" }}>
        <Header />
        <div style={styles.wrapper}>
          <h1 style={styles.pageTitle}>Room Histories</h1>
          <div style={styles.container}>
            <table style={styles.historyTable}>
              <thead>
                <tr>
                  <th style={styles.historyTh}>Student ID</th>
                  <th style={styles.historyTh}>Bed Information</th>
                  <th style={styles.historyTh}>Check-out Date</th>
                  <th style={styles.historyTh}>Price</th>
                  <th style={styles.historyTh}>Semester</th>
                  <th style={styles.historyTh}>Year</th>
                  <th style={styles.historyTh}></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.historyTd}>{JSON.parse(localStorage.getItem("user"))?.studentCode || "N/A"}</td>
                  <td style={styles.historyTd}>{buildingName}{roomName} - {myBedNumber}</td>
                  <td style={styles.historyTd}>{formatCheckoutDate(endDate)}</td>
                  <td style={styles.historyTd}>{roomPrice.toLocaleString("vi-VN")} VND</td>
                  <td style={styles.historyTd}>{semNum}</td>
                  <td style={styles.historyTd}>{semYear}</td>
                  <td style={styles.historyTd}>
                    <button
                      style={styles.roommateBtn}
                      onClick={() => setShowRoommates(true)}
                    >
                      Roommates
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Modal hiển thị Roommates */}
            {showRoommates && (
              <div style={styles.modalOverlay} onClick={() => setShowRoommates(false)}>
                <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.modalHeader}>
                    <h3 style={{ margin: 0 }}>Danh sách bạn cùng phòng</h3>
                    <button
                      style={styles.closeBtn}
                      onClick={() => setShowRoommates(false)}
                    >
                      &times;
                    </button>
                  </div>

                  {roommates.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "20px" }}>Hiện tại chưa có bạn cùng phòng nào.</p>
                  ) : (
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Giường</th>
                          <th style={styles.th}>MSSV</th>
                          <th style={styles.th}>Họ và tên</th>
                          <th style={styles.th}>SĐT</th>
                          <th style={styles.th}>Chuyên ngành</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roommates.map((r, idx) => (
                          <tr key={idx} style={styles.tr}>
                            <td style={styles.td}>{r.bedNumber}</td>
                            <td style={styles.td}>{r.student?.studentCode}</td>
                            <td style={styles.td}>{r.student?.fullName}</td>
                            <td style={styles.td}>{r.student?.phone || "N/A"}</td>
                            <td style={styles.td}>{r.student?.major || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Inline Styles (Gộp chung trong JSX theo yêu cầu)
const styles = {
  wrapper: {
    maxWidth: "1200px",
    margin: "20px auto 40px auto",
    padding: "0 24px",
  },
  pageTitle: {
    color: "#0052cc",
    fontSize: "50px",
    fontWeight: "bold",
    marginBottom: "24px",
    marginTop: "0",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    padding: "24px",
  },
  center: {
    padding: "40px",
    textAlign: "center",
    color: "#666",
  },
  historyTable: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
  },
  historyTh: {
    backgroundColor: "#ffffff",
    padding: "16px 12px",
    textAlign: "center",
    fontWeight: "700",
    color: "#0052cc", // Màu xanh dương giống ảnh mẫu
    borderBottom: "1px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  historyTd: {
    padding: "16px 12px",
    textAlign: "center",
    color: "#4b5563",
    borderRight: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  roommateBtn: {
    backgroundColor: "#16a34a", // Giữ nguyên nút màu xanh lá cây theo yêu cầu
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background-color 0.2s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    width: "700px",
    maxWidth: "90%",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "12px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f3f4f6",
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    borderBottom: "2px solid #e5e7eb",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "12px",
    color: "#4b5563",
  },
};

export default MyRoom;
