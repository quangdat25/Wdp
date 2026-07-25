import React from "react";
import { FaSearch, FaRedo, FaFilter } from "react-icons/fa";

export default function ViolationFilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onReset,
  onRefresh
}) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 24,
      border: "1px solid #E7EFEA",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
        <div style={{
          position: "relative",
          flex: 1,
          maxWidth: 320
        }}>
          <FaSearch style={{ position: "absolute", left: 14, top: 12, color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Tìm kiếm sinh viên, MSV, phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px 10px 40px",
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              fontSize: 14,
              boxSizing: "border-box",
              outline: "none",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => (e.target.style.borderColor = "#22C55E")}
            onBlur={(e) => (e.target.style.borderColor = "#D1D5DB")}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid #D1D5DB",
            fontSize: 14,
            outline: "none",
            backgroundColor: "#fff",
            cursor: "pointer",
            minWidth: 150
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
          <option value="REVOKED">Đã thu hồi</option>
        </select>

        {/* Thêm các bộ lọc khác nếu API hỗ trợ */}

        <button
          onClick={onReset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "#F3F4F6",
            border: "none",
            borderRadius: 8,
            color: "#4B5563",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#E5E7EB")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F3F4F6")}
        >
          <FaFilter size={12} /> Bỏ lọc
        </button>
      </div>
    </div>
  );
}
