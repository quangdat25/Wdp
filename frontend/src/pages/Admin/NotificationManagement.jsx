import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import {
  FaBell,
  FaBullhorn,
  FaEye,
  FaPaperPlane,
  FaRegTrashAlt,
  FaSearch,
  FaTimes,
  FaUserGraduate,
  FaUsers,
} from "react-icons/fa";

import { showError, showSuccess,showConfirm,showWarning } from "../../components/alert";
import {
  createNotification,
  getAllNotifications,
  deleteNotification,
} from "../../api/notificationService";
import Sidebar from "../../components/Sidebar";

const receiverOptions = [
  { value: "all", label: "Tất cả người dùng" },
  { value: "student", label: "Sinh viên" },
  { value: "studentCode", label: "Theo mã sinh viên" },
  { value: "staff", label: "Nhân viên" },
  { value: "manager", label: "Quản lý" },
  { value: "admin", label: "Admin" },
  { value: "parent", label: "Phụ huynh" },
];

function NotificationManagement() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [receiver, setReceiver] = useState("all");
  const [studentCode, setStudentCode] = useState("");

  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [keyword, setKeyword] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getAllNotifications();
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error(error);
      showError("Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getReceiverLabel = (notification) => {
    if (notification.targetType === "all") return "Tất cả người dùng";

    if (notification.targetType === "roles") {
      return notification.targetRoles
        ?.map(
          (role) =>
            receiverOptions.find((item) => item.value === role)?.label || role,
        )
        .join(", ");
    }

    if (notification.targetType === "users") {
      return notification.studentCode
        ? `MSSV: ${notification.studentCode}`
        : "Người dùng cụ thể";
    }

    return "Không xác định";
  };

  const filteredNotifications = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (!text) return notifications;

    return notifications.filter((item) => {
      const receiverLabel = getReceiverLabel(item).toLowerCase();

      return (
        item.title?.toLowerCase().includes(text) ||
        item.content?.toLowerCase().includes(text) ||
        receiverLabel.includes(text)
      );
    });
  }, [notifications, keyword]);

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(start, start + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  const summary = useMemo(() => {
    return {
      total: notifications.length,
      all: notifications.filter((n) => n.targetType === "all").length,
      roles: notifications.filter((n) => n.targetType === "roles").length,
      users: notifications.filter((n) => n.targetType === "users").length,
    };
  }, [notifications]);

  const handleSendNotification = async () => {
    if (!title.trim()) {
      showWarning("Vui lòng nhập tiêu đề thông báo");
      return;
    }

    if (!content.trim()) {
      showWarning("Vui lòng nhập nội dung thông báo");
      return;
    }

    if (receiver === "studentCode" && !studentCode.trim()) {
      showWarning("Vui lòng nhập mã sinh viên");
      return;
    }

    try {
      setSending(true);

      let payload;

      if (receiver === "all") {
        payload = {
          title: title.trim(),
          content: content.trim(),
          targetType: "all",
          targetRoles: [],
          targetUsers: [],
        };
      } else if (receiver === "studentCode") {
        payload = {
          title: title.trim(),
          content: content.trim(),
          targetType: "studentCode",
          studentCode: studentCode.trim(),
        };
      } else {
        payload = {
          title: title.trim(),
          content: content.trim(),
          targetType: "roles",
          targetRoles: [receiver],
          targetUsers: [],
        };
      }

      const res = await createNotification(payload);

      setNotifications((prev) => [res.data.data, ...prev]);
      setTitle("");
      setContent("");
      setReceiver("all");
      setStudentCode("");
      setCurrentPage(1);

      showSuccess("Gửi thông báo thành công");
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Gửi thông báo thất bại");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    const ok = await showConfirm(
      "Xóa thông báo?",
      "Bạn có chắc muốn xóa thông báo này không?",
      "Xóa",
    );
    if (!ok) return;

    try {
      setDeletingId(id);

      await deleteNotification(id);

      setNotifications((prev) => prev.filter((item) => item._id !== id));

      if (selectedNotification?._id === id) {
        setSelectedNotification(null);
      }

      showSuccess("Xóa thông báo thành công");
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || "Xóa thông báo thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={styles.page}>
      <Sidebar />

      <main style={styles.main}>

        <section style={styles.summaryGrid}>
          <SummaryCard
            icon={<FaBell />}
            title="Tổng thông báo"
            value={summary.total}
            tone="blue"
          />

          <SummaryCard
            icon={<FaUsers />}
            title="Gửi tất cả"
            value={summary.all}
            tone="green"
          />

          <SummaryCard
            icon={<FaUsers />}
            title="Gửi theo vai trò"
            value={summary.roles}
            tone="purple"
          />

          <SummaryCard
            icon={<FaUserGraduate />}
            title="Gửi cá nhân"
            value={summary.users}
            tone="orange"
          />
        </section>

        <section style={styles.layoutGrid}>
          <div style={styles.formCard}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Tạo thông báo mới</h2>
                <p style={styles.cardDesc}>
                  Nội dung càng rõ thì người nhận càng dễ hiểu. Đừng spam quá,
                  hệ thống cũng biết mệt đó.
                </p>
              </div>
            </div>

            <div style={styles.formGrid}>
              <InputBox
                label="Tiêu đề"
                value={title}
                onChange={setTitle}
                placeholder="VD: Thông báo bảo trì hệ thống"
              />

              <SelectBox
                label="Gửi đến"
                value={receiver}
                onChange={(value) => {
                  setReceiver(value);
                  if (value !== "studentCode") setStudentCode("");
                }}
                options={receiverOptions}
              />
            </div>

            {receiver === "studentCode" && (
              <div style={styles.studentCodeBox}>
                <InputBox
                  label="Mã sinh viên"
                  value={studentCode}
                  onChange={setStudentCode}
                  placeholder="Nhập mã sinh viên..."
                />

                <p style={styles.hintText}>
                  Thông báo sẽ được gửi riêng đến sinh viên có mã này.
                </p>
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <label style={styles.label}>Nội dung</label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung thông báo..."
                rows={7}
                style={styles.textarea}
              />

              <div style={styles.counter}>{content.trim().length} ký tự</div>
            </div>

            <button
              type="button"
              onClick={handleSendNotification}
              disabled={sending}
              style={{
                ...styles.sendButton,
                opacity: sending ? 0.72 : 1,
                cursor: sending ? "not-allowed" : "pointer",
              }}
            >
              <FaPaperPlane />
              {sending ? "Đang gửi..." : "Gửi thông báo"}
            </button>
          </div>

          <div style={styles.tipsCard}>
            <h3 style={styles.tipsTitle}>Gợi ý nhanh</h3>

            <div style={styles.tipItem}>
              <strong>Gửi toàn hệ thống</strong>
              <span>Dùng cho thông báo chung, lịch bảo trì, quy định mới.</span>
            </div>

            <div style={styles.tipItem}>
              <strong>Gửi theo vai trò</strong>
              <span>
                Dùng khi chỉ muốn gửi cho sinh viên, phụ huynh hoặc nhân viên.
              </span>
            </div>

            <div style={styles.tipItem}>
              <strong>Gửi theo mã sinh viên</strong>
              <span>
                Dùng cho thông báo cá nhân như phòng ở, vi phạm, hỗ trợ riêng.
              </span>
            </div>
          </div>
        </section>

        <section style={styles.tableCard}>
          <div style={styles.tableTop}>
            <div>
              <h2 style={styles.cardTitle}>Danh sách thông báo</h2>
              <p style={styles.cardDesc}>
                Theo dõi các thông báo đã gửi và xóa thông báo không còn cần
                thiết.
              </p>
            </div>

            <div style={styles.searchBox}>
              <FaSearch />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm theo tiêu đề, nội dung..."
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tiêu đề</th>
                  <th style={styles.th}>Gửi đến</th>
                  <th style={styles.th}>Ngày gửi</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={styles.emptyCell}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : paginatedNotifications.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={styles.emptyCell}>
                      Chưa có thông báo nào
                    </td>
                  </tr>
                ) : (
                  paginatedNotifications.map((item) => (
                    <tr key={item._id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.titleCell}>
                          <div style={styles.notificationIcon}>
                            <FaBell />
                          </div>

                          <div>
                            <div style={styles.notiTitle}>{item.title}</div>
                            <div style={styles.notiContent}>{item.content}</div>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <ReceiverBadge
                          type={item.targetType}
                          label={getReceiverLabel(item)}
                        />
                      </td>

                      <td style={styles.td}>
                        <span style={styles.dateText}>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("vi-VN")
                            : "Không rõ"}
                        </span>
                      </td>

                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <div style={styles.actionGroup}>
                          <button
                            type="button"
                            onClick={() => setSelectedNotification(item)}
                            style={styles.viewButton}
                          >
                            <FaEye />
                            Xem
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteNotification(item._id)}
                            disabled={deletingId === item._id}
                            style={{
                              ...styles.deleteButton,
                              opacity: deletingId === item._id ? 0.65 : 1,
                              cursor:
                                deletingId === item._id
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            <FaRegTrashAlt />
                            {deletingId === item._id ? "Đang xóa" : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.paginationWrap}>
            <Pagination
              current={currentPage}
              total={filteredNotifications.length}
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
          receiverLabel={getReceiverLabel(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          onDelete={() => handleDeleteNotification(selectedNotification._id)}
          deleting={deletingId === selectedNotification._id}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon, title, value, tone }) {
  const colors = {
    blue: ["#eff6ff", "#2563eb"],
    green: ["#ecfdf5", "#059669"],
    purple: ["#f5f3ff", "#7c3aed"],
    orange: ["#fff7ed", "#ea580c"],
  };

  const [bg, color] = colors[tone] || colors.blue;

  return (
    <div style={styles.summaryCard}>
      <div style={{ ...styles.summaryIcon, background: bg, color }}>{icon}</div>

      <div>
        <p style={styles.summaryTitle}>{title}</p>
        <strong style={styles.summaryValue}>{value}</strong>
      </div>
    </div>
  );
}

function InputBox({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

function SelectBox({ label, value, onChange, options }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
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

function ReceiverBadge({ type, label }) {
  let style = styles.badgeBlue;

  if (type === "all") style = styles.badgeGreen;
  if (type === "roles") style = styles.badgeBlue;
  if (type === "users") style = styles.badgeOrange;

  return <span style={{ ...styles.badge, ...style }}>{label}</span>;
}

function NotificationModal({
  notification,
  receiverLabel,
  onClose,
  onDelete,
  deleting,
}) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div>
            <div style={styles.modalIcon}>
              <FaBell />
            </div>

            <h2 style={styles.modalTitle}>Chi tiết thông báo</h2>
          </div>

          <button type="button" onClick={onClose} style={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div style={styles.modalBody}>
          <InfoRow label="Tiêu đề" value={notification.title} />
          <InfoRow label="Gửi đến" value={receiverLabel} />
          <InfoRow
            label="Ngày gửi"
            value={
              notification.createdAt
                ? new Date(notification.createdAt).toLocaleString("vi-VN")
                : "Không rõ"
            }
          />

          <div style={styles.contentBox}>
            <strong>Nội dung</strong>
            <p>{notification.content}</p>
          </div>
        </div>

        <div style={styles.modalActions}>
          <button type="button" onClick={onClose} style={styles.cancelButton}>
            Đóng
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            style={{
              ...styles.deleteButtonLarge,
              opacity: deleting ? 0.65 : 1,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            <FaRegTrashAlt />
            {deleting ? "Đang xóa..." : "Xóa thông báo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 32%), linear-gradient(180deg, #f8fbff 0%, #f3f8f6 100%)",
  },

  main: {
    marginLeft: "270px",
    width: "calc(100% - 270px)",
    padding: "24px 28px 34px",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 22,
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 22,
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.06)",
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    fontSize: 20,
  },

  summaryTitle: {
    margin: 0,
    color: "#64748b",
    fontWeight: 700,
    fontSize: 13,
  },

  summaryValue: {
    display: "block",
    marginTop: 4,
    color: "#0f172a",
    fontSize: 26,
    lineHeight: 1,
  },

  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.8fr) minmax(280px, 0.8fr)",
    gap: 18,
    marginBottom: 22,
  },

  formCard: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: 26,
    padding: 24,
    boxShadow: "0 18px 44px rgba(15, 23, 42, 0.07)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
  },

  cardHeader: {
    marginBottom: 18,
  },

  cardTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: 22,
    fontWeight: 900,
  },

  cardDesc: {
    margin: "6px 0 0",
    color: "#64748b",
    lineHeight: 1.55,
    fontSize: 14,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  label: {
    display: "block",
    marginBottom: 8,
    color: "#334155",
    fontSize: 14,
    fontWeight: 800,
  },

  input: {
    width: "100%",
    height: 48,
    borderRadius: 15,
    border: "1px solid #dbe4ef",
    background: "#fff",
    padding: "0 15px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    borderRadius: 18,
    border: "1px solid #dbe4ef",
    padding: 16,
    fontSize: 14,
    lineHeight: 1.6,
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
    background: "#fff",
  },

  counter: {
    marginTop: 8,
    textAlign: "right",
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 700,
  },

  studentCodeBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    background: "#f8fafc",
    border: "1px dashed #bfdbfe",
  },

  hintText: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: 13,
  },

  sendButton: {
    marginTop: 18,
    height: 48,
    minWidth: 170,
    border: "none",
    borderRadius: 15,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 900,
    boxShadow: "0 14px 28px rgba(37, 99, 235, 0.24)",
  },

  tipsCard: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.92))",
    borderRadius: 26,
    padding: 22,
    boxShadow: "0 18px 44px rgba(15, 23, 42, 0.07)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
  },

  tipsTitle: {
    margin: "0 0 14px",
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 900,
  },

  tipItem: {
    display: "grid",
    gap: 5,
    padding: "14px 0",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.55,
  },

  tableCard: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: 26,
    padding: 24,
    boxShadow: "0 18px 44px rgba(15, 23, 42, 0.07)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
  },

  tableTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    marginBottom: 18,
  },

  searchBox: {
    width: 320,
    height: 46,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 14px",
    borderRadius: 16,
    border: "1px solid #dbe4ef",
    background: "#fff",
    color: "#94a3b8",
  },

  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#0f172a",
  },

  tableWrap: {
    overflowX: "auto",
    borderRadius: 20,
    border: "1px solid #e2e8f0",
    background: "#fff",
  },

  table: {
    width: "100%",
    minWidth: 950,
    borderCollapse: "collapse",
  },

  th: {
    padding: "15px 16px",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 13,
    fontWeight: 900,
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
  },

  tr: {
    transition: "0.2s ease",
  },

  td: {
    padding: "15px 16px",
    color: "#334155",
    borderBottom: "1px solid #eef2f7",
    verticalAlign: "middle",
  },

  titleCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  notificationIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "#eff6ff",
    color: "#2563eb",
  },

  notiTitle: {
    maxWidth: 340,
    color: "#0f172a",
    fontWeight: 900,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  notiContent: {
    maxWidth: 420,
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  dateText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  badgeGreen: {
    background: "#dcfce7",
    color: "#15803d",
  },

  badgeBlue: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },

  badgeOrange: {
    background: "#ffedd5",
    color: "#c2410c",
  },

  actionGroup: {
    display: "inline-flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },

  viewButton: {
    height: 38,
    padding: "0 12px",
    border: "none",
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: 900,
    cursor: "pointer",
  },

  deleteButton: {
    height: 38,
    padding: "0 12px",
    border: "none",
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#fee2e2",
    color: "#dc2626",
    fontWeight: 900,
  },

  emptyCell: {
    padding: 28,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 700,
  },

  paginationWrap: {
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    display: "grid",
    placeItems: "center",
    padding: 20,
    background: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(6px)",
  },

  modal: {
    width: 560,
    maxWidth: "95vw",
    borderRadius: 26,
    background: "#fff",
    boxShadow: "0 30px 80px rgba(15, 23, 42, 0.28)",
    overflow: "hidden",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    padding: 24,
    background:
      "linear-gradient(135deg, rgba(239,246,255,1), rgba(248,250,252,1))",
    borderBottom: "1px solid #e2e8f0",
  },

  modalIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "#dbeafe",
    color: "#2563eb",
    marginBottom: 12,
  },

  modalTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: 22,
    fontWeight: 900,
  },

  closeButton: {
    width: 38,
    height: 38,
    border: "none",
    borderRadius: 12,
    background: "#fff",
    color: "#475569",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
  },

  modalBody: {
    padding: 24,
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: "13px 0",
    borderBottom: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: 14,
  },

  contentBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    background: "#f8fafc",
    color: "#334155",
    lineHeight: 1.65,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: 24,
    borderTop: "1px solid #e2e8f0",
    background: "#fff",
  },

  cancelButton: {
    height: 42,
    padding: "0 16px",
    border: "1px solid #dbe4ef",
    borderRadius: 13,
    background: "#fff",
    color: "#334155",
    fontWeight: 900,
    cursor: "pointer",
  },

  deleteButtonLarge: {
    height: 42,
    padding: "0 16px",
    border: "none",
    borderRadius: 13,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#dc2626",
    color: "#fff",
    fontWeight: 900,
  },
};

export default NotificationManagement;
