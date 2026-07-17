import React from 'react';
import { Card } from '../../../../components/DashboardWidgets';

export default function MaintenanceChart({ data }) {
  if (!data) return null;

  const { completed, inProgress, pending, urgent, total } = data;
  
  // Calculate stroke-dasharrays based on percentages of a circle circumference (~251.2 for r=40)
  const c = 2 * Math.PI * 40;
  const pctCompleted = completed / total;
  const pctInProgress = inProgress / total;
  const pctPending = pending / total;
  const pctUrgent = urgent / total;

  const dashCompleted = `${pctCompleted * c} ${c}`;
  const dashInProgress = `${pctInProgress * c} ${c}`;
  const dashPending = `${pctPending * c} ${c}`;
  const dashUrgent = `${pctUrgent * c} ${c}`;

  const offInProgress = -(pctCompleted * c);
  const offPending = offInProgress - (pctInProgress * c);
  const offUrgent = offPending - (pctPending * c);

  return (
    <Card title="Trạng thái bảo trì" noPadding>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", height: 192, padding: "0 24px", marginTop: 24 }}>
        <div style={{ position: "relative", width: 128, height: 128 }}>
          <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22C55E" strokeWidth="12" strokeDasharray={dashCompleted} strokeDashoffset={0} />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="12" strokeDasharray={dashInProgress} strokeDashoffset={offInProgress} />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="12" strokeDasharray={dashPending} strokeDashoffset={offPending} />
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EF4444" strokeWidth="12" strokeDasharray={dashUrgent} strokeDashoffset={offUrgent} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>{total}</span>
            <span style={{ fontSize: 8, textTransform: "uppercase" }}>Ticket</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, background: "#22C55E", borderRadius: "50%" }} /><span style={{ fontSize: 12 }}>Hoàn tất</span></div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{completed}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, background: "#3B82F6", borderRadius: "50%" }} /><span style={{ fontSize: 12 }}>Đang xử lý</span></div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{inProgress}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, background: "#F59E0B", borderRadius: "50%" }} /><span style={{ fontSize: 12 }}>Chờ xử lý</span></div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{pending}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 8, height: 8, background: "#EF4444", borderRadius: "50%" }} /><span style={{ fontSize: 12 }}>Khẩn cấp</span></div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{urgent}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
