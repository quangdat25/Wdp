import { FaTimes } from "react-icons/fa";
import { formatDateTime } from "../utils/date";

// Modal chi tiết bản tin - dùng cho NewsWidget + NewsPage
function NewsDetailModal({ news, onClose }) {
  if (!news) return null;

  const authorName = news.authorId?.fullName || "Ban Quản Lý";
  const buildingName = news.buildingId?.name;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(620px, 94vw)",
          maxHeight: "86vh",
          background: "#FFFFFF",
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            padding: "20px 24px",
            background:
              "linear-gradient(180deg, #34d399 0%, #22c55e 50%, #16a34a 100%)",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {news.isPinned && (
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.25)",
                  padding: "2px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                📌 GHIM
              </span>
            )}
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {news.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              border: "none",
              background: "rgba(255,255,255,0.18)",
              color: "#FFFFFF",
              borderRadius: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Meta info */}
        <div
          style={{
            flexShrink: 0,
            padding: "14px 24px",
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#64748B",
              fontWeight: 600,
            }}
          >
            Đăng bởi: <strong style={{ color: "#0F172A" }}>{authorName}</strong>
            {buildingName && (
              <>
                {" • Tòa "}
                <strong style={{ color: "#0F172A" }}>{buildingName}</strong>
              </>
            )}
          </span>
          <span style={{ fontSize: 13, color: "#94A3B8" }}>
            {formatDateTime(news.createdAt)}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflowY: "auto" }}>
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 16,
              padding: 18,
              color: "#334155",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {news.content}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsDetailModal;
