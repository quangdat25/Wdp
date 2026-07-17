import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../../../components/DashboardWidgets';
import { FaCheckSquare, FaDoorOpen, FaWrench, FaFileInvoiceDollar, FaGavel } from 'react-icons/fa';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card title="Thao tác nhanh">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        <Button onClick={() => navigate('/manager/students')} icon={<FaDoorOpen />} label="Quản lý sinh viên & Xếp phòng" primary style={{ justifyContent: "flex-start" }} />
        <Button onClick={() => navigate('/manager/tickets')} icon={<FaWrench />} label="Phân công bảo trì" primary style={{ justifyContent: "flex-start" }} />
        <Button onClick={() => navigate('/manager/utility-invoices')} icon={<FaFileInvoiceDollar />} label="Tạo hóa đơn điện nước" outline style={{ justifyContent: "flex-start" }} />
        <Button onClick={() => navigate('/manager/violations')} icon={<FaGavel />} label="Ghi nhận vi phạm" danger style={{ justifyContent: "flex-start" }} />
      </div>
    </Card>
  );
}



export function RecentActivitiesList({ recentActivities }) {
  const activities = recentActivities || [];

  return (
    <Card title="Hoạt động gần đây">
      <div style={{ position: "relative", paddingLeft: 24, marginTop: 24, borderLeft: "2px solid #E7EFEA", display: "flex", flexDirection: "column", gap: 32 }}>
        {activities.slice(0, 3).map((act, i) => {
          // Cycle colors for visual variety if not provided
          const colors = ["#22C55E", "#F59E0B", "#3B82F6"];
          const color = colors[i % colors.length];

          return (
            <div key={i} style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: -31, top: 2, width: 12, height: 12, borderRadius: "50%", background: color, border: "3px solid #fff" }} />
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "#6B7280" }}>{act.time || "Vừa xong"}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#111827" }} dangerouslySetInnerHTML={{ __html: act.title }} />
            </div>
          );
        })}
        {activities.length === 0 && <p style={{ fontSize: 13, color: "#6B7280" }}>Không có hoạt động gần đây</p>}
      </div>
    </Card>
  );
}
