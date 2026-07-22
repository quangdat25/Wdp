import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import Sidebar from "../../../components/Sidebar";
import { showConfirm, showError, showSuccess } from "../../../components/alert";
import {
  getCheckInOutBookings,
  checkInBooking,
  checkOutBooking,
} from "../../../api/checkInOutService";

const statusColors = {
  confirmed: {
    background: "#dbeafe",
    color: "#1d4ed8",
    label: "Chờ check-in",
  },
  checked_in: {
    background: "#dcfce7",
    color: "#166534",
    label: "Đang ở",
  },
  checked_out: {
    background: "#f1f5f9",
    color: "#475569",
    label: "Đã check-out",
  },
};

const statusOptions = [
  {
    value: "",
    label: "Tất cả",
  },
  {
    value: "confirmed",
    label: "Chờ check-in",
  },
  {
    value: "checked_in",
    label: "Chờ check-out",
  },
];

function CheckInOutManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const getResponseData = (response) => {
    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await getCheckInOutBookings(statusFilter);

      setBookings(getResponseData(response));
    } catch (error) {
      console.error("GET SECURITY BOOKINGS ERROR:", error);

      showError(
        error?.response?.data?.message ||
          "Lỗi khi tải danh sách check-in/check-out",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const filteredBookings = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return bookings.filter((booking) => {
      const student = booking.studentId || {};
      const room = booking.roomId || {};

      // Backend của bảo vệ populate buildingId
      const building = room.buildingId || room.building || {};

      if (!keyword) {
        return true;
      }

      return [
        student.studentCode,
        student.fullName,
        student.fullname,
        student.email,
        student.phone,
        room.displayName,
        room.roomNumber,
        building.name,
        building.buildingName,
        booking.semester,
        booking.bedNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [bookings, searchText]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredBookings.slice(start, start + pageSize);
  }, [currentPage, pageSize, filteredBookings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: bookings.length,
      waitingCheckIn: bookings.filter(
        (booking) => booking.status === "confirmed",
      ).length,
      waitingCheckOut: bookings.filter(
        (booking) => booking.status === "checked_in",
      ).length,
    };
  }, [bookings]);

  const handleCheckIn = async (booking) => {
    const student = booking.studentId || {};

    const studentName =
      student.fullName ||
      student.fullname ||
      student.studentCode ||
      "sinh viên";

    const confirmed = await showConfirm(
      "Xác nhận check-in?",
      `Bạn có chắc muốn check-in cho sinh viên ${studentName}?`,
      "Check-in",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(booking._id);

      await checkInBooking(booking._id);

      showSuccess("Check-in cho sinh viên thành công");

      setSelectedBooking(null);
      await fetchBookings();
    } catch (error) {
      console.error("CHECK-IN ERROR:", error);

      showError(error?.response?.data?.message || "Check-in không thành công");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCheckOut = async (booking) => {
    const student = booking.studentId || {};

    const studentName =
      student.fullName ||
      student.fullname ||
      student.studentCode ||
      "sinh viên";

    const confirmed = await showConfirm(
      "Xác nhận check-out?",
      `Bạn có chắc muốn check-out cho sinh viên ${studentName}?`,
      "Check-out",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(booking._id);

      await checkOutBooking(booking._id);

      showSuccess("Check-out cho sinh viên thành công");

      setSelectedBooking(null);
      await fetchBookings();
    } catch (error) {
      console.error("CHECK-OUT ERROR:", error);

      showError(error?.response?.data?.message || "Check-out không thành công");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderActionButton = (booking) => {
    const isProcessing = actionLoadingId === booking._id;

    if (booking.status === "confirmed") {
      return (
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleCheckIn(booking)}
          style={{
            ...checkInButtonStyle,
            opacity: isProcessing ? 0.65 : 1,
            cursor: isProcessing ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing ? "Đang xử lý..." : "Check-in"}
        </button>
      );
    }

    if (booking.status === "checked_in") {
      return (
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => handleCheckOut(booking)}
          style={{
            ...checkOutButtonStyle,
            opacity: isProcessing ? 0.65 : 1,
            cursor: isProcessing ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing ? "Đang xử lý..." : "Check-out"}
        </button>
      );
    }

    return <span style={{ color: "#64748b" }}>Đã xử lý</span>;
  };

  const renderBookingRows = () => {
    if (loading) {
      return (
        <tr>
          <td
            colSpan="9"
            style={{
              padding: 24,
              textAlign: "center",
            }}
          >
            Đang tải dữ liệu...
          </td>
        </tr>
      );
    }

    if (paginatedBookings.length === 0) {
      return (
        <tr>
          <td
            colSpan="9"
            style={{
              padding: 24,
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Không có booking phù hợp
          </td>
        </tr>
      );
    }

    return paginatedBookings.map((booking) => {
      const student = booking.studentId || {};
      const room = booking.roomId || {};

      const building = room.buildingId || room.building || {};

      const badge = statusColors[booking.status] || statusColors.confirmed;

      return (
        <tr key={booking._id}>
          <td style={tdStyle}>
            <div
              style={{
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              {student.studentCode || "N/A"}
            </div>

            <div
              style={{
                marginTop: 4,
                color: "#64748b",
                fontSize: 13,
              }}
            >
              {student.fullName || student.fullname || "Không có tên"}
            </div>
          </td>

          <td style={tdStyle}>
            <div style={{ fontWeight: 700 }}>
              {room.displayName || room.roomNumber || "N/A"}
            </div>

            <div
              style={{
                marginTop: 4,
                color: "#64748b",
                fontSize: 13,
              }}
            >
              {building.name || building.buildingName || "Chưa có tòa"}
            </div>
          </td>

          <td style={tdStyle}>Giường {booking.bedNumber || "N/A"}</td>

          <td style={tdStyle}>{booking.semester || "N/A"}</td>

          <td style={tdStyle}>{formatDate(booking.startDate)}</td>

          <td style={tdStyle}>{formatDate(booking.endDate)}</td>

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
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {badge.label}
            </span>
          </td>

          <td style={tdStyle}>{renderActionButton(booking)}</td>

          <td style={tdStyle}>
            <button
              type="button"
              onClick={() => setSelectedBooking(booking)}
              style={detailButtonStyle}
            >
              Chi tiết
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #f3f8f6 100%)",
      }}
    >
      <Sidebar />

      <main
        style={{
          marginLeft: "270px",
          width: "calc(100% - 270px)",
          padding: "24px 28px 32px",
          minHeight: "100vh",
        }}
      >
        <div style={pageHeaderStyle}>
          <div>
            <h1
              style={{
                fontSize: 34,
                color: "#1e4f8f",
                margin: 0,
              }}
            >
              Check-in / Check-out
            </h1>

            <p
              style={{
                color: "#64748b",
                marginBottom: 0,
              }}
            >
              Quản lý sinh viên ra vào tòa nhà bạn phụ trách.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchBookings}
            disabled={loading}
            style={refreshButtonStyle}
          >
            {loading ? "Đang tải..." : "Làm mới"}
          </button>
        </div>

        <section style={summaryGridStyle}>
          <SummaryCard title="Tổng cần xử lý" value={summary.total} />

          <SummaryCard title="Chờ check-in" value={summary.waitingCheckIn} />

          <SummaryCard title="Chờ check-out" value={summary.waitingCheckOut} />
        </section>

        <section style={contentCardStyle}>
          <div
            style={{
              marginBottom: 18,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
              }}
            >
              Danh sách sinh viên
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
              }}
            >
              Có {filteredBookings.length} kết quả phù hợp
            </p>
          </div>

          <div style={filterGridStyle}>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm mã SV, họ tên, phòng, tòa nhà..."
              style={inputStyle}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              style={inputStyle}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr
                  style={{
                    background: "#f7fafc",
                    textAlign: "left",
                  }}
                >
                  {[
                    "Sinh viên",
                    "Phòng",
                    "Giường",
                    "Kỳ",
                    "Ngày bắt đầu",
                    "Ngày kết thúc",
                    "Trạng thái",
                    "Xử lý",
                    "Chi tiết",
                  ].map((head) => (
                    <th key={head} style={thStyle}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>{renderBookingRows()}</tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <Pagination
              current={currentPage}
              total={filteredBookings.length}
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

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          actionLoadingId={actionLoadingId}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

function BookingDetailModal({
  booking,
  actionLoadingId,
  onCheckIn,
  onCheckOut,
  onClose,
}) {
  const student = booking.studentId || {};
  const room = booking.roomId || {};

  const building = room.buildingId || room.building || {};

  const badge = statusColors[booking.status] || statusColors.confirmed;

  const isProcessing = actionLoadingId === booking._id;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
              }}
            >
              Chi tiết check-in/check-out
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
              }}
            >
              Kiểm tra thông tin trước khi xác nhận
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={modalInfoGridStyle}>
          <InfoBox title="Sinh viên">
            <InfoRow
              label="Mã sinh viên"
              value={student.studentCode || "N/A"}
            />

            <InfoRow
              label="Họ tên"
              value={student.fullName || student.fullname || "N/A"}
            />

            <InfoRow label="Email" value={student.email || "Chưa có"} />

            <InfoRow label="Số điện thoại" value={student.phone || "Chưa có"} />
          </InfoBox>

          <InfoBox title="Phòng ở">
            <InfoRow
              label="Tòa nhà"
              value={building.name || building.buildingName || "N/A"}
            />

            <InfoRow
              label="Phòng"
              value={room.displayName || room.roomNumber || "N/A"}
            />

            <InfoRow label="Tầng" value={room.floor || "N/A"} />

            <InfoRow label="Giường" value={booking.bedNumber || "N/A"} />
          </InfoBox>
        </div>

        <div style={{ marginTop: 16 }}>
          <InfoBox title="Thông tin booking">
            <InfoRow label="Học kỳ" value={booking.semester || "N/A"} />

            <InfoRow
              label="Ngày bắt đầu"
              value={formatDate(booking.startDate)}
            />

            <InfoRow
              label="Ngày kết thúc"
              value={formatDate(booking.endDate)}
            />

            <InfoRow
              label="Ngày check-in"
              value={formatDateTime(booking.checkedInAt || booking.checkInDate)}
            />

            <InfoRow
              label="Ngày check-out"
              value={formatDateTime(
                booking.checkedOutAt || booking.checkOutDate,
              )}
            />

            <InfoRow label="Trạng thái" value={badge.label} />
          </InfoBox>
        </div>

        <div style={modalActionStyle}>
          <button type="button" onClick={onClose} style={cancelButtonStyle}>
            Đóng
          </button>

          {booking.status === "confirmed" && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onCheckIn(booking)}
              style={checkInButtonStyle}
            >
              {isProcessing ? "Đang xử lý..." : "Xác nhận check-in"}
            </button>
          )}

          {booking.status === "checked_in" && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onCheckOut(booking)}
              style={checkOutButtonStyle}
            >
              {isProcessing ? "Đang xử lý..." : "Xác nhận check-out"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCardStyle}>
      <div
        style={{
          color: "#64748b",
          fontWeight: 700,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 30,
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoBox({ title, children }) {
  return (
    <div style={infoBoxStyle}>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 17,
        }}
      >
        {title}
      </h3>

      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={infoRowStyle}>
      <strong>{label}</strong>

      <span
        style={{
          color: "#475569",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "Chưa có";

  return new Date(date).toLocaleDateString("vi-VN");
}

function formatDateTime(date) {
  if (!date) return "Chưa có";

  return new Date(date).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const pageHeaderStyle = {
  marginBottom: 24,
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: 24,
  padding: "22px 24px",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const summaryCardStyle = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.96) 100%)",
  borderRadius: 20,
  padding: "20px 22px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  border: "1px solid rgba(148, 163, 184, 0.15)",
};

const contentCardStyle = {
  background: "rgba(255,255,255,0.82)",
  borderRadius: 24,
  padding: 22,
  boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
  border: "1px solid rgba(148, 163, 184, 0.15)",
};

const filterGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 220px",
  gap: 12,
  marginBottom: 18,
};

const inputStyle = {
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid #d7e0ea",
  padding: "0 16px",
  fontSize: 14,
  background: "#fdfefe",
  outline: "none",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1100,
  background: "#fff",
  borderRadius: 18,
  overflow: "hidden",
};

const thStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontSize: 14,
  fontWeight: 800,
};

const tdStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #eef2f7",
  color: "#334155",
  verticalAlign: "middle",
};

const detailButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
  color: "#fff",
  padding: "9px 14px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const checkInButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
  color: "#fff",
  padding: "10px 15px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const checkOutButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
  color: "#fff",
  padding: "10px 15px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const refreshButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  display: "grid",
  placeItems: "center",
  zIndex: 1000,
  padding: 20,
};

const modalCardStyle = {
  width: 860,
  maxWidth: "96vw",
  maxHeight: "92vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 24px 80px rgba(15, 23, 42, 0.28)",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "start",
};

const modalInfoGridStyle = {
  marginTop: 20,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const modalActionStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 20,
};

const closeButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: 999,
  border: "none",
  background: "#e2e8f0",
  color: "#0f172a",
  fontSize: 18,
  cursor: "pointer",
};

const cancelButtonStyle = {
  border: "none",
  background: "#e2e8f0",
  color: "#0f172a",
  padding: "10px 18px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const infoBoxStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 16,
  background: "#f8fafc",
};

const infoRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px solid #e2e8f0",
  gap: 12,
  alignItems: "center",
};

export default CheckInOutManagement;
