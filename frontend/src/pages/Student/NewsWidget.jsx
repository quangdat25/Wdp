import { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { formatRelativeTime } from "../../utils/date";
import NotificationDetailModal from "../../components/NotificationDetailModal";

// Widget hiển thị 5 thông báo gần nhất trên trang chủ Student
function NewsWidget({ onViewMore }) {
  const { notifications, loading, markAsRead } = useNotifications();
  const [selected, setSelected] = useState(null);

  // Chỉ lấy 5 tin gần nhất (API đã sort mới nhất trước)
  const recent = notifications.slice(0, 5);

  const handleClick = async (item) => {
    // Đánh dấu đã đọc nếu chưa, rồi mở modal
    if (!item.isRead) {
      await markAsRead(item._id);
    }
    setSelected({ ...item, isRead: true });
  };

  return (
    <div className="student-panel">
      <div className="student-panel__header">
        <div>
          <h3>Tin tức mới nhất</h3>
          <p>Thông báo từ Ban Quản Lý KTX</p>
        </div>

        {notifications.length > 5 && (
          <button
            type="button"
            className="student-panel__see-more"
            onClick={onViewMore}
          >
            Xem thêm
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="student-news-list">
          {[1, 2, 3, 4, 5].map((i) => (
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
      ) : recent.length === 0 ? (
        /* Empty state có icon */
        <div
          style={{
            padding: "32px 16px",
            textAlign: "center",
            color: "#94A3B8",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📰</div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            Chưa có thông báo nào.
          </span>
        </div>
      ) : (
        <div className="student-news-list">
          {recent.map((item) => (
            <div
              key={item._id}
              className="student-news-item"
              onClick={() => handleClick(item)}
            >
              {/* Dot đậm cho chưa đọc, nhạt cho đã đọc */}
              <span
                className="student-news-item__dot"
                style={{
                  background: item.isRead ? "#cbd5e1" : "#16a34a",
                }}
              />
              <span className="student-news-item__text">
                {item.title}
              </span>
              <span className="student-news-item__date">
                {formatRelativeTime(item.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}

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

export default NewsWidget;
