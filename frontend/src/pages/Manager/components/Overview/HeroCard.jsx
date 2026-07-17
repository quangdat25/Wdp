import React from 'react';
import { FaBuilding } from 'react-icons/fa';

export default function HeroCard({ occupancyRate, pendingRequests, pendingTickets, healthStatus = "BÌNH THƯỜNG" }) {
  const rate = occupancyRate || 0;
  
  return (
    <section style={{ 
      marginBottom: 24, borderRadius: 20, padding: 32, 
      background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", 
      color: "#fff", boxShadow: "0 10px 30px rgba(34,197,94,0.2)", 
      position: "relative", overflow: "hidden", display: "flex", 
      alignItems: "center", justifyContent: "space-between" 
    }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%", opacity: 0.1, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 40 }}>
        <FaBuilding style={{ fontSize: 200 }} />
      </div>

      <div style={{ zIndex: 1, display: "flex", flex: 1, gap: 48, alignItems: "center" }}>
        {/* SVG Circle Progress */}
        <div style={{ position: "relative", width: 160, height: 160 }}>
          <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" style={{ opacity: 0.2 }} />
            <circle cx="80" cy="80" r="70" fill="transparent" stroke="white" strokeWidth="12" strokeDasharray="440" strokeDashoffset={440 - (440 * rate) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 32, fontWeight: 700 }}>{rate}%</span>
            <span style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, letterSpacing: "-0.5px", opacity: 0.8 }}>Tỷ lệ lấp đầy</span>
          </div>
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h3 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Tổng Quan Vận Hành</h3>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 14, opacity: 0.8 }}>Yêu cầu chờ xử lý</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{pendingRequests} Đơn phòng / {pendingTickets} Ticket bảo trì</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ zIndex: 1, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.2)", textAlign: "center", minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ position: "relative", display: "flex", width: 12, height: 12 }}>
            <span style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "#fff", opacity: 0.75, animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
            <span style={{ position: "relative", width: 12, height: 12, borderRadius: "50%", background: "#fff" }} />
            <style>{`@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }`}</style>
          </div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Trạng thái hệ thống</p>
        </div>
        <p style={{ margin: 0, fontSize: 24, fontWeight: 800, textTransform: "uppercase" }}>{healthStatus}</p>
        <p style={{ margin: "4px 0 0", fontSize: 10, opacity: 0.7, fontStyle: "italic" }}>Cập nhật: Vừa xong</p>
      </div>
    </section>
  );
}
