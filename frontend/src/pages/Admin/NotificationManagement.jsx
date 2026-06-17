import { useMemo, useState } from "react";
import { Pagination } from "antd";
import AdminSidebar from "./AdminSidebar";
import { showError, showSuccess } from "../../components/alert";

const receiverOptions = [
  { value: "all", label: "Tất cả người dùng" },
  { value: "student", label: "Sinh viên" },
  { value: "parent", label: "Phụ huynh" },
  { value: "staff", label: "Nhân viên" },
  { value: "manager", label: "Quản lý" },
];

const typeColors = {
  system: { background: "#dbeafe", color: "#1d4ed8", label: "Hệ thống" },
  booking: { background: "#dcfce7", color: "#166534", label: "Đặt phòng" },
  payment: { background: "#fef3c7", color: "#92400e", label: "Thanh toán" },
  urgent: { background: "#fee2e2", color: "#b91c1c", label: "Khẩn cấp" },
};

function NotificationManagement() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [receiver, setReceiver] = useState("all");
  const [type, setType] = useState("system");
  const [sending, setSending] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [notifications, setNotifications] = useState([
    {
      _id: "1",
      title: "Thông báo bảo trì hệ thống",
      content: "Hệ thống sẽ bảo trì vào 22:00 tối nay.",
      receiver: "all",
      type: "system",
      createdAt: new Date(),
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return notifications.slice(start, start + pageSize);
  }, [notifications, currentPage, pageSize]);

  const handleSendNotification = async () => {
    if (!title.trim()) {
      showError("Vui lòng nhập tiêu đề thông báo");
      return;
    }

    if (!content.trim()) {
      showError("Vui lòng nhập nội dung thông báo");
      return;
    }

    try {
      setSending(true);

      const newNotification = {
        _id: Date.now().toString(),
        title,
        content,
        receiver,
        type,
        createdAt: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);

      setTitle("");
      setContent("");
      setReceiver("all");
      setType("system");

      showSuccess("Gửi thông báo thành công");
    } catch (error) {
      console.error(error);
      showError("Gửi thông báo thất bại");
    } finally {
      setSending(false);
    }
  };

  const getReceiverLabel = (value) => {
    return receiverOptions.find((item) => item.value === value)?.label || value;
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
            Gửi thông báo
          </h1>
          <p style={{ color: "#64748b", marginBottom: 0 }}>
            Admin gửi thông báo đến người dùng trong hệ thống.
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
          <SummaryCard title="Tổng thông báo" value={notifications.length} />
          <SummaryCard
            title="Thông báo hệ thống"
            value={notifications.filter((n) => n.type === "system").length}
          />
          <SummaryCard
            title="Thông báo khẩn cấp"
            value={notifications.filter((n) => n.type === "urgent").length}
          />
        </section>

        <section
          style={{
            background: "rgba(255,255,255,0.82)",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            marginBottom: 24,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Tạo thông báo mới</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <InputBox
              label="Tiêu đề"
              value={title}
              onChange={setTitle}
              placeholder="Nhập tiêu đề thông báo..."
            />

            <SelectBox
              label="Gửi đến"
              value={receiver}
              onChange={setReceiver}
              options={receiverOptions}
            />

            <SelectBox
              label="Loại thông báo"
              value={type}
              onChange={setType}
              options={[
                { value: "system", label: "Hệ thống" },
                { value: "booking", label: "Đặt phòng" },
                { value: "payment", label: "Thanh toán" },
                { value: "urgent", label: "Khẩn cấp" },
              ]}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Nội dung</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              rows={6}
              style={{
                width: "100%",
                borderRadius: 14,
                border: "1px solid #d7e0ea",
                padding: 16,
                fontSize: 14,
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleSendNotification}
            disabled={sending}
            style={{
              marginTop: 18,
              background: sending ? "#93c5fd" : "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "12px 18px",
              fontSize: 14,
              fontWeight: 800,
              cursor: sending ? "not-allowed" : "pointer",
              boxShadow: "0 12px 24px rgba(37, 99, 235, 0.22)",
            }}
          >
            {sending ? "Đang gửi..." : "Gửi thông báo"}
          </button>
        </section>

        <section
          style={{
            background: "rgba(255,255,255,0.82)",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Danh sách thông báo</h2>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
                background: "#fff",
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ background: "#f7fafc", textAlign: "left" }}>
                  {["Tiêu đề", "Gửi đến", "Loại", "Ngày gửi", "Chi tiết"].map(
                    (head) => (
                      <th key={head} style={thStyle}>
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {paginatedNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 20, textAlign: "center" }}>
                      Chưa có thông báo nào
                    </td>
                  </tr>
                ) : (
                  paginatedNotifications.map((item) => {
                    const badge = typeColors[item.type] || typeColors.system;

                    return (
                      <tr key={item._id}>
                        <td style={tdStyle}>{item.title}</td>
                        <td style={tdStyle}>{getReceiverLabel(item.receiver)}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              padding: "7px 14px",
                              borderRadius: 999,
                              background: badge.background,
                              color: badge.color,
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          {new Date(item.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => setSelectedNotification(item)}
                            style={{
                              border: "none",
                              background:
                                "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                              color: "#fff",
                              padding: "9px 12px",
                              borderRadius: 10,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <Pagination
              current={currentPage}
              total={notifications.length}
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

      {selectedNotification && (
        <NotificationModal
          notification={selectedNotification}
          receiverLabel={getReceiverLabel(selectedNotification.receiver)}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}

const thStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontSize: 14,
  fontWeight: 700,
};

const tdStyle = {
  padding: "14px 16px",
  borderBottom: "1px solid #eef2f7",
  color: "#334155",
  verticalAlign: "middle",
};

const labelStyle = {
  display: "block",
  marginBottom: 8,
  color: "#334155",
  fontWeight: 700,
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

function InputBox({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 14,
          border: "1px solid #d7e0ea",
          padding: "0 16px",
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>
  );
}

function SelectBox({ label, value, onChange, options }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 46,
          borderRadius: 14,
          border: "1px solid #d7e0ea",
          padding: "0 16px",
          fontSize: 14,
          outline: "none",
          background: "#fff",
        }}
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NotificationModal({ notification, receiverLabel, onClose }) {
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
          width: 520,
          maxWidth: "90vw",
          background: "#fff",
          borderRadius: 22,
          padding: 24,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Chi tiết thông báo</h2>

        <InfoRow label="Tiêu đề" value={notification.title} />
        <InfoRow label="Gửi đến" value={receiverLabel} />
        <InfoRow
          label="Ngày gửi"
          value={new Date(notification.createdAt).toLocaleString("vi-VN")}
        />

        <div style={{ marginTop: 16 }}>
          <strong>Nội dung</strong>
          <div
            style={{
              marginTop: 10,
              padding: 14,
              borderRadius: 14,
              background: "#f8fafc",
              color: "#334155",
              lineHeight: 1.6,
            }}
          >
            {notification.content}
          </div>
        </div>

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
      }}
    >
      <strong>{label}</strong>
      <span style={{ color: "#475569", textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default NotificationManagement;