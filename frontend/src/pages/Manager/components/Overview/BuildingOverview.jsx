import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../../components/DashboardWidgets';
import { FaArrowRight } from 'react-icons/fa';

export default function BuildingOverview({ buildings }) {
  const navigate = useNavigate();
  if (!buildings || buildings.length === 0) return null;

  return (
    <Card noPadding>
      <div style={{ padding: "24px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#111827" }}>Tỷ lệ lấp đầy theo tòa</h3>
        <button onClick={() => navigate("/manager/buildings")} style={{ color: "#16A34A", background: "none", border: "none", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
          Xem chi tiết <FaArrowRight size={10} />
        </button>
      </div>

      <div style={{ padding: "0 24px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {buildings.map((b) => {
          const rate = b.rate || 0;
          const isWarning = rate < 50;
          const barColor = isWarning ? "#F59E0B" : "#22C55E";
          const bgColor = isWarning ? "#FFFBEB" : "#F6FAF7";
          const textColor = isWarning ? "#D97706" : "#16A34A";

          return (
            <div key={b.name} style={{ padding: 20, borderRadius: 12, border: "1px solid #E7EFEA", background: "#F9FAFB", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F3F4F6"} onMouseLeave={e => e.currentTarget.style.background = "#F9FAFB"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{b.name}</span>
                <span style={{ fontSize: 12, background: bgColor, color: textColor, padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                  {rate}%
                </span>
              </div>
              <div style={{ width: "100%", background: "#E7EFEA", height: 8, borderRadius: 999, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ background: barColor, height: "100%", width: `${rate}%`, transition: "width 1s ease-out" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280" }}>
                <span>{b.occupied}/{b.total} Giường</span>
                <span>Khu {b.name.replace("Khu ", "")}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
