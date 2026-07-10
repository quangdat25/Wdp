import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import Sidebar from "../../components/Sidebar";
import { showError } from "../../components/alert";
import { getAllBookings } from "../../api/bookingService";

const statusColors = {
  pending: {
    background: "#fef3c7",
    color: "#92400e",
    label: "Chờ thanh toán",
  },
  confirmed: {
    background: "#dbeafe",
    color: "#1d4ed8",
    label: "Đã xác nhận",
  },
  checked_in: {
    background: "#dcfce7",
    color: "#166534",
    label: "Đang ở",
  },
  checked_out: {
    background: "#f1f5f9",
    color: "#475569",
    label: "Đã trả phòng",
  },
  cancelled: {
    background: "#fee2e2",
    color: "#b91c1c",
    label: "Đã hủy",
  },
};

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ thanh toán" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "checked_in", label: "Đang ở" },
  { value: "checked_out", label: "Đã trả phòng" },
  { value: "cancelled", label: "Đã hủy" },
];

function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await getAllBookings();

      console.log("BOOKING API RESPONSE:", res);

      setBookings(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      showError("Lỗi khi tải danh sách booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return bookings.filter((booking) => {
      const student = booking.studentId || {};
      const room = booking.roomId || {};
      const building = room.building || {};

      const matchStatus = statusFilter ? booking.status === statusFilter : true;

      const matchKeyword = keyword
        ? [
            student.studentCode,
            student.fullName,
            student.email,
            student.phone,
            room.displayName,
            room.roomNumber,
            building.name,
            booking.semester,
            booking.status,
            booking.bedNumber,
          ]
            .join(" ")
            .toLowerCase()
            .includes(keyword)
        : true;

      return matchStatus && matchKeyword;
    });
  }, [bookings, searchText, statusFilter]);

  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [currentPage, filteredBookings, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredBookings.length / pageSize),
    );

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredBookings.length, pageSize]);

  const summary = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((item) => item.status === "pending").length,
      confirmed: bookings.filter((item) => item.status === "confirmed").length,
      staying: bookings.filter((item) => item.status === "checked_in").length,
    };
  }, [bookings]);

  const renderBookingRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="9" style={{ padding: 20, textAlign: "center" }}>
            Đang tải dữ liệu...
          </td>
        </tr>
      );
    }

    if (paginatedBookings.length === 0) {
      return (
        <tr>
          <td colSpan="9" style={{ padding: 20, textAlign: "center" }}>
            Không có booking nào
          </td>
        </tr>
      );
    }

    return paginatedBookings.map((booking) => {
      const student = booking.studentId || {};
      const room = booking.roomId || {};
      const building = room.building || {};
      const badge = statusColors[booking.status] || statusColors.pending;

      return (
        <tr key={booking._id}>
          <td style={tdStyle}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>
              {student.studentCode || "N/A"}
            </div>
            <div style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>
              {student.fullName || "Không có tên"}
            </div>
          </td>

          <td style={tdStyle}>
            <div style={{ fontWeight: 700 }}>{room.displayName || "N/A"}</div>
            <div style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>
              {building.name || "Chưa có tòa"}
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
                lineHeight: 1,
              }}
            >
              {badge.label}
            </span>
          </td>

          <td style={tdStyle}>{formatDateTime(booking.createdAt)}</td>

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
            <h1 style={{ fontSize: 34, color: "#1e4f8f", margin: 0 }}>
              Quản lý booking
            </h1>
            <p style={{ color: "#64748b", marginBottom: 0 }}>
              Theo dõi toàn bộ đơn đặt phòng, trạng thái thanh toán và thông tin
              sinh viên.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchBookings}
            style={refreshButtonStyle}
          >
            Làm mới
          </button>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <SummaryCard title="Tổng booking" value={summary.total} />
          <SummaryCard title="Chờ thanh toán" value={summary.pending} />
          <SummaryCard title="Đã xác nhận" value={summary.confirmed} />
          <SummaryCard title="Đang ở" value={summary.staying} />
        </section>

        <section style={contentCardStyle}>
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
              <h2 style={{ margin: 0, fontSize: 22 }}>Danh sách booking</h2>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Có {filteredBookings.length} kết quả phù hợp
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 220px",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo mã SV, tên, email, phòng, tòa nhà, kỳ..."
              style={inputStyle}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1120,
                background: "#fff",
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "#f7fafc", textAlign: "left" }}>
                  {[
                    "Sinh viên",
                    "Phòng",
                    "Giường",
                    "Kỳ",
                    "Ngày bắt đầu",
                    "Ngày kết thúc",
                    "Trạng thái",
                    "Ngày tạo",
                    "Thao tác",
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
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
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
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

function BookingDetailModal({ booking, onClose }) {
  const student = booking.studentId || {};
  const room = booking.roomId || {};
  const building = room.building || {};
  const badge = statusColors[booking.status] || statusColors.pending;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 24, color: "#0f172a" }}>
              Chi tiết booking
            </h2>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              Thông tin đơn đặt phòng của sinh viên
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <InfoBox title="Sinh viên">
            <InfoRow label="Mã SV" value={student.studentCode || "N/A"} />
            <InfoRow label="Họ tên" value={student.fullName || "N/A"} />
            <InfoRow label="Email" value={student.email || "Chưa có"} />
            <InfoRow label="SĐT" value={student.phone || "Chưa có"} />
            <InfoRow label="Giới tính" value={getGenderLabel(student.gender)} />
          </InfoBox>

          <InfoBox title="Phòng ở">
            <InfoRow label="Tòa nhà" value={building.name || "N/A"} />
            <InfoRow label="Phòng" value={room.displayName || "N/A"} />
            <InfoRow label="Tầng" value={room.floor || "N/A"} />
            <InfoRow label="Giường" value={booking.bedNumber || "N/A"} />
            <InfoRow
              label="Giá phòng"
              value={formatMoney(room.price || 2000000)}
            />
          </InfoBox>
        </div>

        <div style={{ marginTop: 16 }}>
          <InfoBox title="Thông tin booking">
            <InfoRow label="Kỳ" value={booking.semester || "N/A"} />
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
              value={formatDateTime(booking.checkInDate)}
            />
            <InfoRow
              label="Ngày check-out"
              value={formatDateTime(booking.checkOutDate)}
            />
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
              <strong>Trạng thái</strong>
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
                  lineHeight: 1,
                }}
              >
                {badge.label}
              </span>
            </div>
            <InfoRow
              label="Ngày tạo"
              value={formatDateTime(booking.createdAt)}
            />
            <InfoRow
              label="Cập nhật"
              value={formatDateTime(booking.updatedAt)}
            />
          </InfoBox>
        </div>

        <button type="button" onClick={onClose} style={modalMainButtonStyle}>
          Đóng
        </button>
      </div>
    </div>
  );
}

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

function InfoBox({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 16,
        background: "#f8fafc",
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: 17, color: "#0f172a" }}>
        {title}
      </h3>
      {children}
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

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function getGenderLabel(gender) {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";
  return "Khác";
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

const contentCardStyle = {
  background: "rgba(255,255,255,0.82)",
  borderRadius: 24,
  padding: 22,
  boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
  border: "1px solid rgba(148, 163, 184, 0.15)",
  backdropFilter: "blur(8px)",
};

const inputStyle = {
  minHeight: 46,
  borderRadius: 14,
  border: "1px solid #d7e0ea",
  padding: "0 16px",
  fontSize: 14,
  background: "#fdfefe",
  outline: "none",
  boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.02)",
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
  boxShadow: "0 10px 20px rgba(37, 99, 235, 0.18)",
};

const refreshButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
  color: "#fff",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.18)",
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

const modalMainButtonStyle = {
  marginTop: 20,
  width: "100%",
  height: 46,
  border: "none",
  borderRadius: 14,
  background: "#0f172a",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

export default BookingManagement;
