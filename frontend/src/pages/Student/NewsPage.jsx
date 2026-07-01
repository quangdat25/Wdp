import { useState, useMemo } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { formatRelativeTime } from "../../utils/date";
import NotificationDetailModal from "../../components/NotificationDetailModal";

const TABS = [
  { id: "all", label: "Tất cả" },
  { id: "unread", label: "Chưa đọc" },
  { id: "read", label: "Đã đọc" },
];

// Trang danh sách thông báo đầy đủ cho module "news"
function NewsPage() {
  const { notifications, loading, markAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState("all");
  const [selected, setSelected] = useState(null);

  // Filter bằng state (không gọi lại API)
  const filtered = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.isRead);
    if (activeTab === "read") return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, activeTab]);

  const handleClick = async (item) => {
    if (!item.isRead) {
      await markAsRead(item._id);
    }
    setSelected({ ...item, isRead: true });
  };

  return (
    <div className="student-stack">
      {/* Tiêu đề trang */}
      <div className="student-panel" style={{ padding: "20px 24px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            color: "#0f1f35",
            fontWeight: 800,
          }}
        >
          Tin tức & Thông báo
        </h2>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            color: "#637386",
          }}
        >
          Toàn bộ thông báo từ Ban Quản Lý Ký túc xá
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tab) => {
          const count =
            tab.id === "all"
              ? notifications.length
              : tab.id === "unread"
                ? notifications.filter((n) => !n.isRead).length
                : notifications.filter((n) => n.isRead).length;

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: `1px solid ${isActive ? "#16a34a" : "#d9e4f0"}`,
                background: isActive ? "#16a34a" : "#ffffff",
                color: isActive ? "#ffffff" : "#637386",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.15s",
              }}
            >
              {tab.label}
              <span
                style={{
                  minWidth: 20,
                  height: 20,
                  padding: "0 6px",
                  borderRadius: 999,
                  background: isActive ? "rgba(255,255,255,0.25)" : "#f0fdf4",
                  color: isActive ? "#ffffff" : "#16a34a",
                  fontSize: 11,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Danh sách thông báo */}
      <div className="student-panel">
        {loading ? (
          <div className="student-news-list">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: "#f0fdf4",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#dcfce7",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    height: 14,
                    background: "#dcfce7",
                    borderRadius: 4,
                  }}
                />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state có icon */
          <div
            style={{
              padding: "48px 16px",
              textAlign: "center",
              color: "#94A3B8",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Chưa có thông báo nào.
            </span>
          </div>
        ) : (
          <div className="student-news-list">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="student-news-item"
                onClick={() => handleClick(item)}
              >
                <span
                  className="student-news-item__dot"
                  style={{
                    background: item.isRead ? "#cbd5e1" : "#16a34a",
                  }}
                />
                <span className="student-news-item__text">{item.title}</span>
                <span className="student-news-item__date">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {selected && (
        <NotificationDetailModal
          notification={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default NewsPage;
