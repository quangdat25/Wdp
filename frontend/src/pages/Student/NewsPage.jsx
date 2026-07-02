import { useState } from "react";
import { useNews } from "../../hooks/useNews";
import { formatRelativeTime } from "../../utils/date";
import NewsDetailModal from "../../components/NewsDetailModal";

// Trang danh sách bản tin đầy đủ cho module "news"
function NewsPage() {
  const { news, loading } = useNews();
  const [selected, setSelected] = useState(null);

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
          Toàn bộ bản tin từ Ban Quản Lý Ký túc xá
        </p>
      </div>

      {/* Danh sách thông báo (News) */}
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
        ) : news.length === 0 ? (
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
              Chưa có bản tin nào.
            </span>
          </div>
        ) : (
          <div className="student-news-list">
            {news.map((item) => (
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
      </div>

      {/* Modal chi tiết */}
      {selected && (
        <NewsDetailModal news={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default NewsPage;
