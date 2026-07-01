import { useState } from "react";
import { useNews } from "../../hooks/useNews";
import { formatRelativeTime } from "../../utils/date";
import NewsDetailModal from "../../components/NewsDetailModal";

// Widget hiển thị 5 bản tin gần nhất trên trang chủ Student
function NewsWidget({ onViewMore }) {
  const { news, loading } = useNews();
  const [selected, setSelected] = useState(null);

  // Chỉ lấy 5 tin gần nhất (API đã sort: isPinned trước, rồi createdAt giảm dần)
  const recent = news.slice(0, 5);

  return (
    <div className="student-panel">
      <div className="student-panel__header">
        <div>
          <h3>Tin tức mới nhất</h3>
          <p>Thông báo từ Ban Quản Lý KTX</p>
        </div>

        {news.length > 5 && (
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
            Chưa có bản tin nào.
          </span>
        </div>
      ) : (
        <div className="student-news-list">
          {recent.map((item) => (
            <div
              key={item._id}
              className="student-news-item"
              onClick={() => setSelected(item)}
            >
              <span
                className="student-news-item__dot"
                style={{
                  background: item.isPinned ? "#dc2626" : "#16a34a",
                }}
              />
              <span className="student-news-item__text">
                {item.isPinned && "📌 "}
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
        <NewsDetailModal news={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default NewsWidget;
